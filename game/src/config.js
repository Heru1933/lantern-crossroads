// Lantern Crossroads — game constants.
// Two lantern-keepers duel at a crossroads at dusk. Three lanterns hang over
// three lanes; play spirit cards into lanes, and at the end of each round the
// lanes resolve: the stronger side in a lane damages the enemy lantern there.
// First to darken two enemy lanterns wins the duel.

export const LANES = ['Dawn', 'Dusk', 'Night'];

export const LANTERN_HP = 10;

export const LANTERNS_TO_WIN = 2;

export const SPIRIT_PER_ROUND = 3;

export const START_HAND = 4;

export const MAX_HAND = 8;

export const DECK_COPIES = 2;

// A lantern takes at most this much damage from one lane in a round: no
// single lane can one-shot a lantern, so a duel is won by sustained pressure.
export const MAX_LANE_DAMAGE = 4;

// Elements are told apart by colour AND shape, never by text alone.
export const ELEMENTS = {
  flame: { name: 'Flame', color: '#e5484d', dark: '#7a1f22', shape: '▲' },
  tide: { name: 'Tide', color: '#3e9bff', dark: '#174a80', shape: '●' },
  leaf: { name: 'Leaf', color: '#46a758', dark: '#1d4d29', shape: '◆' },
  star: { name: 'Star', color: '#f5a623', dark: '#7a5200', shape: '★' },
};

export const ABILITIES = {
  ember: 'Ember',
  spark: 'Spark',
  guard: 'Guard',
  bloom: 'Bloom',
  anchor: 'Anchor',
};
