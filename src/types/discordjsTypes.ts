import { Client, Collection, CommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface ClientWithCommands extends Client {
	commands: ClientCommandType;
}

export type ClientCommandType = Collection<string, SlashCommand>;

export interface SlashCommand {
	data: SlashCommandBuilder;
	execute: (interaction: CommandInteraction) => Promise<void>;
}
