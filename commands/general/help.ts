import { Command } from '@/index';
import embed from '@/utils/embed';

export default new Command({
  name: 'help',
  description: 'Commands And Their Descriptions',
  aliases: ['commands'],
  run: (client, __, interaction) => {
    interaction.reply({
      embeds: [
        embed({
          title: 'Help Menu',
          description: 'Commands And Their Descriptions',
          fields: client.commands
            .filter((command) => !command.isAlias)
            .map((command) => ({
              name: command.name,
              value: `${command.description}\nAliases: ${command.aliases.join(
                ', '
              )}`
            })),
          user: interaction.user
        })
      ]
    });
  }
});
