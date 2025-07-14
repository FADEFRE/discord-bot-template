import { Collection, CommandInteraction, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { ClientWithCommands, SlashCommand } from './types/discordjsTypes';

dotenv.config(); // Load environment variables from .env

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function deployCommands(client: ClientWithCommands, BOT_TOKEN: string, CLIENT_ID: string) {
	client.commands = new Collection();
	const commands = [];

	// Grab all the command files from the commands directory
	const foldersPath = path.join(__dirname, 'commands');
	const commandFolders = fs.readdirSync(foldersPath);
	console.log(`Deploying commands from folders: ${commandFolders.join(', ')}`);

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const fileUrl = pathToFileURL(filePath).href;
			const com = await import(fileUrl);

			if (!com.commandIdentifier) {
				console.log(`[WARNING] The command at ${filePath} is missing.`);
				continue;
			}

			const command: SlashCommand = com.commandIdentifier;
			if ('data' in command && 'execute' in command) {
				// Add to commands array for deployment
				commands.push(command.data.toJSON());
				// Also add to client commands collection
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}

	// Construct and prepare an instance of the REST module
	const rest = new REST().setToken(BOT_TOKEN);

	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
}

export async function chatInteractionIsCommand(
	interaction: CommandInteraction,
	interactionClient: ClientWithCommands
): Promise<void> {
	const command = interactionClient.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	}
}
