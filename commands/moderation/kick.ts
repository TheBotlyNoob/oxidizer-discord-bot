import { Command } from '@/types';
import { Permissions } from 'discord.js';
import { userMention } from '@discordjs/builders';
import embed from '@/embed';

export default () =>
  new Command({
    name: 'kick',
    description: 'Kick A User With A Reason',
    options: [
      {
        name: 'user',
        description: 'The User To Ban',
        type: 'USER',
        isRequired: true
      },
      {
        name: 'reason',
        description: 'The Reason You Are Banning The User',
        type: 'STRING',
        isRequired: true
      }
    ],
    async run(_, __, interaction) {
      let user = interaction.options.getUser('user');
      let reason = interaction.options.getString('reason');
      let member = await interaction.guild.members.fetch(user);

      if (!interaction.memberPermissions.has(Permissions.FLAGS.KICK_MEMBERS))
        return await interaction.reply({
          content: 'You Do Not Have Permission To Kick Members',
          ephemeral: true
        });
      else if (!member.kickable)
        return await interaction.reply({
          embeds: [
            embed({
              title: 'Cannot Kick This User',
              description: `You Are Not Able To Kick ${userMention(user.id)}`,
              user: interaction.user,
              isError: true
            })
          ],
          ephemeral: true
        });

      await member.kick(reason);
      try {
        await user.send({
          embeds: [
            embed({
              title: 'You Were Kicked',
              description: `You Were Kicked From: ${interaction.guild.name}, For: ${reason}`,
              user,
              isError: true
            })
          ]
        });
      } catch {}

      await interaction.reply({
        embeds: [
          embed({
            title: 'Kicked User',
            description: `Sucessfully Kicked User: ${user.tag}, For ${reason}`,
            user: interaction.user
          })
        ],
        ephemeral: true
      });
    }
  });
