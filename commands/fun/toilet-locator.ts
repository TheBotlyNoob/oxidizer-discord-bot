import { Command } from '@/index';
import rand from '@/utils/rand';

export default new Command({
  name: 'locate-toilet',
  description: 'Locate The Nearest Toilet',
  aliases: ['toilet'],
  run: (_, __, interaction) => {
    interaction.reply(`The Nearest Toilet Is: ${rand(100)} Feet Away`);
  }
});
