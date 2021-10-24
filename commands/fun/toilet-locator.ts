import { Command } from '@types';
import rand from '@/utils/rand';
import embed from '@embed';

export default () =>
  new Command({
    name: 'locate-toilet',
    description: 'Locate The Nearest Toilet',
    aliases: ['toilet'],
    run: async (_, __, interaction) => {
      await interaction.reply({
        embeds: [
          embed({
            title: 'The Nearest Toilet',
            description: `The Nearest Toilet Is: ${rand(100, 20)} Feet Away`,
            user: interaction.user
          })
        ]
      });
    }
  });
