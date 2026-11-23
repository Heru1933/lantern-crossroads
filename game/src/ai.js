// Lantern Crossroads — the rival AI.
// The rival reads the table and plays greedily, one card at a time: it weighs
// each card in each lane by how much it swings that lane, what its ability
// adds, and what it costs. It defends a threatened lantern, presses a lane it
// can flip, and never spends spirit on a play that gains nothing. Deterministic
// for a given state: ties break by hand order, then lane order.

import { LANES } from './config.js';
import { cardById } from './cards.js';
import { lanePower, playCard } from './state.js';

// The effective power a card would add in a lane, counting its ability.
function addedPower(state, side, card, lane) {
  const already = side.played[lane].length;
  let power = card.power;
  if (card.ability === 'anchor') power *= 2;
  if (card.ability === 'ember' && already > 0) power += 2;
  return power;
}

// Score one candidate play. Higher is better; a score at or below zero means
// the play is not worth its spirit.
function scorePlay(state, side, other, card, lane) {
  const mine = lanePower(state, side, lane);
  const theirs = lanePower(state, other, lane);
  const added = addedPower(state, side, card, lane);
  const after = mine + added;
  let score = 0;
  if (mine < theirs && after >= theirs) {
    // Flipping a lost lane, or at least evening it.
    score += after > theirs ? 4 : 3;
  } else if (mine >= theirs) {
    // Pressing a lane already held: every extra power is damage.
    score += added * 1.0;
  } else {
    // Still losing, but narrowing the gap saves lantern light.
    score += added * 0.6;
  }
  if (card.ability === 'spark') score += 1.2;
  if (card.ability === 'bloom') score += side.hand.length >= 8 ? 0 : 1.0;
  if (card.ability === 'guard') {
    // Guard is worth it only where the lantern is actually threatened.
    score += theirs > mine ? 2.0 : 0.3;
  }
  // Spirit is scarce: a costly card must earn its keep.
  score -= card.cost * 0.4;
  return score;
}

// Play the rival's whole turn: keep taking the best available play until
// none is worth it, then stop. Returns how many cards the rival played.
export function aiTakeTurn(state) {
  const side = state.rival;
  const other = state.player;
  let played = 0;
  for (;;) {
    let best = null;
    let bestScore = 0.5;
    for (let i = 0; i < side.hand.length; i++) {
      const card = cardById(side.hand[i]);
      if (!card || card.cost > side.spirit) continue;
      for (const lane of LANES) {
        const score = scorePlay(state, side, other, card, lane);
        if (score > bestScore) {
          bestScore = score;
          best = { handIndex: i, lane };
        }
      }
    }
    if (!best) break;
    const result = playCard(state, side, best.handIndex, best.lane);
    if (!result.ok) break;
    played++;
    if (played > 12) break;
  }
  return played;
}
