import { Command } from '@/types';
import { pull } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import { root, client, restart, log } from '@';
import embed from '@/embed';

export default new Command({
  name: 'restart',
  description: 'Restart The Bot',
  async run(_, __, interaction) {
    log.warn('Pulling, And Restarting...');

    await interaction.reply({
      embeds: [
        embed({
          title: 'Pulling And Restarting...',
          description: '',
          user: interaction.user
        })
      ],
      ephemeral: true
    });

    await pull({
      fs,
      http,
      dir: root,
      author: {
        name: client.config.name
      }
    });

    await restart();
  }
});
