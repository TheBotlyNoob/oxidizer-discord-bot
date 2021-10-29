import { Command } from '@/types';
import akinator from 'discord.js-akinator';

export default () =>
  new Command({
    name: 'akinator',
    description: 'Play A Game Of Akinator',
    options: [
      {
        name: 'language',
        description: 'The Language To Use',
        type: 'STRING'
      },
      {
        name: 'game-type',
        description: 'The Type of Akinator Game to Play',
        type: 'STRING',
        choices: { animal: 'animal', character: 'character' }
      }
    ],
    run: async (_, __, interaction) =>
      akinator(interaction, {
        useButtons: true
      })
  });
