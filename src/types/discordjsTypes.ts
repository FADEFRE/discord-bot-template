import { Collection, CommandInteraction, SlashCommandBuilder } from 'discord.js';

export type ClientCommandType = Collection<string, SlashCommand>;

export type SlashCommand = BasicSlashCommand | AutoCompleteSlashCommand;

export interface BasicSlashCommand {
	data: SlashCommandBuilder;
	execute: (interaction: CommandInteraction) => Promise<void>;
}

export interface AutoCompleteSlashCommand extends BasicSlashCommand {
	autoComplete: (interaction: CommandInteraction) => Promise<void>;
}

// Types for command module loading
export interface CommandModule {
	[key: string]: unknown;
}
