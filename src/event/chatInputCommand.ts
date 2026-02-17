import { ChatInputCommandInteraction, Events, Interaction } from 'discord.js';
import { Client } from '../client.js';
import { SlashCommand } from '../types/discordjsTypes';

export function registerChatInputCommands(client: Client) {
	client.on(Events.InteractionCreate, async (interaction: Interaction) => {
		if (!interaction.isChatInputCommand()) {
			return;
		}

		try {
			const command = verifyCommandExistsOnClient(client, interaction);
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
}

function verifyCommandExistsOnClient(client: Client, interaction: ChatInputCommandInteraction): SlashCommand {
	const command = client.commands.get(interaction.commandName);

	if (!command) {
		throw new Error(`No command matching ${interaction.commandName} was found.`);
	}

	return command;
}
