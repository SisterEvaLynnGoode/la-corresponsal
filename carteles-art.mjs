// carteles-art.mjs — the eight example posters for the poster unit.
//
// Every poster is ORIGINAL: invented cause, invented slogan, drawn in the visual
// grammar of a real tradition (constructivist labour, strike boycott, wartime
// recruitment, mid-century consumer ad, modernist public health, social feed).
// Nothing here reproduces a real poster, so the packet can be copied forever.
//
// One SVG source per poster, two palettes. The packet prints them in grayscale
// with real black for the focal shape; the projector deck shows the same markup
// in colour. Same "one list, two surfaces" rule as NORMAS/FRASES: if a slogan
// changes, it changes on paper and on screen at once.
//
// Each poster declares the techniques it uses, which is what the analysis pages
// and the answer key are built from — the key can never drift from the art.

// Grayscale: black carries the focal shape, two grays and a hairline behind it.
export const GRIS = { bg:'#fff', ink:'#111', mid:'#6e6e6e', soft:'#c9c9c9', pale:'#ebebeb', paper:'#fff' };

const P = [];
const poster = o => { P.push(o); return o; };

// Poster type is set in a 300-wide box, so a long line has to be told how much
// room it gets: textLength squeezes it instead of letting it run off the sheet.
// `x` is the left edge unless anchor is 'middle', in which case it is the centre.
const T = (s, { x, y, size, w, fill, anchor = 'start', weight = 800, family = 'Helvetica,Arial,sans-serif',
                 style = '', ls = 0 }) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}"
     font-family="${family}" font-weight="${weight}"${style ? ` font-style="${style}"` : ''}
     ${ls ? `letter-spacing="${ls}" ` : ''}textLength="${w}" lengthAdjust="spacingAndGlyphs">${s}</text>`;

// ── 1 · Constructivist labour ────────────────────────────────────────────────
poster({
  id: 'turno',
  titulo: 'El turno es nuestro',
  estilo: 'Cartel obrero, estilo constructivista (1920s)',
  lema: '¡EL TURNO ES NUESTRO!',
  lado: 'obrero',
  tecnicas: ['nosotros', 'imagen-heroica', 'mandato'],
  color: { bg:'#F3E9D2', ink:'#1A1A1A', mid:'#C8372D', soft:'#E8A33D', pale:'#F7D9A0', paper:'#F3E9D2' },
  svg: p => `
    <rect width="300" height="400" fill="${p.bg}"/>
    <path d="M0 400 L300 0 L300 130 L120 400 Z" fill="${p.mid}"/>
    <g fill="${p.soft}">
      <path d="M150 60 L300 20 L300 60 Z" opacity=".85"/>
      <circle cx="96" cy="104" r="46"/>
    </g>
    <!-- a baker's fist around a rolling pin: the focal shape, always full black -->
    <g transform="rotate(-18 150 210)">
      <g fill="${p.ink}">
        <rect x="56" y="150" width="188" height="26" rx="13"/>
        <rect x="36" y="156" width="26" height="14" rx="6"/>
        <rect x="238" y="156" width="26" height="14" rx="6"/>
      </g>
      <g fill="${p.ink}">
        <path d="M104 176 q-6 0 -6 10 l0 56 q0 34 38 34 l30 0 q34 0 34-34 l0-56 q0-10-8-10 z"/>
        <g fill="${p.bg}" opacity=".9">
          <circle cx="120" cy="196" r="7"/><circle cx="142" cy="196" r="7"/>
          <circle cx="164" cy="196" r="7"/><circle cx="186" cy="196" r="7"/>
        </g>
        <path d="M196 212 q22 2 22 22 t-24 20 l-10 0 z"/>
      </g>
    </g>
    <rect x="0" y="310" width="300" height="62" fill="${p.ink}"/>
    ${T('¡EL TURNO', { x:18, y:340, size:27, w:148, fill:p.bg })}
    ${T('ES NUESTRO!', { x:18, y:364, size:27, w:178, fill:p.bg })}
    ${T('SINDICATO DE PANADERAS · 8 HORAS', { x:18, y:388, size:10.5, w:264, fill:p.ink, ls:1.2 })}`,
});

// ── 2 · The company's answer, same visual grammar ────────────────────────────
poster({
  id: 'fabrica',
  titulo: 'La fábrica somos todos',
  estilo: 'Cartel de empresa (mismos años, lado contrario)',
  lema: 'LA FÁBRICA SOMOS TODOS',
  lado: 'empresa',
  tecnicas: ['nosotros', 'imagen-heroica', 'dato'],
  color: { bg:'#EAF0F4', ink:'#1B2A35', mid:'#2E6F9E', soft:'#8FBBD6', pale:'#CFE1EC', paper:'#EAF0F4' },
  svg: p => `
    <rect width="300" height="400" fill="${p.bg}"/>
    <path d="M300 400 L0 0 L0 130 L180 400 Z" fill="${p.mid}"/>
    <g fill="${p.soft}"><circle cx="210" cy="100" r="44"/></g>
    <!-- the plant, a rising line, and one contented worker: the same "we",
         pointed the other way -->
    <g fill="${p.ink}">
      <path d="M28 300 l0-96 l54 0 l0 30 l54-30 l0 30 l54-30 l0 96 z"/>
      <rect x="196" y="150" width="20" height="54"/>
      <rect x="226" y="168" width="20" height="36"/>
      <g fill="${p.bg}">
        <rect x="44" y="236" width="20" height="26"/><rect x="96" y="236" width="20" height="26"/>
        <rect x="148" y="236" width="20" height="26"/><rect x="200" y="236" width="20" height="26"/>
      </g>
      <circle cx="150" cy="110" r="30"/>
      <path d="M100 196 q6-50 50-58 q44 8 50 58 z"/>
      <path d="M44 184 L96 140 L140 164 L246 86" fill="none" stroke="${p.ink}" stroke-width="7"/>
      <path d="M224 80 L256 78 L250 110 Z"/>
    </g>
    <rect x="0" y="312" width="300" height="60" fill="${p.ink}"/>
    ${T('LA FÁBRICA', { x:18, y:340, size:25, w:150, fill:p.bg, weight:700, family:"Georgia,'Times New Roman',serif" })}
    ${T('SOMOS TODOS', { x:18, y:364, size:25, w:182, fill:p.bg, weight:700, family:"Georgia,'Times New Roman',serif" })}
    ${T('PRODUCCIÓN +19% · GRACIAS A USTEDES', { x:18, y:388, size:10.5, w:264, fill:p.ink, ls:1.2 })}`,
});

// ── 3 · Boycott ──────────────────────────────────────────────────────────────
poster({
  id: 'boicot',
  titulo: 'No compres sin preguntar',
  estilo: 'Cartel de boicot / huelga',
  lema: 'NO COMPRES SIN PREGUNTAR',
  lado: 'obrero',
  tecnicas: ['mandato', 'ellos', 'llamada'],
  color: { bg:'#FBF3E4', ink:'#141414', mid:'#B4212A', soft:'#E3C04A', pale:'#F0DFAE', paper:'#FBF3E4' },
  svg: p => `
    <rect width="300" height="400" fill="${p.bg}"/>
    <circle cx="150" cy="168" r="118" fill="${p.mid}"/>
    <circle cx="150" cy="168" r="118" fill="none" stroke="${p.ink}" stroke-width="5"/>
    <!-- open palm: stop, and ask -->
    <g fill="${p.bg}" stroke="${p.ink}" stroke-width="5" stroke-linejoin="round">
      <path d="M118 244 l0-56 q-14 4-18-8 l-14-42 q-4-14 10-18 t18 10 l10 28 l0-72 q0-15 14-15 t14 15 l0 54
               l0-64 q0-15 14-15 t14 15 l0 64 l4-46 q2-15 16-13 t12 17 l-6 72 q-4 56-44 74 z"/>
    </g>
    <g fill="${p.soft}">
      <path d="M150 58 l10 20 l22 4 l-16 16 l4 22 l-20-11 l-20 11 l4-22 l-16-16 l22-4 z" opacity=".9"/>
    </g>
    ${T('NO COMPRES', { x:150, y:322, size:27, w:184, fill:p.ink, anchor:'middle' })}
    ${T('SIN PREGUNTAR', { x:150, y:350, size:27, w:232, fill:p.ink, anchor:'middle' })}
    ${T('¿QUIÉN LO HIZO? ¿CUÁNTO LE PAGARON?', { x:150, y:376, size:11, w:258, fill:p.ink, anchor:'middle', ls:1 })}`,
});

// ── 4 · Recruitment, the pointing figure ─────────────────────────────────────
poster({
  id: 'necesitamos',
  titulo: 'Te necesitamos a ti',
  estilo: 'Cartel de reclutamiento (el dedo que señala)',
  lema: 'TE NECESITAMOS A TI',
  lado: 'gobierno',
  tecnicas: ['tu-directo', 'mandato', 'nosotros'],
  color: { bg:'#F2EAD8', ink:'#17202B', mid:'#1F4E79', soft:'#C0392B', pale:'#DCCDA8', paper:'#F2EAD8' },
  svg: p => `
    <rect width="300" height="400" fill="${p.bg}"/>
    <g stroke="${p.pale}" stroke-width="12">
      ${Array.from({length:9},(_,i)=>`<line x1="150" y1="170" x2="${-60+i*60}" y2="-40"/>`).join('')}
    </g>
    <circle cx="150" cy="150" r="104" fill="${p.mid}"/>
    <!-- shoulders and head behind; the arm comes at the reader, so the hand is
         the biggest thing on the sheet and the finger overlaps everything -->
    <g fill="${p.ink}">
      <circle cx="118" cy="136" r="36"/>
      <path d="M120 100 q-26-4-26-26 q24-14 54 0 q0 22-28 26 z"/>
      <path d="M54 300 q8-52 52-64 l36 0 q40 10 52 64 z"/>
      <path d="M150 300 L196 222 L254 254 L214 324 Z"/>
    </g>
    <g fill="${p.bg}" stroke="${p.ink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <rect x="188" y="216" width="76" height="72" rx="24"/>
      <rect x="120" y="236" width="92" height="32" rx="16" transform="rotate(16 166 252)"/>
      <rect x="196" y="190" width="28" height="48" rx="14" transform="rotate(-18 210 214)"/>
      <g fill="none"><path d="M212 240 l40 0 M214 262 l44 0"/></g>
    </g>
    <rect x="0" y="306" width="300" height="66" fill="${p.soft}"/>
    ${T('TE NECESITAMOS', { x:150, y:338, size:30, w:258, fill:p.bg, anchor:'middle' })}
    ${T('A TI', { x:150, y:366, size:30, w:62, fill:p.bg, anchor:'middle' })}
    ${T('PRESÉNTATE EL LUNES · NO ESPERES', { x:150, y:390, size:10.5, w:252, fill:p.ink, anchor:'middle', ls:1.4 })}`,
});

// ── 5 · Public health, modernist ─────────────────────────────────────────────
poster({
  id: 'agua',
  titulo: 'Toma agua, no excusas',
  estilo: 'Cartel de salud pública (modernista, años 60)',
  lema: 'TOMA AGUA, NO EXCUSAS',
  lado: 'salud',
  tecnicas: ['mandato', 'dato', 'repeticion'],
  color: { bg:'#EFF6F5', ink:'#10343A', mid:'#2E9B8F', soft:'#F2B544', pale:'#CCE5E1', paper:'#EFF6F5' },
  svg: p => `
    <rect width="300" height="400" fill="${p.bg}"/>
    <g fill="${p.pale}">
      ${Array.from({length:32},(_,i)=>`<circle cx="${26+(i%8)*36}" cy="${30+Math.floor(i/8)*34}" r="9"/>`).join('')}
    </g>
    <path d="M150 128 q58 70 58 106 a58 58 0 0 1-116 0 q0-36 58-106 z" fill="${p.mid}"/>
    <path d="M150 128 q58 70 58 106 a58 58 0 0 1-116 0 q0-36 58-106 z" fill="none" stroke="${p.ink}" stroke-width="5"/>
    <path d="M124 238 a26 26 0 0 0 26 26" fill="none" stroke="${p.bg}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="232" cy="96" r="24" fill="${p.soft}"/>
    ${T('TOMA AGUA,', { x:30, y:330, size:26, w:166, fill:p.ink })}
    ${T('NO EXCUSAS.', { x:30, y:356, size:26, w:182, fill:p.ink })}
    ${T('8 DE CADA 10 LLEGAN SIN TOMAR AGUA', { x:30, y:380, size:10.5, w:240, fill:p.ink, weight:400, ls:1 })}`,
});

// ── 6 · Consumer advertising ─────────────────────────────────────────────────
poster({
  id: 'compra',
  titulo: 'Compra. Sonríe. Repite.',
  estilo: 'Anuncio comercial (años 50)',
  lema: 'COMPRA. SONRÍE. REPITE.',
  lado: 'empresa',
  tecnicas: ['repeticion', 'mandato', 'todos-lo-hacen'],
  color: { bg:'#FFF4E8', ink:'#2B1B12', mid:'#E2552C', soft:'#49A2B8', pale:'#FBD9B4', paper:'#FFF4E8' },
  svg: p => `
    <rect width="300" height="400" fill="${p.bg}"/>
    <g fill="${p.pale}">
      ${Array.from({length:20},(_,i)=>`<path d="M150 170 L${150+124*Math.cos(i*Math.PI/10)} ${170+124*Math.sin(i*Math.PI/10)} L${150+124*Math.cos((i+.42)*Math.PI/10)} ${170+124*Math.sin((i+.42)*Math.PI/10)} Z"/>`).join('')}
    </g>
    <circle cx="150" cy="170" r="86" fill="${p.mid}"/>
    <g fill="${p.bg}" font-family="Helvetica,Arial,sans-serif" font-weight="800" text-anchor="middle">
      <text x="150" y="150" font-size="22">NUEVO</text>
      <text x="150" y="182" font-size="34">¡YA!</text>
      <text x="150" y="208" font-size="13" letter-spacing="1.4">TODOS LO TIENEN</text>
    </g>
    <g fill="${p.soft}"><rect x="40" y="248" width="48" height="36" rx="4"/><rect x="212" y="248" width="48" height="36" rx="4"/></g>
    ${T('Compra. Sonríe.', { x:150, y:322, size:25, w:196, fill:p.ink, anchor:'middle', weight:700,
                             family:"Georgia,'Times New Roman',serif", style:'italic' })}
    ${T('Repite.', { x:150, y:350, size:25, w:88, fill:p.ink, anchor:'middle', weight:700,
                     family:"Georgia,'Times New Roman',serif", style:'italic' })}
    ${T('PAGA DESPUÉS · NO PIENSES TANTO', { x:150, y:378, size:10.5, w:250, fill:p.ink, anchor:'middle', ls:1.3 })}`,
});

// ── 7 · The social feed ──────────────────────────────────────────────────────
poster({
  id: 'parque',
  titulo: '#SalvaElParque',
  estilo: 'Publicación de redes sociales (hoy)',
  lema: '#SALVAELPARQUE',
  lado: 'vecinos',
  tecnicas: ['todos-lo-hacen', 'llamada', 'nosotros'],
  cuadrado: true,
  color: { bg:'#15181C', ink:'#F4F6F8', mid:'#5BD08A', soft:'#F25C78', pale:'#2A3038', paper:'#15181C' },
  svg: p => `
    <rect width="320" height="320" fill="${p.bg}"/>
    <circle cx="160" cy="146" r="104" fill="${p.pale}"/>
    <g fill="${p.mid}">
      <circle cx="160" cy="118" r="52"/><circle cx="118" cy="150" r="36"/><circle cx="202" cy="150" r="36"/>
      <rect x="150" y="166" width="20" height="84" rx="5"/>
    </g>
    ${T('#SalvaElParque', { x:160, y:276, size:30, w:216, fill:p.ink, anchor:'middle' })}
    ${T('1.284 vecinos ya firmaron · firma tú', { x:160, y:298, size:12, w:212, fill:p.ink, anchor:'middle', weight:400 })}
    <g fill="${p.soft}">
      <path d="M34 36 q-12-14 2-22 t14 8 q0-16 14-8 t2 22 l-16 16 z"/>
      <circle cx="286" cy="34" r="13"/>
    </g>
    <g fill="${p.ink}" opacity=".75" font-family="Helvetica,Arial,sans-serif" font-size="11">
      <text x="58" y="40">vecinos_del_sur</text>
      <text x="278" y="38" text-anchor="end" fill="${p.bg}" font-weight="800">3</text>
    </g>`,
});

// ── 8 · The student model ────────────────────────────────────────────────────
poster({
  id: 'luz',
  titulo: '¡Apaga la luz!',
  estilo: 'Cartel de estudiante (hecho a mano)',
  lema: '¡APAGA LA LUZ!',
  lado: 'escuela',
  tecnicas: ['mandato', 'dato', 'llamada'],
  color: { bg:'#FFFBEA', ink:'#1C1C1C', mid:'#F2C230', soft:'#3F7D4F', pale:'#F7E9B0', paper:'#FFFBEA' },
  svg: p => `
    <rect width="300" height="400" fill="${p.bg}"/>
    <rect x="12" y="12" width="276" height="376" fill="none" stroke="${p.ink}" stroke-width="7"/>
    <circle cx="150" cy="168" r="78" fill="${p.mid}"/>
    <g stroke="${p.ink}" stroke-width="6" stroke-linecap="round">
      ${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return `<line x1="${150+92*Math.cos(a)}" y1="${168+92*Math.sin(a)}" x2="${150+112*Math.cos(a)}" y2="${168+112*Math.sin(a)}"/>`;}).join('')}
    </g>
    <g fill="none" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round">
      <path d="M150 112 a42 42 0 0 1 26 75 l0 14 l-52 0 l0-14 a42 42 0 0 1 26-75 z"/>
      <path d="M128 212 l44 0 M132 224 l36 0"/>
    </g>
    ${T('¡APAGA', { x:150, y:300, size:35, w:148, fill:p.ink, anchor:'middle' })}
    ${T('LA LUZ!', { x:150, y:332, size:35, w:152, fill:p.ink, anchor:'middle' })}
    ${T('LA ÚLTIMA PERSONA QUE SALGA DEL SALÓN', { x:150, y:356, size:11, w:248, fill:p.soft, anchor:'middle', weight:700 })}
    ${T('La escuela gasta $4,000 al año en luz de noche', { x:150, y:374, size:11, w:248, fill:p.ink, anchor:'middle', weight:400 })}`,
});

export const CARTELES = P;
export const byId = id => P.find(c => c.id === id);

// Techniques named once; the packet, the deck and the key all read this list.
export const TECNICAS = [
  ['el eslogan',        'mandato',        'Una orden corta que se queda pegada. Casi siempre es un mandato: ¡Únete! ¡No compres! ¡Apaga!'],
  ['la repetición',     'repeticion',     'La misma palabra o forma vuelve, hasta que suena a verdad: «Compra. Sonríe. Repite.»'],
  ['el nosotros',       'nosotros',       'Te mete en un grupo al que ya perteneces: «La fábrica somos todos», «el turno es nuestro».'],
  ['el ellos',          'ellos',          'Alguien tiene la culpa, y nunca eres tú ni quien hizo el cartel.'],
  ['el tú directo',     'tu-directo',     'Te mira, te señala, te habla de tú: «Te necesitamos a ti.»'],
  ['la imagen heroica', 'imagen-heroica', 'Una persona grande, fuerte, vista desde abajo. Nadie está cansado ni tiene miedo.'],
  ['el dato',           'dato',           'Un número exacto que suena a prueba. A veces lo es; a veces nadie lo revisa.'],
  ['todos lo hacen',    'todos-lo-hacen', 'Si todos ya firmaron, ya compraron, ya se unieron, ¿qué esperas tú?'],
  ['la llamada',        'llamada',        'Te dice exactamente qué hacer hoy: firma, preséntate, pregunta, apaga.'],
];

export const tecNombre = slug => (TECNICAS.find(t => t[1] === slug) || ['—'])[0];

// Wrap one poster's markup. `pal` is GRIS for paper, c.color for the projector.
export function svgCartel(c, pal, { w = '100%', clase = '' } = {}) {
  const vb = c.cuadrado ? '0 0 320 320' : '0 0 300 400';
  return `<svg class="cartel ${clase}" viewBox="${vb}" width="${w}" role="img"
     aria-label="${c.titulo}" xmlns="http://www.w3.org/2000/svg">${c.svg(pal)}</svg>`;
}
