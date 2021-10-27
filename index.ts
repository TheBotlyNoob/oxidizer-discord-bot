import { Intents } from 'discord.js';
import glob from 'fast-glob';
import onReady from '@/events/ready.js';
import { REST } from '@discordjs/rest';
import { Client, _command } from '@/types';
import log from '@/log';
import { Routes } from 'discord-api-types/v9';
import { resolve } from 'node:path';
import { token } from '@/config.json';

process.chdir(__dirname);

async function main(
  client: Client,
  rest: REST,
  require: (path: string) => any
) {
  client.config = {
    token: token,
    youtubeApiKey: require('@/config.json').youtubeApiKey,
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

  await Promise.all(
    (
      await glob('handlers/**/*.js')
    ).map(async (handler: string) => require(`${__dirname}/${handler}`)())
  );

  client.once('ready', () => onReady(client));

  log.debug(`Token: ${client.config.token}`);
  client.login(client.config.token);
}

export function default_require(path: string): any {
  let required_item = require(path);

  return required_item.default ?? required_item;
}

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
export const rest = new REST({ version: '9' }).setToken(token);
export function imp(path: string): any {
  let required_item = require(path);

  return required_item?.default ?? required_item;
}
export const dist = __dirname;
export const root = resolve(__dirname, '..');

main(client, rest, imp);
