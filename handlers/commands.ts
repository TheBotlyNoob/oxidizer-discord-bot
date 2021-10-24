import glob from 'fast-glob';
import ascii from 'ascii-table';
import { client, imp, dist } from '@';

export default async () => {
  (await glob('commands/**/*.js')).map((command: string) =>
    imp(`${dist}/${command}`)()
  );

  const table = new ascii('Commands');
  table.setHeading('Command', 'Descriptions', 'Aliases');
  client.commands
    .filter((command) => !command.isAlias)
    .map((command) =>
      table.addRow(
        command.name,
        command.description,
        command.aliases ? command.aliases.join(', ') : 'No Aliases'
      )
    );
  console.log(`\n${String(table)}\n`);
};
