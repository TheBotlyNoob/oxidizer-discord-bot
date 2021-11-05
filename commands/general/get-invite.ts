import { Command } from '@/types';
import embed from '@/embed';

export default () =>
  new Command({
    name: 'get-invite',
    description: 'Get An Invite To The Current Guild',
    async run(interaction, client, rest, db): Promise<any> {
      await interaction.reply({
        embeds: [
          embed({
            title: 'Invite',
            description: `The Invite Is: ${
              (
                db.get('invite') || {
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
