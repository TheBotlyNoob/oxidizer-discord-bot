import { spawn as spawnSync } from 'child_process';
import { pathToFileURL } from 'node:url';

export function restart(): never {
  return spawnSync('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    env: { RESTARTED: 'yes' }
  }) as never;
}

export async function require(path: string): Promise<any> {
  let imported = await import(String(pathToFileURL(path)));

  return imported?.default ?? imported;
}
