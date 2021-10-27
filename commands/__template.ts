import { Command } from '@/types';

export default () =>
  new Command({
    name: 'name',
    description: 'Command Template For The Principal Bot',
    aliases: [],
    run: async (_, __, ___) => void 0
  });
