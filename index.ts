import { resolve } from 'node:path';
import chalk from 'chalk';
import glob from 'fast-glob';
import log from '@/log.js';
import { root, dist } from '@/dirs.js';
import client from '@/client.js';

process.chdir(root);

process.on('uncaughtException', (err) => log.fatal(err));

if (process.env.RESTARTED === 'yes')
  log.info(`Restarted At ${chalk.yellow(new Date().toLocaleString())}`);

await Promise.all(
  (
    await glob('handlers/**/*.js')
  ).map(async (handler: string) => (await require(resolve(dist, handler)))())
);

await client().run();
