import {
  Client as _Client,
  Collection,
  Intents,
  CommandInteraction
} from 'discord.js';
import glob from 'fast-glob';
import onReady from '@/events/ready.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { token, clientId } from '@/config.json';

process.chdir(__dirname);

async function main() {
  (await glob('commands/**/*.js')).map((command: string) =>
    require(`${__dirname}/${command}`)
  );

  (await glob('handlers/**/*.js')).map(async (handler: string) =>
    require(`${__dirname}/${handler}`)
  );

  client.once('ready', onReady);

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.run(client, rest, interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `Failed To Execute The Command!\nPlease DM Me About This Error At <@488802888928329753>\n${error}`
      });
    }
  });

  await rest.put(
    Routes.applicationGuildCommands(clientId, '900561863094460497'),
    {
      body: client.commands.map((command) => command.slashCommand.toJSON())
    }
  );

  client.login(token);
}

export class Command {
  constructor(command: command) {
    [
      {
        ...command,
        isAlias: false,
        slashCommand: new SlashCommandBuilder()
          .setName(command.name)
          .setDescription(command.description)
      },
      ...command.aliases.map((alias: string) => ({
        ...command,
        name: alias,
        isAlias: true,
        slashCommand: new SlashCommandBuilder()
          .setName(alias)
          .setDescription(command.description)
      }))
    ].map((command: _command) => {
      client.commands.set(command.name, command);
    });
  }
}

export class Client extends _Client {
  commands: Collection<string, _command> = new Collection();
}

export interface command {
  name: string;
  description: string;
  aliases: string[];
  run: (client: Client, rest: REST, interaction: CommandInteraction) => any;
}

export interface _command {
  name: string;
  description: string;
  aliases: string[];
  run: (client: Client, rest: REST, interaction: CommandInteraction) => any;
  slashCommand: SlashCommandBuilder;
  isAlias: boolean;
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const rest = new REST({ version: '9' }).setToken(token);

main();
