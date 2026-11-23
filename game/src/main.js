// Lantern Crossroads — boot.
// Reads ?seed=N and ?shot=title|play|win|loss from the URL, builds the duel,
// and wires input to rendering. A shot stages a fixed scene for screenshots;
// otherwise the game opens on its title screen and waits for the player.

import { newGame, startRound } from './state.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { stateForShot } from './shots.js';

function seedFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('seed');
  const n = raw === null ? NaN : Number.parseInt(raw, 10);
  if (Number.isFinite(n)) return n >>> 0;
  return (Date.now() % 2147483647) >>> 0;
}

function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('shot');
}

// A fresh duel, ready to play (round one already dealt).
window.__lanternNewGame = function newDuel(seed) {
  const state = newGame(seed);
  startRound(state);
  state.phase = 'play';
  return state;
};

function boot() {
  const seed = seedFromUrl();
  const shot = shotFromUrl();
  let state;
  if (shot && shot !== 'title') {
    state = stateForShot(shot, seed);
  }
  if (!state) {
    state = newGame(seed);
    startRound(state);
    state.phase = 'title';
  }
  window.__lanternState = state;
  bindInput(state, render);
  render(state);
}

boot();
