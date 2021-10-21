import { Command } from '@/index';
import rand from '@/utils/rand';

export default new Command({
  name: 'help',
  description: 'Commands And Their Descriptions',
  aliases: ['commands'],
  run: (_, __, interaction) => {
    interaction.reply(`The Nearest Toilet Is: ${rand(100)} Feet Away`);
  }
});
