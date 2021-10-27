import { Command } from '@/types';
import embed from '@/embed';
import player from '@/commands/music/__player';

export default () =>
  new Command({
    name: 'music',
    description: 'Music Commands And Options',
    options: [
      {
        name: 'play',
        description: 'Hi There!',
        type: 'SUB_COMMAND',
        subcommand: player()
      }
    ],
    run: (_, __, ___) => void 0
  });
