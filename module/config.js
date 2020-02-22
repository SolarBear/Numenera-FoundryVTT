export const NUMENERA = {};

NUMENERA.weightClasses = {
  'l': 'Light',
  'm': 'Medium',
  'h': 'Heavy'
};

NUMENERA.stats = {
  'i': 'Intellect',
  'm': 'Might',
  's': 'Speed'
};

NUMENERA.skillLevels = {
  'i': 'Inability',
  'u': 'Untrained',
  't': 'Trained',
  's': 'Specialized'
};

NUMENERA.types = [
  {
    abbrev: 'a',
    name: 'Arkai',
  },
  {
    abbrev: 'd',
    name: 'Delve',
  },
  {
    abbrev: 'g',
    name: 'Glaive',
  },
  {
    abbrev: 'j',
    name: 'Jack',
  },
  {
    abbrev: 'n',
    name: 'Nano',
  },
  {
    abbrev: 'w',
    name: 'Wright',
  },
];

NUMENERA.typePowers = {
  'g': 'Combat Manoeuvers',
  'j': 'Tricks of the Trade',
  'n': 'Esoteries',
  'a': 'Precepts',
  'd': 'Delve Lore',
  'w': 'Inspired Techniques',
};

NUMENERA.damageTrack = [
  'Hale',
  'Impaired',
  'Debilitated',
  'Dead'
];

NUMENERA.recoveries = [
  '1 Action',
  '10 min',
  '1 hour',
  '10 hours'
];

NUMENERA.advances = {
  'statPools': '+4 to stat pools',
  'effort': '+1 to Effort',
  'edge': '+1 to Edge',
  'skillTraining': 'Train/specialize skill',
  'other': 'Other',
};
