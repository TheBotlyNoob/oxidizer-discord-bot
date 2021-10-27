import { Command } from '@/types';
import embed from '@/embed';
import player from '@/commands/music/__player';

export default () =>
  new Command({
    name: 'music',
    description: 'Music Commands And Options',
    options: [
      {
        name: 'title',
        description: 'The Title Of The Song You Want To Play',
        type: 'STRING'
      },
      {
        name: 'play',
        description: 'Hi There!',
        type: 'SUB_COMMAND',
        subcommand: player()
      }
    ],
    run: async (_, __, interaction) => {
      await interaction.reply({
        embeds: [
          embed({
            title: 'The Nearest Toilet',
            description: ``,
            user: interaction.user
          })
        ]
      });
    }
  });
