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
//  WEEK 1 — front matter: first week of school, persona, community
// ═════════════════════════════════════════════════════════════════════════════
const W1_P1 = sheet('Semana 1 · Día 1<br>Bienvenida', `
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
  'La Corresponsal · Semana 1', 'Página 1 de 13');

const W1_P2 = sheet('Semana 1 · Día 1<br>Tu primera entrevista', `
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
  'La Corresponsal · Semana 1', 'Página 2 de 13');

const W1_P3 = sheet('Semana 1 · Día 1<br>El mapa de mi español', `
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
  'La Corresponsal · Semana 1', 'Página 3 de 13');

const W1_P4 = sheet('Semana 1 · Día 2<br>Credencial de prensa', `
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
  'La Corresponsal · Semana 1', 'Página 4 de 13');

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
const w1 = W1_P1 + W1_P2 + W1_P3 + W1_P4
  + sessionPages(1, 1, 'México_0', EX['México_0'], [5, 6, 7],    13)
  + sessionPages(1, 2, 'México_1', EX['México_1'], [8, 9, 10],   13)
  + sessionPages(1, 3, 'México_2', EX['México_2'], [11, 12, 13], 13);
writeFileSync(join(OUT, 'semana-1.html'),
  docHTML('Semana 1 — México | La Corresponsal', w1, 'Imprimir las 13 páginas'), 'utf8');

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
  <ol start="5" style="font-size:.8rem">${aud.map(row).join('')}</ol>
  <p style="font-size:.8rem"><strong>Tu respuesta:</strong>
     <span class="open">abierta — se evalúa con la rúbrica.</span></p>`;
}

const keyPages =
  sheet('Clave de respuestas<br>Sólo para la maestra', `
  <h1>Clave — Semana 1: México</h1>
  <div class="sub">Rojo = respuesta correcta · Verde = abierta</div>
  ${keyFor(1, 1, 'México_0')}
  ${keyFor(1, 2, 'México_1')}
  ${keyFor(1, 3, 'México_2')}`,
  'Clave · Semana 1', 'Página 1 de 5')
  + sheet('Clave de respuestas<br>Sólo para la maestra', `
  <h1>Clave — Semana 2: Guatemala</h1>
  ${keyFor(2, 1, 'Guatemala_0')}
  ${keyFor(2, 2, 'Guatemala_1')}
  ${keyFor(2, 3, 'Guatemala_2')}`,
  'Clave · Semana 2', 'Página 2 de 5')
  + sheet('Clave de respuestas<br>Sólo para la maestra', `
  <h1>Clave — Semana 3: Honduras</h1>
  ${keyFor(3, 1, 'Honduras_0')}
  ${keyFor(3, 2, 'Honduras_1')}
  ${keyFor(3, 3, 'Honduras_2')}`,
  'Clave · Semana 3', 'Página 3 de 5')
  + sheet('Clave de respuestas<br>Sólo para la maestra', `
  <h1>Clave — Semana 4: El Salvador</h1>
  ${keyFor(4, 1, 'El Salvador_0')}
  ${keyFor(4, 2, 'El Salvador_1')}
  ${keyFor(4, 3, 'El Salvador_2')}`,
  'Clave · Semana 4', 'Página 4 de 5')
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

  <h2>Notas de las páginas de comunidad (Semana 1)</h2>
  <ul style="font-size:.88rem">
    <li><strong>Tu primera entrevista (p. 2):</strong> lo que se evalúa es que haya
      <em>anotado</em> las respuestas y que la pregunta de seguimiento sea de verdad nueva,
      no una de la lista.</li>
    <li><strong>El mapa de mi español (p. 3):</strong> no se califica. Es diagnóstica y personal.
      Léela: te dice quién habla qué en casa y qué variedad trae cada estudiante.</li>
    <li><strong>Credencial (p. 4):</strong> acepta nombres de pluma. Un estudiante que no quiere
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
  'Rúbrica y notas', 'Página 5 de 5');

writeFileSync(join(OUT, 'claves.html'),
  docHTML('Clave de respuestas | La Corresponsal', keyPages, 'Imprimir la clave'), 'utf8');

console.log('semana-1.html  13 páginas');
console.log('semana-2.html  11 páginas');
console.log('semana-3.html  11 páginas');
console.log('semana-4.html  11 páginas');
console.log('claves.html     5 páginas');
