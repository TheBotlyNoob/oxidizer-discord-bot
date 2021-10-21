import { Client } from 'discord.js';

export default async (client: Client) => {
  console.log(`Logged In As ${client.user.tag}!`);
  client.user.setActivity('Bart Simposon', { type: 'WATCHING' });
};
