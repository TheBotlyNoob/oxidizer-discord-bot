import { Command } from '@/types';

export default () =>
  new Command({
    name: 'name',
    description: 'Command Template For The Principal Bot',
    aliases: [],
    async run(_, __, ___) {}
  });
