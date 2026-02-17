import {
	Client as DiscordBaseClient,
	Collection,
	Events,
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
} from 'discord.js';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerChatInputCommands } from './event/chatInputCommand.js';
import { ClientCommandType, CommandModule } from './types/discordjsTypes';
import { Consts } from './util/consts.js';
import {
	verifyClientId,
	verifyClientToken,
	verifyCommandExistsInModule,
	verifyCommandFolderPath,
	verifyGuildId,
} from './util/verify.js';

/**
 * Custom Client class that extends the base Discord.js Client to include command handling and deployment functionality.
 */
export class Client extends DiscordBaseClient {
	commands: ClientCommandType = new Collection();
	BOT_TOKEN: string = Consts.INVALID_BOT_TOKEN;
	BOT_ID: string = Consts.INVALID_BOT_ID;
	GUILD_ID: string = Consts.INVALID_GUILD_ID;
	commandFolderPath: string = Consts.INVALID_COMMAND_FOLDER_PATH;

	private commandsDeployed: boolean = false;

	async deployCommands() {
		if (this.commandsDeployed) {
			return;
		}

		try {
			this.BOT_TOKEN = verifyClientToken();
			this.BOT_ID = verifyClientId();
			this.commandFolderPath = verifyCommandFolderPath(path.dirname(fileURLToPath(import.meta.url)));
		} catch (_) {
			return;
		}

		try {
			const restCommands = this.loadCommandsFromFolder();
			await new REST().setToken(this.BOT_TOKEN).put(Routes.applicationCommands(this.BOT_ID), {
				body: restCommands,
			});
		} catch (error) {
			console.error('[ERROR] Failed to deploy commands to Discord:', error);
			return;
		}

		console.log(`✓ Deployed ${this.commands.size} command(s) to Discord`);
		this.commandsDeployed = true;
	}

	registerEventListeners() {
		this.onReady();
		registerChatInputCommands(this);
	}

	private onReady() {
		this.once(Events.ClientReady, async (client) => {
			console.log(`Logged in as ${client.user?.tag}`);

			try {
				this.GUILD_ID = verifyGuildId();

				const guild = await client.guilds.fetch(this.GUILD_ID);
				console.log(`Connected to guild: ${guild.name}`);
			} catch (error) {
				console.error('Failed to fetch guild:', error);
			}
		});
	}

	private loadCommandsFromFolder(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
		const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
		const commandFolders = fs.readdirSync(this.commandFolderPath);

		for (const folder of commandFolders) {
			const commandsPath = path.join(this.commandFolderPath, folder);

			if (!fs.statSync(commandsPath).isDirectory()) {
				continue;
			}

			const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

			for (const file of commandFiles) {
				const filePath = path.join(commandsPath, file);

				try {
					const commandModule = createRequire(import.meta.url)(filePath) as CommandModule;
					const command = verifyCommandExistsInModule(commandModule);

					if (command) {
						// Register to client
						this.commands.set(command.data.name, command);
						// Collect for Discord API
						commands.push(command.data.toJSON());
					}
				} catch (error) {
					console.error(`[ERROR] Failed to load ${file}:`, error);
				}
			}
		}

		if (commands.length > 0) {
			console.log(`✓ Loaded ${commands.length} command(s)`);
			return commands;
		} else {
			console.error('[ERROR] No commands to deploy!');
			throw new Error('[ERROR] No commands to deploy!');
		}
	}
}
