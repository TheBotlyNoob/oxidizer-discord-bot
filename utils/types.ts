import {
  Client as _Client,
  Collection as _Collection,
  CommandInteraction
} from 'discord.js';
import {
  SlashCommandBuilder,
  SlashCommandStringOption
} from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { client } from '@';
import { readFileSync, writeFileSync } from 'fs-extra';
import exitHook from '@/exit-hook';

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
  db: DB;
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

export class Collection<K, V> extends _Collection<K, V> {
  toJSON(): any {
    return Object.fromEntries(this);
  }

  defaultGet(key: K, defaultValue?: V): V {
    return this.get(key) ?? defaultValue;
  }
}

export class DB extends Collection<string, unknown> {
  constructor(file: string) {
    super();

    for (const [key, value] of Object.entries(
      (() => {
        try {
          return JSON.parse(readFileSync(file, 'utf-8'));
        } catch {
          writeFileSync(file, '{}');
          return {};
        }
      })()
    ))
      this.set(key, value);
    this.get;
    exitHook(() => writeFileSync(file, JSON.stringify(this.toJSON())));
  }
}
