import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export const dist = dirname(fileURLToPath(import.meta.url));
export const root = resolve(dist, '..');
