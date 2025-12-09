import { ClientWithCommands } from '@/types/discordjsTypes';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import deploy from './deployCommands.js';

dotenv.config();

const clientWithCustomType = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
}) as ClientWithCommands;

clientWithCustomType.commands = new Collection();

deploy(clientWithCustomType).then((_) => {});

clientWithCustomType.once(Events.ClientReady, async (client) => {
	console.log(`Logged in as ${client.user?.tag}`);

	const GUILD_ID = process.env.GUILD_ID;
	if (!GUILD_ID) {
		console.error('GUILD_ID is not defined in environment variables');
		return;
	}

	try {
		const guild = await client.guilds.fetch(GUILD_ID);
		console.log(`Connected to guild: ${guild.name}`);
	} catch (error) {
		console.error('Failed to fetch guild:', error);
	}
});

clientWithCustomType.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	// Cast the client to our custom type that includes commands
	const command = (interaction.client as ClientWithCommands).commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error('Error executing command:', error);

		const errorMessage = {
			content: 'There was an error while executing this command!',
			ephemeral: true,
		};

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp(errorMessage);
		} else {
			await interaction.reply(errorMessage);
		}
	}
});

clientWithCustomType.login(process.env.CLIENT_TOKEN).then((_) => {});
