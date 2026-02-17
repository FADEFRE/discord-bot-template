import { GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { Client } from './client.js';

dotenv.config();

const extendedClient = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

await extendedClient.deployCommands();

extendedClient.registerEventListeners();

extendedClient.login(process.env.CLIENT_TOKEN).then((_) => {});
