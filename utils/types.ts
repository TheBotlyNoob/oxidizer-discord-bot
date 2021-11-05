import {
  Client as _Client,
  Collection as _Collection,
  CommandInteraction
} from 'discord.js';
import { REST } from '@discordjs/rest';
import { client, root } from '@/main.js';
import fs from 'fs-extra';
import exitHook from '@/exit-hook.js';
import { Snowflake as _Snowflake } from '@sapphire/snowflake';
import { default as createLogger } from 'logging';

export class Command implements _command {
  slash_command: slash_command;
  isAlias: boolean;
  name: string;
  description: string;
  aliases?: string[];
  options?: option[];
  run: (
    interaction: CommandInteraction,
    client: Client,
    rest: REST,
    db: {
      [key: string]: any;
    }
  ) => any;

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

  private add_option(option: option, cmd: slash_command) {}

  private slash_command_builder(
    command: command,
    alias?: string,
    builder?: any
  ): any {
    // let cmd: slash_command = { id: BigInt(2) };
    // (command.options || []).map((option) => this.add_option(option, cmd));
    // return cmd;
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
  run?: (
    interaction: CommandInteraction,
    client: Client,
    rest: REST,
    db: {
      [key: string]: any;
    }
  ) => any;
}

export interface _command extends command {
  slash_command: slash_command;
  isAlias: boolean;
}

export interface slash_command {
  id: Snowflake;
  type?: ('CHAT_INPUT' | 1) | ('USER' | 2) | ('MESSAGE' | 3);
  application_id: Snowflake;
  guild_id?: Snowflake;
  name: string;
  description: string;
  options?: option[];
  default_permission?: boolean;
  version: Snowflake;
}

export interface option {
  name: string;
  description: string;
  isRequired?: boolean;
  type:
    | ('SUB_COMMAND' | 1)
    | ('SUB_COMMAND_GROUP' | 2)
    | ('STRING' | 3)
    | ('INTEGER' | 4)
    | ('BOOLEAN' | 5)
    | ('USER' | 6)
    | ('CHANNEL' | 7)
    | ('ROLE' | 8)
    | ('MENTIONABLE' | 9)
    | ('NUMBER' | 10);
  subcommand?: Command;
  choices?: {
    [key: string]: string;
  };
}

export class Collection<K, V> extends _Collection<K, V> {
  toJSON(): any {
    return Object.fromEntries(this);
  }

  defaultGet(key: K, defaultValue: V): V {
    return this.get(key) ?? defaultValue;
  }
}

export class Logger {
  logger: createLogger.Logger;
  errStream: fs.WriteStream;
  outStream: fs.WriteStream;

  constructor(name: string) {
    let time = Date.now();
    this.logger = (createLogger as any).default(name);
    fs.mkdirpSync(`${root}/logs`);
    this.errStream = fs.createWriteStream(`${root}/logs/err-${time}.log`);
    this.outStream = fs.createWriteStream(`${root}/logs/out-${time}.log`);
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

export class DB extends Collection<
  string,
  Collection<
    string,
    {
      [key: string]: any;
    }
  >
> {
  constructor(file: string) {
    super();

    for (const [key, value] of Object.entries(
      (() => {
        try {
          return JSON.parse(fs.readFileSync(file, 'utf-8'));
        } catch {
          fs.writeFileSync(file, '{}');
          return {};
        }
      })()
    ))
      this.set(key, value as any);
    exitHook(() => fs.writeFileSync(file, JSON.stringify(this.toJSON())));
  }
}

export class Snowflake extends Number {
  constructor(epoch?: number | bigint | Date) {
    super(new _Snowflake(epoch || Snowflake.DiscordEpoch));
  }

  public static readonly DiscordEpoch = 1420070400000;
}
