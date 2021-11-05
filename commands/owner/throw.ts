import { Command } from '@/types';
import quit from '@/quit';

export default () =>
  new Command({
    name: 'throw',
    description: 'Throw An Error',
    options: [
      { name: 'message', description: 'The Error Message', type: 'STRING' }
    ],
    forOwner: true,
    async run(interaction, client, rest, db): Promise<any> {
      quit(interaction.options.getString('message') || 'An Error');
    }
  });
