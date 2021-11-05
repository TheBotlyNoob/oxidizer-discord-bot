import { Command } from '@/types.js';
import rand from '@/rand.js';
import embed from '@/embed.js';

export default () =>
  new Command({
    name: 'locate-toilet',
    description: 'Locate The Nearest Toilet',
    aliases: ['toilet'],
    async run(interaction, client, rest, db): Promise<any> {
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
