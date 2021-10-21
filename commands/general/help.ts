import { MessageEmbed } from 'discord.js';
import { Command } from 'index';
import Embed from 'utils/embed';

export default new Command({
  name: 'help',
  description: 'The help command',
  aliases: ['commands'],
  run: (_, __, interaction) =>
    interaction.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor(
            interaction.user.tag,
            interaction.user.displayAvatarURL({ dynamic: true })
          )
          .setTitle('Help Menu')
          .setDescription(
            'The Help Menu, Contains All The Commands And Their Names.'
          )
          .setTimestamp()
      ]
    })
});
