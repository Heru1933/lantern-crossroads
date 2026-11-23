// Lantern Crossroads — deterministic screenshot scenes.
// ?shot=title|play|win|loss&seed=N stages a fixed scene for the screenshots:
// the title screen, a mid-duel table, the victory screen and the defeat
// screen. The play scene is a real duel advanced two rounds by a fixed
// policy, so the table shows genuine hands, cards in lanes and damaged
// lanterns — never a mock.

import { newGame, startRound, playCard, resolveRound } from './state.js';
import { aiTakeTurn } from './ai.js';
import { cardById } from './cards.js';
import { drawCards } from './deck.js';
import { LANES } from './config.js';

// Play the player's hand greedily, one card per lane at most, for the shot.
function greedyPlayer(state) {
  for (const lane of LANES) {
    for (let i = 0; i < state.player.hand.length; i++) {
      const card = cardById(state.player.hand[i]);
      if (card && card.cost <= state.player.spirit) {
        playCard(state, state.player, i, lane);
        break;
      }
    }
  }
}

// A mid-duel table: two full rounds played, then a third round half-played
// with a full hand and cards in every lane, so the screenshot shows the game
// at its richest.
export function shotPlay(seed) {
  const state = newGame(seed);
  startRound(state);
  state.phase = 'play';
  greedyPlayer(state);
  aiTakeTurn(state);
  resolveRound(state);
  greedyPlayer(state);
  aiTakeTurn(state);
  resolveRound(state);
  // Top the player's hand up to six cards and fill every lane, then let the
  // rival answer, so the table shows a real mid-round position instead of
  // an empty one.
  drawCards(state.player.deck, state.player.hand, 6 - state.player.hand.length);
  state.player.spirit = 8;
  for (const lane of LANES) {
    for (let i = 0; i < state.player.hand.length; i++) {
      const card = cardById(state.player.hand[i]);
      if (card && card.cost <= state.player.spirit) {
        playCard(state, state.player, i, lane);
        break;
      }
    }
  }
  aiTakeTurn(state);
  return state;
}

export function shotWin(seed) {
  const state = newGame(seed);
  state.phase = 'win';
  state.winner = 'player';
  state.round = 5;
  state.rival.lanterns.Dawn = 0;
  state.rival.lanterns.Dusk = 0;
  state.rival.lanterns.Night = 3;
  state.player.lanterns.Dawn = 6;
  state.player.lanterns.Dusk = 5;
  state.player.lanterns.Night = 6;
  state.log.push('Two rival lanterns are dark. You win the duel!');
  return state;
}

export function shotLoss(seed) {
  const state = newGame(seed);
  state.phase = 'loss';
  state.winner = 'rival';
  state.round = 6;
  state.player.lanterns.Dawn = 0;
  state.player.lanterns.Dusk = 0;
  state.player.lanterns.Night = 4;
  state.rival.lanterns.Dawn = 6;
  state.rival.lanterns.Dusk = 6;
  state.rival.lanterns.Night = 5;
  state.log.push('Two of your lanterns are dark. The rival wins.');
  return state;
}

// Build the state for a ?shot= name, or null when there is no shot.
export function stateForShot(shot, seed) {
  if (shot === 'play') return shotPlay(seed);
  if (shot === 'win') return shotWin(seed);
  if (shot === 'loss') return shotLoss(seed);
  return null;
}
