// Lantern Crossroads — game state and turn flow.
// One duel: two keepers, three lanes, three lanterns each. A round is:
// gain spirit and draw, play cards into lanes, then the lanes resolve and the
// stronger side in each lane damages the enemy lantern there. A lantern at
// zero light goes dark; darken two enemy lanterns and the duel is yours.

import { LANES, LANTERN_HP, LANTERNS_TO_WIN, SPIRIT_PER_ROUND, START_HAND, MAX_HAND, MAX_LANE_DAMAGE } from './config.js';
import { cardById } from './cards.js';
import { buildDeck, drawCards } from './deck.js';
import { makeRng } from './random.js';

function freshSide(deck, hand) {
  const lanterns = {};
  const played = {};
  const guard = {};
  for (const lane of LANES) {
    lanterns[lane] = LANTERN_HP;
    played[lane] = [];
    guard[lane] = false;
  }
  return { deck, hand, spirit: 0, lanterns, played, guard };
}

// A new duel from a seed. Both keepers draw their opening hands.
export function newGame(seed) {
  const rng = makeRng(seed);
  const playerDeck = buildDeck(rng);
  const rivalDeck = buildDeck(rng);
  const playerHand = [];
  const rivalHand = [];
  drawCards(playerDeck, playerHand, START_HAND);
  drawCards(rivalDeck, rivalHand, START_HAND);
  const state = {
    seed,
    rng,
    round: 1,
    phase: 'title',
    player: freshSide(playerDeck, playerHand),
    rival: freshSide(rivalDeck, rivalHand),
    log: ['The lanterns are lit. The crossroads waits.'],
    selected: null,
    winner: null,
  };
  return state;
}

// Draw cards for a side; when the deck is empty, the keeper's lanterns each
// lose 1 light (fatigue), so a duel can never stall once the decks run dry.
function drawForSide(state, side, count) {
  const drawn = drawCards(side.deck, side.hand, count);
  if (drawn.length < count && side.deck.length === 0) {
    for (const lane of LANES) side.lanterns[lane] = Math.max(0, side.lanterns[lane] - 1);
    const who = side === state.player ? 'You' : 'Rival';
    state.log.push(`${who} draw from an empty deck: the lanterns dim (fatigue).`);
  }
  return drawn;
}

// Begin a round: both keepers gain spirit and draw one card.
export function startRound(state) {
  for (const side of [state.player, state.rival]) {
    side.spirit += SPIRIT_PER_ROUND;
    if (side.hand.length < MAX_HAND) drawForSide(state, side, 1);
    for (const lane of LANES) side.guard[lane] = false;
  }
  state.log.push(`Round ${state.round}: spirit flows, a card is drawn.`);
}

// The effective power of one played card in its lane. Anchor doubles it;
// Ember adds 2 when the card is not the first in its lane.
export function cardPower(state, side, lane, index) {
  const id = side.played[lane][index];
  const card = cardById(id);
  if (!card) return 0;
  let power = card.power;
  if (card.ability === 'anchor') power *= 2;
  if (card.ability === 'ember' && index > 0) power += 2;
  return power;
}

// A side's total power in a lane.
export function lanePower(state, side, lane) {
  let total = 0;
  for (let i = 0; i < side.played[lane].length; i++) {
    total += cardPower(state, side, lane, i);
  }
  return total;
}

// Play a card from a side's hand into a lane. Returns the played card id, or
// null with a reason when the play is not legal.
export function playCard(state, side, handIndex, lane) {
  if (state.phase !== 'play') return { ok: false, reason: 'not playing' };
  if (!LANES.includes(lane)) return { ok: false, reason: 'no such lane' };
  const hand = side.hand;
  if (handIndex < 0 || handIndex >= hand.length) return { ok: false, reason: 'no such card' };
  const id = hand[handIndex];
  const card = cardById(id);
  if (!card) return { ok: false, reason: 'no such card' };
  if (side.spirit < card.cost) return { ok: false, reason: 'not enough spirit' };
  hand.splice(handIndex, 1);
  side.spirit -= card.cost;
  side.played[lane].push(id);
  const other = side === state.player ? state.rival : state.player;
  const who = side === state.player ? 'You' : 'Rival';
  if (card.ability === 'spark') {
    other.lanterns[lane] = Math.max(0, other.lanterns[lane] - 1);
    state.log.push(`${who} play ${card.name} in ${lane}: a spark bites the enemy lantern.`);
  } else if (card.ability === 'bloom') {
    drawForSide(state, side, 1);
    state.log.push(`${who} play ${card.name} in ${lane}: it blooms, a card is drawn.`);
  } else if (card.ability === 'guard') {
    side.guard[lane] = true;
    state.log.push(`${who} play ${card.name} in ${lane}: the lantern is guarded.`);
  } else {
    state.log.push(`${who} play ${card.name} in ${lane}.`);
  }
  return { ok: true, id };
}

// How many of a side's lanterns are dark.
export function darkCount(state, side) {
  let n = 0;
  for (const lane of LANES) if (side.lanterns[lane] <= 0) n++;
  return n;
}

// Total light left across a side's lanterns.
export function totalLight(state, side) {
  let n = 0;
  for (const lane of LANES) n += side.lanterns[lane];
  return n;
}

// The duel's winner once two lanterns are dark on a side, or null.
export function winnerOf(state) {
  const playerDark = darkCount(state, state.player);
  const rivalDark = darkCount(state, state.rival);
  if (playerDark >= LANTERNS_TO_WIN && rivalDark >= LANTERNS_TO_WIN) {
    // Both fell in the same round: the keeper with more light left wins.
    if (totalLight(state, state.player) === totalLight(state, state.rival)) return 'player';
    return totalLight(state, state.player) > totalLight(state, state.rival) ? 'player' : 'rival';
  }
  if (rivalDark >= LANTERNS_TO_WIN) return 'player';
  if (playerDark >= LANTERNS_TO_WIN) return 'rival';
  return null;
}

// Resolve every lane, then clear the table and see if the duel is over.
export function resolveRound(state) {
  for (const lane of LANES) {
    const mine = lanePower(state, state.player, lane);
    const theirs = lanePower(state, state.rival, lane);
    if (mine === theirs) {
      state.log.push(`${lane}: even — the lanterns hold.`);
      continue;
    }
    if (mine > theirs) {
      let damage = Math.min(mine - theirs, MAX_LANE_DAMAGE);
      if (state.rival.guard[lane]) damage = Math.max(0, damage - 2);
      state.rival.lanterns[lane] = Math.max(0, state.rival.lanterns[lane] - damage);
      state.log.push(`${lane}: you hold it ${mine} to ${theirs} — the rival lantern takes ${damage}.`);
    } else {
      let damage = Math.min(theirs - mine, MAX_LANE_DAMAGE);
      if (state.player.guard[lane]) damage = Math.max(0, damage - 2);
      state.player.lanterns[lane] = Math.max(0, state.player.lanterns[lane] - damage);
      state.log.push(`${lane}: the rival holds it ${theirs} to ${mine} — your lantern takes ${damage}.`);
    }
  }
  for (const side of [state.player, state.rival]) {
    for (const lane of LANES) side.played[lane] = [];
  }
  const winner = winnerOf(state);
  if (winner) {
    state.winner = winner;
    state.phase = winner === 'player' ? 'win' : 'loss';
    state.log.push(winner === 'player' ? 'Two rival lanterns are dark. You win the duel!' : 'Two of your lanterns are dark. The rival wins.');
    return;
  }
  state.round++;
  startRound(state);
}
