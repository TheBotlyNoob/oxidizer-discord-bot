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
        choices: { animal: 'animal', character: 'character', object: 'object' }
      }
    ],
    run: async (_, __, interaction) =>
      akinator(interaction, {
        useButtons: true,
        gameType: interaction.options.getString('game-type') || 'character',
        language: interaction.options.getString('language') || 'en',
        childMode: true
      })
  });
