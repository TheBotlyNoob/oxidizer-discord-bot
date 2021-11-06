import { client } from '@/main.js';
import { Collection } from '@/types.js';

export default async () =>
  client.on('guildCreate', async (guild) => {
    client.db
      .defaultGet(guild.id, new Collection())
      .set(
        'invite',
        await (
          guild.widgetChannel ||
          guild.rulesChannel ||
          guild.publicUpdatesChannel ||
          guild.systemChannel ||
          guild.afkChannel
        ).createInvite({ maxAge: 0, maxUses: 0 })
      );
  });
