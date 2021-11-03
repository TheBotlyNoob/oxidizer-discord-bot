import { Command } from '@/types';
import embed from '@/embed';

export default () =>
  new Command({
    name: 'get-invite',
    description: 'Get An Invite To The Current Guild',
    async run(client, __, interaction) {
      await interaction.reply({
        embeds: [
          embed({
            title: 'Invite',
            description: `The Invite Is: ${
              (
                client.db.get(`invite-${interaction.guild.name}`) || {
                  url: 'There Is No Invite For This Server!'
                }
              ).url
            }`,
            user: interaction.user
          })
        ],
        ephemeral: true
      });
    }
  });
