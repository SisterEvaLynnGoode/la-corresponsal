// build-hojas.mjs — generates the printable worksheet packets.
//
// The packets are SELF-CONTAINED: the article and the interview are printed on
// the page, so a class can run the whole week on paper with no Chromebooks. The
// reading text and every comprehension answer are pulled from content/batch-*.json,
// which is the same source the game bakes into index.html — so the paper and the
// screen can never disagree, and the answer key can never drift.
//
// Run: node build-hojas.mjs
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'hojas');

const CONTENT = {};
for (const f of readdirSync(join(__dirname, 'content')).filter(f => /^batch-\d+\.json$/.test(f)).sort())
  Object.assign(CONTENT, JSON.parse(readFileSync(join(__dirname, 'content', f), 'utf8')));

const LETTER = ['A', 'B', 'C', 'D'];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = n => `<div class="lines">${'<div></div>'.repeat(n)}</div>`;

// ── Page scaffolding ──────────────────────────────────────────────────────────
function sheet(meta, body, footL, footR) {
  return `
<div class="sheet">
  <div class="hdr">
    <div class="brand">El Mundo Nuestro</div>
    <div class="meta">${meta}</div>
  </div>
  ${body}
  <div class="foot"><span>${footL}</span><span>${footR}</span></div>
</div>`;
}
const namebar = (full = false) => full
  ? `<div class="namebar"><span>Nombre: </span><span>Período: </span><span>Fecha: </span></div>`
  : `<div class="namebar"><span>Nombre: </span><span>Fecha: </span></div>`;

// ── Rendered pieces pulled from the game content ─────────────────────────────
function notaHTML(s) {
  const paras = s.article.paragraphs
    .map((p, i) => `<p><b class="pn">${i + 1}</b>${esc(p)}</p>`).join('\n      ');
  return `
  <div class="nota">
    <div class="kicker">Nota de portada</div>
    <h3>${esc(s.article.headline)}</h3>
    <div class="byline">${esc(s.article.byline)}</div>
    <div class="lectura">
      ${paras}
    </div>
  </div>`;
}

function vocabHTML(s) {
  const items = s.article.keywords
    .map(k => `<dt>${esc(k.word)}</dt><dd>${esc(k.definition)}</dd>`).join('\n      ');
  return `
  <div class="vocab">
    <div class="lbl">Palabras clave de esta nota</div>
    <dl>
      ${items}
    </dl>
  </div>`;
}

function entrevistaHTML(s) {
  return `
  <div class="entre">
    <div class="who">🎙 ${esc(s.audio.source)}</div>
    <div class="said">${esc(s.audio.script)}</div>
  </div>`;
}

// Multiple choice, rendered for pencil-and-paper
function mcHTML(questions, startNum = 1) {
  let n = startNum - 1;
  return `<ol class="q mc" start="${startNum}">` + questions.filter(q => q.type === 'mc').map(q => {
    n++;
    const opts = (q.opts || q.options)
      .map((o, i) => `<li>${LETTER[i]}. ${esc(o)}</li>`).join('');
    return `<li>${esc(q.text)}<ul class="opts">${opts}</ul></li>`;
  }).join('\n    ') + `</ol>`;
}

const writtenQ = s => s.article.questions.find(q => q.type === 'written');

// ── Session pages ────────────────────────────────────────────────────────────
// Three pages per session. Two was too tight once the actual reading passage and
// interview transcript went on the paper — every page overflowed by 200–350px.
// Splitting also means the reading page stays a reading page, uncluttered.
function sessionPages(week, sessionNo, key, extra, pageNos, totalPages) {
  const s = CONTENT[key];
  if (!s) throw new Error('missing content: ' + key);
  const place = s.article.byline.split('|')[1]?.trim() || '';
  const foot = `La Corresponsal · Semana ${week} · Sesión ${sessionNo}`;
  const p = i => `Página ${pageNos[i]} de ${totalPages}`;

  const pageA = sheet(
    `Semana ${week} · Sesión ${sessionNo}<br>${esc(place)}`,
    `${namebar()}
  <h1>${esc(s.topic)}</h1>
  <div class="sub">Paso 1 — Lee la nota</div>

  <div class="instr"><strong>Antes de leer:</strong> mira el titular y las palabras clave de
  abajo. ¿De qué crees que va a tratar? Escribe tu predicción en una oración.</div>
  ${lines(1)}
  ${notaHTML(s)}
  ${vocabHTML(s)}
  <div class="instr">Vuelve a leer la nota una segunda vez antes de contestar. La segunda
  lectura siempre te da algo que la primera se te pasó.</div>`,
    foot, p(0));

  const pageB = sheet(
    `Semana ${week} · Sesión ${sessionNo}<br>Preguntas`,
    `${namebar()}
  <h1>¿Qué dice la nota?</h1>
  <div class="sub">Paso 2 — Comprueba lo que entendiste</div>

  <div class="instr">Encierra la letra correcta. Puedes regresar a la nota cuantas veces quieras
  — eso no es hacer trampa, es lo que hace un periodista.</div>
  ${mcHTML(s.article.questions, 1)}

  <h2>Escribe tu respuesta</h2>
  <div class="instr">${esc(writtenQ(s).text)}</div>
  ${lines(4)}

  ${extra}`,
    foot, p(1));

  const pageC = sheet(
    `Semana ${week} · Sesión ${sessionNo}<br>La entrevista`,
    `${namebar()}
  <h1>La entrevista</h1>
  <div class="sub">Paso 3 — Escucha a la fuente</div>

  <div class="instr">Lo que te contó la fuente, con sus propias palabras. Léelo despacio.</div>
  ${entrevistaHTML(s)}

  <h2>Preguntas sobre la entrevista</h2>
  ${mcHTML(s.audio.questions, 5)}

  <h2>La cita que me quedo</h2>
  <table>
    <tbody>
      <tr><td style="width:30%"><strong>Una frase suya, copiada palabra por palabra</strong></td>
          <td class="blank" style="height:.3in"></td></tr>
      <tr><td><strong>La escogí porque…</strong></td>
          <td class="blank" style="height:.22in"></td></tr>
    </tbody>
  </table>`,
    foot, p(2));

  return pageA + pageB + pageC;
}

// ═════════════════════════════════════════════════════════════════════════════
//  DAYS 1–3 — orientation, norms, persona. Runs BEFORE any country content.
//
//  Two surfaces, one source: the norms and the newsroom phrases below are
//  rendered into both the projector deck (presentacion.html) and the printed
//  packet (hojas/dias-1-3.html). A student must never meet a rule on screen
//  worded differently from the rule on their paper.
//
//  Modelled on la-liga-sombra's lib/decks/intro.ts, but the norms are different
//  on purpose: that class is Spanish 1, where the risk is being afraid to speak.
//  This class is heritage speakers, where the risk is shame about the Spanish
//  they already have, and students policing each other's variety.
// ═════════════════════════════════════════════════════════════════════════════

const PROFILE = {
  name: 'Mr. Tommy (they/them)',
  bio: [
    'Me llamo Tommy Martin-Edwards y aquí todos me dicen Mr. Tommy. Lo primero que deben saber de mí es algo que los pone a ustedes por delante: yo no crecí hablando español. Lo aprendí en un salón, de un libro, ya de grande.',
    'Ustedes tienen algo que yo no voy a tener nunca. A ustedes el español les llegó de gente que los quiere: de una abuela, de una mamá, de un tío que cuenta chistes. Eso no se estudia. Eso se hereda.',
    'Entonces que quede claro desde hoy: yo no estoy aquí para arreglarles el español. Estoy aquí para darles las partes que la escuela les quedó debiendo — leer rápido, escribir sin miedo, y saber que lo que hablan en su casa es un idioma completo.',
  ],
  facts: [
    ['Cómo llamarme', 'Mr. Tommy (they/them)'],
    ['Enseñando desde', '2010–2011'],
    ['También he enseñado', 'Español, chino, tecnología — y fui subdirector'],
    ['Países que conozco', 'España, México, Canadá, Francia, Bélgica, China'],
    ['Pregúntame sobre', 'El Camino de Santiago, o la historia queer'],
  ],
  personal:
    'Una cosa más, dicha el primer día para que nadie tenga que adivinar: soy queer y tengo esposo. Si algún día quieren preguntarme de historia queer, es de mis temas favoritos.',
};

// The norms. Spanish label + the reasoning, because a rule without a reason is
// just an order, and these students have heard plenty of orders about Spanish.
const NORMAS = [
  ['Aquí no se corrige el español de nadie',
   'Nadie en este salón se burla de cómo habla otra persona. Ni del acento, ni de una palabra «mal dicha», ni del español de tu casa, ni de lo que dice tu familia en el pueblo de donde vienen. Tampoco se burla nadie de quién eres, a quién quieres, cómo te ves, ni de lo que todavía estás descubriendo. Y va en las dos direcciones: no se le dice a nadie que habla «demasiado español», ni que «ni siquiera sabe español». Ésta es la única regla que no tiene primera advertencia.'],
  ['Tu español ya es correcto',
   'No hay un español bueno y muchos malos. Hay un español de la escuela, uno de tu casa, uno de Michoacán, uno de San Salvador, uno de aquí de la esquina. Todos siguen reglas. Este año vamos a agregar uno más — el del periódico — sin quitarte ninguno de los que ya traes.'],
  ['Se escribe aunque salga mal',
   'Casi todos ustedes hablan mejor de lo que escriben. Eso no es un defecto: es lo normal cuando aprendiste un idioma oyéndolo. Aquí se escribe todos los días, con faltas, sin borrar tres veces. La ortografía se arregla después. La página en blanco no se arregla sola.'],
  ['Treinta segundos antes de preguntar',
   'Cuando no sepas una palabra, quédate treinta segundos con la duda antes de buscarla. Ahí es donde se te queda. Pasados los treinta segundos, pregunta fuerte y con confianza.'],
  ['Se puede mezclar mientras aprendes',
   'Si a media oración se te sale una palabra en inglés, dila y sigue. Mezclar no es un error, es lo que hacen los bilingües del mundo entero. Lo que sí te voy a pedir es que lo que entregues por escrito esté en español — porque ese es el músculo que venimos a entrenar.'],
  ['Se puede repetir',
   'Casi todo aquí se puede volver a hacer por la nota completa. Una calificación baja es información, no una sentencia. Lo único que no se arregla es el trabajo que nunca entregaste.'],
];

// Phrases for THIS class. Not survival Spanish — these students have that. The
// gap for a heritage speaker is the newsroom register and, above all, being
// able to say "I can say it but I can't spell it" without shame.
const FRASES = [
  ['¿Cómo se escribe…?', 'How do you spell / write…?', 'La pregunta más útil del año.'],
  ['Lo sé decir pero no lo sé escribir', 'I can say it but I can\'t write it', 'Dilo sin pena. Le pasa a todo el mundo aquí.'],
  ['¿Lleva acento?', 'Does it take an accent mark?', 'Pregunta legítima y frecuente.'],
  ['¿Me lo repite, por favor?', 'Could you repeat that?', 'Siempre pide la repetición.'],
  ['¿Qué significa…?', 'What does … mean?', 'Aunque la hayas oído toda la vida.'],
  ['En mi casa decimos…', 'At home we say…', 'Siempre es un dato bienvenido, no una corrección.'],
  ['No estoy segura / seguro', 'I\'m not sure', 'Mejor que inventar un dato.'],
  ['Según la fuente…', 'According to the source…', 'Frase de periodista. Úsala al citar.'],
  ['¿Me das un ejemplo?', 'Can you give me an example?', 'Sirve conmigo y sirve en una entrevista.'],
  ['Todavía no', 'Not yet', 'No es «no puedo». Es «no puedo todavía».'],
];

const PASOS = [
  ['1 · Llegada', 'Llegas al país y conoces dónde estás.'],
  ['2 · Asignación', 'La editora te dice qué historia buscar.'],
  ['3 · Lectura', 'Lees la nota y aprendes las palabras clave.'],
  ['4 · Escucha', 'Escuchas a una persona real de ese lugar.'],
  ['5 · Redacción', 'Escribes tu propio artículo.'],
  ['6 · Publicación', 'Se publica con tu nombre.'],
];

// ═════════════════════════════════════════════════════════════════════════════
//  WEEK 1 — front matter: first week of school, persona, community
// ═════════════════════════════════════════════════════════════════════════════
const D_P1 = sheet('Días 1–3 · Día 1<br>Bienvenida', `
  ${namebar(true)}
  <h1>Te contrataron.</h1>
  <div class="sub">El Mundo Nuestro · Departamento de Corresponsales</div>

  <div class="nota">
    <div class="kicker">Carta de la jefa de redacción</div>
    <div class="lectura" style="font-size:1rem">
      <p>Bienvenida al periódico. Te voy a explicar por qué te llamamos a ti.</p>
      <p>Somos un periódico pequeño con una idea grande: las historias del mundo hispanohablante
      casi siempre las cuenta gente de afuera. Llegan, toman fotos, se van, y escriben sobre
      nosotros como si fuéramos un museo. Nosotros queremos lo contrario.</p>
      <p>Queremos corresponsales que entiendan lo que oyen. Que sepan que una abuela puede
      enseñar sin hablar el mismo idioma. Que sepan que una comida no es «exótica», es la cena
      del martes. Tú ya sabes eso. Por eso te contratamos.</p>
      <p>Este año vas a viajar a veinte países. En cada uno vas a leer, escuchar a una persona
      real y escribir tu propia nota. Nadie más va a escribir tu artículo. Es tuyo.</p>
      <p>Una última cosa. Aquí no se castiga equivocarse: se castiga no intentar. Escribe aunque
      dudes. Pregunta aunque te dé pena. Ese es el trabajo.</p>
    </div>
  </div>

  <h2>Lo que vas a hacer cada sesión</h2>
  <table>
    <thead><tr><th style="width:22%">Paso</th><th style="width:78%">Qué haces</th></tr></thead>
    <tbody>
      <tr><td><strong>1 · Llegada</strong></td><td>Llegas al país y conoces dónde estás.</td></tr>
      <tr><td><strong>2 · Asignación</strong></td><td>La editora te dice qué historia buscar.</td></tr>
      <tr><td><strong>3 · Lectura</strong></td><td>Lees la nota y aprendes las palabras clave.</td></tr>
      <tr><td><strong>4 · Escucha</strong></td><td>Escuchas a una persona de ese lugar.</td></tr>
      <tr><td><strong>5 · Redacción</strong></td><td>Escribes tu propio artículo.</td></tr>
      <tr><td><strong>6 · Publicación</strong></td><td>Se publica con tu nombre.</td></tr>
    </tbody>
  </table>

  <h2>Firma tu contrato</h2>
  <div class="box">
    <p style="font-size:.95rem">Como corresponsal de <em>El Mundo Nuestro</em> me comprometo a
    escuchar con atención, a escribir lo que de verdad dijeron, a escribir en oraciones completas
    aunque me equivoque, y a preguntar cuando no entienda una palabra.</p>
    <div style="display:flex;gap:1.5rem;margin-top:.6rem">
      <span style="flex:2;border-bottom:1px solid #111">&nbsp;</span>
      <span style="flex:1;border-bottom:1px solid #111">&nbsp;</span>
    </div>
    <div class="sans" style="display:flex;gap:1.5rem;font-size:.6rem;color:#5a5a5a">
      <span style="flex:2">Firma</span><span style="flex:1">Fecha</span>
    </div>
  </div>`,
  'La Corresponsal · Días 1–3', 'Página 1 de 6');

const D_P2 = sheet('Días 1–3 · Día 1<br>Tu primera entrevista', `
  ${namebar()}
  <h1>Tu primera entrevista</h1>
  <div class="sub">Practica con alguien de esta sala</div>

  <div class="instr">Antes de entrevistar a alguien en Oaxaca, practica aquí. Busca a una persona
  con quien <strong>no</strong> hables todos los días. Hazle estas preguntas y
  <strong>escribe sus respuestas</strong>. Un periodista no confía en su memoria.</div>

  <div class="box" style="padding:.35rem .5rem;margin-bottom:.45rem">
    <span class="sans" style="font-size:.72rem"><strong>Entrevisté a:</strong></span>
    <span style="display:inline-block;width:62%;border-bottom:1px solid #111">&nbsp;</span>
  </div>

  <table>
    <thead><tr><th style="width:44%">Pregunta</th><th style="width:56%">Lo que me contestó</th></tr></thead>
    <tbody>
      <tr><td>¿Cómo te llamas y cómo prefieres que te llamen?</td><td class="blank"></td></tr>
      <tr><td>¿De dónde es tu familia?</td><td class="blank"></td></tr>
      <tr><td>¿Quién te enseñó español?</td><td class="blank"></td></tr>
      <tr><td>¿Hay alguna comida que sólo sabes nombrar en español?</td><td class="blank"></td></tr>
      <tr><td>¿Qué canción te recuerda a tu familia?</td><td class="blank"></td></tr>
      <tr><td>Si pudieras contarle una historia al mundo entero, ¿cuál sería?</td><td class="blank"></td></tr>
    </tbody>
  </table>

  <h2>La pregunta de seguimiento</h2>
  <div class="instr">Esto es lo que separa a un periodista de un formulario. Escoge la respuesta
  más interesante que te dio y pregúntale <strong>una cosa más</strong> sobre eso.</div>
  <table>
    <tbody>
      <tr><td style="width:38%"><strong>Mi pregunta de seguimiento</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Lo que me contestó</strong></td><td class="blank" style="height:.5in"></td></tr>
    </tbody>
  </table>

  <h2>Escribe su perfil</h2>
  <div class="instr">Tres oraciones sobre esta persona, como si fuera para el periódico. Empieza
  con lo más interesante, no con «se llama…».</div>
  ${lines(5)}`,
  'La Corresponsal · Días 1–3', 'Página 2 de 6');

const D_P3 = sheet('Días 1–3 · Día 3<br>El mapa de mi español', `
  ${namebar()}
  <h1>El mapa de mi español</h1>
  <div class="sub">De dónde viene tu voz</div>

  <div class="instr">Tu español tiene una historia y un origen. Nadie más en esta sala tiene
  exactamente el tuyo. Vamos a dibujarlo.</div>

  <h2>1 · ¿Quién te habla en español?</h2>
  <table>
    <thead><tr><th style="width:34%">Persona</th><th style="width:33%">¿De dónde es?</th>
      <th style="width:33%">¿Qué le dices en español?</th></tr></thead>
    <tbody>
      <tr><td class="blank"></td><td></td><td></td></tr>
      <tr><td class="blank"></td><td></td><td></td></tr>
      <tr><td class="blank"></td><td></td><td></td></tr>
    </tbody>
  </table>

  <h2>2 · Palabras que viven en un solo idioma</h2>
  <div class="two">
    <div>
      <div class="instr" style="margin-bottom:.15rem">Sólo sé decirlas en <strong>español</strong>:</div>
      ${lines(4)}
    </div>
    <div>
      <div class="instr" style="margin-bottom:.15rem">Sólo sé decirlas en <strong>inglés</strong>:</div>
      ${lines(4)}
    </div>
  </div>

  <h2>3 · Así lo decimos en mi casa</h2>
  <div class="instr">El español cambia de casa en casa y de país en país. Ninguna forma es la
  «correcta»: son todas reales. Escribe tres palabras que en tu casa se dicen distinto de como
  las dice un libro o un maestro.</div>
  <table>
    <thead><tr><th style="width:50%">En mi casa decimos…</th>
      <th style="width:50%">También he oído…</th></tr></thead>
    <tbody>
      <tr><td class="blank"></td><td></td></tr>
      <tr><td class="blank"></td><td></td></tr>
      <tr><td class="blank"></td><td></td></tr>
    </tbody>
  </table>

  <h2>4 · Termina la oración</h2>
  <div class="instr">Con toda honestidad. No hay respuesta incorrecta.</div>
  <p style="font-size:.98rem">Mi español es _______________________________________________</p>
  <p style="font-size:.98rem">Cuando hablo español me siento _____________________________</p>
  <p style="font-size:.98rem">Lo que me cuesta del español escrito es ____________________</p>
  <p style="font-size:.98rem">Este año quiero poder ______________________________________</p>`,
  'La Corresponsal · Días 1–3', 'Página 3 de 6');

const D_P5 = sheet('Días 1–3 · Día 3<br>Credencial de prensa', `
  ${namebar()}
  <h1>Crea tu corresponsal</h1>
  <div class="sub">Quién eres cuando firmas un artículo</div>

  <div class="instr">Todo periodista tiene una firma y una razón para escribir. Diseña la tuya.
  Puedes usar tu nombre real o un nombre de pluma.</div>

  <div class="box" style="padding:0;border-width:2px">
    <div style="background:#f2f2f2;border-bottom:2px solid #111;padding:.25rem .6rem;
         display:flex;justify-content:space-between;align-items:center">
      <span class="sans" style="font-weight:700;letter-spacing:1px;font-size:.78rem">
        EL MUNDO NUESTRO · PRENSA</span>
      <span class="sans" style="font-size:.6rem;color:#5a5a5a">CREDENCIAL Nº ________</span>
    </div>
    <div style="display:flex;gap:.7rem;padding:.6rem">
      <div style="width:1.5in;height:1.75in;border:1px solid #111;display:flex;
           align-items:flex-end;justify-content:center;padding-bottom:.15rem">
        <span class="sans" style="font-size:.55rem;color:#5a5a5a">dibuja tu foto</span>
      </div>
      <div style="flex:1;font-size:.9rem;line-height:2.05">
        <div>Nombre de corresponsal: <span style="display:inline-block;width:56%;
          border-bottom:1px solid #111">&nbsp;</span></div>
        <div>De dónde soy: <span style="display:inline-block;width:66%;
          border-bottom:1px solid #111">&nbsp;</span></div>
        <div>Idiomas que hablo: <span style="display:inline-block;width:60%;
          border-bottom:1px solid #111">&nbsp;</span></div>
        <div class="sans" style="font-size:.7rem;margin-top:.2rem">MI ESPECIALIDAD (marca una):</div>
        <div class="sans" style="font-size:.78rem;line-height:1.6">
          ☐ Cultura y arte &nbsp; ☐ Medio ambiente &nbsp; ☐ Comunidad<br>
          ☐ Música y deporte &nbsp; ☐ Comida &nbsp; ☐ Juventud
        </div>
      </div>
    </div>
    <div style="border-top:1px solid #111;padding:.35rem .6rem">
      <span class="sans" style="font-size:.62rem;color:#5a5a5a">MI LEMA (una frase que me describe)</span>
      <div style="border-bottom:1px solid #111;height:.3in"></div>
    </div>
  </div>
  <div class="instr" style="text-align:center;margin-top:-.2rem">✂ Puedes recortarla y pegarla en tu cuaderno.</div>

  <h2>Mi historia de origen</h2>
  <div class="instr">Todo corresponsal empezó en algún lado. Contesta como tu personaje —
  puede parecerse mucho a ti, o nada.</div>
  <ol class="q">
    <li>¿Por qué quiero contar historias? ¿Qué me pasó que me hizo querer esto?
      ${lines(3)}</li>
    <li>¿Cuál es la historia que <strong>nadie</strong> ha contado bien todavía, y que yo sí quiero contar?
      ${lines(3)}</li>
    <li>¿A quién quiero que lea lo que escribo?
      ${lines(2)}</li>
  </ol>`,
  'La Corresponsal · Días 1–3', 'Página 5 de 6');

// Page 4 — the norms, co-constructed. Same six norms as the projector deck.
const D_P4 = sheet('Días 1–3 · Día 2<br>Las normas', `
  ${namebar()}
  <h1>Las normas de la redacción</h1>
  <div class="sub">Cómo funciona este salón, y por qué</div>

  <div class="instr">Léelas con tu grupo. No son órdenes: cada una tiene una razón, y la razón
  importa más que la regla.</div>

  <table>
    <thead><tr><th style="width:30%">La norma</th><th style="width:70%">Por qué</th></tr></thead>
    <tbody>
      ${NORMAS.map(([l, t]) => `<tr><td><strong>${esc(l)}</strong></td><td>${esc(t)}</td></tr>`).join('\n      ')}
    </tbody>
  </table>

  <h2>La norma que falta</h2>
  <div class="instr">En parejas. ¿Qué norma le falta a este salón? Escríbanla con su razón, igual
  que las de arriba. Las que la clase apruebe se quedan en la pared todo el año, firmadas.</div>
  <table>
    <tbody>
      <tr><td style="width:30%"><strong>Nuestra norma</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Por qué la necesitamos</strong></td><td class="blank" style="height:.55in"></td></tr>
      <tr><td><strong>Propuesta por</strong></td><td class="blank" style="height:.26in"></td></tr>
    </tbody>
  </table>

  <div class="tip"><strong>De las seis, una no tiene segunda oportunidad:</strong> aquí no se
  corrige ni se burla nadie del español de otra persona. Las demás se hablan. Ésa no.</div>`,
  'La Corresponsal · Días 1–3', 'Página 4 de 6');

// Page 6 — the same ten phrases the projector shows, so paper and screen agree.
const D_P6 = sheet('Días 1–3 · Día 2<br>Frases de la redacción', `
  ${namebar()}
  <h1>Diez frases para este salón</h1>
  <div class="sub">No son frases de sobrevivencia — ésas ya las tienes</div>

  <div class="instr">Ustedes ya saben saludar y pedir permiso. Éstas son otras: las que hacen
  falta cuando uno <em>sabe decir</em> algo pero no sabe escribirlo. Aquí se usan sin pena.</div>

  <table>
    <thead><tr><th style="width:34%">En español</th><th style="width:26%">En inglés</th>
      <th style="width:40%">Cuándo la vas a usar</th></tr></thead>
    <tbody>
      ${FRASES.map(([es, en, nt]) =>
        `<tr><td><strong>${esc(es)}</strong></td><td>${esc(en)}</td><td>${esc(nt)}</td></tr>`).join('\n      ')}
    </tbody>
  </table>

  <h2>Practica ahora</h2>
  <div class="instr">Voltéate con la persona de al lado. Dile tu nombre y después la frase de esta
  lista que crees que vas a necesitar más este año. Los dos lo van a decir medio raro. Ése es el
  punto del día de hoy.</div>
  <div class="box" style="padding:.55rem .7rem">
    <p style="font-size:1rem">Hola, me llamo ________________________.
    Creo que voy a necesitar «________________________________».</p>
  </div>

  <h2>Mi frase</h2>
  <div class="instr">¿Cuál escogiste y por qué?</div>
  ${lines(2)}`,
  'La Corresponsal · Días 1–3', 'Página 6 de 6');

// México portada — week 1 now starts at the content, like weeks 2–4.
const W1_PORTADA = sheet('Semana 1 · México<br>Portada', `
  ${namebar(true)}
  <h1>Primera semana: México</h1>
  <div class="sub">Mercados, mariposas y muros que hablan</div>

  <div class="nota">
    <div class="kicker">Nota de la jefa de redacción</div>
    <div class="lectura" style="font-size:1rem">
      <p>Ya firmaste el contrato y ya tienes credencial. Se acabó el entrenamiento: esta semana
      sales a trabajar.</p>
      <p>Empiezas por México, y no por las razones de siempre. No vas a las pirámides ni a la
      playa. Vas a un mercado donde una señora lleva sesenta años tejiendo, a un bosque donde
      cada noviembre llegan millones de mariposas después de volar cuatro mil kilómetros, y a un
      barrio donde unos muchachos de tu edad están pintando a sus vecinos en paredes de tres
      metros.</p>
      <p>Las tres historias tienen algo en común: alguien decidió que lo suyo valía la pena
      contarlo. Búscalo mientras trabajas.</p>
    </div>
  </div>

  <h2>La pregunta de la semana</h2>
  <div class="box">
    <p style="font-size:1.02rem;font-style:italic">¿Quién decide qué historias merecen contarse?</p>
  </div>
  <div class="instr"><strong>Lunes:</strong> escribe tu primera respuesta, aunque no estés segura.</div>
  ${lines(3)}
  <div class="instr" style="margin-top:.4rem"><strong>Viernes:</strong> vuelve a leerla. ¿Cambió
  después de las tres historias?</div>
  ${lines(3)}

  <h2>México en tres datos</h2>
  <table>
    <thead><tr><th style="width:26%">Sesión</th><th style="width:74%">Un dato que me sorprendió</th></tr></thead>
    <tbody>
      <tr><td>El mercado</td><td class="blank"></td></tr>
      <tr><td>Las mariposas</td><td class="blank"></td></tr>
      <tr><td>Los murales</td><td class="blank"></td></tr>
    </tbody>
  </table>`,
  'La Corresponsal · Semana 1', 'Página 1 de 10');

// ═════════════════════════════════════════════════════════════════════════════
//  Per-session extras
// ═════════════════════════════════════════════════════════════════════════════
const EX = {
  'México_0': `
  <h2>Trabajo de vocabulario</h2>
  <div class="instr">Escribe una oración tuya usando <strong>dos</strong> palabras clave de esta nota.</div>
  ${lines(2)}
  <div class="tip"><strong>Ojo con los acentos:</strong> <em>tejió</em> (ella, ayer) lleva acento;
  <em>tejo</em> (yo, hoy) no. El acento cambia quién hace la acción y cuándo.</div>`,

  'México_1': `
  <h2>Los números de la historia</h2>
  <table>
    <thead><tr><th style="width:62%">Dato</th><th style="width:38%">Número</th></tr></thead>
    <tbody>
      <tr><td>Kilómetros que vuelan las mariposas</td><td class="blank"></td></tr>
      <tr><td>Edad de Rubén cuando aprendió a usar el hacha</td><td class="blank"></td></tr>
      <tr><td>Niños que hoy vienen a la escuelita de tambor… (¡ojo! ese dato no está aquí)</td><td class="blank"></td></tr>
    </tbody>
  </table>
  <div class="tip">Una de esas filas es una trampa: el dato no aparece en esta nota. Un buen
  periodista dice «no lo sé» en vez de inventarlo. Escribe «no aparece» donde corresponda.</div>`,

  'México_2': `
  <h2>Diseña tu mural</h2>
  <div class="instr">Yolanda pinta a la gente de su barrio que nadie ve. Dibuja a quién pintarías tú.</div>
  <div class="box" style="height:1.05in"></div>
  <div class="instr" style="margin-top:.2rem">¿A quién pintaste y por qué merece estar en una pared de tres metros?</div>
  ${lines(2)}`,

  'Guatemala_0': `
  <h2>Mi conexión</h2>
  <div class="instr">¿Qué objeto o ropa de tu familia cuenta una historia sobre quiénes son ustedes?
  Descríbelo: cómo es, de quién era, qué guarda.</div>
  ${lines(4)}`,

  'Guatemala_1': `
  <h2>Causa y efecto</h2>
  <table>
    <thead><tr><th style="width:50%">Causa</th><th style="width:50%">Efecto</th></tr></thead>
    <tbody>
      <tr><td>Llegan jabones y aguas sucias al lago</td><td class="blank"></td></tr>
      <tr><td class="blank"></td><td>Los pueblos construyen plantas de tratamiento</td></tr>
    </tbody>
  </table>
  <div class="tip"><strong>Ojo con los acentos:</strong> <em>está</em> (el lago está sucio) lleva
  acento. <em>esta</em> (esta semana) no.</div>`,

  'Guatemala_2': `
  <h2>Tu programa de radio</h2>
  <div class="instr">Vas a conducir quince minutos de radio para tu comunidad. Planéalo.</div>
  <table>
    <tbody>
      <tr><td style="width:38%"><strong>Nombre del programa</strong></td><td class="blank"></td></tr>
      <tr><td><strong>¿En qué idioma o idiomas?</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Un aviso importante para mi gente</strong></td><td class="blank"></td></tr>
    </tbody>
  </table>`,

  'Honduras_0': `
  <h2>Los sonidos de mi casa</h2>
  <div class="instr">Para los garífunas, el tambor guarda el idioma. Piensa en los sonidos que
  para ti significan «casa»: una canción, una voz, la tele prendida, una olla, una risa.</div>
  <table>
    <thead><tr><th style="width:44%">El sonido</th><th style="width:56%">Qué me hace sentir o recordar</th></tr></thead>
    <tbody>
      <tr><td class="blank"></td><td></td></tr>
      <tr><td class="blank"></td><td></td></tr>
    </tbody>
  </table>`,

  'Honduras_1': `
  <h2>La decisión difícil</h2>
  <div class="instr">Los pescadores votaron cerrar zonas a la pesca por varios años. Los primeros
  años se pasó hambre. Ponte en los dos lados antes de opinar — eso hace un periodista.</div>
  <table>
    <thead><tr><th style="width:50%">A favor de cerrar la zona</th>
      <th style="width:50%">En contra de cerrar la zona</th></tr></thead>
    <tbody>
      <tr><td class="blank" style="height:.5in"></td><td></td></tr>
    </tbody>
  </table>`,

  'Honduras_2': `
  <h2>Diseña tu glifo</h2>
  <div class="instr">Los mayas escribían con símbolos, no con letras. Inventa un glifo que te
  represente a ti o a tu familia, y explica qué significa cada parte.</div>
  <div style="display:flex;gap:.7rem;align-items:stretch">
    <div class="box" style="width:1.5in;height:1.15in;margin:.3rem 0 .5rem"></div>
    <div style="flex:1">${lines(4)}</div>
  </div>`,

  'El Salvador_0': `
  <h2>Los pasos, en orden</h2>
  <div class="instr">Rosa Elena explica cómo se hace una pupusa. Escribe los pasos de una comida
  que tú sepas hacer, usando estas palabras de orden.</div>
  <div class="wordbank">primero &nbsp;·&nbsp; después &nbsp;·&nbsp; luego &nbsp;·&nbsp;
    mientras &nbsp;·&nbsp; al final</div>
  ${lines(4)}`,

  'El Salvador_1': `
  <h2>A pleno sol o bajo sombra</h2>
  <div class="instr">El ingeniero y Silvia no estaban de acuerdo. Anota lo que gana y lo que
  pierde cada forma de sembrar, según la nota.</div>
  <table>
    <thead><tr><th style="width:26%"></th><th style="width:37%">A pleno sol</th>
      <th style="width:37%">Bajo sombra</th></tr></thead>
    <tbody>
      <tr><td><strong>Produce…</strong></td><td class="blank"></td><td></td></tr>
      <tr><td><strong>La tierra…</strong></td><td class="blank"></td><td></td></tr>
    </tbody>
  </table>`,

  'Nicaragua_0': `
  <h2>Escribe tres versos</h2>
  <div class="instr">En el taller de Douglas nadie se burla de nadie: ésa es la primera regla, igual
  que aquí. Escribe tres versos sobre algo pequeño y tuyo — unas manos, una cocina, un camino,
  una espera. No tiene que rimar.</div>
  ${lines(4)}`,

  'Nicaragua_1': `
  <h2>Una isla no tiene a dónde tirar</h2>
  <div class="instr">Xiomara dice que en una isla lo que uno tira se queda. Piensa en tu casa una
  semana: ¿qué es lo que más se tira? ¿A dónde crees que va?</div>
  <table>
    <tbody>
      <tr><td style="width:38%"><strong>Lo que más tiramos</strong></td><td class="blank"></td></tr>
      <tr><td><strong>A dónde creo que va</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Una cosa que podríamos dejar de tirar</strong></td><td class="blank"></td></tr>
    </tbody>
  </table>`,

  'Nicaragua_2': `
  <h2>Lo que nadie mira</h2>
  <div class="instr">La mamá de Julio lo puso a hacer flecos dos años: «si no aprendés a hacer bien
  lo que nadie mira, no vas a poder hacer bien lo que todos miran». Piensa en algo que tú haces
  bien y que nadie nota.</div>
  ${lines(3)}`,

  'Costa Rica_0': `
  <h2>Una solución barata</h2>
  <div class="instr">El problema era enorme y la solución fue una cuerda entre dos árboles. Piensa
  en un problema de tu escuela o tu cuadra. ¿Cuál sería la solución más simple y más barata?</div>
  <table>
    <tbody>
      <tr><td style="width:34%"><strong>El problema</strong></td><td class="blank"></td></tr>
      <tr><td><strong>La solución barata</strong></td><td class="blank" style="height:.45in"></td></tr>
    </tbody>
  </table>`,

  'Costa Rica_1': `
  <h2>De dónde sale la luz</h2>
  <div class="instr">Álvaro explica que Costa Rica quitó su ejército en 1948 y puso ese dinero en
  escuelas, salud y energía. Ordena de dónde viene la electricidad tica, según la nota.</div>
  <table>
    <thead><tr><th style="width:34%">Fuente</th><th style="width:66%">De dónde saca la energía</th></tr></thead>
    <tbody>
      <tr><td><strong>Hidroeléctrica</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Geotérmica</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Eólica</strong></td><td class="blank"></td></tr>
    </tbody>
  </table>`,

  'Costa Rica_2': `
  <h2>Un acuerdo difícil</h2>
  <div class="instr">En Ostional la comunidad puede recoger los huevos de los primeros días — los que
  se van a romper de todos modos — y a cambio cuida la playa. Mucha gente de fuera los critica.
  Escribe un argumento de cada lado antes de decidir qué opinas.</div>
  <table>
    <thead><tr><th style="width:50%">Por qué el acuerdo funciona</th>
      <th style="width:50%">Por qué alguien lo critica</th></tr></thead>
    <tbody>
      <tr><td class="blank" style="height:.5in"></td><td></td></tr>
    </tbody>
  </table>`,

  'El Salvador_2': `
  <h2>Primero la escuela</h2>
  <div class="instr">La regla del club es clara: si no pasas tus materias, no entras al agua.
  Ponte una meta tuya para este mes y algo concreto que vas a hacer para lograrla.</div>
  <table>
    <tbody>
      <tr><td style="width:30%"><strong>Mi meta de este mes</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Lo que voy a hacer cada semana</strong></td><td class="blank"></td></tr>
    </tbody>
  </table>`
};

// ═════════════════════════════════════════════════════════════════════════════
//  Week 2 front + closing
// ═════════════════════════════════════════════════════════════════════════════
const W2_P1 = sheet('Semana 2 · Guatemala<br>Portada', `
  ${namebar(true)}
  <h1>Segunda semana: Guatemala</h1>
  <div class="sub">Tierra de volcanes, tejidos y voces</div>

  <div class="nota">
    <div class="kicker">Nota de la jefa de redacción</div>
    <div class="lectura" style="font-size:1rem">
      <p>Buen trabajo en México. Ahora bajas a Guatemala, y te aviso de algo antes de que salgas.</p>
      <p>Las tres historias de esta semana se parecen entre sí, aunque hablen de cosas distintas:
      un tejido, un lago y una radio. En las tres hay algo que casi se pierde y gente que decidió
      no dejarlo morir. Búscalo mientras trabajas.</p>
      <p>También te vas a topar con idiomas que quizá no conocías: k'iche', kaqchikel, tz'utujil.
      No son dialectos ni «lenguas raras». Son idiomas completos, con gramática y literatura, que
      se hablaban aquí siglos antes del español.</p>
    </div>
  </div>

  <h2>La pregunta de la semana</h2>
  <div class="box">
    <p style="font-size:1.02rem;font-style:italic">¿Qué se pierde cuando se pierde un idioma,
    un tejido o un lago?</p>
  </div>
  <div class="instr"><strong>Lunes:</strong> escribe tu primera respuesta, aunque no estés segura.</div>
  ${lines(3)}
  <div class="instr" style="margin-top:.5rem"><strong>Viernes:</strong> vuelve a leerla. ¿Cambió
  tu respuesta después de las tres historias? ¿Qué le agregarías?</div>
  ${lines(3)}

  <h2>Guatemala en tres datos</h2>
  <table>
    <thead><tr><th style="width:26%">Sesión</th><th style="width:74%">Un dato que me sorprendió</th></tr></thead>
    <tbody>
      <tr><td>Los tejidos</td><td class="blank"></td></tr>
      <tr><td>El lago</td><td class="blank"></td></tr>
      <tr><td>La radio</td><td class="blank"></td></tr>
    </tbody>
  </table>`,
  'La Corresponsal · Semana 2', 'Página 1 de 11');

const W2_P8 = sheet('Semana 2 · Cierre<br>Proyecto', `
  ${namebar()}
  <h1>Tu primera portada</h1>
  <div class="sub">Cierre de las dos semanas</div>

  <div class="instr">Ya visitaste México y Guatemala y escribiste seis notas. Ahora te toca
  decidir, como editora, cuál va en la portada del periódico.</div>

  <h2>1 · La decisión editorial</h2>
  <table>
    <tbody>
      <tr><td style="width:34%"><strong>La historia que elijo</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Por qué merece la portada</strong></td><td class="blank" style="height:.55in"></td></tr>
    </tbody>
  </table>

  <h2>2 · Escribe el titular</h2>
  <div class="instr">Un buen titular cabe en una línea, no miente y da ganas de leer.
  Escribe tres versiones y encierra la mejor.</div>
  ${lines(3)}

  <h2>3 · Tu nota de portada</h2>
  <div class="instr">Escribe de nuevo esa historia con tus palabras, en 6–8 oraciones. Incluye:
  una cita de la persona entrevistada, un dato con número, y por qué le debería importar a
  alguien de tu ciudad.</div>
  ${lines(11)}

  <h2>4 · Autoevaluación</h2>
  <table>
    <thead><tr><th style="width:58%">Ahora puedo…</th><th style="width:14%">Sí</th>
      <th style="width:14%">Casi</th><th style="width:14%">Aún no</th></tr></thead>
    <tbody>
      <tr><td>Leer una nota en español y entender lo principal</td><td></td><td></td><td></td></tr>
      <tr><td>Sacar un dato exacto de un texto</td><td></td><td></td><td></td></tr>
      <tr><td>Escribir seis oraciones completas en español</td><td></td><td></td><td></td></tr>
      <tr><td>Entrevistar a alguien y anotar lo que dijo</td><td></td><td></td><td></td></tr>
      <tr><td>Explicar por qué una historia importa</td><td></td><td></td><td></td></tr>
    </tbody>
  </table>`,
  'La Corresponsal · Semana 2', 'Página 11 de 11');

// ═════════════════════════════════════════════════════════════════════════════
//  WEEK 3 — Honduras. Skill of the week: quoting a source accurately.
// ═════════════════════════════════════════════════════════════════════════════
const W3_P1 = sheet('Semana 3 · Honduras<br>Portada', `
  ${namebar(true)}
  <h1>Tercera semana: Honduras</h1>
  <div class="sub">El tambor, el arrecife y las piedras que hablan</div>

  <div class="nota">
    <div class="kicker">Nota de la jefa de redacción</div>
    <div class="lectura" style="font-size:1rem">
      <p>Llevas dos países y seis notas. Ya no eres pasante.</p>
      <p>Esta semana vas a la costa caribeña de Honduras, después a una isla, y al final a una
      ciudad maya de hace mil doscientos años. Tres historias sobre lo mismo desde ángulos
      distintos: quién tiene derecho a contar una historia, y qué pasa cuando por fin la cuenta
      la gente de ahí.</p>
      <p>Te pido una cosa más esta semana. Vas a empezar a <strong>citar</strong>. Un periodista
      que cambia lo que la gente dijo, aunque sea «para que suene mejor», deja de ser periodista.</p>
    </div>
  </div>

  <h2>Destreza de la semana: la cita</h2>
  <div class="instr">Hay dos maneras de contar lo que alguien dijo. Las dos son correctas y se
  usan todo el tiempo en un periódico.</div>
  <table>
    <thead><tr><th style="width:22%">Tipo</th><th style="width:78%">Ejemplo</th></tr></thead>
    <tbody>
      <tr><td><strong>Cita directa</strong><br><span class="sans" style="font-size:.66rem;color:#5a5a5a">
        sus palabras exactas, entre comillas</span></td>
        <td>Teodoro dijo: <strong>«El tambor enseña el idioma.»</strong></td></tr>
      <tr><td><strong>Cita indirecta</strong><br><span class="sans" style="font-size:.66rem;color:#5a5a5a">
        lo mismo, contado por ti, sin comillas</span></td>
        <td>Teodoro dijo <strong>que</strong> el tambor enseña el idioma.</td></tr>
    </tbody>
  </table>
  <div class="tip">Fíjate en lo que cambia: se van las comillas, aparece la palabra
  <strong>que</strong>, y a veces cambia la persona del verbo. <em>«Yo aprendí»</em> se vuelve
  <em>dijo que él aprendió</em>.</div>

  <h2>Practica con voces que ya conoces</h2>
  <div class="instr">Pásalas de directa a indirecta. Empieza cada una con «Dijo que…».</div>
  <ol class="q" style="font-size:.93rem">
    <li>Doña Esperanza: «Los colores no los compramos en ninguna tienda.»
      ${lines(1)}</li>
    <li>Elena Chávez: «Mi cuerpo es parte del telar.»
      ${lines(1)}</li>
    <li>Ana Petzey: «El guaraní no es para conseguir trabajo.»
      ${lines(1)}</li>
  </ol>`,
  'La Corresponsal · Semana 3', 'Página 1 de 11');

const W3_P11 = sheet('Semana 3 · Cierre<br>Proyecto', `
  ${namebar()}
  <h1>Una entrevista de verdad</h1>
  <div class="sub">Tarea de la semana — fuera del salón</div>

  <div class="instr">Karla aprendió a leer las piedras de su propio pueblo. Esta semana te toca a
  ti: entrevista a alguien de tu familia o de tu barrio y trae su historia al periódico.
  Puede ser en español, en inglés o mezclando — pero la escribes en español.</div>

  <table>
    <tbody>
      <tr><td style="width:32%"><strong>¿A quién entrevisté?</strong></td><td class="blank"></td></tr>
      <tr><td><strong>¿Qué relación tiene conmigo?</strong></td><td class="blank"></td></tr>
      <tr><td><strong>¿Dónde y cuándo hablamos?</strong></td><td class="blank"></td></tr>
    </tbody>
  </table>

  <h2>Mis preguntas y sus respuestas</h2>
  <div class="instr">Escribe al menos tres preguntas. Una tiene que ser de seguimiento, inventada
  en el momento.</div>
  <table>
    <thead><tr><th style="width:40%">Pregunta</th><th style="width:60%">Lo que contestó</th></tr></thead>
    <tbody>
      <tr><td class="blank"></td><td></td></tr>
      <tr><td class="blank"></td><td></td></tr>
      <tr><td class="blank"></td><td></td></tr>
    </tbody>
  </table>

  <h2>Una cita directa</h2>
  <div class="instr">Copia una frase suya <strong>exacta</strong>, entre comillas. Sin arreglarla.</div>
  <div class="box" style="min-height:.5in"></div>

  <h2>La misma idea, en cita indirecta</h2>
  ${lines(2)}`,
  'La Corresponsal · Semana 3', 'Página 11 de 11');

// ═════════════════════════════════════════════════════════════════════════════
//  WEEK 4 — El Salvador. Skill of the week: evidence over adjectives.
// ═════════════════════════════════════════════════════════════════════════════
const W4_P1 = sheet('Semana 4 · El Salvador<br>Portada', `
  ${namebar(true)}
  <h1>Cuarta semana: El Salvador</h1>
  <div class="sub">Las manos que hacen el trabajo</div>

  <div class="nota">
    <div class="kicker">Nota de la jefa de redacción</div>
    <div class="lectura" style="font-size:1rem">
      <p>Última semana de esta primera etapa. Vas a El Salvador y las tres historias son sobre
      trabajo: unas manos que hacen cuatrocientas pupusas al día, una mujer que decidió no cortar
      sus árboles, y unas muchachas a las que les dijeron que el mar no era para ellas.</p>
      <p>Y esta semana te pido precisión. «Muchas pupusas» no es información. «Cuatrocientas
      pupusas al día» sí lo es. Un dato exacto convence más que diez adjetivos.</p>
    </div>
  </div>

  <h2>Destreza de la semana: el dato</h2>
  <div class="instr">Compara. Las dos oraciones dicen algo parecido, pero sólo una te hace creerlo.</div>
  <table>
    <thead><tr><th style="width:50%">Vago</th><th style="width:50%">Con dato</th></tr></thead>
    <tbody>
      <tr><td>Llegan muchísimas mariposas.</td>
          <td>Llegan millones de mariposas después de volar más de cuatro mil kilómetros.</td></tr>
      <tr><td>El huipil toma mucho tiempo.</td>
          <td>Un huipil completo puede tomar tres meses.</td></tr>
    </tbody>
  </table>

  <h2>Arregla estas oraciones</h2>
  <div class="instr">Todas son verdad, pero ninguna convence. Reescríbelas con el dato exacto que
  ya leíste en las semanas pasadas. Si no te acuerdas, búscalo en tus hojas.</div>
  <ol class="q" style="font-size:.93rem">
    <li>El mercado de Oaxaca es muy viejo.
      ${lines(1)}</li>
    <li>En Guatemala se hablan varios idiomas mayas.
      ${lines(1)}</li>
    <li>Muchos pueblos rodean el lago Atitlán.
      ${lines(1)}</li>
  </ol>

  <div class="tip">Ojo: inventar un dato es peor que no ponerlo. Si no lo sabes, escribe
  «no aparece» y sigue. Eso también es honestidad periodística.</div>`,
  'La Corresponsal · Semana 4', 'Página 1 de 11');

const W4_P11 = sheet('Semana 4 · Cierre<br>Proyecto final', `
  ${namebar()}
  <h1>Tu portada del mes</h1>
  <div class="sub">Cierre de las cuatro semanas</div>

  <div class="instr">Cuatro países, doce notas, doce personas entrevistadas. Ahora eres tú quien
  decide qué va en la portada del mes.</div>

  <h2>1 · La decisión</h2>
  <table>
    <tbody>
      <tr><td style="width:32%"><strong>La historia que elijo</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Por qué merece la portada</strong></td><td class="blank" style="height:.45in"></td></tr>
    </tbody>
  </table>

  <h2>2 · El titular</h2>
  <div class="instr">Tres versiones. Encierra la mejor.</div>
  ${lines(3)}

  <h2>3 · Tu nota</h2>
  <div class="instr">De 6 a 8 oraciones. Tiene que llevar, sin falta: <strong>una cita directa</strong>
  entre comillas (semana 3) y <strong>un dato exacto</strong> con número (semana 4).</div>
  ${lines(9)}

  <h2>4 · Lo que ya puedo hacer</h2>
  <table>
    <thead><tr><th style="width:58%">Ahora puedo…</th><th style="width:14%">Sí</th>
      <th style="width:14%">Casi</th><th style="width:14%">Aún no</th></tr></thead>
    <tbody>
      <tr><td>Leer una nota en español y entender lo principal</td><td></td><td></td><td></td></tr>
      <tr><td>Sacar un dato exacto de un texto</td><td></td><td></td><td></td></tr>
      <tr><td>Citar a alguien sin cambiar lo que dijo</td><td></td><td></td><td></td></tr>
      <tr><td>Entrevistar y hacer una pregunta de seguimiento</td><td></td><td></td><td></td></tr>
      <tr><td>Explicar por qué una historia importa</td><td></td><td></td><td></td></tr>
    </tbody>
  </table>`,
  'La Corresponsal · Semana 4', 'Página 11 de 11');

// ═════════════════════════════════════════════════════════════════════════════
//  WEEK 5 — Nicaragua. Skill: la entrada (the lead).
// ═════════════════════════════════════════════════════════════════════════════
const W5_P1 = sheet('Semana 5 · Nicaragua<br>Portada', `
  ${namebar(true)}
  <h1>Quinta semana: Nicaragua</h1>
  <div class="sub">Poetas, volcanes y nudos</div>

  <div class="nota">
    <div class="kicker">Nota de la jefa de redacción</div>
    <div class="lectura" style="font-size:1rem">
      <p>Un mes de trabajo. Ya sabes citar y ya sabes usar un dato. Ahora vamos por la parte que
      decide si alguien te lee o no: la primera oración.</p>
      <p>Vas a Nicaragua, que es un país raro y maravilloso para un periodista. Es de los pocos
      lugares del mundo donde el héroe nacional es un poeta, donde una isla se formó de dos
      volcanes juntos, y donde una hamaca lleva ochocientos nudos hechos a mano.</p>
    </div>
  </div>

  <h2>Destreza de la semana: la entrada</h2>
  <div class="instr">La entrada, o el <em>lead</em>, es la primera oración de una nota. Tiene un
  solo trabajo: hacer que la persona siga leyendo. Compara estas dos maneras de empezar la misma
  historia.</div>
  <table>
    <thead><tr><th style="width:50%">Entrada floja</th><th style="width:50%">Entrada que jala</th></tr></thead>
    <tbody>
      <tr><td>Este artículo trata sobre la poesía en Nicaragua.</td>
          <td>En muchos países los héroes nacionales son militares. En Nicaragua es un poeta.</td></tr>
      <tr><td>Voy a hablar de unas mariposas que viajan.</td>
          <td>Ninguna de estas mariposas vivirá para terminar el viaje. Aun así, todas llegan.</td></tr>
    </tbody>
  </table>
  <div class="tip">Las entradas flojas anuncian. Las buenas <strong>empiezan</strong>. Nunca
  escribas «este artículo trata de…» ni «voy a hablar de…»: eso es calentamiento, no es la nota.</div>

  <h2>Arregla estas entradas</h2>
  <div class="instr">Reescríbelas para que jalen. Usa un dato, un contraste o una imagen.</div>
  <ol class="q" style="font-size:.93rem">
    <li>Este artículo trata sobre unos pescadores de Honduras.
      ${lines(1)}</li>
    <li>Voy a hablar de la comida de El Salvador.
      ${lines(1)}</li>
  </ol>`,
  'La Corresponsal · Semana 5', 'Página 1 de 11');

const W5_P11 = sheet('Semana 5 · Cierre<br>Proyecto', `
  ${namebar()}
  <h1>Tres entradas</h1>
  <div class="sub">Cierre de la semana</div>

  <div class="instr">Vuelve a las tres historias de Nicaragua. Escribe una entrada nueva para cada
  una — la primera oración, nada más. Después escoge la mejor y desarróllala.</div>

  <table>
    <thead><tr><th style="width:26%">Historia</th><th style="width:74%">Mi entrada</th></tr></thead>
    <tbody>
      <tr><td>Los poetas de León</td><td class="blank" style="height:.42in"></td></tr>
      <tr><td>La isla de Ometepe</td><td class="blank" style="height:.42in"></td></tr>
      <tr><td>Las hamacas de Masaya</td><td class="blank" style="height:.42in"></td></tr>
    </tbody>
  </table>

  <h2>Desarrolla la mejor</h2>
  <div class="instr">Encierra tu entrada favorita de arriba y sigue escribiendo: cinco o seis
  oraciones más. Incluye una cita directa y un dato exacto, como ya sabes hacer.</div>
  ${lines(9)}

  <h2>¿Por qué escogiste ésa?</h2>
  ${lines(2)}`,
  'La Corresponsal · Semana 5', 'Página 11 de 11');

// ═════════════════════════════════════════════════════════════════════════════
//  WEEK 6 — Costa Rica. Skill: describing with the senses.
// ═════════════════════════════════════════════════════════════════════════════
const W6_P1 = sheet('Semana 6 · Costa Rica<br>Portada', `
  ${namebar(true)}
  <h1>Sexta semana: Costa Rica</h1>
  <div class="sub">Puentes de cuerda, vapor y tortugas</div>

  <div class="nota">
    <div class="kicker">Nota de la jefa de redacción</div>
    <div class="lectura" style="font-size:1rem">
      <p>Esta semana las tres historias son de gente que arregló algo. Un puente de cuerda que
      salvó a cientos de monos. Un país que decidió hace décadas de dónde iba a sacar su luz. Un
      pueblo que se puso a cuidar una playa de noche.</p>
      <p>Y te voy a pedir algo nuevo: que me hagas <em>ver</em> los lugares. Hasta ahora has
      contado bien lo que pasa. Esta semana quiero también el ruido, el olor y la temperatura.</p>
    </div>
  </div>

  <h2>Destreza de la semana: escribir con los sentidos</h2>
  <div class="instr">Un buen reportaje no explica un lugar: lo pone enfrente. Fíjate en lo que
  cambia cuando se usan los sentidos.</div>
  <table>
    <thead><tr><th style="width:44%">Sólo información</th><th style="width:56%">Con los sentidos</th></tr></thead>
    <tbody>
      <tr><td>Llegan muchas mariposas al bosque.</td>
          <td>Cuando el sol calienta, se oye un sonido suave, como lluvia ligera. Son millones de
              alas abriéndose al mismo tiempo.</td></tr>
      <tr><td>La vigilante trabaja de noche.</td>
          <td>Usa una linterna de luz roja. La blanca desorienta a las tortugas y las manda de
              regreso al mar sin poner.</td></tr>
    </tbody>
  </table>
  <div class="tip">No se trata de poner más adjetivos. «Un lugar muy bonito» no es una imagen.
  Un detalle concreto sí lo es: la luz roja, la lluvia ligera, el barro hasta las rodillas.</div>

  <h2>Practica: los cinco sentidos</h2>
  <div class="instr">Escoge un lugar que conozcas bien — tu cocina, la parada del bus, la cancha.
  Anota un detalle concreto para cada sentido. Nada de «bonito» ni «feo».</div>
  <table>
    <thead><tr><th style="width:22%">Sentido</th><th style="width:78%">Un detalle concreto</th></tr></thead>
    <tbody>
      <tr><td><strong>Se ve</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Se oye</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Se huele</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Se siente</strong></td><td class="blank"></td></tr>
    </tbody>
  </table>`,
  'La Corresponsal · Semana 6', 'Página 1 de 11');

const W6_P11 = sheet('Semana 6 · Cierre<br>Proyecto', `
  ${namebar()}
  <h1>Llévame ahí</h1>
  <div class="sub">Cierre de la semana — y de mes y medio</div>

  <div class="instr">Escoge uno de los tres lugares de esta semana: el bosque de Manuel Antonio,
  la planta geotérmica de Guanacaste o la playa de Ostional de noche. Escribe como si tu lector
  nunca hubiera salido de aquí.</div>

  <h2>1 · Antes de escribir</h2>
  <table>
    <thead><tr><th style="width:22%">Sentido</th><th style="width:78%">Lo que hay en ese lugar, según la nota y la entrevista</th></tr></thead>
    <tbody>
      <tr><td><strong>Se ve</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Se oye</strong></td><td class="blank"></td></tr>
      <tr><td><strong>Se siente</strong></td><td class="blank"></td></tr>
    </tbody>
  </table>

  <h2>2 · Tu nota</h2>
  <div class="instr">De 7 a 9 oraciones. Debe llevar: una <strong>entrada que jale</strong>
  (semana 5), una <strong>cita directa</strong> (semana 3), un <strong>dato exacto</strong>
  (semana 4) y por lo menos <strong>dos detalles de los sentidos</strong> (esta semana).</div>
  ${lines(11)}

  <h2>3 · Revisa lo tuyo</h2>
  <table>
    <thead><tr><th style="width:70%">¿Lo incluí?</th><th style="width:15%">Sí</th><th style="width:15%">No</th></tr></thead>
    <tbody>
      <tr><td>Mi primera oración jala, no anuncia</td><td></td><td></td></tr>
      <tr><td>Hay una cita entre comillas, copiada exacta</td><td></td><td></td></tr>
      <tr><td>Hay por lo menos un número</td><td></td><td></td></tr>
      <tr><td>Hay dos detalles que se ven, se oyen o se sienten</td><td></td><td></td></tr>
    </tbody>
  </table>`,
  'La Corresponsal · Semana 6', 'Página 11 de 11');

// ═════════════════════════════════════════════════════════════════════════════
//  PROJECTOR DECK — presentacion.html
//  Built from the same NORMAS / FRASES / PASOS arrays as the paper packet.
// ═════════════════════════════════════════════════════════════════════════════
function buildDeck() {
  const S = [];
  const cover = (day, title, hook) => S.push({cls:'cover', day, html:
    `<div class="eyebrow">El Mundo Nuestro · Día ${day}</div>
     <h1>${title}</h1><p class="hook">${hook}</p>`});
  const beat = (day, eyebrow, head, paras, pull) => S.push({cls:'beat', day, html:
    `<div class="eyebrow">${eyebrow}</div><h2>${head}</h2>
     ${paras.map(p => `<p>${p}</p>`).join('')}
     ${pull ? `<div class="pull">${pull}</div>` : ''}`});
  const list = (day, eyebrow, head, items, note) => S.push({cls:'list', day, html:
    `<div class="eyebrow">${eyebrow}</div><h2>${head}</h2>
     <dl>${items.map(([l, t]) => `<dt>${l}</dt><dd>${t}</dd>`).join('')}</dl>
     ${note ? `<div class="pull">${note}</div>` : ''}`});
  const act = (day, head, what, page) => S.push({cls:'act', day, html:
    `<div class="eyebrow">Actividad</div><h2>${head}</h2><p>${what}</p>
     <div class="page">📄 ${page}</div>`});

  // ── DÍA 1 ────────────────────────────────────────────────────────────────
  cover(1, 'Te contrataron.',
    'Veinte países. Sesenta historias. Un año para contarlas — y las vas a contar tú.');

  beat(1, 'Quién soy', PROFILE.name, PROFILE.bio,
    'Yo no vengo a arreglarles el español. Vengo a darles lo que la escuela les quedó debiendo.');

  list(1, 'Quién soy', 'Para que me conozcan', PROFILE.facts, PROFILE.personal);

  beat(1, 'Por qué existe esta clase', 'Ustedes ya tienen el idioma. Falta lo demás.', [
    'Esta clase no es español para principiantes y no es español de castigo. Ustedes llegan hablando. Eso es la parte difícil y ya la tienen.',
    'Lo que falta es lo que la escuela normalmente no les da: leer un texto largo sin cansarse, escribir sin miedo a la falta de ortografía, y tener palabras para hablar de cosas serias — no sólo de la casa y la familia, sino del trabajo, del medio ambiente, de la política, del arte.',
    'A eso le vamos a llamar «rango». Al final del año van a poder moverse entre el español de su casa y el español del periódico, sin perder ninguno de los dos.',
  ], 'Nadie sale de aquí hablando menos como su familia. Salen hablando también de otras maneras.');

  beat(1, 'El periódico', 'El Mundo Nuestro', [
    'Todo el año van a trabajar para un periódico. Cada semana viajan a un país distinto, leen una nota, escuchan a una persona real de ahí y escriben su propio artículo.',
    'Las historias no son de turista. No hay ruinas bonitas ni playas. Hay una tejedora que perdió el idioma de su abuela, unos pescadores que cerraron su propia pesca, unas señoras que suben montañas de seis mil metros en pollera.',
    'Son historias donde la gente del lugar es la protagonista y no el decorado. Ustedes las van a contar.',
  ]);

  act(1, 'Tu primera entrevista',
    'Busca a alguien con quien no hablas todos los días. Hazle las seis preguntas de la hoja y ANOTA lo que conteste. Después inventa una pregunta tuya de seguimiento — ésa es la que importa.',
    'Días 1–3, página 2');

  // ── DÍA 2 ────────────────────────────────────────────────────────────────
  cover(2, 'Las normas de la redacción',
    'Toda redacción tiene reglas. Éstas son las nuestras, y por qué existen.');

  list(2, 'Las normas', 'Cómo funciona este salón', NORMAS.slice(0, 3));
  list(2, 'Las normas', 'Cómo funciona este salón (2)', NORMAS.slice(3));

  beat(2, 'La nota', 'Setenta por ciento qué tan bien. Treinta por ciento cuánto.', [
    'Su calificación se arma de dos cosas. Setenta por ciento es calidad: qué tan bien leen, escriben y entienden. Treinta por ciento es cuánto terminaron.',
    'Esa división es a propósito. El trabajo cuidadoso vale más que el trabajo rápido, pero no se puede saltar la mitad de las sesiones y salvarse por hablar bien español.',
  ], 'Casi nada hunde una calificación aquí, menos el trabajo que nunca se entregó.');

  list(2, 'La nota', 'Qué cuenta y qué no', [
    ['Cuenta a tu favor', 'Terminar las sesiones. Escribir aunque salga con faltas. Preguntar. Rehacer algo que te salió mal. Venir.'],
    ['No cuenta en tu contra', 'Un acento que se te olvidó. Una palabra escrita como suena. No saber una palabra. Hablar como habla tu familia.'],
    ['Sí cuenta en tu contra', 'No entregar nada. Pasar un párrafo por un traductor o una inteligencia artificial y entregarme su español en vez del tuyo. Se nota, y peor: ese día no aprendiste nada.'],
    ['Sobre los traductores', 'Buscar una palabra es investigación y está bien. Pegar un párrafo no. Si no sabes de qué lado de la raya estás, pregúntame antes y no después.'],
  ]);

  act(2, 'La norma que falta',
    'En parejas: lean las seis normas. ¿Cuál les falta? Escriban una norma nueva para este salón, con su razón. Las mejores se quedan en la pared todo el año, firmadas por quien las propuso.',
    'Días 1–3, página 4');

  S.push({cls:'vocab', day:2, html:
    `<div class="eyebrow">Frases de la redacción</div>
     <h2>Diez frases para este salón</h2>
     <p class="sm">Ustedes ya saben pedir permiso y saludar. Éstas son otras — las que se necesitan
     cuando uno sabe decir algo pero no sabe escribirlo.</p>
     <table>${FRASES.map(([es, en, note]) =>
       `<tr><td class="es">${es}</td><td class="en">${en}</td><td class="nt">${note}</td></tr>`).join('')}
     </table>`});

  // ── DÍA 3 ────────────────────────────────────────────────────────────────
  cover(3, 'Tu corresponsal',
    'Antes de salir a México, decide quién eres cuando firmas un artículo.');

  beat(3, 'El mapa de mi español', 'De dónde viene tu voz', [
    'Antes de escribir de otros, hay que saber de dónde viene uno. Hoy van a dibujar su propio mapa: quién les habla en español, qué palabras sólo saben en un idioma, y cómo se dicen las cosas en su casa.',
    'Esta hoja no lleva calificación. La voy a leer, y me va a decir más de ustedes que cualquier examen.',
  ], 'Ninguna forma de decir algo es la incorrecta. Todas son datos.');

  act(3, 'El mapa de mi español',
    'Llena las cuatro partes de la hoja. En la tercera, «Así lo decimos en mi casa», piensa en palabras que sabes que se dicen distinto en otros lados. Ésas son oro.',
    'Días 1–3, página 3');

  list(3, 'Cómo funciona', 'Los seis pasos de cada sesión', PASOS);

  act(3, 'Tu credencial de prensa',
    'Diseña tu credencial: nombre de corresponsal (puede ser un nombre de pluma), de dónde eres, tu especialidad y tu lema. Después contesta las tres preguntas de tu historia de origen. Recórtala y pégala en tu cuaderno.',
    'Días 1–3, página 5');

  S.push({cls:'closer', day:3, html:
    `<h2>Mañana sales a México.</h2>
     <p class="hook">Trae tu credencial, tu cuaderno y la pregunta de seguimiento que inventaste.
     Tu primera historia es un mercado de quinientos años en Oaxaca, y la señora que teje ahí
     lleva sesenta años esperando que alguien cuente bien su historia.</p>`});

  const slides = S.map((s, i) => `
  <section class="slide ${s.cls}" data-day="${s.day}" id="s${i}">
    <div class="inner">${s.html}</div>
    <div class="foot"><span>El Mundo Nuestro · Día ${s.day}</span><span>${i + 1} / ${S.length}</span></div>
  </section>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Días 1–3 — Presentación | La Corresponsal</title>
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
</style>
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

// ═════════════════════════════════════════════════════════════════════════════
//  Assemble
// ═════════════════════════════════════════════════════════════════════════════
function docHTML(title, pages, printLabel) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="_hoja.css">
</head>
<body>
<div class="noprint">
  <button onclick="window.print()">🖨️ ${printLabel}</button>
  <a href="../maestra.html">← Volver al panel</a>
  <div style="margin-top:.5rem;font-size:.8rem;color:#444">Al imprimir, pon <strong>Márgenes: Ninguno</strong> y desactiva «Encabezados y pies de página».</div>
</div>
${pages}
</body>
</html>
`;
}

// Week 1: 4 front pages + 3 sessions x 2 pages = 10
// Days 1–3: orientation, norms and persona, before any country content.
const dias = D_P1 + D_P2 + D_P3 + D_P4 + D_P5 + D_P6;
writeFileSync(join(OUT, 'dias-1-3.html'),
  docHTML('Días 1–3 — Normas y credencial | La Corresponsal', dias, 'Imprimir las 6 páginas'), 'utf8');

writeFileSync(join(__dirname, 'presentacion.html'), buildDeck(), 'utf8');

// Week 1: portada + 3 sessions x 3 pages = 10
const w1 = W1_PORTADA
  + sessionPages(1, 1, 'México_0', EX['México_0'], [2, 3, 4],   10)
  + sessionPages(1, 2, 'México_1', EX['México_1'], [5, 6, 7],   10)
  + sessionPages(1, 3, 'México_2', EX['México_2'], [8, 9, 10],  10);
writeFileSync(join(OUT, 'semana-1.html'),
  docHTML('Semana 1 — México | La Corresponsal', w1, 'Imprimir las 10 páginas'), 'utf8');

// Week 2: 1 front page + 3 sessions x 2 pages + 1 closing = 8
const w2 = W2_P1
  + sessionPages(2, 1, 'Guatemala_0', EX['Guatemala_0'], [2, 3, 4],   11)
  + sessionPages(2, 2, 'Guatemala_1', EX['Guatemala_1'], [5, 6, 7],   11)
  + sessionPages(2, 3, 'Guatemala_2', EX['Guatemala_2'], [8, 9, 10],  11)
  + W2_P8;
writeFileSync(join(OUT, 'semana-2.html'),
  docHTML('Semana 2 — Guatemala | La Corresponsal', w2, 'Imprimir las 11 páginas'), 'utf8');

// Week 3: portada + 3 sessions x 3 pages + proyecto = 11
const w3 = W3_P1
  + sessionPages(3, 1, 'Honduras_0', EX['Honduras_0'], [2, 3, 4],  11)
  + sessionPages(3, 2, 'Honduras_1', EX['Honduras_1'], [5, 6, 7],  11)
  + sessionPages(3, 3, 'Honduras_2', EX['Honduras_2'], [8, 9, 10], 11)
  + W3_P11;
writeFileSync(join(OUT, 'semana-3.html'),
  docHTML('Semana 3 — Honduras | La Corresponsal', w3, 'Imprimir las 11 páginas'), 'utf8');

// Week 4: portada + 3 sessions x 3 pages + proyecto final = 11
const w4 = W4_P1
  + sessionPages(4, 1, 'El Salvador_0', EX['El Salvador_0'], [2, 3, 4],  11)
  + sessionPages(4, 2, 'El Salvador_1', EX['El Salvador_1'], [5, 6, 7],  11)
  + sessionPages(4, 3, 'El Salvador_2', EX['El Salvador_2'], [8, 9, 10], 11)
  + W4_P11;
writeFileSync(join(OUT, 'semana-4.html'),
  docHTML('Semana 4 — El Salvador | La Corresponsal', w4, 'Imprimir las 11 páginas'), 'utf8');

// Week 5: Nicaragua
const w5 = W5_P1
  + sessionPages(5, 1, 'Nicaragua_0', EX['Nicaragua_0'], [2, 3, 4],  11)
  + sessionPages(5, 2, 'Nicaragua_1', EX['Nicaragua_1'], [5, 6, 7],  11)
  + sessionPages(5, 3, 'Nicaragua_2', EX['Nicaragua_2'], [8, 9, 10], 11)
  + W5_P11;
writeFileSync(join(OUT, 'semana-5.html'),
  docHTML('Semana 5 — Nicaragua | La Corresponsal', w5, 'Imprimir las 11 páginas'), 'utf8');

// Week 6: Costa Rica
const w6 = W6_P1
  + sessionPages(6, 1, 'Costa Rica_0', EX['Costa Rica_0'], [2, 3, 4],  11)
  + sessionPages(6, 2, 'Costa Rica_1', EX['Costa Rica_1'], [5, 6, 7],  11)
  + sessionPages(6, 3, 'Costa Rica_2', EX['Costa Rica_2'], [8, 9, 10], 11)
  + W6_P11;
writeFileSync(join(OUT, 'semana-6.html'),
  docHTML('Semana 6 — Costa Rica | La Corresponsal', w6, 'Imprimir las 11 páginas'), 'utf8');

// ── Answer key, generated from the same data so it cannot drift ──────────────
function keyFor(week, sessionNo, key) {
  const s = CONTENT[key];
  const art = s.article.questions.filter(q => q.type === 'mc');
  const aud = s.audio.questions.filter(q => q.type === 'mc');
  const row = (q, n) => `<li>${esc(q.text)} → <span class="ans">${LETTER[q.correct]}. ${esc((q.opts || q.options)[q.correct])}</span></li>`;
  return `
  <h3>Semana ${week} · Sesión ${sessionNo} — ${esc(s.topic)}</h3>
  <p><strong>Preguntas 1–4 (la nota)</strong></p>
  <ol style="font-size:.8rem">${art.map(row).join('')}</ol>
  <p><strong>Preguntas 5–8 (la entrevista)</strong></p>
  <ol start="5" style="font-size:.8rem">${aud.map(row).join('')}</ol>`;
}

const keyPages =
  sheet('Clave de respuestas<br>Sólo para la maestra', `
  <h1>Clave — Semana 1: México</h1>
  <div class="sub">Rojo = respuesta correcta · La pregunta escrita de cada sesión es abierta y se evalúa con la rúbrica</div>
  ${keyFor(1, 1, 'México_0')}
  ${keyFor(1, 2, 'México_1')}
  ${keyFor(1, 3, 'México_2')}`,
  'Clave · Semana 1', 'Página 1 de 7')
  + sheet('Clave de respuestas<br>Sólo para la maestra', `
  <h1>Clave — Semana 2: Guatemala</h1>
  <div class="sub">La pregunta escrita de cada sesión es abierta — rúbrica en la última página</div>
  ${keyFor(2, 1, 'Guatemala_0')}
  ${keyFor(2, 2, 'Guatemala_1')}
  ${keyFor(2, 3, 'Guatemala_2')}`,
  'Clave · Semana 2', 'Página 2 de 7')
  + sheet('Clave de respuestas<br>Sólo para la maestra', `
  <h1>Clave — Semana 3: Honduras</h1>
  <div class="sub">La pregunta escrita de cada sesión es abierta — rúbrica en la última página</div>
  ${keyFor(3, 1, 'Honduras_0')}
  ${keyFor(3, 2, 'Honduras_1')}
  ${keyFor(3, 3, 'Honduras_2')}`,
  'Clave · Semana 3', 'Página 3 de 7')
  + sheet('Clave de respuestas<br>Sólo para la maestra', `
  <h1>Clave — Semana 4: El Salvador</h1>
  <div class="sub">La pregunta escrita de cada sesión es abierta — rúbrica en la última página</div>
  ${keyFor(4, 1, 'El Salvador_0')}
  ${keyFor(4, 2, 'El Salvador_1')}
  ${keyFor(4, 3, 'El Salvador_2')}`,
  'Clave · Semana 4', 'Página 4 de 7')
  + sheet('Clave de respuestas<br>Sólo para la maestra', `
  <h1>Clave — Semana 5: Nicaragua</h1>
  <div class="sub">La pregunta escrita de cada sesión es abierta — rúbrica en la última página</div>
  ${keyFor(5, 1, 'Nicaragua_0')}
  ${keyFor(5, 2, 'Nicaragua_1')}
  ${keyFor(5, 3, 'Nicaragua_2')}`,
  'Clave · Semana 5', 'Página 5 de 7')
  + sheet('Clave de respuestas<br>Sólo para la maestra', `
  <h1>Clave — Semana 6: Costa Rica</h1>
  <div class="sub">La pregunta escrita de cada sesión es abierta — rúbrica en la última página</div>
  ${keyFor(6, 1, 'Costa Rica_0')}
  ${keyFor(6, 2, 'Costa Rica_1')}
  ${keyFor(6, 3, 'Costa Rica_2')}`,
  'Clave · Semana 6', 'Página 6 de 7')
  + sheet('Rúbrica<br>Sólo para la maestra', `
  <h1>Rúbrica para la redacción</h1>
  <div class="sub">Sirve para las dos semanas y para el resto del año</div>
  <table class="rubric">
    <thead><tr><th style="width:22%">Criterio</th><th style="width:26%">Lo logró (3)</th>
      <th style="width:26%">Casi (2)</th><th style="width:26%">Todavía no (1)</th></tr></thead>
    <tbody>
      <tr><td><strong>Contenido</strong></td><td>Usa datos concretos de la historia</td>
        <td>Menciona la historia en general</td><td>No se relaciona con la historia</td></tr>
      <tr><td><strong>Extensión</strong></td><td>Escribe lo pedido con ideas completas</td>
        <td>Se queda corta</td><td>Una o dos palabras</td></tr>
      <tr><td><strong>Voz</strong></td><td>Se oye a la persona: cita o parafrasea la entrevista</td>
        <td>Menciona a la fuente</td><td>Ignora la entrevista</td></tr>
      <tr><td><strong>Conexión</strong></td><td>Liga la historia con su vida o su comunidad</td>
        <td>Lo intenta</td><td>Sólo resume</td></tr>
    </tbody>
  </table>
  <p class="open" style="font-size:.88rem">La ortografía y los acentos <em>no</em> están en la
  rúbrica a propósito. En estas dos semanas se califica la idea, no la forma. Marca los acentos
  como retroalimentación sin bajar la nota: para muchos estudiantes de herencia, la primera
  experiencia de que «mi español está mal escrito» es la que los calla por años.</p>

  <div class="tip">Semana 1, Sesión 2, «Los números de la historia»: la tercera fila es una
  trampa deliberada — ese dato no aparece en esa nota. La respuesta correcta es «no aparece».
  El punto es que decir «no lo sé» es una respuesta periodística válida.</div>

  <h2>Notas del paquete de Días 1–3</h2>
  <ul style="font-size:.88rem">
    <li><strong>Tu primera entrevista (Días 1–3, p. 2):</strong> lo que se evalúa es que haya
      <em>anotado</em> las respuestas y que la pregunta de seguimiento sea de verdad nueva,
      no una de la lista.</li>
    <li><strong>El mapa de mi español (Días 1–3, p. 3):</strong> no se califica. Es diagnóstica y personal.
      Léela: te dice quién habla qué en casa y qué variedad trae cada estudiante.</li>
    <li><strong>Credencial (Días 1–3, p. 5):</strong> acepta nombres de pluma. Un estudiante que no quiere
      usar su nombre real muchas veces está probando si aquí puede tener una voz distinta.</li>
  </ul>

  <h2>Destrezas de las semanas 3 y 4</h2>
  <p><strong>Semana 3 — la cita.</strong> Las tres conversiones de la portada:</p>
  <ol style="font-size:.84rem">
    <li><span class="ans">Dijo que los colores no los compran en ninguna tienda.</span></li>
    <li><span class="ans">Dijo que su cuerpo es parte del telar.</span></li>
    <li><span class="ans">Dijo que el guaraní no es para conseguir trabajo.</span></li>
  </ol>
  <p class="open" style="font-size:.84rem">Acepta variantes razonables. Lo que se evalúa es que
  desaparezcan las comillas, aparezca «que» y cambie la persona («mi cuerpo» → «su cuerpo»).</p>

  <p><strong>Semana 4 — el dato.</strong> Las tres oraciones vagas:</p>
  <ol style="font-size:.84rem">
    <li><span class="ans">El mercado Benito Juárez lleva más de quinientos años en el mismo sitio.</span></li>
    <li><span class="ans">En Guatemala se hablan veintidós idiomas mayas.</span></li>
    <li><span class="ans">Doce pueblos rodean el lago Atitlán.</span></li>
  </ol>
  <p class="open" style="font-size:.84rem">Los datos están en las hojas de las semanas 1 y 2.
  Que las busquen es parte del ejercicio.</p>

  <p class="open" style="font-size:.84rem"><strong>Proyecto de la semana 3</strong> (entrevista
  fuera del salón): lo que se califica es que la cita directa esté entre comillas y sin
  «arreglar», y que la versión indirecta cambie de verdad la persona del verbo. El contenido de
  la entrevista es de ellos; no lo califiques.</p>`,
  'Rúbrica y notas', 'Página 7 de 7');

writeFileSync(join(OUT, 'claves.html'),
  docHTML('Clave de respuestas | La Corresponsal', keyPages, 'Imprimir la clave'), 'utf8');

console.log('dias-1-3.html      6 páginas  (normas + credencial)');
console.log('presentacion.html  deck proyectable');
console.log('semana-1.html     10 páginas');
console.log('semana-2.html  11 páginas');
console.log('semana-3.html  11 páginas');
console.log('semana-4.html  11 páginas');
console.log('semana-5.html  11 páginas');console.log('semana-6.html  11 páginas');console.log('claves.html     7 páginas');
