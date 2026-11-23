// Lantern Crossroads — seeded randomness.
// Every shuffle and every AI tie-break comes from one seeded generator, so a
// duel replayed with the same seed plays out the same way. ?seed=N in the URL
// fixes the seed; without one the seed comes from the clock.

// Mulberry32: a small, fast, deterministic PRNG.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle driven by a seeded generator. Returns a new array.
export function shuffle(array, rng) {
  const out = array.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

// Pick a random element of an array with a seeded generator.
export function pick(array, rng) {
  return array[Math.floor(rng() * array.length)];
}
