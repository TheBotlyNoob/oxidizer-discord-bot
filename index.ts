import {
  Client as _Client,
  Collection,
  Intents,
  CommandInteraction
} from 'discord.js';
import glob from 'fast-glob';
import onReady from 'events/ready.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { token, clientId } from './config.json';

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
    Routes.applicationGuildCommands(clientId, '899823921765969940'),
    {
      body: client.commands.map((command) => command.slashCommand.toJSON())
    }
  );

  client.login(token);
}

export interface command {
  name: string;
  description: string;
  aliases: string[];
  run: (client: Client, rest: REST, interaction: CommandInteraction) => any;
}

export class Command {
  name: string;
  description: string;
  aliases: string[] | undefined;
  run: (client: Client, rest: REST, interaction: CommandInteraction) => any;
  slashCommand: SlashCommandBuilder;

  constructor(command: command) {
    Object.assign(this, command);
    const commands = [
      {
        ...command,
        slashCommand: new SlashCommandBuilder()
          .setName(command.name)
          .setDescription(command.description)
      },
      ...command.aliases.map((alias: string) => ({
        ...command,
        name: alias,
        slashCommand: new SlashCommandBuilder()
          .setName(alias)
          .setDescription(command.description)
      }))
    ];
    commands.map((command: _command) =>
      client.commands.set(command.name, command)
    );
  }
}

export class Client extends _Client {
  commands: Collection<string, Command> = new Collection();
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const rest = new REST({ version: '9' }).setToken(token);

export interface _command {
  name: string;
  description: string;
  aliases: string[];
  run: (client: Client, rest: REST, interaction: CommandInteraction) => any;
  slashCommand: SlashCommandBuilder;
}

main();
