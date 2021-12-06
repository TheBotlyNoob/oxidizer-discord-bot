import { InteractionCommandClient } from 'detritus-client';
import type { InteractionCommandClientOptions } from 'detritus-client';
import DB from '@/db.js';

export class Client extends InteractionCommandClient {
  constructor(
    token: string,
    db: DB,
    config: config,
    options?: InteractionCommandClientOptions
  ) {
    super(token, options);

    Object.assign(this, { db, config });
  }

  config: config;

  db: DB;
}

export interface config {
  token: string;
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
}
