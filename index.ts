import { Intents } from 'discord.js';
import glob from 'fast-glob';
import onReady from '@/events/ready.js';
import { REST } from '@discordjs/rest';
import { Client, _command, Logger } from '@/types';
import { Routes } from 'discord-api-types/v9';
import { resolve } from 'node:path';
import { token } from '@/config.json';
import { spawn as spawnSync } from 'child_process';
import { yellow } from 'chalk';

process.chdir(__dirname);

export default async function main() {
  if (process.env.RESTARTED === 'yes')
    log.info(`Restarted At ${yellow(new Date().toLocaleString())}`);

  client.config = {
    token: token,
    youtubeApiKey: defaultRequire(`${root}/config.json`).youtubeApiKey,
    ...((await rest.get(Routes.oauth2CurrentApplication())) as Client['config'])
  };

  (await glob('handlers/**/*.js')).map((handler: string) =>
    defaultRequire(`${dist}/${handler}`)()
  );

  client.once('ready', async () => await onReady(client));

  log.debug(`Token: ${client.config.token}`);
  client.login(client.config.token);
}

export const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
export const rest = new REST({ version: '9' }).setToken(token);
export const dist = __dirname;
export const root = resolve(__dirname, '..');
export const log = new Logger('Principal Bot');
export function defaultRequire(path: string) {
  let required_item = require(path);

  return required_item?.default || required_item;
}

export function restart(): never {
  return spawnSync('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    env: { RESTARTED: 'yes' }
  }) as never;
}

if (require.main === module) main();
