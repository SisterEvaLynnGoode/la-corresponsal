// normalize-audio.mjs — even out loudness across the 60 interview clips.
//
// ElevenLabs returns inconsistent levels (mean volume ranged -24 to -35 dB), and
// the quietest clips are hard to hear on Chromebook speakers in a full room.
// Two-pass EBU R128 loudnorm to -16 LUFS, the usual target for spoken word,
// with true peak held at -1.5 dBTP so nothing clips.
//
// Two-pass (measure, then correct with those numbers) rather than single-pass,
// because single-pass normalises dynamically and can pump on speech.
//
// Run: node normalize-audio.mjs
import { execFileSync, spawnSync } from 'child_process';
import { readdirSync, renameSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const audioDir = join(__dirname, 'audio');
const tmpDir   = join(__dirname, 'audio-norm-tmp');
const I = '-16', TP = '-1.5', LRA = '11';

const ff = args => execFileSync('ffmpeg', args, { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] , maxBuffer: 1 << 24 });
// loudnorm prints its JSON report to stderr and still exits 0, so this has to
// read stderr on success — not just in a catch block.
const ffErr = args => {
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8', maxBuffer: 1 << 24 });
  return (r.stderr || '') + (r.stdout || '');
};

if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });
mkdirSync(tmpDir);

const files = readdirSync(audioDir).filter(f => /^\d+_[0-2]\.mp3$/.test(f))
  .sort((a, b) => { const [ac, as] = a.split(/[_.]/).map(Number), [bc, bs] = b.split(/[_.]/).map(Number); return ac - bc || as - bs; });

console.log(`Normalising ${files.length} clips to ${I} LUFS (true peak ${TP} dBTP)\n`);

let done = 0, failed = [];
for (const f of files) {
  const src = join(audioDir, f), out = join(tmpDir, f);
  process.stdout.write(`  ${String(++done).padStart(2)}/${files.length}  ${f.padEnd(9)}`);
  try {
    // Pass 1 — measure
    const log = ffErr(['-hide_banner','-i', src, '-af',
      `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:print_format=json`, '-f','null','NUL']);
    const m = log.match(/\{[\s\S]*?\}/);
    if (!m) throw new Error('could not read loudnorm measurements');
    const s = JSON.parse(m[0]);

    // Pass 2 — apply, feeding the measured values back in for a linear correction
    ff(['-hide_banner','-v','error','-y','-i', src, '-af',
      `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:measured_I=${s.input_i}:measured_TP=${s.input_tp}:` +
      `measured_LRA=${s.input_lra}:measured_thresh=${s.input_thresh}:offset=${s.target_offset}:linear=true`,
      '-ar','44100','-ac','1','-b:a','64k', out]);

    console.log(`  ${String(s.input_i).padStart(6)} → ${I} LUFS`);
  } catch (e) {
    failed.push(f);
    console.log(`  ✗ ${String(e.message).slice(0, 60)}`);
  }
}

if (failed.length) {
  console.log(`\n✗ ${failed.length} failed (${failed.join(', ')}) — originals left untouched.`);
  process.exit(1);
}

for (const f of files) renameSync(join(tmpDir, f), join(audioDir, f));
rmSync(tmpDir, { recursive: true });
console.log(`\n✓ ${files.length} clips normalised in place.`);
