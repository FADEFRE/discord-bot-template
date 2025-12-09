import { SlashCommand } from '@/types/discordjsTypes';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

/**
 * The name of the function does not matter but should be unique.
 *
 */
export const commandIdentifier: SlashCommand = {
	data: new SlashCommandBuilder().setName('template-command').setDescription('template-command'),

	async execute(interaction: CommandInteraction) {
		console.log('Executing template command');
		await interaction.reply('This is a template command response!');
	},
};
