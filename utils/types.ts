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
import { client, root } from '@';
import {
  readFileSync,
  writeFileSync,
  createWriteStream,
  WriteStream,
  mkdirpSync
} from 'fs-extra';
import exitHook from '@/exit-hook';
import quit from '@/quit';
import createLogger from 'logging';

export class Command implements _command {
  slash_command: Omit<
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
        slash_command: this.slash_command_builder(command)
      },
      ...(command.aliases || []).map((alias: string) => ({
        ...command,
        name: alias,
        isAlias: true,
        aliases: command.aliases.filter((item: string) => item !== alias),
        slash_command: this.slash_command_builder(command, alias)
      }))
    ].map((command: _command) => {
      if (addToDB) client.commands.set(command.name, command);
    });

    Object.assign(this, command);
  }

  private add_option(_opt: option, cmd: SlashCommandBuilder) {
    let prev = 0;
    let add_option_string = _opt.type.replace(/./g, (m: string, i: number) =>
      m === '_'
        ? void (prev = i++) || ''
        : i === 0 || i === prev
        ? m.toUpperCase()
        : m.toLowerCase()
    );

    cmd[
      `add${
        add_option_string.includes('Subcommand')
          ? add_option_string
          : add_option_string + 'Option'
      }`
    ]((option: SlashCommandStringOption) => {
      if (_opt.type.includes('SUB_COMMAND'))
        return _opt.subcommand
          ? this.slash_command_builder(
              _opt.subcommand,
              null,
              SlashCommandSubcommandBuilder
            )
          : quit(
              new TypeError(
                'The Subcommand Is Required When Using A Subcommand Option'
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

  private slash_command_builder(
    command: command,
    alias?: string,
    builder?: any
  ) {
    let cmd: SlashCommandBuilder = new (builder ?? SlashCommandBuilder)()
      .setName(alias || command.name)
      .setDescription(command.description);

    (command.options || []).map((option) => this.add_option(option, cmd));

    return cmd;
  }
}

export class Client extends _Client {
  commands: Collection<string, _command> = new Collection();
  db: DB;
  config: {
    token: string;
    youtubeApiKey?: string;
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
  forOwner?: boolean;
  run?: (client: Client, rest: REST, interaction: CommandInteraction) => any;
}

export interface _command extends command {
  slash_command: Omit<
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
  choices?: {
    [key: string]: string;
  };
}

export class Collection<K, V> extends _Collection<K, V> {
  toJSON(): any {
    return Object.fromEntries(this);
  }

  defaultGet(key: K, defaultValue?: V): V {
    return this.get(key) ?? defaultValue;
  }
}

export class Logger {
  logger: createLogger.Logger;
  errStream: WriteStream;
  outStream: WriteStream;

  constructor(name: string) {
    let time = Date.now();
    this.logger = createLogger(name);
    mkdirpSync(`${root}/logs`);
    this.errStream = createWriteStream(`${root}/logs/err-${time}.log`);
    this.outStream = createWriteStream(`${root}/logs/out-${time}.log`);
  }

  info(...args: unknown[]): void {
    this.logger.info(...args);
    this.outStream.write(
      args
        .map((arg) => {
          if (arg instanceof String || typeof arg === 'string') return arg;

          try {
            return JSON.stringify(arg);
          } catch {
            return arg;
          }
        })
        .join('') + '\n'
    );
  }

  debug(...args: unknown[]): void {
    this.logger.debug(...args);
    this.outStream.write(
      args
        .map((arg) => {
          if (arg instanceof String || typeof arg === 'string') return arg;

          try {
            return JSON.stringify(arg);
          } catch {
            return arg;
          }
        })
        .join('') + '\n'
    );
  }

  error(...args: unknown[]): void {
    this.logger.error(...args);
    this.errStream.write(
      args
        .map((arg) => {
          if (arg instanceof String || typeof arg === 'string') return arg;

          try {
            return JSON.stringify(arg);
          } catch {
            return arg;
          }
        })
        .join('') + '\n'
    );
    this.outStream.write(
      args
        .map((arg) => {
          if (arg instanceof String || typeof arg === 'string') return arg;

          try {
            return JSON.stringify(arg);
          } catch {
            return arg;
          }
        })
        .join('') + '\n'
    );
  }

  warn(...args: unknown[]): void {
    this.logger.warn(...args);
    this.errStream.write(
      args
        .map((arg) => {
          if (arg instanceof String || typeof arg === 'string') return arg;

          try {
            return JSON.stringify(arg);
          } catch {
            return arg;
          }
        })
        .join('') + '\n'
    );
    this.outStream.write(
      args
        .map((arg) => {
          if (arg instanceof String || typeof arg === 'string') return arg;

          try {
            return JSON.stringify(arg);
          } catch {
            return arg;
          }
        })
        .join('') + '\n'
    );
  }

  log(...args: unknown[]): void {
    console.log(...args);

    this.errStream.write(
      args
        .map((arg) => {
          if (arg instanceof String || typeof arg === 'string') return arg;

          try {
            return JSON.stringify(arg);
          } catch {
            return arg;
          }
        })
        .join('') + '\n'
    );
    this.outStream.write(
      args
        .map((arg) => {
          if (arg instanceof String || typeof arg === 'string') return arg;

          try {
            return JSON.stringify(arg);
          } catch {
            return arg;
          }
        })
        .join('') + '\n'
    );
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
