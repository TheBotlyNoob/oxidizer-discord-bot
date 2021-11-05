import { Intents } from 'discord.js';
import glob from 'fast-glob';
import onReady from '@/events/ready.js';
import { REST } from '@discordjs/rest';
import { Client, _command, Logger } from '@/types.js';
import { Routes } from 'discord-api-types/v9';
import { resolve } from 'node:path';
import { spawn as spawnSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs-extra';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';

export const dist = dirname(fileURLToPath(import.meta.url));
export const root = resolve(dist, '..');

process.chdir(dist);

export async function require(path: string): Promise<any> {
  console.log(await import(String(pathToFileURL(path))));
}

const { token, youtubeApiKey } = JSON.parse(
  await fs.readFile(`${root}/config.json`, 'utf8')
);

export const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
export const rest = new REST({ version: '9' }).setToken(token);
client.config = {
  token,
  youtubeApiKey,
  ...((await rest.get(Routes.oauth2CurrentApplication())) as Client['config'])
};

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

await Promise.all(
  (
    await glob('handlers/**/*.js')
  ).map(async (handler: string) => await require(`${dist}/${handler}`))
);

client.once('ready', async () => await onReady(client));

log.debug(`Token: ${client.config.token}`);
await client.login(client.config.token);
