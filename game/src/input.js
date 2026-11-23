// Lantern Crossroads — input.
// Click a card, then click a lane; or keyboard: 1–8 picks a hand card,
// A / S / D plays the picked card to Dawn / Dusk / Night, Space ends the
// round, Enter begins. One delegated listener handles every click so the
// re-rendered DOM never leaves a stale handler behind.

import { LANES } from './config.js';
import { playCard, resolveRound } from './state.js';
import { aiTakeTurn } from './ai.js';

export function laneIndexForKey(key) {
  if (key === 'a' || key === 'A') return 0;
  if (key === 's' || key === 'S') return 1;
  if (key === 'd' || key === 'D') return 2;
  return -1;
}

// Run the rival's turn, resolve the round, and re-render.
export function endPlayerRound(state, render) {
  if (state.phase !== 'play') return;
  state.selected = null;
  aiTakeTurn(state);
  resolveRound(state);
  render(state);
}

export function bindInput(state, render) {
  const root = document.getElementById('app');
  if (!root) return;

  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]');
    if (action) {
      const name = action.getAttribute('data-action');
      if (name === 'begin' || name === 'again') {
        if (name === 'again') {
          const seed = (state.seed + 1) >>> 0;
          const fresh = window.__lanternNewGame(seed);
          Object.assign(state, fresh);
        }
        state.phase = 'play';
        render(state);
      } else if (name === 'end-round') {
        endPlayerRound(state, render);
      }
      return;
    }
    const handCard = event.target.closest('[data-hand-index]');
    if (handCard) {
      const i = Number(handCard.getAttribute('data-hand-index'));
      state.selected = state.selected === i ? null : i;
      render(state);
      return;
    }
    const lane = event.target.closest('[data-lane]');
    if (lane && state.selected !== null) {
      const laneName = lane.getAttribute('data-lane');
      const result = playCard(state, state.player, state.selected, laneName);
      if (result.ok) {
        state.selected = null;
        render(state);
      } else {
        state.log.push(`That play is not legal: ${result.reason}.`);
        render(state);
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (state.phase === 'title' && (event.key === 'Enter' || event.key === ' ')) {
      state.phase = 'play';
      render(state);
      return;
    }
    if (state.phase === 'win' || state.phase === 'loss') {
      if (event.key === 'Enter') {
        const seed = (state.seed + 1) >>> 0;
        Object.assign(state, window.__lanternNewGame(seed));
        state.phase = 'play';
        render(state);
      }
      return;
    }
    if (state.phase !== 'play') return;
    if (event.key >= '1' && event.key <= '8') {
      const i = Number(event.key) - 1;
      if (i < state.player.hand.length) {
        state.selected = state.selected === i ? null : i;
        render(state);
      }
      return;
    }
    const laneIndex = laneIndexForKey(event.key);
    if (laneIndex >= 0 && state.selected !== null) {
      const result = playCard(state, state.player, state.selected, LANES[laneIndex]);
      if (result.ok) {
        state.selected = null;
        render(state);
      }
      return;
    }
    if (event.key === ' ') {
      event.preventDefault();
      endPlayerRound(state, render);
    }
  });
}
