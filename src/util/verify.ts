import { default as fs } from 'fs';
import { default as path } from 'path';
import { CommandModule, SlashCommand } from '../types/discordjsTypes';

/**
 * Verifies that the CLIENT_TOKEN environment variable is defined.
 * @returns The value of CLIENT_TOKEN if it is defined.
 * @throws Error if CLIENT_TOKEN is not defined.
 */
export function verifyClientToken() {
	const CLIENT_TOKEN = process.env.CLIENT_TOKEN;
	if (!CLIENT_TOKEN) {
		console.error('[ERROR] CLIENT_TOKEN is not defined in environment variables!');
		throw new Error('CLIENT_TOKEN is not defined in environment variables');
	} else {
		return CLIENT_TOKEN;
	}
}

/**
 * Verifies that the CLIENT_ID environment variable is defined.
 * @returns The value of CLIENT_ID if it is defined.
 * @throws Error if CLIENT_ID is not defined.
 */
export function verifyClientId(): string {
	const CLIENT_ID = process.env.CLIENT_ID;
	if (!CLIENT_ID) {
		console.error('[ERROR] CLIENT_ID is not defined in environment variables!');
		throw new Error('CLIENT_ID is not defined in environment variables');
	} else {
		return CLIENT_ID;
	}
}

/**
 * Verifies that the GUILD_ID environment variable is defined.
 * @returns The value of GUILD_ID if it is defined.
 * @throws Error if GUILD_ID is not defined.
 */
export function verifyGuildId(): string {
	const GUILD_ID = process.env.GUILD_ID;
	if (!GUILD_ID) {
		console.error('[ERROR] GUILD_ID is not defined in environment variables!');
		throw new Error('GUILD_ID is not defined in environment variables');
	} else {
		return GUILD_ID;
	}
}

/**
 * Verifies that the command folder path is defined.
 * @returns The command folder path if it is defined.
 * @throws Error if the command folder path is not defined.
 */
export function verifyCommandFolderPath(dirname: string): string {
	const foldersPath = path.join(dirname, 'commands');

	if (!fs.existsSync(foldersPath)) {
		console.error(`[ERROR] Commands folder not found at ${foldersPath}`);
		throw new Error(`Commands folder not found at ${foldersPath}`);
	} else {
		return foldersPath;
	}
}

/**
 * Verifies that a command module contains a valid SlashCommand export.
 * @returns The SlashCommand if found, or null if not found.
 * @throws Error if no valid SlashCommand export is found in the module.
 * @param commandModule
 */
export function verifyCommandExistsInModule(commandModule: CommandModule): SlashCommand | null {
	for (const key of Object.keys(commandModule)) {
		const value = commandModule[key];
		if (value && typeof value === 'object' && 'data' in value && 'execute' in value) {
			return value as SlashCommand;
		}
	}

	throw new Error('No valid SlashCommand export found in module');
}
