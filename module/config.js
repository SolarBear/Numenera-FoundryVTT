export const NUMENERA = {};

NUMENERA.weightClasses = [
  'Light',
  'Medium',
  'Heavy'
];

NUMENERA.weaponTypes = [
  'Bashing',
  'Bladed',
  'Ranged',
]

NUMENERA.stats = [
  'Might',
  'Speed',
  'Intellect',
];

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
  'g': 'Combat Maneuvers',
  'j': 'Tricks of the Trade',
  'n': 'Esoteries',
  'a': 'Precepts',
  'd': 'Delve Lores',
  'w': 'Inspired Techniques',
};

NUMENERA.damageTrack = {
  hale: {
    index: 0,
    label: 'Hale',
    description: 'Normal state for a character.'
  },
  impaired: {
    index: 1,
    label: 'Impaired',
    description: 'In a wounded or injured state. Applying Effort costs 1 extra point per effort level applied.'
  },
  debilitated: {
    index: 2,
    label: 'Debilitated',
    description: 'In a critically injured state. The character can do no other action than to crawl an immediate distance; if their Speed pool is 0, they cannot move at all.'
  },
  dead: {
    index: 3,
    label: 'Dead',
    description: 'The character is dead.'
  }
};

NUMENERA.recoveries = {
  'action': '1 Action',
  'tenMin': '10 min',
  'oneHour': '1 hour',
  'tenHours': '10 hours'
};

NUMENERA.advances = {
  'statPools': '+4 to stat pools',
  'effort': '+1 to Effort',
  'edge': '+1 to Edge',
  'skillTraining': 'Train/specialize skill',
  'other': 'Other',
};

NUMENERA.ranges = [
  'Immediate',
  'Short',
  'Long',
  'Very Long'
];
