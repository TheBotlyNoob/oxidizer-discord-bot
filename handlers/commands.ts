import glob from 'fast-glob';
import Table from 'tty-table';
import { client, rest, dist, log } from '@/main.js';
import embed from '@/embed';
import { codeBlock, userMention } from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';
import { _command } from '@/types';

export default async () => {
  await Promise.all(
    (
      await glob('commands/**/*.js', { ignore: ['**/__*'] })
    ).map(async (command: string) => {
      let _command = await import(`${dist}/${command}`);

      (_command instanceof Function ? _command : () => {})();
    })
  );

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    if (!command.run)
      return await interaction.reply({
        embeds: [
          embed({
            title: 'That Is Not A Command',
            description: 'That Is Not A Runnable Command!',
            user: interaction.user,
            isError: true
          })
        ]
      });

    try {
      if (
        !command.forOwner ||
        (command.forOwner && interaction.user.id === client.config.owner.id)
      ) {
        await command.run(
          interaction,
          client,
          rest,
          client.db.defaultGet(interaction.guild.id, {})
        );
      } else
        await interaction.reply({
          embeds: [
            embed({
              title: 'You Are Not An Owner',
              description: `You Are Not The Owner Of ${client.config.name}`,
              user: interaction.user
            })
          ]
        });
    } catch (error) {
      log.error(error);
      let args = {
        embeds: [
          embed({
            title: 'Error',
            description: `Failed To Execute The Command!\nPlease DM Me About This Error At ${userMention(
              '488802888928329753'
            )}\n${codeBlock('diff', `- ${String(error)} -`)}`,
            user: interaction.user,
            isError: true
          })
        ],
        ephemeral: true
      };

      try {
        await interaction.reply(args);
      } catch {
        await interaction.editReply(args);
      }
    }
  });

  await rest.put(Routes.applicationCommands(client.config.id), {
    body: client.commands.map((command: _command) =>
      command.slash_command.toJSON()
    )
  });

  await rest.put(
    Routes.applicationGuildCommands(client.config.id, '900561863094460497'),
    {
      body: client.commands.map((command: _command) =>
        command.slash_command.toJSON()
      )
    }
  );

  log.log(
    `\n${Table(
      ['Commands', 'Descriptions', 'Aliases'],
      client.commands
        .filter((command) => !command.isAlias)
        .map((command) => [
          command.name,
          command.description,
          command.aliases?.length ? command.aliases.join(', ') : 'No Aliases'
        ])
    ).render()}\n`
  );
};
