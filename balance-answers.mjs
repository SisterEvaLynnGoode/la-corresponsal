// balance-answers.mjs — evens out the A/B/C/D distribution of correct answers.
// Authoring naturally clusters the right answer on one option; a student who
// always picks that letter would score high without reading. This rotates each
// MC question's options so the correct answer cycles 0,1,2,3 across the game.
//
// Rotation (not shuffle) preserves the cyclic order of options, so numeric
// sequences still read naturally. Deterministic and idempotent: a question
// already on its target index is left untouched.
//
// Run: node balance-answers.mjs
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COUNTRIES = ['México','Guatemala','Honduras','El Salvador','Nicaragua','Costa Rica',
  'Panamá','Cuba','República Dominicana','Puerto Rico','Colombia','Venezuela','Ecuador',
  'Perú','Bolivia','Chile','Argentina','Uruguay','Paraguay','España'];
const SESSIONS = 3;

const dir = join(__dirname, 'content');
const files = readdirSync(dir).filter(f => /^batch-\d+\.json$/.test(f)).sort();

// Load every batch, remembering which file each session came from
const batches = files.map(f => ({ f, data: JSON.parse(readFileSync(join(dir, f), 'utf8')) }));
const ownerOf = {};
batches.forEach(b => Object.keys(b.data).forEach(k => { ownerOf[k] = b; }));

// Deterministic PRNG so the shuffle is reproducible across runs and machines.
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// First count the questions, then build a target list holding each of A/B/C/D an
// equal number of times and shuffle it. Simply cycling n%4 also balances the
// totals, but lays them out as A,B,C,D,A,B,C,D — which on a printed worksheet a
// student cracks immediately. Balanced AND unpredictable is what we need.
function buildTargets(count) {
  const t = [];
  for (let i = 0; i < count; i++) t.push(i % 4);
  const rnd = mulberry32(0x1A5C0);          // fixed seed → same result every run
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }

  // A fair shuffle still throws up long streaks — the raw draw had eight of the
  // same letter in a row, which reads as a mistake on a printed page. Break any
  // run longer than MAXRUN by swapping with a later differing element. Swapping
  // (rather than reassigning) keeps the four counts exactly equal.
  const MAXRUN = 3;
  for (let i = MAXRUN; i < t.length; i++) {
    let run = 1;
    while (run <= MAXRUN && t[i - run] === t[i]) run++;
    if (run <= MAXRUN) continue;
    for (let j = i + 1; j < t.length; j++) {
      if (t[j] === t[i]) continue;
      if (t[j] === t[i - 1]) continue;                 // would extend the run
      if (j > 0 && t[j - 1] === t[i]) continue;        // would create one there
      if (j + 1 < t.length && t[j + 1] === t[i]) continue;
      [t[i], t[j]] = [t[j], t[i]];
      break;
    }
  }
  return t;
}

// Walk sessions in a STABLE order (country order, then session, then question)
// so adding new batches later never renumbers the questions already balanced.
let n = 0, changed = 0;
const before = [0,0,0,0], after = [0,0,0,0];

// Count first so the target list is the right length.
let qCount = 0;
for (const country of COUNTRIES)
  for (let si = 0; si < SESSIONS; si++) {
    const s0 = ownerOf[`${country}_${si}`]?.data[`${country}_${si}`];
    if (!s0) continue;
    for (const q of [...(s0.article?.questions || []), ...(s0.audio?.questions || [])]) {
      const o = q.opts || q.options;
      if (q.type === 'mc' && Array.isArray(o) && o.length === 4 && typeof q.correct === 'number') qCount++;
    }
  }
const TARGETS = buildTargets(qCount);

for (const country of COUNTRIES) {
  for (let si = 0; si < SESSIONS; si++) {
    const s = ownerOf[`${country}_${si}`]?.data[`${country}_${si}`];
    if (!s) continue;
    for (const q of [...(s.article?.questions || []), ...(s.audio?.questions || [])]) {
      if (q.type !== 'mc') continue;
      const opts = q.opts || q.options;
      if (!Array.isArray(opts) || opts.length !== 4) continue;
      if (typeof q.correct !== 'number') continue;

      before[q.correct]++;
      const target = TARGETS[n++];
      const r = (target - q.correct + 4) % 4;
      if (r !== 0) {
        const rotated = new Array(4);
        opts.forEach((o, j) => { rotated[(j + r) % 4] = o; });
        for (let i = 0; i < 4; i++) opts[i] = rotated[i];
        q.correct = target;
        changed++;
      }
      after[q.correct]++;
    }
  }
}

for (const b of batches) writeFileSync(join(dir, b.f), JSON.stringify(b.data, null, 2) + '\n', 'utf8');

console.log(`Questions:  ${n}   rotated: ${changed}`);
console.log(`Before A/B/C/D: ${before.join(' / ')}`);
console.log(`After  A/B/C/D: ${after.join(' / ')}`);
