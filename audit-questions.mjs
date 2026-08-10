// audit-questions.mjs — finds multiple-choice items that can be answered without
// reading, and reports them worst-first.
//
// The dominant tell in this content is length: the correct option is written as a
// full, careful sentence while the three distractors are terse. A student who
// notices that scores far above chance across the whole course without
// comprehending anything. A secondary tell is the hedge word — distractors
// narrowed with "solo" / "nada más" read as wrong on sight.
//
// Run: node audit-questions.mjs            report everything
//      node audit-questions.mjs México     filter to matching session keys
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filter = process.argv[2];

const CONTENT = {};
for (const f of readdirSync(join(__dirname, 'content')).filter(f => /^batch-\d+\.json$/.test(f)).sort())
  Object.assign(CONTENT, JSON.parse(readFileSync(join(__dirname, 'content', f), 'utf8')));

const words = s => String(s).trim().split(/\s+/).length;

export function auditQuestion(q) {
  const opts = q.opts || q.options;
  if (q.type !== 'mc' || !Array.isArray(opts) || opts.length !== 4) return null;
  const lens = opts.map(words);
  const ci = q.correct;
  const others = lens.filter((_, i) => i !== ci);
  const cLen = lens[ci];
  const mean = others.reduce((a, b) => a + b, 0) / others.length;
  const maxOther = Math.max(...others);

  // Options that are structurally parallel — four time spans, four ages, four
  // one-word nouns — are fair even when one is a word or two longer, because the
  // shape gives nothing away. Only the raw word count differs.
  const norm = o => String(o).toLowerCase()
    .replace(/\d+|\b(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|quince|veinte|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa|cien|mil|millones?)\b/g, '#')
    .replace(/[^\wáéíóúñ# ]/g, '').trim();
  const shapes = opts.map(o => norm(o).split(/\s+/).slice(0, 2).join(' '));
  const parallel = new Set(shapes).size <= 2                      // same opening shape
    || opts.every(o => /^#|\b#\b/.test(norm(o)))                  // all numeric
    || Math.max(...lens) - Math.min(...lens) <= 2;                // all about equal

  const flags = [];
  // The main tell. Longest AND meaningfully longer than the average distractor.
  if (!parallel && cLen > maxOther && cLen >= mean * 1.6 && cLen - mean >= 2)
    flags.push(`LENGTH correct=${cLen}w vs distractors avg ${mean.toFixed(1)}w`);
  // Hedged distractors give themselves away.
  const hedged = opts.filter((o, i) => i !== ci && /\b(solo|sólo|nada más|nunca|siempre|todos|nadie)\b/i.test(o));
  if (hedged.length >= 2)
    flags.push(`HEDGE ${hedged.length} distractors narrowed with solo/nada más/nunca`);
  // A one-word correct answer among long distractors is the inverse tell.
  if (cLen < Math.min(...others) && mean >= cLen * 2 && mean - cLen >= 2)
    flags.push(`INVERSE correct is far shortest (${cLen}w vs ${mean.toFixed(1)}w)`);

  return flags.length ? { flags, cLen, mean: +mean.toFixed(1), opts, correct: ci } : null;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const rows = [];
  for (const [key, s] of Object.entries(CONTENT)) {
    if (filter && !key.includes(filter)) continue;
    const sets = [['nota', s.article.questions], ['entrevista', s.audio.questions]];
    for (const [where, qs] of sets)
      qs.forEach((q, i) => {
        const a = auditQuestion(q);
        if (a) rows.push({ key, where, n: i + 1, text: q.text, ...a });
      });
  }
  const total = Object.values(CONTENT).reduce((n, s) =>
    n + s.article.questions.filter(q => q.type === 'mc').length + s.audio.questions.length, 0);

  rows.sort((a, b) => (b.cLen - b.mean) - (a.cLen - a.mean));
  console.log(`${rows.length} of ${total} multiple-choice items are guessable\n`);
  for (const r of rows) {
    console.log(`${r.key} · ${r.where} q${r.n}  [${r.flags.join(' | ')}]`);
    console.log(`  ${r.text}`);
    r.opts.forEach((o, i) => console.log(`    ${i === r.correct ? '✔' : ' '} ${o}`));
    console.log('');
  }
  const byWeek = {};
  rows.forEach(r => { const c = r.key.replace(/_\d$/, ''); byWeek[c] = (byWeek[c] || 0) + 1; });
  console.log('by country:', Object.entries(byWeek).sort((a,b)=>b[1]-a[1])
    .map(([k, v]) => `${k} ${v}`).join(' · '));
}
