import { DB, Collection } from '@/types.js';
import { root, client } from '@/main.js';

export default () => {
  client.db = new DB(`${root}/db.json`);

  client.on('guildCreate', async (guild) => {
    client.db.set(guild.id, new Collection<string, any>());
  });
};
