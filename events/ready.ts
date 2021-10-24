import { Client } from '@types';

export default async (client: Client) => {
  console.log(`Logged In As ${client.user.tag}!`);
  client.user.setActivity('Bart Simposon', { type: 'WATCHING' });
};
