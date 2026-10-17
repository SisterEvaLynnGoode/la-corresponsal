// prep-carteles-img.mjs — turn the poster scans in img-src/ into the two
// derivatives the unit needs: grayscale for the photocopied packet, colour for
// the projector. Run after dropping a new scan in img-src/, then rebuild:
//
//   node prep-carteles-img.mjs && node build-carteles.mjs
//
// Public-domain posters land in img/carteles/ and ship with the site.
// In-copyright ones land in img-local/carteles/, which is gitignored: they
// print in Tommy's classroom copy and show a labelled box on the public site.
// Needs ffmpeg on PATH (same dependency as the audio pipeline).
import { execFileSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, 'img-src');

// crop is [w, h, x, y] in source pixels, for scans photographed on a backdrop.
const MANIFEST = [
  { id: 'samtio',    src: 'samtio.jpg' },
  { id: 'moor',      src: 'moor.jpg' },
  { id: 'wecandoit', src: 'wecandoit.jpg' },
  { id: 'keepfit',   src: 'keepfit.jpg' },
  { id: 'anuncio',   src: 'anuncio.jpg', crop: [952, 1156, 78, 42] },
  { id: 'falso',     src: 'falso.webp' },
  { id: 'huelga',    src: 'huelga.jpg',   local: true },
  { id: 'boomboom',  src: 'boomboom.jpg', local: true },
];

const run = (args) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: 'inherit' });

for (const m of MANIFEST) {
  const src = join(SRC, m.src);
  if (!existsSync(src)) { console.log(`skip ${m.id} — no ${m.src}`); continue; }
  const dir = join(__dirname, m.local ? 'img-local/carteles' : 'img/carteles');
  mkdirSync(dir, { recursive: true });
  const crop = m.crop ? `crop=${m.crop.join(':')},` : '';

  // Colour, for the deck. 1200px wide is plenty for a projector.
  run(['-i', src, '-vf', `${crop}scale='min(1200,iw)':-1:flags=lanczos`,
       '-q:v', '4', join(dir, `${m.id}.jpg`)]);

  // Grayscale, for the packet. A little extra contrast survives a photocopier,
  // which flattens midtones badly.
  run(['-i', src, '-vf', `${crop}scale='min(1000,iw)':-1:flags=lanczos,format=gray,eq=contrast=1.12:brightness=0.015`,
       '-q:v', '4', join(dir, `${m.id}-gris.jpg`)]);

  console.log(`${m.id.padEnd(10)} → ${m.local ? 'img-local' : 'img     '}/carteles/${m.id}{,-gris}.jpg`);
}
