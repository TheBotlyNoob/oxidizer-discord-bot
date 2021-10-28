import { DB } from '@/types';
import { root, client } from '@';

export default () => (client.db = new DB(`${root}/db.json`));
