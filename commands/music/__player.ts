import { Command } from '@/types';
import embed from '@/embed';

export default () =>
  new Command({
    name: 'locate-toilet',
    description: 'Locate The Nearest Toilet',
    aliases: ['toilet'],
    run: async (_, __, ___) => {}
  });
