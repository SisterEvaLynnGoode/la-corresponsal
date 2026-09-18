// deck-shell.mjs — the projector-deck page shared by every deck in the course:
// styles, keyboard/touch navigation, progress bar, print fallback. Each builder
// pushes slides as {cls, day, html} and hands them here.
export function deckHTML(S, title, brand = 'El Mundo Nuestro', extraCSS = '') {
  const slides = S.map((s, i) => `
  <section class="slide ${s.cls}" data-day="${s.day}" id="s${i}">
    <div class="inner">${s.html}</div>
    <div class="foot"><span>${brand} · Día ${s.day}</span><span>${i + 1} / ${S.length}</span></div>
  </section>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
:root{--terracotta:#C4622D;--cream:#FDF5E6;--cream-dk:#F0E6D0;--ink:#2C1810;
  --ink-lt:#6B4C3B;--gold:#E8C547;--white:#fff}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{background:var(--ink);color:var(--ink);font-family:Georgia,'Times New Roman',serif;overflow:hidden}
.sans{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}

.slide{position:absolute;inset:0;display:none;background:var(--cream);
  padding:4vh 6vw 7vh;overflow:auto}
.slide.on{display:flex;flex-direction:column;justify-content:center}
.inner{max-width:min(1180px,88vw);margin:0 auto;width:100%}

.eyebrow{font-family:sans-serif;font-size:clamp(.7rem,1.35vw,1rem);text-transform:uppercase;
  letter-spacing:.22em;color:var(--terracotta);font-weight:700;margin-bottom:.6rem}
h1{font-size:clamp(2.4rem,7vw,5.2rem);line-height:1.02;letter-spacing:-.02em;margin-bottom:1.1rem}
h2{font-size:clamp(1.7rem,3.9vw,3.1rem);line-height:1.1;margin-bottom:1rem}
p{font-size:clamp(1rem,1.85vw,1.5rem);line-height:1.5;margin-bottom:.75rem;max-width:56ch}
p.sm{font-size:clamp(.9rem,1.45vw,1.15rem);color:var(--ink-lt)}
.hook{font-size:clamp(1.15rem,2.5vw,2rem);line-height:1.32;color:var(--ink-lt);max-width:44ch}
.pull{border-left:5px solid var(--terracotta);padding:.5rem 0 .5rem 1.1rem;margin-top:1.2rem;
  font-size:clamp(1.05rem,2.05vw,1.6rem);font-style:italic;line-height:1.34;max-width:52ch}

dl{display:grid;grid-template-columns:minmax(min-content,17rem) 1fr;
  gap:.75rem 1.8rem;align-items:baseline}
dt{font-family:sans-serif;font-weight:700;font-size:clamp(.9rem,1.6vw,1.35rem);
  color:var(--terracotta);line-height:1.22}
dd{font-size:clamp(.9rem,1.55vw,1.3rem);line-height:1.42}

table{width:100%;border-collapse:collapse;font-size:clamp(.82rem,1.4vw,1.2rem)}
td{padding:.4rem .7rem;border-bottom:1px solid var(--cream-dk);vertical-align:baseline}
td.es{font-weight:700;white-space:nowrap}
td.en{color:var(--ink-lt);font-family:sans-serif;font-size:.86em}
td.nt{color:var(--ink-lt);font-style:italic;font-size:.84em}

.cover{background:var(--ink);color:var(--cream)}
.cover h1{color:var(--cream)}
.cover .hook{color:var(--gold)}
.cover .eyebrow{color:var(--gold)}
.closer{background:var(--terracotta);color:var(--white)}
.closer h2,.closer .hook{color:var(--white);max-width:52ch}
.act{background:var(--cream-dk)}
.page{display:inline-block;margin-top:1rem;background:var(--ink);color:var(--cream);
  font-family:sans-serif;font-size:clamp(.85rem,1.5vw,1.2rem);padding:.5rem 1.1rem;border-radius:6px}

.foot{position:absolute;left:6vw;right:6vw;bottom:2.4vh;display:flex;justify-content:space-between;
  font-family:sans-serif;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink-lt);opacity:.65}
.cover .foot,.closer .foot{color:var(--cream);opacity:.6}

#bar{position:fixed;left:0;top:0;height:4px;background:var(--terracotta);
  transition:width .18s;z-index:10}
#help{position:fixed;right:1rem;bottom:1rem;font-family:sans-serif;font-size:.7rem;
  color:var(--ink-lt);opacity:.5;z-index:10}
@media print{
  body{overflow:visible;background:#fff}
  .slide{position:relative;display:block !important;page-break-after:always;
    min-height:0;padding:.5in;border-bottom:1px solid #ccc}
  .cover,.closer,.act{background:#fff;color:#111}
  .cover h1,.cover .hook,.cover .eyebrow,.closer h2,.closer .hook{color:#111}
  #bar,#help{display:none}
}
${extraCSS}</style>
</head>
<body>
<div id="bar"></div>
${slides}
<div id="help">← → o barra espaciadora · F pantalla completa</div>
<script>
  const slides = [...document.querySelectorAll('.slide')];
  let i = Math.min(+(location.hash.slice(1) || 0), slides.length - 1);
  function show(n) {
    i = Math.max(0, Math.min(n, slides.length - 1));
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    document.getElementById('bar').style.width = ((i + 1) / slides.length * 100) + '%';
    history.replaceState(null, '', '#' + i);
    slides[i].scrollTop = 0;
  }
  addEventListener('keydown', e => {
    if (['ArrowRight',' ','PageDown','ArrowDown'].includes(e.key)) { show(i + 1); e.preventDefault(); }
    else if (['ArrowLeft','PageUp','ArrowUp'].includes(e.key)) { show(i - 1); e.preventDefault(); }
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(slides.length - 1);
    else if (e.key.toLowerCase() === 'f') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    }
  });
  // Tap right half to advance, left half to go back — for a touchscreen panel.
  addEventListener('click', e => show(e.clientX > innerWidth / 2 ? i + 1 : i - 1));
  show(i);
</script>
</body>
</html>
`;
}
