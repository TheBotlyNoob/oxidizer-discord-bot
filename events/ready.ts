import { Client } from '@/types';
import { log } from '@/main.js';

export default async (client: Client) => {
  log.info(`Logged In As ${client.user.tag}!`);
  client.user.setActivity('Bart Simpson', { type: 'WATCHING' });
};
