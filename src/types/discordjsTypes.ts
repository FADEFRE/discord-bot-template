import { Client, Collection, CommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface ClientWithCommands extends Client<true> {
	commands: ClientCommandType;
}

export type ClientCommandType = Collection<string, SlashCommand>;

export interface SlashCommand {
	data: SlashCommandBuilder;
	execute: (interaction: CommandInteraction) => Promise<void>;
}

// Types for command module loading
export interface CommandModule {
	default?: SlashCommand;
	commandName?: SlashCommand;
	[key: string]: unknown;
}

// Types for Discord API responses
export interface DeployedCommand {
	id: string;
	name: string;
	description: string;
	type?: number;
	application_id?: string;
	version?: string;
}
