import { Intents } from 'discord.js';
import glob from 'fast-glob';
import onReady from '@/events/ready.js';
import { REST } from '@discordjs/rest';
import { Client, _command, logger } from '@/types';
import { Routes } from 'discord-api-types/v9';
import { resolve } from 'node:path';
import { token } from '@/config.json';
import { spawn } from 'child_process';

process.chdir(__dirname);

export default async function main() {
  console.log(process.env.RESTARTED);

  client.config = {
    token: token,
    youtubeApiKey: defaultRequire(`${root}/config.json`).youtubeApiKey,
    ...((await rest.get(Routes.oauth2CurrentApplication())) as {
      id: string;
      name: string;
      icon: string;
      description: string;
      summary: string;
      hook: boolean;
      bot_public: boolean;
      bot_require_code_grant: boolean;
      verify_key: string;
      owner: {
        id: string;
        username: string;
        avatar: string;
        discriminator: string;
        public_flags: number;
        flags: number;
      };
      team: string | null;
    })
  };

  (await glob('handlers/**/*.js')).map((handler: string) =>
    defaultRequire(`${dist}/${handler}`)()
  );

  client.once('ready', () => onReady(client));

  log.debug(`Token: ${client.config.token}`);
  client.login(client.config.token);
}

export const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
export const rest = new REST({ version: '9' }).setToken(token);
export const dist = __dirname;
export const root = resolve(__dirname, '..');
export const log = new logger('Principal Bot');
export function defaultRequire(path: string) {
  let required_item = require(path);

  return required_item?.default || required_item;
}

export async function restart() {
  spawn('npm', ['start'], {
    stdio: 'pipe',
    shell: true,
    env: { RESTARTED: 'yes' }
  });

  process.exit(0);
}

if (require.main === module) main();
