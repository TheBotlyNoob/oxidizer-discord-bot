import { Command } from '@/types';
import { pull } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import { root, restart, log } from '@/main.js';
import embed from '@/embed';

export default new Command({
  name: 'restart',
  description: 'Restart The Bot',
  async run(interaction, client, rest, db): Promise<any> {
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

    restart();
  }
});
