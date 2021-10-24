import { createClient } from 'redis';
import { pathExists, open } from 'fs-extra';
import { root, client } from '@';

export default async () => {
  const redisClient = createClient();

  redisClient.on('error', (err) => console.error(err));
};
