export const NUMENERA = {};

NUMENERA.weightClasses = {
  "Light": "NUMENERA.weightClasses.Light",
  "Medium": "NUMENERA.weightClasses.Medium",
  "Heavy": "NUMENERA.weightClasses.Heavy",
};

NUMENERA.optionalWeightClasses = Object.assign({"N/A": "NUMENERA.N/A"}, NUMENERA.weightClasses);

NUMENERA.weaponTypes = {
  "Bashing": "NUMENERA.weaponTypes.Bashing",
  "Bladed": "NUMENERA.weaponTypes.Bladed",
  "Ranged": "NUMENERA.weaponTypes.Ranged",
};

NUMENERA.stats = {
  "might": "NUMENERA.stats.might",
  "speed": "NUMENERA.stats.speed",
  "intellect" : "NUMENERA.stats.intellect",
};

NUMENERA.skillLevels = {
  "i": "NUMENERA.skillLevels.Inability",
  "u": "NUMENERA.skillLevels.Untrained",
  "t": "NUMENERA.skillLevels.Trained",
  "s": "NUMENERA.skillLevels.Specialized"
};

NUMENERA.types = [
  {
    abbrev: "a",
    name: "Arkus",
  },
  {
    abbrev: "d",
    name: "Delve",
  },
  {
    abbrev: "g",
    name: "Glaive",
  },
  {
    abbrev: "j",
    name: "Jack",
  },
  {
    abbrev: "n",
    name: "Nano",
  },
  {
    abbrev: "w",
    name: "Wright",
  },
  {
    abbrev: 'p',
    name: 'Paradox',
  },
  {
    abbrev: 's',
    name: 'Spinner',
  },
  {
    abbrev: 'v',
    name: 'Vector',
  },
];

NUMENERA.typePowers = {
  'g': 'Combat Maneuvers',
  'j': 'Tricks of the Trade',
  'n': 'Esoteries',
  'a': 'Precepts',
  'd': 'Delve Lores',
  'w': 'Inspired Techniques',
  'v': 'Moves',
  'p': 'Revisions',
  's': 'Twists',
};

NUMENERA.damageTrack = [
  {
    label: "NUMENERA.pc.damageTrack.hale.label",
    description: "NUMENERA.pc.damageTrack.hale.description",
  },
  {
    label: "NUMENERA.pc.damageTrack.impaired.label",
    description: "NUMENERA.pc.damageTrack.impaired.description",
  },
  {
    label: "NUMENERA.pc.damageTrack.debilitated.label",
    description: "NUMENERA.pc.damageTrack.debilitated.description",
  },
  {
    label: "NUMENERA.pc.damageTrack.dead.label",
    description: "NUMENERA.pc.damageTrack.dead.description",
  }
];

NUMENERA.recoveries = {
  "action": "NUMENERA.pc.recovery.action",
  "tenMin": "NUMENERA.pc.recovery.tenMin",
  "oneHour": "NUMENERA.pc.recovery.oneHour",
  "tenHours": "NUMENERA.pc.recovery.tenHours",
};

NUMENERA.advances = {
  "statPools": "NUMENERA.pc.advances.statPools",
  "effort": "NUMENERA.pc.advances.effort",
  "edge": "NUMENERA.pc.advances.edge",
  "skillTraining": "NUMENERA.pc.advances.skillTraining",
  "other": "NUMENERA.pc.advances.other",
};

NUMENERA.ranges = [
  "NUMENERA.range.immediate",
  "NUMENERA.range.short",
  "NUMENERA.range.long",
  "NUMENERA.range.veryLong"
];

NUMENERA.optionalRanges = ["N/A"].concat(NUMENERA.ranges);

NUMENERA.abilityTypes = [
  "NUMENERA.item.ability.type.action",
  "NUMENERA.item.ability.type.enabler",
];

NUMENERA.cypherTypes = [
  "NUMENERA.pc.numenera.cypher.type.anoetic",
  "NUMENERA.pc.numenera.cypher.type.occultic",
];

// Note that these colors do not get propagated to the CSS; that would be neat, though
NUMENERA.attributeColors = {
  0: 0xff443d,    // Might
  1: 0x87ff3d,    // Speed
  2: 0x3ddbff     // Intellect
};

NUMENERA.units = {
  feet: "NUMENERA.canvas.unit.feet",
  meters: "NUMENERA.canvas.unit.meters",
};
