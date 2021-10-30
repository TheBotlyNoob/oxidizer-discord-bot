import { Command } from '@/types';
import rand from '@/rand';
import embed from '@/embed';

export default () =>
  new Command({
    name: 'locate-toilet',
    description: 'Locate The Nearest Toilet',
    aliases: ['toilet'],
    async run(_, __, interaction) {
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
