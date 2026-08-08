// bake-content.mjs — merges content/batch-*.json into index.html
// Run: node bake-content.mjs          (validate + write)
//      node bake-content.mjs --check  (validate only, no write)
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHECK_ONLY = process.argv.includes('--check');

const COUNTRIES = ['México','Guatemala','Honduras','El Salvador','Nicaragua','Costa Rica',
  'Panamá','Cuba','República Dominicana','Puerto Rico','Colombia','Venezuela','Ecuador',
  'Perú','Bolivia','Chile','Argentina','Uruguay','Paraguay','España'];
const SESSIONS = 3;

// ── Merge all batches ─────────────────────────────────────────────────────────
const dir = join(__dirname, 'content');
const files = readdirSync(dir).filter(f => /^batch-\d+\.json$/.test(f)).sort();
const all = {};
const dupes = [];

for (const f of files) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  } catch (e) {
    console.error(`✗ ${f}: invalid JSON — ${e.message}`);
    process.exit(1);
  }
  for (const [k, v] of Object.entries(parsed)) {
    if (all[k]) dupes.push(`${k} (redefined in ${f})`);
    all[k] = v;
  }
  console.log(`  loaded ${f}: ${Object.keys(parsed).length} sessions`);
}

// ── Validate ──────────────────────────────────────────────────────────────────
const errors = [];
const warnings = [];

for (const ci in COUNTRIES) {
  for (let si = 0; si < SESSIONS; si++) {
    const key = `${COUNTRIES[ci]}_${si}`;
    const s = all[key];
    if (!s) { errors.push(`MISSING: ${key}`); continue; }

    if (!s.topic)      errors.push(`${key}: no topic`);
    if (!s.assignment) errors.push(`${key}: no assignment`);

    const a = s.article;
    if (!a) { errors.push(`${key}: no article`); continue; }
    if (!a.headline) errors.push(`${key}: no headline`);
    if (!a.byline)   errors.push(`${key}: no byline`);
    if (!Array.isArray(a.paragraphs) || a.paragraphs.length < 3)
      errors.push(`${key}: needs >=3 paragraphs (has ${a.paragraphs?.length})`);
    if (!Array.isArray(a.keywords) || a.keywords.length < 4)
      errors.push(`${key}: needs >=4 keywords (has ${a.keywords?.length})`);

    // keywords must literally appear in the article text (they get regex-highlighted)
    const fullText = (a.paragraphs || []).join(' ');
    (a.keywords || []).forEach(k => {
      if (!k.word || !k.definition) { errors.push(`${key}: malformed keyword`); return; }
      // Must mirror the highlight regex in index.html: \b is ASCII-only and would
      // report false misses for accented edges (coquí, convocó, ñandutí).
      const esc = k.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(^|[^\\p{L}\\p{N}])${esc}(?![\\p{L}\\p{N}])`, 'iu');
      if (!re.test(fullText)) warnings.push(`${key}: keyword "${k.word}" not found in paragraphs`);
    });

    // article questions: expect MC set + 1 written
    const aq = a.questions || [];
    if (aq.length < 4) errors.push(`${key}: needs >=4 article questions (has ${aq.length})`);
    if (!aq.some(q => q.type === 'written')) warnings.push(`${key}: no written question`);
    aq.forEach((q, i) => validateQ(q, `${key} article q${i}`));

    const au = s.audio;
    if (!au) { errors.push(`${key}: no audio`); continue; }
    if (!au.source) errors.push(`${key}: no audio source`);
    const wc = (au.script || '').split(/\s+/).filter(Boolean).length;
    if (wc < 120) warnings.push(`${key}: audio script short (${wc} words)`);
    if (wc > 260) warnings.push(`${key}: audio script long (${wc} words)`);
    const uq = au.questions || [];
    if (uq.length < 3) errors.push(`${key}: needs >=3 audio questions (has ${uq.length})`);
    uq.forEach((q, i) => validateQ(q, `${key} audio q${i}`));
  }
}

function validateQ(q, label) {
  if (!q.text) errors.push(`${label}: no text`);
  if (q.type === 'written') return;
  if (q.type !== 'mc') { errors.push(`${label}: bad type "${q.type}"`); return; }
  const opts = q.opts || q.options || [];
  if (opts.length !== 4) errors.push(`${label}: needs exactly 4 opts (has ${opts.length})`);
  if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= opts.length)
    errors.push(`${label}: correct index ${q.correct} out of range`);
  if (new Set(opts).size !== opts.length) warnings.push(`${label}: duplicate options`);
}

// answer-key spread check — if every answer is the same index, something's off
const spread = [0,0,0,0];
Object.values(all).forEach(s => {
  [...(s.article?.questions||[]), ...(s.audio?.questions||[])]
    .filter(q => q.type === 'mc' && typeof q.correct === 'number')
    .forEach(q => spread[q.correct]++);
});

// ── Report ────────────────────────────────────────────────────────────────────
const have = Object.keys(all).length;
console.log(`\n${'─'.repeat(50)}`);
console.log(`Sessions: ${have}/${COUNTRIES.length * SESSIONS}`);
console.log(`Answer spread A/B/C/D: ${spread.join(' / ')}`);
if (dupes.length) console.log(`\nDUPLICATE KEYS:\n  ${dupes.join('\n  ')}`);
if (warnings.length) console.log(`\n⚠ WARNINGS (${warnings.length}):\n  ${warnings.join('\n  ')}`);
if (errors.length) {
  console.log(`\n✗ ERRORS (${errors.length}):\n  ${errors.join('\n  ')}`);
  const missing = errors.filter(e => e.startsWith('MISSING')).length;
  if (missing && missing === errors.length) {
    console.log(`\n(only missing-session errors — that's expected mid-authoring)`);
  } else {
    console.log('\nFix structural errors before baking.');
    if (!CHECK_ONLY) process.exit(1);
  }
} else {
  console.log('\n✓ No errors.');
}

if (CHECK_ONLY) { console.log('\n(--check: nothing written)'); process.exit(0); }
if (have < COUNTRIES.length * SESSIONS) {
  console.log(`\n✗ Refusing to bake: ${COUNTRIES.length*SESSIONS - have} sessions still missing.`);
  process.exit(1);
}

// ── Bake ──────────────────────────────────────────────────────────────────────
const htmlPath = join(__dirname, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
const block = `// @@CONTENT_START@@\nconst FALLBACK = ${JSON.stringify(all, null, 2)};\n// @@CONTENT_END@@`;
const out = html.replace(/\/\/ @@CONTENT_START@@[\s\S]*?\/\/ @@CONTENT_END@@/, () => block);
if (out === html) { console.error('✗ Sentinel markers not found in index.html'); process.exit(1); }
writeFileSync(htmlPath, out, 'utf8');
console.log(`\n✓ Baked ${have} sessions into index.html (${(out.length/1024).toFixed(0)} KB)`);
