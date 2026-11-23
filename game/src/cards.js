// Lantern Crossroads — the card set.
// Twelve original spirits, each with a cost in spirit, a power, an element and
// one ability. Abilities are the combos: Ember rewards stacking a lane,
// Spark chips a lantern directly, Guard shields a lantern, Bloom draws, and
// Anchor doubles a card's power in its lane. A card with no ability is a
// plain heavy hitter.

export const CARDS = [
  {
    id: 'cinder-imp',
    name: 'Cinder Imp',
    element: 'flame',
    cost: 1,
    power: 2,
    ability: 'ember',
    text: 'Ember: +2 power if a card is already in this lane.',
  },
  {
    id: 'hearth-sprite',
    name: 'Hearth Sprite',
    element: 'flame',
    cost: 2,
    power: 3,
    ability: 'spark',
    text: 'Spark: deal 1 damage to the enemy lantern here.',
  },
  {
    id: 'wildfire',
    name: 'Wildfire',
    element: 'flame',
    cost: 3,
    power: 5,
    ability: null,
    text: 'A wall of flame. No tricks, just heat.',
  },
  {
    id: 'tidecaller',
    name: 'Tidecaller',
    element: 'tide',
    cost: 2,
    power: 2,
    ability: 'guard',
    text: 'Guard: this lantern takes 2 less damage this round.',
  },
  {
    id: 'mist-wisp',
    name: 'Mist Wisp',
    element: 'tide',
    cost: 1,
    power: 1,
    ability: 'bloom',
    text: 'Bloom: draw a card.',
  },
  {
    id: 'deep-current',
    name: 'Deep Current',
    element: 'tide',
    cost: 3,
    power: 4,
    ability: 'anchor',
    text: 'Anchor: this card counts double in its lane.',
  },
  {
    id: 'seedling',
    name: 'Seedling',
    element: 'leaf',
    cost: 1,
    power: 2,
    ability: 'bloom',
    text: 'Bloom: draw a card.',
  },
  {
    id: 'thornvine',
    name: 'Thornvine',
    element: 'leaf',
    cost: 2,
    power: 3,
    ability: 'ember',
    text: 'Ember: +2 power if a card is already in this lane.',
  },
  {
    id: 'old-oak',
    name: 'Old Oak',
    element: 'leaf',
    cost: 3,
    power: 4,
    ability: 'guard',
    text: 'Guard: this lantern takes 2 less damage this round.',
  },
  {
    id: 'lucky-star',
    name: 'Lucky Star',
    element: 'star',
    cost: 1,
    power: 1,
    ability: 'spark',
    text: 'Spark: deal 1 damage to the enemy lantern here.',
  },
  {
    id: 'comet',
    name: 'Comet',
    element: 'star',
    cost: 2,
    power: 3,
    ability: 'anchor',
    text: 'Anchor: this card counts double in its lane.',
  },
  {
    id: 'eclipse',
    name: 'Eclipse',
    element: 'star',
    cost: 3,
    power: 5,
    ability: null,
    text: 'Darkness falls. No tricks, just night.',
  },
];

// A card definition by id, or null.
export function cardById(id) {
  return CARDS.find((c) => c.id === id) ?? null;
}
