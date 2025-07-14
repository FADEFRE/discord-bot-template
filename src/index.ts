import { Client, CommandInteraction, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { chatInteractionIsCommand, deployCommands } from './deployCommands';
import { ClientWithCommands } from './types/discordjsTypes';

dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	],
}) as ClientWithCommands;

const BOT_TOKEN = process.env.CLIENT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!BOT_TOKEN || !CLIENT_ID || !GUILD_ID) {
	console.error('Missing CLIENT_TOKEN, CLIENT_ID or GUILD_ID in environment variables.');
	process.exit(1);
}

await deployCommands(client, BOT_TOKEN, CLIENT_ID);

client.once(Events.ClientReady, async (clnt: Client) => {
	console.log(`Logged in as ${clnt.user?.tag}`);

	const guild = await client.guilds.fetch(GUILD_ID);

	console.log(`Connected to guild: ${guild.name}`);
	performScheduledTask();
});

function performScheduledTask(intervalInSeconds: number = 300) {
	setInterval(async () => {
		//function to run
	}, intervalInSeconds * 1000);
}

client.on(Events.InteractionCreate, async (interaction: any) => {
	if (interaction.isChatInputCommand()) {
		await chatInteractionIsCommand(interaction as CommandInteraction, interaction.client as ClientWithCommands);
	} else {
		return;
	}
});

client.login(process.env.CLIENT_TOKEN);
