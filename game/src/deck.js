// Lantern Crossroads — the deck.
// Each keeper's deck holds two copies of every spirit in the set, shuffled
// with the duel's seeded generator. Drawing from an empty deck does nothing;
// a keeper who runs out of cards simply plays with what they hold.

import { CARDS } from './cards.js';
import { DECK_COPIES } from './config.js';
import { shuffle } from './random.js';

// Build a fresh shuffled deck (an array of card ids).
export function buildDeck(rng) {
  const ids = [];
  for (const card of CARDS) {
    for (let i = 0; i < DECK_COPIES; i++) ids.push(card.id);
  }
  return shuffle(ids, rng);
}

// Draw up to `count` cards from the deck into the hand.
export function drawCards(deck, hand, count) {
  const drawn = [];
  for (let i = 0; i < count; i++) {
    const id = deck.pop();
    if (id === undefined) break;
    hand.push(id);
    drawn.push(id);
  }
  return drawn;
}
