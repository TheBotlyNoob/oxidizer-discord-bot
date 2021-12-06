import fs from 'fs-extra';
import { root } from '@/dirs.js';
import { Client as RestClient } from 'detritus-client-rest';

const { token }: { token: string } = JSON.parse(
  await fs.readFile(`${root}/config.json`, 'utf8')
);

export default {
  token,
  ...(await new RestClient(token).fetchOauth2Application())
};
