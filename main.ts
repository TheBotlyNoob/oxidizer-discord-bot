import { Intents } from 'discord.js';
import glob from 'fast-glob';
import onReady from '@/events/ready.js';
import { REST } from '@discordjs/rest';
import { Client, _command, Logger } from '@/types.js';
import { Routes } from 'discord-api-types/v9';
import { resolve } from 'node:path';
import { spawn as spawnSync } from 'child_process';
import chalk from 'chalk';
import { createRequire } from 'module';

export const require = createRequire(import.meta.url);

const token = require('@/config.json');

process.chdir(__dirname);

export const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
export const rest = new REST({ version: '9' }).setToken(token);
export const dist = __dirname;
export const root = resolve(__dirname, '..');
export const log = new Logger(client.config.name);
export function restart(): never {
  return spawnSync('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    env: { RESTARTED: 'yes' }
  }) as never;
}

if (process.env.RESTARTED === 'yes')
  log.info(`Restarted At ${chalk.yellow(new Date().toLocaleString())}`);

client.config = {
  token,
  youtubeApiKey: (await import(`${root}/config.json`)).youtubeApiKey,
  ...((await rest.get(Routes.oauth2CurrentApplication())) as Client['config'])
};

await Promise.all(
  (
    await glob('handlers/**/*.js')
  ).map(async (handler: string) => (await import(`${dist}/${handler}`))())
);

client.once('ready', async () => await onReady(client));

log.debug(`Token: ${client.config.token}`);
client.login(client.config.token);
