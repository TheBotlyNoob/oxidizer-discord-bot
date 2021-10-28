import { Command } from '@/types';

export default () =>
  new Command(
    {
      name: 'why?',
      description: 'wtf',
      run: async (_, __, ___) => void 0
    },
    false
  );
