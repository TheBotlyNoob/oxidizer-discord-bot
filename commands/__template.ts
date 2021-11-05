import { Command } from '@/types';

export default () =>
  new Command({
    name: 'name',
    description: 'Command Template For The Principal Bot',
    aliases: [],
    async run(interaction, client, rest, db): Promise<any> {}
  });
