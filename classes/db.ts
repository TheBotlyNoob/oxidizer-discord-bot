import { Low } from 'lowdb';
import type { Adapter } from 'lowdb';
import hook from 'exit-hook';

export default class DB extends Low {
  constructor(adapter: Adapter<any>) {
    super(adapter);
    this.read();
    hook(() => this.write());
  }
}
