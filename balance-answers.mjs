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

// Walk sessions in a STABLE order (country order, then session, then question)
// so adding new batches later never renumbers the questions already balanced.
let n = 0, changed = 0;
const before = [0,0,0,0], after = [0,0,0,0];

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
      const target = n++ % 4;
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
