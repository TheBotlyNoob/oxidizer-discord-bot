import { Command } from '@/types.js';
import quit from '@/quit.js';

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
