import { DB } from '@/types';
import { root, client } from '@/main.js';

export default () => (client.db = new DB(`${root}/db.json`));
