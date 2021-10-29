import {
  Client as _Client,
  Collection as _Collection,
  CommandInteraction
} from 'discord.js';
import {
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder
} from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { client } from '@';
import { readFileSync, writeFileSync } from 'fs-extra';
import exitHook from '@/exit-hook';
import quit from '@/quit';

export class Command implements _command {
  slashCommand: Omit<
    SlashCommandBuilder,
    'addSubcommand' | 'addSubcommandGroup'
  >;
  isAlias: boolean;
  name: string;
  description: string;
  aliases?: string[];
  options?: option[];
  run: (client: Client, rest: REST, interaction: CommandInteraction) => any;

  constructor(command: command, addToDB: boolean = true) {
    [
      {
        ...command,
        isAlias: false,
        slashCommand: this.slashCommandBuilder(command)
      },
      ...(command.aliases || []).map((alias: string) => ({
        ...command,
        name: alias,
        isAlias: true,
        slashCommand: this.slashCommandBuilder(command, alias)
      }))
    ].map((command: _command) => {
      if (addToDB) client.commands.set(command.name, command);
      command.isAlias
        ? this.aliases.push(command.name)
        : Object.assign(this, command);
    });
  }

  private addOption(_opt: option, cmd: SlashCommandBuilder) {
    let prev = 0;
    let addOptionString = _opt.type.replace(/./g, (m: string, i: number) =>
      m === '_'
        ? (() => {
            prev = i++;
            return '';
          })()
        : i === 0 || i === prev
        ? m.toUpperCase()
        : m.toLowerCase()
    );

    cmd[
      `add${
        addOptionString.includes('Subcommand')
          ? addOptionString
          : addOptionString + 'Option'
      }`
    ]((option: SlashCommandStringOption) => {
      if (option.type === undefined)
        return (
          this.slashCommandBuilder(this, null, SlashCommandSubcommandBuilder) ??
          quit(
            new TypeError(
              'The Subcommand Is Required When Using A Subcommand Option'
            )
          )
        );

      let opt = option.setName(_opt.name).setDescription(_opt.description);

      opt.setRequired?.(Boolean(_opt.isRequired));

      Object.entries(_opt.choices || []).map(([name, value]) =>
        option.addChoice?.(name, String(value))
      );

      return opt;
    });
  }

  private slashCommandBuilder(command: command, alias?: string, builder?: any) {
    let cmd = new (builder ?? SlashCommandBuilder)()
      .setName(alias || command.name)
      .setDescription(command.description);

    (command.options || []).map((option) => this.addOption(option, cmd));

    return cmd;
  }
}

export class Client extends _Client {
  commands: Collection<string, _command> = new Collection();
  db: DB;
  config: {
    token: string;
    youtubeApiKey: string | null;
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
  };
}

export interface command {
  name: string;
  description: string;
  aliases?: string[];
  options?: option[];
  run: (client: Client, rest: REST, interaction: CommandInteraction) => any;
}

export interface _command extends command {
  slashCommand: Omit<
    SlashCommandBuilder,
    'addSubcommand' | 'addSubcommandGroup'
  >;
  isAlias: boolean;
}

export interface option {
  name: string;
  description: string;
  isRequired?: boolean;
  type:
    | 'SUB_COMMAND'
    | 'SUB_COMMAND_GROUP'
    | 'STRING'
    | 'INTEGER'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'USER'
    | 'CHANNEL'
    | 'ROLE'
    | 'MENTIONABLE';
  subcommand?: Command;
  choices?: any;
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
    exitHook(() => writeFileSync(file, JSON.stringify(this.toJSON())));
  }
}
