import { client } from '@/main.js';

export default async () =>
  client.on('guildCreate', async (guild) => {
    client.db.set(
      `invite-${guild.name}`,
      await (
        guild.widgetChannel ||
        guild.rulesChannel ||
        guild.publicUpdatesChannel ||
        guild.systemChannel ||
        guild.afkChannel
      ).createInvite({ maxAge: 0, maxUses: 0 })
    );
  });
