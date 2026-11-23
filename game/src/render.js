// Lantern Crossroads — rendering.
// The game is plain DOM: a title screen, the three-lane table, and a win and
// a loss screen. Every screen is rebuilt from the state on each change, so
// the table always shows the truth: the player's hand, the rival's hand as
// card backs, each lantern's light, and the cards in each lane.

import { LANES, ELEMENTS, ABILITIES, LANTERN_HP } from './config.js';
import { cardById } from './cards.js';
import { lanePower, darkCount, totalLight } from './state.js';

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// One lantern's light as pips: lit ● and dark ○.
function lightPips(hp, max) {
  let out = '';
  for (let i = 0; i < max; i++) out += i < hp ? '●' : '○';
  return out;
}

// A card face. `selected` lifts it; `faceDown` renders a card back.
export function cardHtml(card, opts = {}) {
  if (opts.faceDown) {
    return `<div class="card back"><div class="card-back-mark">🏮</div><div class="card-back-text">LANTERN</div></div>`;
  }
  const el = ELEMENTS[card.element];
  const ability = card.ability ? `<div class="card-ability">${esc(ABILITIES[card.ability])}</div>` : '';
  return `<div class="card ${card.element}${opts.selected ? ' selected' : ''}" style="--card-color:${el.color};--card-dark:${el.dark}">
    <div class="card-top"><span class="card-cost" title="Spirit cost">✦${card.cost}</span><span class="card-shape">${el.shape}</span></div>
    <div class="card-name">${esc(card.name)}</div>
    <div class="card-power">${card.power}</div>
    ${ability}
    <div class="card-text">${esc(card.text)}</div>
  </div>`;
}

function lanternHtml(state, side, lane, who) {
  const hp = side.lanterns[lane];
  const dark = hp <= 0;
  return `<div class="lantern${dark ? ' dark' : ''}">
    <div class="lantern-glyph">🏮</div>
    <div class="lantern-name">${who} · ${lane}</div>
    <div class="lantern-pips">${lightPips(hp, LANTERN_HP)}</div>
    <div class="lantern-hp">${hp} light</div>
  </div>`;
}

function laneHtml(state, lane) {
  const rivalCards = state.rival.played[lane].map((id) => cardHtml(cardById(id))).join('');
  const playerCards = state.player.played[lane].map((id) => cardHtml(cardById(id))).join('');
  const mine = lanePower(state, state.player, lane);
  const theirs = lanePower(state, state.rival, lane);
  const guardNote =
    (state.player.guard[lane] ? ' 🛡 you guarded' : '') + (state.rival.guard[lane] ? ' 🛡 rival guarded' : '');
  return `<div class="lane" data-lane="${lane}">
    ${lanternHtml(state, state.rival, lane, 'Rival')}
    <div class="played rival">${rivalCards || '<div class="played-empty">—</div>'}</div>
    <div class="lane-mid"><span class="lane-name">${lane}</span><span class="lane-power">${mine} vs ${theirs}</span><span class="lane-guard">${guardNote}</span></div>
    <div class="played player">${playerCards || '<div class="played-empty">—</div>'}</div>
    ${lanternHtml(state, state.player, lane, 'You')}
  </div>`;
}

function logHtml(state) {
  const lines = state.log.slice(-6);
  return `<div class="log">${lines.map((l) => `<div>${esc(l)}</div>`).join('')}</div>`;
}

function titleHtml(state) {
  return `<div class="screen title">
    <h1>🏮 Lantern Crossroads</h1>
    <p class="tagline">A duel of spirits at dusk. Three lanterns. Three lanes. One crossroads.</p>
    <div class="rules">
      <h2>How to play</h2>
      <ul>
        <li>You and the Rival each guard <b>3 lanterns</b> (Dawn, Dusk, Night), each with <b>10 light</b>.</li>
        <li>Each round you gain <b>3 spirit</b> and draw a card. Play cards into lanes — each card costs spirit.</li>
        <li>When the round ends, each lane resolves: the stronger side deals the <b>difference in power</b> as damage to the enemy lantern there (at most 4 from one lane).</li>
        <li><b>Ember</b> +2 power if a card is already in the lane · <b>Spark</b> bites the enemy lantern for 1 · <b>Guard</b> shields a lantern by 2 · <b>Bloom</b> draws a card · <b>Anchor</b> counts double.</li>
        <li>First to darken <b>2 enemy lanterns</b> wins the duel. Drawing from an empty deck dims your own lanterns — the duel always ends.</li>
      </ul>
      <p class="controls">Click a card, then click a lane — or press <b>1–8</b> to pick a card, <b>A / S / D</b> for Dawn / Dusk / Night, <b>Space</b> to end the round.</p>
    </div>
    <button class="big" data-action="begin">Begin the duel</button>
  </div>`;
}

function tableHtml(state) {
  const hand = state.player.hand
    .map((id, i) => `<div data-hand-index="${i}">${cardHtml(cardById(id), { selected: state.selected === i })}</div>`)
    .join('');
  const backs = state.rival.hand.map(() => cardHtml(null, { faceDown: true })).join('');
  return `<div class="screen table">
    <div class="topbar">
      <span class="who rival">Rival — Spirit ✦${state.rival.spirit} — Lanterns lit: ${3 - darkCount(state, state.rival)}/3</span>
      <span class="round">Round ${state.round}</span>
      <span class="who player">You — Spirit ✦${state.player.spirit} — Lanterns lit: ${3 - darkCount(state, state.player)}/3</span>
    </div>
    <div class="rival-hand">${backs}</div>
    <div class="lanes">${LANES.map((lane) => laneHtml(state, lane)).join('')}</div>
    <div class="player-hand">${hand}</div>
    <div class="actions"><button class="big" data-action="end-round">End round (Space)</button><span class="hint">Pick a card, then a lane. A / S / D play to Dawn / Dusk / Night.</span></div>
    ${logHtml(state)}
  </div>`;
}

function endHtml(state, won) {
  const title = won ? 'Victory!' : 'Defeat';
  const line = won
    ? 'Two rival lanterns are dark. The crossroads is yours — the lanterns burn for you.'
    : 'Two of your lanterns are dark. The rival keeps the crossroads tonight.';
  return `<div class="screen end ${won ? 'win' : 'loss'}">
    <h1>${won ? '🏮 Victory!' : '🌑 Defeat'}</h1>
    <p class="tagline">${line}</p>
    <div class="final-score">
      <div>Your light left: <b>${totalLight(state, state.player)}</b> — Rival light left: <b>${totalLight(state, state.rival)}</b></div>
      <div>Rounds played: <b>${state.round}</b></div>
    </div>
    <button class="big" data-action="again">Play again</button>
  </div>`;
}

// Rebuild the whole screen from the state.
export function render(state) {
  const root = document.getElementById('app');
  if (!root) return;
  if (state.phase === 'title') root.innerHTML = titleHtml(state);
  else if (state.phase === 'play') root.innerHTML = tableHtml(state);
  else if (state.phase === 'win') root.innerHTML = endHtml(state, true);
  else root.innerHTML = endHtml(state, false);
}
