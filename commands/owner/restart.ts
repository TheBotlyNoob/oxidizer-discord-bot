import { Command } from '@/types';
import { pull } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import { root, client, restart, log } from '@';

export default new Command({
  name: 'restart',
  description: 'Restart The Bot',
  async run(_, __, ___) {
    log.warn('Pulling, And Restarting...');

    pull({
      fs,
      http,
      dir: root,
      author: {
        name: client.config.name
      }
    });
    restart();
  }
});
