import { Intents } from 'discord.js';
import glob from 'fast-glob';
import onReady from '@/events/ready.js';
import embed from '@/embed';
import { codeBlock, userMention } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, _command } from '@/types';
import { token, clientId } from '@/config.json';
import log from '@/log';
import { resolve } from 'node:path';

process.chdir(__dirname);

async function main(
  client: Client,
  rest: REST,
  require: (path: string) => any
) {
  await Promise.all(
    (
      await glob('handlers/**/*.js')
    ).map(async (handler: string) => require(`${__dirname}/${handler}`)())
  );

  client.once('ready', () => onReady(client));

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.run(client, rest, interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        embeds: [
          embed({
            title: 'Error',
            description: `Failed To Execute The Command!\nPlease DM Me About This Error At ${userMention(
              '488802888928329753'
            )}\n${codeBlock('diff', `! ${String(error)} !`)}`,
            user: interaction.user,
            isError: true
          })
        ],
        ephemeral: true
      });
    }
  });

  await rest.put(Routes.applicationCommands(clientId), {
    body: client.commands.map((command: _command) =>
      command.slashCommand.toJSON()
    )
  });

  log.debug(`Token: ${token}`);
  client.login(token);
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
