import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { ClientWithCommands, CommandModule, DeployedCommand, SlashCommand } from '@/types/discordjsTypes';

dotenv.config();

const BOT_TOKEN = process.env.CLIENT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// __dirname isn't available in ESM; derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Provide a CommonJS `require` for loading compiled .js files
const require = createRequire(import.meta.url);

const deploy = async (client: ClientWithCommands) => {
	if (!BOT_TOKEN) {
		console.error('[ERROR] CLIENT_TOKEN is not defined in environment variables!');
		return;
	}

	if (!CLIENT_ID) {
		console.error('[ERROR] CLIENT_ID is not defined in environment variables!');
		return;
	}

	const foldersPath = path.join(__dirname, 'commands');

	if (!fs.existsSync(foldersPath)) {
		console.error(`[ERROR] Commands folder not found at ${foldersPath}`);
		return;
	}

	const commands = loadCommands(client, foldersPath);
	await deployToDiscord(commands);
};

function loadCommands(client: ClientWithCommands, foldersPath: string): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
	const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
	const commandFolders = fs.readdirSync(foldersPath);
	let registeredCount = 0;

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);

		if (!fs.statSync(commandsPath).isDirectory()) {
			continue;
		}

		const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);

			try {
				const commandModule = require(filePath) as CommandModule;
				const command = findCommandInModule(commandModule);

				if (!command || !('data' in command) || !('execute' in command)) {
					console.error(`[ERROR] Invalid command in ${file}`);
					continue;
				}

				// Register to client
				client.commands.set(command.data.name, command);

				// Collect for Discord API
				commands.push(command.data.toJSON());
				registeredCount++;
			} catch (error) {
				console.error(`[ERROR] Failed to load ${file}:`, error);
			}
		}
	}

	console.log(`✓ Loaded ${registeredCount} command(s)`);
	return commands;
}

function findCommandInModule(commandModule: CommandModule): SlashCommand | null {
	// Check for default export
	if (commandModule.default && typeof commandModule.default === 'object') {
		return commandModule.default;
	}

	// Check for commandName export (legacy)
	if (commandModule.commandName && typeof commandModule.commandName === 'object') {
		return commandModule.commandName;
	}

	// Check for any named export that looks like a command
	for (const key of Object.keys(commandModule)) {
		const value = commandModule[key];
		if (value && typeof value === 'object' && 'data' in value && 'execute' in value) {
			return value as SlashCommand;
		}
	}

	return null;
}

async function deployToDiscord(commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]) {
	if (commands.length === 0) {
		console.error('[ERROR] No commands to deploy!');
		return;
	}

	const rest = new REST().setToken(BOT_TOKEN!);

	try {
		const data = await rest.put(
			Routes.applicationCommands(CLIENT_ID!),
			{ body: commands }
		) as DeployedCommand[];

		console.log(`✓ Deployed ${data.length} command(s) to Discord`);
	} catch (error) {
		console.error('[ERROR] Failed to deploy commands to Discord:', error);
	}
}

export default deploy;
