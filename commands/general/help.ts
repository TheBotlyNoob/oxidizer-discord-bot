import { Command } from '@types';
import embed from '@embed';

export default () =>
  new Command({
    name: 'help',
    description: 'Commands And Their Descriptions',
    aliases: ['commands'],
    run: async (client, _, interaction) => {
      await interaction.reply({
        embeds: [
          embed({
            title: 'Help Menu',
            description: 'Commands And Their Descriptions',
            fields: client.commands
              .filter((command) => !command.isAlias)
              .map((command) => ({
                name: command.name,
                value: `${command.description}\nAliases: ${
                  command.aliases
                    ? command.aliases.join(', ')
                    : 'There Are No Aliases'
                }`
              })),
            user: interaction.user
          })
        ]
      });
    }
  });
