import glob from 'fast-glob';
import Table from 'tty-table';
import { client, rest, dist, defaultRequire, log } from '@';
import embed from '@/embed';
import { codeBlock, userMention } from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';
import { _command } from '@/types';

export default async () => {
  (await glob('commands/**/*.js', { ignore: ['**/__*'] })).map(
    (command: string) => {
      let _command = defaultRequire(`${dist}/${command}`);

      (_command instanceof Function ? _command : () => {})();
    }
  );

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      if (
        !command.forOwner ||
        (command.forOwner && interaction.user.id === client.config.owner.id)
      )
        await command.run(client, rest, interaction);
      else
        await interaction.reply({
          embeds: [
            embed({
              title: 'You Are Not An Owner',
              description: `You Are Not An Owner Of ${client.config.name}`,
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

  console.log(
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
