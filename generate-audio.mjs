// generate-audio.mjs — one-time ElevenLabs generation of the 60 interview clips.
// Reads the scripts straight from content/batch-*.json and writes the files the
// game already probes for: audio/{countryIndex}_{sessionIndex}.mp3
//
// Key comes from the environment, never from this file:
//   EL_KEY=sk_xxx node generate-audio.mjs
//
// Resumable: skips any clip already on disk, so a interrupted run just continues.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EL_KEY   = process.env.EL_KEY;
const EL_VOICE = process.env.EL_VOICE || 'shgZhK1V2xIH95P6mErd';
const MODEL    = 'eleven_multilingual_v2';
const DRY_RUN  = process.argv.includes('--dry-run');

const COUNTRIES = ['México','Guatemala','Honduras','El Salvador','Nicaragua','Costa Rica',
  'Panamá','Cuba','República Dominicana','Puerto Rico','Colombia','Venezuela','Ecuador',
  'Perú','Bolivia','Chile','Argentina','Uruguay','Paraguay','España'];
const SESSIONS = 3;

// ── Load every script from the content batches ────────────────────────────────
const dir = join(__dirname, 'content');
const all = {};
for (const f of readdirSync(dir).filter(f => /^batch-\d+\.json$/.test(f)).sort())
  Object.assign(all, JSON.parse(readFileSync(join(dir, f), 'utf8')));

const jobs = [];
for (let ci = 0; ci < COUNTRIES.length; ci++)
  for (let si = 0; si < SESSIONS; si++) {
    const s = all[`${COUNTRIES[ci]}_${si}`];
    if (!s) { console.error(`✗ missing ${COUNTRIES[ci]}_${si}`); process.exit(1); }
    jobs.push({ ci, si, file: `${ci}_${si}.mp3`, label: `${COUNTRIES[ci]} S${si + 1}`,
                text: s.audio.script, source: s.audio.source });
  }

const audioDir = join(__dirname, 'audio');
if (!existsSync(audioDir)) mkdirSync(audioDir);

const pending = jobs.filter(j => !existsSync(join(audioDir, j.file)));
const chars   = pending.reduce((n, j) => n + j.text.length, 0);

console.log(`Clips:      ${jobs.length} total, ${jobs.length - pending.length} already on disk, ${pending.length} to generate`);
console.log(`Characters: ${chars.toLocaleString()}`);
console.log(`Voice:      ${EL_VOICE}   Model: ${MODEL}\n`);

if (DRY_RUN) { console.log('(--dry-run: nothing generated)'); process.exit(0); }
if (!EL_KEY) { console.error('ERROR: EL_KEY not set.'); process.exit(1); }
if (!EL_KEY.startsWith('sk_')) {
  console.error(`ERROR: key starts with "${EL_KEY.slice(0, 3)}" — real ElevenLabs keys start with "sk_".`);
  console.error('A bare hex string is the key ID, not the key. Rotate the key to reveal a new one.');
  process.exit(1);
}
if (!pending.length) { console.log('Nothing to do — all clips exist.'); process.exit(0); }

// ── Generate ──────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function tts(text) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': EL_KEY },
    body: JSON.stringify({
      text, model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true }
    })
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 160)}`);
  return Buffer.from(await res.arrayBuffer());
}

let done = 0, failed = [];
for (const j of pending) {
  const n = `${++done}/${pending.length}`.padStart(7);
  try {
    let buf, lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { buf = await tts(j.text); break; }
      catch (e) {
        lastErr = e;
        // 401/402/422 are configuration problems; retrying just burns quota.
        if (/^(401|402|422)/.test(e.message)) throw e;
        if (attempt < 3) { console.log(`  ↻ retry ${attempt} — ${e.message.slice(0, 70)}`); await sleep(4000); }
      }
    }
    if (!buf) throw lastErr;
    writeFileSync(join(audioDir, j.file), buf);
    console.log(`${n} ✓ ${j.label.padEnd(26)} ${j.file.padEnd(9)} ${Math.round(buf.length / 1024)}KB  ${j.source}`);
  } catch (e) {
    failed.push(`${j.label}: ${e.message.slice(0, 100)}`);
    console.log(`${n} ✗ ${j.label.padEnd(26)} ${e.message.slice(0, 90)}`);
    if (/^(401|402)/.test(e.message)) { console.error('\nAuth/plan error — stopping so quota is not wasted.'); break; }
  }
  await sleep(1200);
}

const onDisk = readdirSync(audioDir).filter(f => f.endsWith('.mp3')).length;
console.log(`\n${'─'.repeat(50)}`);
console.log(`On disk: ${onDisk}/${jobs.length} clips`);
if (failed.length) { console.log(`\nFailed (${failed.length}):\n  ${failed.join('\n  ')}`); console.log('\nRe-run to retry only the missing ones.'); }
else console.log('✓ Complete. Commit the audio/ folder and push.');
