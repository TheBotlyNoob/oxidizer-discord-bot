import { Database } from 'sqlite3';
import { pathExists, open } from 'fs-extra';
import { root, client } from '@';

export default async () => {
  if (!(await pathExists(`${root}/db.sql`))) await open(`${root}/db.sql`, 'w+');

  client.db = new Database(`${root}/db.sql`);
};
