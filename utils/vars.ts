import fs from 'fs-extra';
import { JSONFile } from 'lowdb';
import { Client as RestClient } from 'detritus-client-rest';
import Client from '@/client.js';
import DB from '@/db.js';
import { root } from '@/dirs.js';

const { token } = JSON.parse(await fs.readFile(`${root}/config.json`, 'utf8'));

export const rest = new RestClient(token);

export const client = new Client(
  token,
  new DB(new JSONFile(`${root}/db.json`)),
  {
    token,
    ...(await rest.fetchOauth2Application())
  },
  {
    gateway: {
      loadAllMembers: true,
      presence: {
        activity: {
          name: 'Bart Simpson',
          type: 1
        },
        status: 'online'
      }
    }
  }
);
