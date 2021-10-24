import { Client as _Client, Collection, CommandInteraction } from 'discord.js';
import {
  SlashCommandBuilder,
  SlashCommandStringOption
} from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { client } from '@';
import { RedisClient } from 'redis';

export class Command {
  constructor(command: command) {
    [
      {
        ...command,
        isAlias: false,
        slashCommand: ((command: command) => {
          let cmd = new SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description);

          (command.options || []).map((userOption) => {
            cmd[
              `add${userOption.type.replace(/./g, (m, i) =>
                i === 0 ? m.toUpperCase() : m.toLowerCase()
              )}Option`
            ]((option: SlashCommandStringOption) => {
              let opt = option
                .setName(userOption.name)
                .setDescription(userOption.description)
                .setRequired(Boolean(userOption.isRequired));

              // (option.addChoices instanceof Function
              //   ? option.addChoices
              //   : (_: [name: string, value: string][]) => _)(
              //   (userOption.choices || []).map((choice) => [
              //     choice.name,
              //     choice.value
              //   ])
              // );

              return opt;
            });
          });

          return cmd;
        })(command)
      },
      ...(command.aliases || []).map((alias: string) => ({
        ...command,
        name: alias,
        isAlias: true,
        slashCommand: ((command: command) => {
          let cmd = new SlashCommandBuilder()
            .setName(alias)
            .setDescription(command.description);

          (command.options || []).map((userOption) => {
            cmd[
              `add${userOption.type.replace(/./g, (m, i) =>
                i === 0 ? m.toUpperCase() : m.toLowerCase()
              )}Option`
            ]((option: SlashCommandStringOption) => {
              let opt = option
                .setName(userOption.name)
                .setDescription(userOption.description)
                .setRequired(Boolean(userOption.isRequired));

              return opt;
            });
          });

          return cmd;
        })(command)
      }))
    ].map((command: _command) => {
      client.commands.set(command.name, command);
    });
  }
}

export class Client extends _Client {
  commands: Collection<string, _command> = new Collection();
  db: RedisClient;
}

export interface command {
  name: string;
  description: string;
  aliases?: string[];
  options?: {
    name: string;
    description: string;
    isRequired?: boolean;
    type:
      | 'STRING'
      | 'INTEGER'
      | 'NUMBER'
      | 'BOOLEAN'
      | 'USER'
      | 'CHANNEL'
      | 'ROLE'
      | 'MENTIONABLE';
    choices?: {
      name: string;
      value: any;
    }[];
  }[];
  run: (client: Client, rest: REST, interaction: CommandInteraction) => any;
}

export interface _command extends command {
  slashCommand: Omit<
    SlashCommandBuilder,
    'addSubcommand' | 'addSubcommandGroup'
  >;
  isAlias: boolean;
}
