// build-carteles.mjs — «El taller de carteles», the two-and-a-half week
// propaganda-poster unit.
//
// The newspaper project taught students to report without taking a side. This
// one hands them the other half of the trade: persuasion. They decode the same
// technique arguing both sides of one strike, name the nine moves, then pick a
// cause they actually believe in and build a poster — slogan, symbol, draft,
// peer test, final — ending with the counter-poster their opponents would make.
//
// Schedule is a block week: Mon 50, Tue 50, Wed/Thu 80 (studio), Fri 50.
// Ten meetings, so the long studio days land on days 3 and 7.
//
// Outputs:
//   hojas/carteles.html           student packet, 16 pages, black and white
//   hojas/carteles-maestra.html   teacher guide, English: day plan, rubric, prep
//   hojas/carteles-claves.html    answer key for the analysis pages
//   carteles-presentacion.html    projector deck, posters in colour
//
// Art lives in carteles-art.mjs and is rendered twice from one source: grayscale
// on paper, colour on the projector. Shares _hoja.css and deck-shell.mjs.
// Run: node build-carteles.mjs
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { deckHTML } from './deck-shell.mjs';
import { CARTELES, GRIS, TECNICAS, byId, svgCartel, tecNombre } from './carteles-art.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'hojas');

const lines = n => `<div class="lines">${'<div></div>'.repeat(n)}</div>`;
const namebar = () =>
  `<div class="namebar"><span>Nombre: </span><span>Período: </span><span>Fecha: </span></div>`;
const blanks = (label, h = '.34in') =>
  `<tr><td style="width:34%"><strong>${label}</strong></td><td class="blank" style="height:${h}"></td></tr>`;
const fig = (id, cap, cls = '') => {
  const c = byId(id);
  return `<figure class="${cls}">${svgCartel(c, GRIS)}<figcaption><b>${c.titulo}</b> · ${cap || c.estilo}</figcaption></figure>`;
};
const chips = ts => `<div class="chips">${ts.map(t => `<span>☐ ${t}</span>`).join('')}</div>`;
const TODAS = TECNICAS.map(t => t[0]);

// ─────────────────────────────────────────────────────────────────────────────
//  Shared content — rendered into the packet, the deck and the key, so paper
//  and projector can never disagree.
// ─────────────────────────────────────────────────────────────────────────────
const DIAS = [
  ['1',  '50', 'Lunes',     '¿Qué es la propaganda?',   'Leer, y comparar dos carteles del mismo pleito', 'pp. 2–3'],
  ['2',  '50', 'Martes',    'La caja de herramientas',  'Nombrar las nueve técnicas y cazarlas',          'pp. 4–5'],
  ['3',  '80', 'Bloque',    'Taller 1 · Carteles en duelo', 'Decodificar, escoger tu causa, tres bocetos','pp. 6–8'],
  ['4',  '50', 'Viernes',   'Tu causa',                 'La prueba del cartel y la propuesta',            'p. 9'],
  ['5',  '50', 'Lunes',     'El eslogan',               'Mandatos: tú, usted, nosotros',                  'p. 10'],
  ['6',  '50', 'Martes',    'La imagen',                'Un símbolo, un foco, tres segundos',             'p. 11'],
  ['7',  '80', 'Bloque',    'Taller 2 · Borrador',      'El cartel completo a lápiz',                     'p. 12'],
  ['8',  '50', 'Viernes',   'La prueba de 3 segundos',  'Edición entre compañeros y plan de cambios',     'p. 13'],
  ['9',  '50', 'Lunes',     'Taller 3 · Cartel final',  'La versión final, con color',                    'p. 14'],
  ['10', '50', 'Martes',    'La defensa',               'Defensa escrita, contracartel y reflexión',      'pp. 15–16'],
];

// The cause has to survive this before anyone draws anything.
const PRUEBA = [
  '¿Es una causa real, que me importa de verdad?',
  '¿La puedo decir en siete palabras o menos?',
  '¿Hay algo que quiero que la gente haga?',
  '¿La puedo dibujar con un solo símbolo?',
  '¿Se puede colgar en el pasillo de esta escuela?',
];

// Mandatos: the grammar the slogan runs on. Pronoun attached = written accent.
const MANDATOS = [
  ['unirse',     '¡Únete!',       '¡Únase!',       '¡Unámonos!'],
  ['luchar',     '¡Lucha!',       '¡Luche!',       '¡Luchemos!'],
  ['cuidar',     '¡Cuídalo!',     '¡Cuídelo!',     '¡Cuidémoslo!'],
  ['apagar',     '¡Apágala!',     '¡Apáguela!',    '¡Apaguémosla!'],
  ['firmar',     '¡Firma!',       '¡Firme!',       '¡Firmemos!'],
  ['preguntar',  '¡Pregunta!',    '¡Pregunte!',    '¡Preguntemos!'],
  ['callarse',   '¡No te calles!','¡No se calle!', '¡No nos callemos!'],
];

const RUBRICA = [
  ['Causa',   'Es real, es mía y se entiende de un vistazo', 'Se entiende, pero es muy general', 'No se sabe de qué trata'],
  ['Eslogan', 'Siete palabras o menos, con un mandato',      'Largo o sin mandato',              'No hay eslogan'],
  ['Imagen',  'Un símbolo, un foco, se lee en 3 segundos',   'Se lee, pero compite consigo mismo','No se entiende la imagen'],
  ['Técnica', 'Uso dos técnicas y las puedo nombrar',        'Uso una',                           'No puedo nombrar ninguna'],
  ['Proceso', 'El borrador y el final son distintos, y mejor','Cambié poco',                      'Pasé el borrador en limpio'],
];

const TRES_SEG = [
  '¿Qué viste primero?',
  '¿De qué crees que trata?',
  '¿Qué quiere que hagas?',
  '¿Qué palabra se te quedó?',
];

let pageNo = 0;
const PAGES = [];
const page = (meta, body) => PAGES.push({ meta, body, n: ++pageNo });

function render(pages, footLabel, en = false) {
  return pages.map(p => `
<div class="sheet">
  <div class="hdr">
    <div class="brand">El Mundo Nuestro</div>
    <div class="meta">${p.meta}</div>
  </div>
  ${p.body}
  <div class="foot"><span>${footLabel}</span><span>${en ? 'Page' : 'Página'} ${p.n} ${en ? 'of' : 'de'} ${pages.length}</span></div>
</div>`).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
//  1 · Portada
// ─────────────────────────────────────────────────────────────────────────────
page('Taller de carteles<br>Portada', `
  ${namebar()}
  <h1>El taller de carteles</h1>
  <div class="sub">Diez días para convencer a alguien de algo que te importa</div>

  <div class="nota">
    <div class="kicker">Nota de la jefa de redacción</div>
    <div class="lectura" style="font-size:1rem">
      <p>En el periódico te pedí que no tomaras partido. Que preguntaras, que citaras exacto, que
      dejaras que el lector decidiera. Ese trabajo se acabó.</p>
      <p>Este mes el taller imprime carteles. Un cartel no informa: convence. Tiene siete palabras y
      tres segundos para meterse en la cabeza de quien pasa.</p>
      <p>Primero vas a aprender a desarmarlos — los que te gustan y los que no — porque las mismas
      nueve técnicas sirven para cualquier causa, incluyendo las que están en tu contra. Después vas
      a escoger algo en lo que crees de verdad y vas a hacer el tuyo.</p>
    </div>
  </div>

  <h2>Tu calendario</h2>
  <div class="instr">Firmo cada paso cuando lo terminas. Los días de <strong>bloque</strong> son de
  taller: traes todo y trabajas la hora completa.</div>
  <table>
    <thead><tr><th style="width:7%">Día</th><th style="width:11%">Clase</th><th style="width:26%">Paso</th>
      <th style="width:33%">Qué haces</th><th style="width:9%">Hoja</th><th style="width:14%">Firma</th></tr></thead>
    <tbody>
      ${DIAS.map(([d, min, dia, paso, que, hoja]) =>
        `<tr><td>${d}</td><td>${dia === 'Bloque' ? '<strong>Bloque</strong>' : dia}
          <span class="sans" style="font-size:.6rem;color:#5a5a5a">${min}′</span></td>
          <td><strong>${paso}</strong></td><td>${que}</td><td>${hoja}</td><td></td></tr>`).join('\n      ')}
    </tbody>
  </table>`);

// ─────────────────────────────────────────────────────────────────────────────
//  2 · ¿Qué es la propaganda?
// ─────────────────────────────────────────────────────────────────────────────
page('Día 1<br>¿Qué es la propaganda?', `
  ${namebar()}
  <h1>¿Qué es la propaganda?</h1>
  <div class="sub">Día 1 — Lee y subraya</div>

  <div class="nota">
    <div class="lectura">
      <p><b class="pn">1</b>La palabra suena a película vieja: un dictador, una bandera, una radio.
      Pero propaganda es cualquier mensaje hecho para que pienses algo y hagas algo. No tiene que
      ser mentira. Mucha propaganda dice la verdad; lo que hace es decir <em>una parte</em> de la
      verdad, muy fuerte, y callar el resto.</p>
      <p><b class="pn">2</b>Piensa en tres mensajes distintos sobre la misma fábrica. El primero
      dice: «La fábrica abre a las seis.» Eso es <strong>información</strong>. El segundo dice:
      «Trabaja con nosotros: buen sueldo.» Eso es un <strong>anuncio</strong>: quiere tu dinero o
      tu firma. El tercero dice: «¡El turno es nuestro!» Eso es <strong>propaganda</strong>: quiere
      que te sientas parte de un lado y que actúes.</p>
      <p><b class="pn">3</b>La frontera entre los tres es delgada, y los tres usan las mismas
      herramientas. Por eso vale la pena aprenderlas: no para dejar de creer en todo, sino para
      saber qué te están pidiendo y quién gana si se lo das.</p>
      <p><b class="pn">4</b>En los años veinte, en las fábricas y las panaderías, los sindicatos
      imprimían carteles para pedir turnos de ocho horas. Las empresas imprimían los suyos para
      pedir calma y producción. Los dos usaban puños, obreros grandes vistos desde abajo y la
      palabra <em>nosotros</em>. El dibujo era casi igual. Lo que cambiaba era quién pagaba la
      imprenta.</p>
      <p><b class="pn">5</b>Esa es la pregunta con la que vas a leer todo este mes: <strong>¿quién
      pagó este cartel, y qué quiere que yo haga?</strong></p>
    </div>
  </div>

  <h2>Después de leer</h2>
  <div class="instr">Escribe la diferencia entre información, anuncio y propaganda, con tus palabras.</div>
  ${lines(3)}
  <div class="instr">¿Dónde viste propaganda esta semana? Puede ser un cartel, un video o una
  publicación.</div>
  ${lines(2)}`);

// ─────────────────────────────────────────────────────────────────────────────
//  3 · Los carteles en duelo
// ─────────────────────────────────────────────────────────────────────────────
page('Día 1<br>Dos lados, un mismo truco', `
  ${namebar()}
  <h1>El mismo pleito, dos carteles</h1>
  <div class="sub">Día 1 — La huelga de las panaderías</div>

  <div class="instr">Los dos carteles salieron la misma semana, de la misma huelga. Uno lo pagó el
  sindicato; el otro, la empresa. Míralos tres segundos cada uno, como si pasaras caminando.</div>

  <div class="carteles med">
    ${fig('turno', 'Lo pagó el <b>sindicato</b>')}
    ${fig('fabrica', 'Lo pagó la <b>empresa</b>')}
  </div>

  <table>
    <thead><tr><th style="width:30%">Pregunta</th><th style="width:35%">Cartel del sindicato</th>
      <th style="width:35%">Cartel de la empresa</th></tr></thead>
    <tbody>
      <tr><td><strong>¿Qué ves primero?</strong></td><td class="blank"></td><td class="blank"></td></tr>
      <tr><td><strong>¿Quién es «nosotros»?</strong></td><td class="blank"></td><td class="blank"></td></tr>
      <tr><td><strong>¿Qué quiere que hagas?</strong></td><td class="blank"></td><td class="blank"></td></tr>
      <tr><td><strong>¿Qué <em>no</em> te dice?</strong></td><td class="blank" style="height:.42in"></td>
        <td class="blank" style="height:.42in"></td></tr>
    </tbody>
  </table>

  <div class="tip">Los dos usan un obrero grande y la palabra <em>nosotros</em>. La misma herramienta
  sirve para pedir ocho horas y para pedir que nadie pare la máquina.</div>

  <div class="instr">¿Cuál te convenció más? Di por qué, y nombra una cosa del dibujo que te convenció.</div>
  ${lines(3)}`);

// ─────────────────────────────────────────────────────────────────────────────
//  4 · La caja de herramientas
// ─────────────────────────────────────────────────────────────────────────────
page('Día 2<br>Las nueve técnicas', `
  ${namebar()}
  <h1>La caja de herramientas</h1>
  <div class="sub">Día 2 — Nueve técnicas con nombre</div>

  <div class="instr">Con nombre se ven. Sin nombre funcionan. Léelas y, en la última columna, apunta
  dónde has visto cada una — en un cartel, un anuncio, un video o la boca de alguien que conoces.</div>

  <table>
    <thead><tr><th style="width:20%">Técnica</th><th style="width:52%">Cómo funciona</th>
      <th style="width:28%">Dónde la he visto</th></tr></thead>
    <tbody>
      ${TECNICAS.map(([n, , d]) =>
        `<tr><td><strong>${n}</strong></td><td>${d}</td><td class="blank"></td></tr>`).join('\n      ')}
    </tbody>
  </table>

  <div class="tip">Ninguna de estas técnicas es mala por sí sola. Un cartel de vacunas y un cartel
  de guerra usan las mismas. Lo que cambia es para qué, y quién gana.</div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  5 · Caza de técnicas
// ─────────────────────────────────────────────────────────────────────────────
page('Día 2<br>Caza de técnicas', `
  ${namebar()}
  <h1>Caza de técnicas</h1>
  <div class="sub">Día 2 — Dos carteles más</div>

  <div class="instr">Para cada cartel: marca las técnicas que encuentres, copia la prueba exacta del
  cartel y escribe qué te pide hacer.</div>

  <div class="carteles med">
    ${fig('boicot')}
    ${fig('necesitamos')}
  </div>

  <h2>Cartel de la izquierda</h2>
  ${chips(TODAS)}
  <table>
    <tbody>
      ${blanks('La prueba (cópiala)', '.4in')}
      ${blanks('¿Qué quiere que hagas?')}
    </tbody>
  </table>

  <h2>Cartel de la derecha</h2>
  ${chips(TODAS)}
  <table>
    <tbody>
      ${blanks('La prueba (cópiala)', '.4in')}
      ${blanks('¿Qué quiere que hagas?')}
    </tbody>
  </table>`);

// ─────────────────────────────────────────────────────────────────────────────
//  6 · Taller 1, primera parte: salud y anuncio
// ─────────────────────────────────────────────────────────────────────────────
page('Día 3 · Bloque<br>Taller 1 (1 de 3)', `
  ${namebar()}
  <h1>Vender agua, vender cosas</h1>
  <div class="sub">Día 3 — Las mismas herramientas, dos intenciones</div>

  <div class="instr">Uno quiere que tomes agua. El otro quiere tu dinero. Compáralos con cuidado:
  usan casi las mismas técnicas.</div>

  <div class="carteles med">
    ${fig('agua')}
    ${fig('compra')}
  </div>

  <table>
    <thead><tr><th style="width:30%">Pregunta</th><th style="width:35%">Cartel de salud</th>
      <th style="width:35%">Anuncio</th></tr></thead>
    <tbody>
      <tr><td><strong>Técnicas que usa</strong></td><td class="blank" style="height:.4in"></td>
        <td class="blank" style="height:.4in"></td></tr>
      <tr><td><strong>¿Quién gana si le haces caso?</strong></td><td class="blank" style="height:.4in"></td>
        <td class="blank" style="height:.4in"></td></tr>
      <tr><td><strong>¿El dato es comprobable?</strong></td><td class="blank"></td><td class="blank"></td></tr>
    </tbody>
  </table>

  <h2>La pregunta difícil</h2>
  <div class="instr">Si las dos usan las mismas técnicas, ¿por qué una nos parece bien y la otra no?
  No hay una sola respuesta correcta; defiende la tuya.</div>
  ${lines(4)}`);

// ─────────────────────────────────────────────────────────────────────────────
//  7 · Taller 1, segunda parte: la pantalla
// ─────────────────────────────────────────────────────────────────────────────
page('Día 3 · Bloque<br>Taller 1 (2 de 3)', `
  ${namebar()}
  <h1>El cartel que traes en el bolsillo</h1>
  <div class="sub">Día 3 — La propaganda ya no se pega en la pared</div>

  <div class="two" style="gap:0 .9rem">
    <div>${fig('parque', 'Publicación de vecinos · hoy', 'med')}</div>
    <div>
      <div class="instr">Hoy los carteles se deslizan. Tienen la misma estructura: una imagen, pocas
      palabras, una orden. Y una ventaja nueva: el número de gente que ya dijo que sí.</div>
      <table>
        <tbody>
          ${blanks('Técnica más fuerte', '.38in')}
          ${blanks('El número que usa', '.3in')}
          ${blanks('Qué te pide', '.3in')}
        </tbody>
      </table>
    </div>
  </div>

  <h2>Tu propio bolsillo</h2>
  <div class="instr">Piensa en algo que viste en tu teléfono esta semana y que quería convencerte de
  algo: un anuncio, un video, una publicación de alguien famoso.</div>
  <table>
    <tbody>
      ${blanks('¿Qué era?', '.38in')}
      ${blanks('¿Qué técnica usaba?')}
      ${blanks('¿Quién ganaba si le hacías caso?', '.38in')}
      ${blanks('¿Funcionó contigo? Sé honesto', '.38in')}
    </tbody>
  </table>

  <div class="tip">Cuando algo te hace sentir que te vas a quedar fuera si no actúas ya, eso tiene
  nombre: «todos lo hacen» más «la llamada». Es la pareja más vieja del oficio.</div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  8 · Taller 1, tercera parte: escoge tu causa
// ─────────────────────────────────────────────────────────────────────────────
page('Día 3 · Bloque<br>Taller 1 (3 de 3)', `
  ${namebar()}
  <h1>Escoge tu causa</h1>
  <div class="sub">Día 3 — Algo en lo que crees de verdad</div>

  <div class="instr">Anota por lo menos dos ideas en cada recuadro. No te censures todavía: la
  prueba viene después.</div>

  <div class="two">
    <div>
      <div class="box" style="min-height:.95in"><div class="lbl">Algo que cambiaría de esta escuela</div></div>
      <div class="box" style="min-height:.95in"><div class="lbl">Algo que pasa en mi barrio</div></div>
      <div class="box" style="min-height:.95in"><div class="lbl">Algo de mi cultura que la gente no entiende</div></div>
    </div>
    <div>
      <div class="box" style="min-height:.95in"><div class="lbl">Algo del trabajo o del dinero</div></div>
      <div class="box" style="min-height:.95in"><div class="lbl">Algo de la salud o del planeta</div></div>
      <div class="box" style="min-height:.95in"><div class="lbl">Algo que me da coraje y nadie dice</div></div>
    </div>
  </div>

  <h2>La prueba del cartel</h2>
  <div class="instr">Escoge tus dos mejores ideas y márcalas. La que pase las cinco es tu causa.</div>
  <table>
    <thead><tr><th style="width:56%">Pregunta</th><th style="width:22%">Idea 1</th><th style="width:22%">Idea 2</th></tr></thead>
    <tbody>
      ${PRUEBA.map(q => `<tr><td>${q}</td><td></td><td></td></tr>`).join('\n      ')}
    </tbody>
  </table>

  <h2>Tres bocetos de un minuto</h2>
  <div class="instr">Antes de salir hoy: tres dibujos rápidos, un minuto cada uno. Feos está bien.</div>
  <div class="carteles tres">
    ${[1, 2, 3].map(() => `<div class="marco" style="height:1.35in"><div class="campo">boceto</div></div>`).join('')}
  </div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  9 · La propuesta
// ─────────────────────────────────────────────────────────────────────────────
page('Día 4<br>La propuesta', `
  ${namebar()}
  <h1>Propón tu cartel</h1>
  <div class="sub">Día 4 — Nadie imprime sin permiso</div>

  <div class="instr">Llena la propuesta con la idea que pasó la prueba. Yo la apruebo o te pido
  cambios antes de que empieces a dibujar.</div>

  <table>
    <tbody>
      ${blanks('Mi causa, en una oración', '.5in')}
      ${blanks('¿Por qué me importa a mí?', '.5in')}
      ${blanks('¿A quién le hablo? (mi público)')}
      ${blanks('¿Qué quiero que esa persona haga?', '.42in')}
      ${blanks('Un dato o un hecho que lo apoya', '.42in')}
      ${blanks('El símbolo que podría usar')}
    </tbody>
  </table>

  <h2>Tu público</h2>
  <div class="instr">Un cartel para toda la escuela no convence a nadie. Escoge una persona real y
  escríbele a ella: un estudiante de noveno, una maestra, tu tío, el director.</div>
  <div class="wordbank">estudiantes de esta escuela &nbsp;·&nbsp; familias &nbsp;·&nbsp; maestros
    &nbsp;·&nbsp; vecinos &nbsp;·&nbsp; la administración &nbsp;·&nbsp; alguien que no está de acuerdo</div>

  <div class="box" style="margin-top:.5rem">
    <div class="lbl">Sólo para tu profe</div>
    <p style="font-size:.9rem">☐ Aprobada tal como está &nbsp;&nbsp; ☐ Aprobada con cambios
    &nbsp;&nbsp; ☐ Busca otra causa</p>
    <div class="lines" style="margin-top:.2rem"><div></div><div></div></div>
    <p style="font-size:.85rem;margin-top:.3rem">Firma: ____________________________</p>
  </div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  10 · El eslogan y los mandatos
// ─────────────────────────────────────────────────────────────────────────────
page('Día 5<br>El eslogan', `
  ${namebar()}
  <h1>El eslogan</h1>
  <div class="sub">Día 5 — Siete palabras o menos, y casi siempre un mandato</div>

  <div class="instr">Los eslóganes mandan: ¡Únete! ¡No compres! ¡Apágala! Eso es un
  <strong>mandato</strong>. Cambia según a quién le hables.</div>

  <table>
    <thead><tr><th style="width:20%">Verbo</th><th style="width:27%">A un compañero (tú)</th>
      <th style="width:27%">A un adulto (usted)</th><th style="width:26%">A todos (nosotros)</th></tr></thead>
    <tbody>
      ${MANDATOS.map(([v, tu, ud, nos]) =>
        `<tr><td>${v}</td><td><strong>${tu}</strong></td><td>${ud}</td><td>${nos}</td></tr>`).join('\n      ')}
    </tbody>
  </table>

  <div class="tip"><strong>El acento del mandato:</strong> cuando le pegas un pronombre al final, la
  palabra crece y pide acento escrito: <em>cuida → cuídalo</em>, <em>apaga → apágala</em>,
  <em>une → únete</em>. Dilo en voz alta: el golpe no se movió, pero la palabra sí.</div>

  <h2>Escribe cinco</h2>
  <div class="instr">Cinco eslóganes para tu causa. Siete palabras o menos. Por lo menos tres tienen
  que empezar con un mandato. Uno tiene que hablarle de <em>usted</em>.</div>
  <ol class="q" style="font-size:.93rem">
    ${Array.from({ length: 5 }, () => `<li>${lines(1)}</li>`).join('')}
  </ol>

  <h2>El que escoges</h2>
  <div class="instr">Encierra el mejor arriba y cópialo aquí, con sus acentos y sus signos.</div>
  <div class="box" style="padding:.5rem .6rem"><div class="lines"><div></div></div></div>
  <div class="instr">¿Cuántas palabras tiene? ________ &nbsp;&nbsp; ¿Qué mandato usa? ______________________</div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  11 · La imagen
// ─────────────────────────────────────────────────────────────────────────────
page('Día 6<br>La imagen', `
  ${namebar()}
  <h1>Un símbolo, un foco, tres segundos</h1>
  <div class="sub">Día 6 — Cómo se ve un cartel que sí funciona</div>

  <div class="two" style="gap:0 .9rem">
    <div>${fig('luz', 'Cartel de una estudiante · hecho a mano', 'med')}</div>
    <div>
      <div class="instr">Este lo hizo una estudiante con tres marcadores. Funciona por cuatro
      razones, y las cuatro las puedes copiar hoy.</div>
      <table>
        <tbody>
          <tr><td><strong>Un símbolo</strong><br>Un foco. No un foco, un salón, un recibo y un planeta.</td></tr>
          <tr><td><strong>Un foco visual</strong><br>Lo más importante es lo más grande y está en el centro.</td></tr>
          <tr><td><strong>Letras que se leen de lejos</strong><br>Gruesas, derechas, pocas.</td></tr>
          <tr><td><strong>Un dato chiquito</strong><br>Abajo, para el que se acerca.</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <h2>Tu símbolo</h2>
  <div class="instr">Escribe tres objetos que podrían representar tu causa. Después encierra el que
  se entienda sin explicación.</div>
  <table><tbody><tr><td class="blank" style="height:.34in"></td></tr></tbody></table>

  <h2>Las letras</h2>
  <div class="instr">Practica tu eslogan con letras de palo, mayúsculas, gruesas. Usa el renglón de
  abajo como guía: primero marca dónde empieza y termina cada palabra, y luego engrosa.</div>
  <div class="box" style="padding:.45rem .5rem">
    <div class="lines"><div style="height:.4in"></div><div style="height:.4in"></div></div>
  </div>

  <h2>Tu composición</h2>
  <div class="instr">Tres maneras distintas de acomodar lo mismo: símbolo arriba y letras abajo,
  letras arriba y símbolo abajo, símbolo gigante con las letras encima.</div>
  <div class="carteles tres">
    ${['símbolo arriba', 'letras arriba', 'símbolo gigante'].map(t =>
      `<div class="marco" style="height:1.15in"><div class="campo">${t}</div></div>`).join('')}
  </div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  12 · Borrador a lápiz
// ─────────────────────────────────────────────────────────────────────────────
page('Día 7 · Bloque<br>Taller 2', `
  <div class="instr" style="margin-top:.1rem"><strong>Borrador a lápiz.</strong> El cartel completo:
  eslogan, símbolo, dato y llamada. A lápiz, para poder borrar. A la media hora paramos y alguien
  más lo ve. Nombre: ______________________ &nbsp; Período: __________</div>

  <div class="marco" style="padding:.35rem">
    <div class="campo" style="height:6.7in;align-items:flex-start">
      <span style="margin-top:.2rem">tu cartel · a lápiz</span>
    </div>
  </div>

  <table>
    <tbody>
      <tr><td style="width:50%"><strong>Mi eslogan dice</strong><div class="lines"><div></div></div></td>
        <td style="width:50%"><strong>Mi símbolo es</strong><div class="lines"><div></div></div></td></tr>
      <tr><td><strong>Quiero que hagan</strong><div class="lines"><div></div></div></td>
        <td><strong>Mis dos técnicas son</strong><div class="lines"><div></div></div></td></tr>
    </tbody>
  </table>`);

// ─────────────────────────────────────────────────────────────────────────────
//  13 · La prueba de 3 segundos
// ─────────────────────────────────────────────────────────────────────────────
page('Día 8<br>La prueba de 3 segundos', `
  ${namebar()}
  <h1>La prueba de tres segundos</h1>
  <div class="sub">Día 8 — Nadie se para a estudiar un cartel</div>

  <div class="instr">Le enseñas tu borrador a un compañero <strong>tres segundos</strong> y lo tapas.
  Él contesta de memoria, sin volver a verlo. Tú llenas esta hoja con lo que te diga: no discutas,
  sólo apunta. Si no vio lo que querías, el problema es del cartel, no de sus ojos.</div>

  <table>
    <tbody>
      ${blanks('Mi cartel lo vio')}
      ${TRES_SEG.map(q => blanks(q, '.4in')).join('\n      ')}
    </tbody>
  </table>

  <h2>Lo que yo quería que pasara</h2>
  <table>
    <thead><tr><th style="width:50%">Yo quería que viera…</th><th style="width:50%">Lo que vio de verdad</th></tr></thead>
    <tbody><tr><td class="blank" style="height:.5in"></td><td class="blank" style="height:.5in"></td></tr></tbody>
  </table>

  <h2>Plan de cambios</h2>
  <div class="instr">Tres cambios concretos para la versión final. «Hacerlo mejor» no es un cambio;
  «poner el eslogan arriba y el foco más grande» sí lo es.</div>
  <ol class="q" style="font-size:.93rem">
    ${[1, 2, 3].map(() => `<li>${lines(1)}</li>`).join('')}
  </ol>

  <div class="tip">Si tu compañero tardó en entenderlo, no le expliques: anótalo. En el pasillo no
  vas a estar tú para explicar.</div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  14 · Cartel final
// ─────────────────────────────────────────────────────────────────────────────
page('Día 9 · Taller 3<br>Cartel final', `
  <div class="instr" style="margin-top:.1rem"><strong>Versión final.</strong> Con color, con las
  letras gruesas, con tu nombre chiquito abajo a la derecha como firma del autor. Si tienes papel
  más grande, usa esta página como plano y pásalo. &nbsp; Nombre: ______________________</div>

  <div class="marco" style="padding:.35rem;border-width:3px">
    <div class="campo" style="height:7.75in;align-items:flex-start">
      <span style="margin-top:.2rem">cartel final</span>
    </div>
  </div>
  <div class="instr" style="text-align:right">Firma del autor ↗</div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  15 · La defensa y el contracartel
// ─────────────────────────────────────────────────────────────────────────────
page('Día 10<br>La defensa', `
  ${namebar()}
  <h1>Defiende tu cartel</h1>
  <div class="sub">Día 10 — Por escrito, como si te lo pidiera la editora</div>

  <div class="instr">Entre 80 y 120 palabras. Tiene que contestar las cuatro: cuál es tu causa, a
  quién le hablas, qué dos técnicas usaste y por qué escogiste ese símbolo.</div>
  <div class="wordbank">Mi cartel trata de… &nbsp;·&nbsp; Le hablo a… &nbsp;·&nbsp; Usé la técnica
    de… porque… &nbsp;·&nbsp; Escogí este símbolo porque… &nbsp;·&nbsp; Quiero que…</div>
  ${lines(11)}

  <h2>El contracartel</h2>
  <div class="instr">Ahora el otro lado. Alguien no está de acuerdo contigo y tiene dinero para
  imprimir. Con las mismas nueve técnicas, ¿qué cartel haría contra el tuyo?</div>
  <table>
    <tbody>
      ${blanks('Su eslogan sería', '.42in')}
      ${blanks('La técnica que usaría')}
      ${blanks('Su símbolo sería')}
      ${blanks('Lo que su cartel NO diría', '.42in')}
    </tbody>
  </table>
  <div class="tip">Esta es la parte que importa de todo el mes: las herramientas no tienen lado.
  El que las conoce, las ve venir.</div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  16 · Reflexión y rúbrica
// ─────────────────────────────────────────────────────────────────────────────
page('Día 10<br>Reflexión', `
  ${namebar()}
  <h1>Mira lo que hiciste</h1>
  <div class="sub">Día 10 — Reflexión y autoevaluación</div>

  <h2>1 · Del borrador al final</h2>
  <table>
    <tbody>
      ${blanks('El cambio más grande que hice', '.5in')}
      ${blanks('Por qué lo hice', '.5in')}
    </tbody>
  </table>

  <h2>2 · Piensa</h2>
  <ol class="q">
    <li>¿Qué técnica usaste tú, de las nueve, y por qué ésa? ${lines(2)}</li>
    <li>Después de este mes, ¿qué vas a mirar distinto cuando veas un anuncio? ${lines(2)}</li>
  </ol>

  <h2>3 · Califica tu cartel</h2>
  <div class="instr">Encierra un número en cada fila. Tu profe usa la misma tabla.</div>
  <table class="rubric">
    <thead><tr><th style="width:16%">Criterio</th><th style="width:30%">3 · Lo logré</th>
      <th style="width:28%">2 · Casi</th><th style="width:26%">1 · Todavía no</th></tr></thead>
    <tbody>
      ${RUBRICA.map(([c, tres, dos, uno]) =>
        `<tr><td><strong>${c}</strong></td><td>${tres}</td><td>${dos}</td><td>${uno}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
  <div class="instr">Total: _______ / 15</div>

  <div class="tip">Tu cartel se queda colgado. Alguien que no conoces va a pasar por el pasillo, lo
  va a ver tres segundos y va a pensar en tu causa. Eso es todo el oficio.</div>`);

// ═════════════════════════════════════════════════════════════════════════════
//  Answer key
// ═════════════════════════════════════════════════════════════════════════════
const KEY = [];
const keyPage = (meta, body) => KEY.push({ meta, body, n: KEY.length + 1 });
const tecs = c => c.tecnicas.map(tecNombre).join(', ');

keyPage('Clave de respuestas<br>Sólo para uso docente', `
  <h1>El taller de carteles — clave</h1>
  <div class="sub">Páginas 3, 5 y 6 · análisis de carteles</div>
  <div class="instr"><span class="ans">En rojo</span> lo que debe aparecer.
  <span class="open">En verde</span> lo que es respuesta abierta: se califica por la defensa, no por
  coincidir conmigo.</div>

  <h3>Página 3 · El mismo pleito, dos carteles</h3>
  <table>
    <thead><tr><th style="width:24%">Pregunta</th><th style="width:38%">Sindicato («¡El turno es nuestro!»)</th>
      <th style="width:38%">Empresa («La fábrica somos todos»)</th></tr></thead>
    <tbody>
      <tr><td>¿Qué ves primero?</td><td class="open">El puño con el rodillo</td><td class="open">La fábrica y la flecha que sube</td></tr>
      <tr><td>¿Quién es «nosotros»?</td><td class="ans">Las panaderas, los trabajadores</td>
        <td class="ans">Los dueños y los trabajadores juntos — la empresa incluye al obrero en su «nosotros»</td></tr>
      <tr><td>¿Qué quiere que hagas?</td><td class="ans">Unirte al sindicato, exigir las 8 horas</td>
        <td class="ans">Seguir produciendo, sentirte parte, no parar</td></tr>
      <tr><td>¿Qué <em>no</em> te dice?</td><td class="ans">Qué se pierde en la huelga; si hay sueldo esos días</td>
        <td class="ans">Cuántas horas se trabajan; quién se queda con el +19%</td></tr>
    </tbody>
  </table>
  <div class="instr">La respuesta que buscas en la última pregunta: los dos usan
  <strong>el nosotros</strong> y <strong>la imagen heroica</strong>. Si alguien lo dice sin ayuda,
  ya entendió el mes entero.</div>

  <h3>Página 5 · Caza de técnicas</h3>
  <table>
    <thead><tr><th style="width:26%">Cartel</th><th style="width:40%">Técnicas</th><th style="width:34%">Qué pide</th></tr></thead>
    <tbody>
      ${['boicot', 'necesitamos'].map(id => { const c = byId(id); return
        `<tr><td><strong>${c.titulo}</strong></td><td class="ans">${tecs(c)}</td>
          <td class="ans">${id === 'boicot' ? 'Que preguntes quién lo hizo antes de comprar' : 'Que te presentes el lunes'}</td></tr>`;
      }).join('\n      ')}
    </tbody>
  </table>

  <h3>Página 6 · Salud y anuncio</h3>
  <table>
    <thead><tr><th style="width:26%">Cartel</th><th style="width:40%">Técnicas</th><th style="width:34%">Quién gana</th></tr></thead>
    <tbody>
      ${['agua', 'compra'].map(id => { const c = byId(id); return
        `<tr><td><strong>${c.titulo}</strong></td><td class="ans">${tecs(c)}</td>
          <td class="ans">${id === 'agua' ? 'El estudiante que toma agua; nadie cobra' : 'La tienda — el «dato» aquí no existe'}</td></tr>`;
      }).join('\n      ')}
    </tbody>
  </table>
  <div class="instr">El dato del cartel de salud («8 de cada 10 llegan sin tomar agua») es
  <strong>comprobable</strong> en teoría: se puede preguntar, contar, medir. El anuncio no da ningún
  número — sólo dice «todos lo tienen». Esa es la diferencia que quieres que vean.</div>`);

keyPage('Clave de respuestas<br>Sólo para uso docente', `
  <h1>Clave — páginas 7 y 10</h1>
  <div class="sub">Redes y mandatos</div>

  <h3>Página 7 · #SalvaElParque</h3>
  <table>
    <tbody>
      <tr><td style="width:30%"><strong>Técnica más fuerte</strong></td>
        <td class="ans">«Todos lo hacen» — los 1.284 vecinos que ya firmaron</td></tr>
      <tr><td><strong>El número</strong></td><td class="ans">1.284 firmas. Nadie dice de dónde salió ni de cuándo es</td></tr>
      <tr><td><strong>Qué pide</strong></td><td class="ans">Que firmes tú también</td></tr>
    </tbody>
  </table>

  <h3>Página 10 · Mandatos</h3>
  <table>
    <thead><tr><th style="width:20%">Verbo</th><th style="width:27%">tú</th><th style="width:27%">usted</th>
      <th style="width:26%">nosotros</th></tr></thead>
    <tbody>
      ${MANDATOS.map(([v, tu, ud, nos]) =>
        `<tr><td>${v}</td><td class="ans">${tu}</td><td class="ans">${ud}</td><td class="ans">${nos}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
  <div class="instr">El punto de la fila de <em>callarse</em>: en negativo el pronombre se va
  <strong>antes</strong> del verbo y el acento desaparece — <em>¡No te calles!</em>, no
  «¡No cállate!». Es el error más común y vale la pena decirlo en voz alta.</div>

  <h3>Lo que no lleva calificación</h3>
  <p style="font-size:.9rem"><span class="open">Abiertas:</span> «¿cuál te convenció más?» (p. 3),
  la pregunta difícil (p. 6), el bolsillo (p. 7), la causa y la propuesta (pp. 8–9), todo lo del
  cartel (pp. 10–14), la defensa y el contracartel (p. 15) y la reflexión (p. 16).</p>
  <p style="font-size:.9rem">En el contracartel busca una cosa: que la técnica que nombra
  <strong>sea de la lista</strong> y que el eslogan contrario de verdad golpee su propia causa. Si
  escribe un contracartel débil a propósito, no entendió — o no quiso entender — que las
  herramientas no tienen lado.</p>`);

// ═════════════════════════════════════════════════════════════════════════════
//  Teacher guide (English)
// ═════════════════════════════════════════════════════════════════════════════
const TEACHER = [];
TEACHER.push({ n: 1, meta: 'Teacher guide<br>Ten-day plan', body: `
  <h1>El taller de carteles — Teacher Guide</h1>
  <div class="sub">Propaganda unit · ten meetings · student packet is 16 pages</div>

  <p style="font-size:.95rem">Students decode posters that argue both sides of one labour dispute,
  name nine techniques, then design a poster for a cause they choose. The unit ends with the
  counter-poster: the slogan their opponents would print, using a technique they just learned.
  The example posters are drawn originals, not reproductions, so the packet copies forever —
  grayscale on paper, colour on the projector.</p>

  <h2>The ten days</h2>
  <table style="font-size:.8rem">
    <thead><tr><th style="width:7%">Day</th><th style="width:11%">Length</th><th style="width:26%">Step</th>
      <th style="width:38%">What happens</th><th style="width:18%">Signed when</th></tr></thead>
    <tbody>
      ${DIAS.map(([d, min, dia, paso, , hoja], i) => {
        const firma = ['Reading annotated', 'Technique table filled', 'Three thumbnails done',
          'Pitch approved', 'Slogan chosen', 'Composition picked', 'Pencil draft complete',
          'Three-second test done', 'Final poster in', 'Defense + reflection in'][i];
        return `<tr><td>${d}</td><td>${dia === 'Bloque' ? '<strong>80 min</strong>' : min + ' min'}</td>
          <td><strong>${paso}</strong><br><span class="sans" style="font-size:.6rem;color:#5a5a5a">${hoja}</span></td>
          <td>${[
            'Read the passage, then the duelling pair. Both posters use the same two tools — that is the unit.',
            'Name the nine techniques, then hunt them. Expect arguing over which is which; the argument is the lesson.',
            'Block. Health vs advertisement, the phone-feed poster, then choose a cause and sketch three thumbnails.',
            'The cause test and the pitch. Approve, request changes, or send them back for another cause.',
            'Mandatos: tú, usted, nosotros, and the accent that appears when a pronoun is attached.',
            'One symbol, one focal point, three seconds. Lettering practice, three compositions.',
            'Block. Full pencil draft. Stop everyone at the half hour for a partner look.',
            'The three-second test, then three concrete changes. Not "make it better".',
            'Final poster, colour media. Keep it to the hour.',
            'Written defense, counter-poster, reflection, self-rubric. Posters go up.',
          ][i]}</td><td>${firma}</td></tr>`;
      }).join('\n      ')}
    </tbody>
  </table>

  <h2>Sort these out before day 1</h2>
  <p style="font-size:.88rem"><strong>Materials.</strong> Markers and colored pencils for days 7 and
  9. The packet's frames are letter-size, so nothing bigger is required; with 11×17, page 14 becomes
  the plan and they scale it up. &nbsp;<strong>Wall space.</strong> Decide where the posters hang and
  tell them on day 1 — the unit leans on strangers seeing the poster.
  &nbsp;<strong>Causes.</strong> You sign the pitch on day 4, which is where you redirect anything
  aimed at a person rather than an idea.</p>` });

TEACHER.push({ n: 2, meta: 'Teacher guide<br>Teaching notes', body: `
  <h1>Teaching notes</h1>

  <h2>Why labour and not war</h2>
  <p style="font-size:.95rem">The duelling pair is a bakers' strike: the union's poster and the
  company's poster, same week, same fist, same word «nosotros». Students see one technique argue
  both sides before anyone asks them to pick a side, and the heat stays on who paid the printer
  rather than on anybody's identity. The ad-versus-public-health pair on day 3 makes the same point
  with lower stakes: a poster you approve of and a poster you don't, running the same play.</p>

  <h2>The question that runs the unit</h2>
  <p style="font-size:.95rem">«¿Quién pagó este cartel, y qué quiere que yo haga?» Ask it every
  single day, about every poster, including the one on the student's own desk on day 9.</p>

  <h2>What to watch for</h2>
  <ul style="font-size:.9rem">
    <li><strong>Posters that are flyers.</strong> The commonest failure is four sentences and a
      border. The three-second test on day 8 fixes it better than you can by telling them.</li>
    <li><strong>A cause with no action.</strong> "Stop racism" is a belief, not a call. Push for the
      thing a reader does this week: sign, ask, show up, turn it off, bring one.</li>
    <li><strong>Students who can't draw.</strong> One symbol, big, is the whole requirement, and the
      model poster on page 11 is a light bulb. Lettering counts as art.</li>
    <li><strong>The counter-poster going soft.</strong> If a student writes a weak slogan for the
      other side, they have dodged the point. Make them write the one that would actually hurt.</li>
  </ul>

  <h2>Grading</h2>
  <p style="font-size:.95rem">Fifteen points, same table the student uses on page 16. Spelling is
  not on it — accents on the slogan are coached on page 10 as the shop's house style, the same way
  the newspaper unit handled them.</p>
  <table class="rubric">
    <thead><tr><th style="width:16%">Criterion</th><th style="width:30%">3</th><th style="width:28%">2</th>
      <th style="width:26%">1</th></tr></thead>
    <tbody>
      ${RUBRICA.map(([c, tres, dos, uno]) => {
        const en = { 'Causa':'Cause', 'Eslogan':'Slogan', 'Imagen':'Image', 'Técnica':'Technique', 'Proceso':'Process' }[c];
        return `<tr><td><strong>${en}</strong><br><em style="font-size:.9em">${c}</em></td>
          <td>${tres}</td><td>${dos}</td><td>${uno}</td></tr>`;
      }).join('\n      ')}
    </tbody>
  </table>
  <p style="font-size:.9rem">The answer key (<em>carteles-claves</em>) covers the analysis pages.
  Everything from the pitch onward is open and is graded on the defense, not on agreeing with you.</p>` });

// ═════════════════════════════════════════════════════════════════════════════
//  Projector deck
// ═════════════════════════════════════════════════════════════════════════════
function buildDeck() {
  const S = [];
  const cover = (day, title, hook) => S.push({cls:'cover', day, html:
    `<div class="eyebrow">El taller de carteles · Día ${day} de 10</div>
     <h1>${title}</h1><p class="hook">${hook}</p>`});
  const beat = (day, eyebrow, head, paras, pull) => S.push({cls:'beat', day, html:
    `<div class="eyebrow">${eyebrow}</div><h2>${head}</h2>
     ${paras.map(p => `<p>${p}</p>`).join('')}
     ${pull ? `<div class="pull">${pull}</div>` : ''}`});
  const list = (day, eyebrow, head, items, note) => S.push({cls:'list', day, html:
    `<div class="eyebrow">${eyebrow}</div><h2>${head}</h2>
     <dl>${items.map(([l, t]) => `<dt>${l}</dt><dd>${t}</dd>`).join('')}</dl>
     ${note ? `<div class="pull">${note}</div>` : ''}`});
  const checks = (day, eyebrow, head, items, intro) => S.push({cls:'list', day, html:
    `<div class="eyebrow">${eyebrow}</div><h2>${head}</h2>
     ${intro ? `<p class="sm">${intro}</p>` : ''}
     <ul class="checks">${items.map(t => `<li>${t}</li>`).join('')}</ul>`});
  const act = (day, head, what, page) => S.push({cls:'act', day, html:
    `<div class="eyebrow">Manos a la obra</div><h2>${head}</h2><p>${what}</p>
     <div class="page">📄 Taller de carteles, ${page}</div>`});
  // One poster, big, with the question we ask of it.
  const uno = (day, id, eyebrow, pregunta) => { const c = byId(id); S.push({cls:'solo', day, html:
    `<div class="eyebrow">${eyebrow}</div>
     <div class="soloWrap">${svgCartel(c, c.color)}
       <div><h2>${c.titulo}</h2><p class="sm">${c.estilo}</p><div class="pull">${pregunta}</div></div>
     </div>`}); };
  const duo = (day, a, b, eyebrow, head, pie, rotulos = []) => S.push({cls:'duo', day, html:
    `<div class="eyebrow">${eyebrow}</div><h2>${head}</h2>
     <div class="duoWrap">
       ${[a, b].map((id, i) => { const c = byId(id); return `<figure>${svgCartel(c, c.color)}
         <figcaption>${rotulos[i] || c.lema}</figcaption></figure>`; }).join('')}
     </div>${pie ? `<p class="sm pie">${pie}</p>` : ''}`});

  // ── DÍA 1 ────────────────────────────────────────────────────────────────
  cover(1, 'El taller de carteles',
    'Diez días. Una causa tuya. Siete palabras y tres segundos para convencer a alguien.');

  beat(1, 'El trabajo nuevo', 'En el periódico no tomabas partido. Eso se acabó.', [
    'Una noticia informa y deja que el lector decida. Un cartel no: un cartel quiere que hagas algo, y tiene tres segundos para lograrlo.',
    'Primero vamos a desarmar carteles — los que te gustan y los que no. Después haces el tuyo, sobre algo en lo que de verdad crees, y se cuelga donde lo vea gente que no conoces.',
  ], '¿Quién pagó este cartel, y qué quiere que yo haga?');

  list(1, 'El calendario', 'Diez días',
    DIAS.map(([d, min, dia, paso, que]) => [`${d} · ${paso}${dia === 'Bloque' ? ' (bloque)' : ''}`, que]));

  list(1, 'Tres mensajes', 'Información, anuncio, propaganda', [
    ['Información', '«La fábrica abre a las seis.» No quiere nada de ti.'],
    ['Anuncio', '«Trabaja con nosotros: buen sueldo.» Quiere tu dinero o tu firma.'],
    ['Propaganda', '«¡El turno es nuestro!» Quiere que te sientas de un lado, y que actúes.'],
  ], 'No tiene que ser mentira. Casi siempre es una parte de la verdad, dicha muy fuerte.');

  duo(1, 'turno', 'fabrica', 'La huelga de las panaderías', 'El mismo pleito, dos carteles',
    'Misma semana, mismo puño, misma palabra: nosotros.',
    ['Lo pagó el sindicato', 'Lo pagó la empresa']);

  beat(1, 'Lo que hay que ver', 'El dibujo es casi igual. Lo que cambia es quién pagó la imprenta.', [
    'Los dos ponen a un obrero grande, visto desde abajo, donde nadie está cansado.',
    'Los dos dicen «nosotros» — pero el «nosotros» del sindicato son las trabajadoras, y el de la empresa incluye al dueño.',
  ], 'La misma herramienta sirve para pedir ocho horas y para pedir que nadie pare la máquina.');

  act(1, 'Lee y compara',
    'Lee la página 2 y subraya la diferencia entre información, anuncio y propaganda. Después llena la tabla de los dos carteles y contesta cuál te convenció más.',
    'pp. 2–3');

  // ── DÍA 2 ────────────────────────────────────────────────────────────────
  cover(2, 'La caja de herramientas', 'Con nombre se ven. Sin nombre funcionan.');

  list(2, 'Las nueve técnicas', 'Nómbralas', TECNICAS.slice(0, 5).map(([n, , d]) => [n, d]));
  list(2, 'Las nueve técnicas', 'Nómbralas (2)', TECNICAS.slice(5).map(([n, , d]) => [n, d]));

  uno(2, 'boicot', 'Caza de técnicas', '¿Qué técnicas ves? ¿Qué te pide hacer, hoy, antes de comprar?');
  uno(2, 'necesitamos', 'Caza de técnicas', '¿A quién mira? ¿Por qué el dedo se siente dirigido a ti?');

  beat(2, 'Antes de juzgar', 'Ninguna técnica es mala por sí sola.', [
    'Un cartel de vacunas y un cartel de guerra usan exactamente las mismas nueve. Lo que cambia es para qué, y quién gana.',
  ], 'Tú las vas a usar también. La diferencia es que tú vas a saber cuáles usaste.');

  act(2, 'Caza de técnicas', 'Llena la tabla de las nueve técnicas con dónde has visto cada una. Después marca las técnicas de los dos carteles y copia la prueba exacta.', 'pp. 4–5');

  // ── DÍA 3 · BLOQUE ───────────────────────────────────────────────────────
  cover(3, 'Taller 1', 'Ochenta minutos: dos pares de carteles, tu causa y tres bocetos.');

  duo(3, 'agua', 'compra', 'Las mismas herramientas', 'Uno quiere que tomes agua. El otro quiere tu dinero.',
    'Mandato, repetición y un número. Los dos. ¿Por qué uno nos parece bien y el otro no?',
    ['Salud pública', 'Anuncio comercial']);

  beat(3, 'El dato', 'Un número suena a prueba. A veces lo es.', [
    '«8 de cada 10 llegan sin tomar agua» se puede comprobar: se cuenta, se pregunta, se mide.',
    '«Todos lo tienen» no se puede comprobar, y por eso se usa tanto.',
  ], 'Cuando veas un número en un cartel, pregúntate quién lo contó.');

  uno(3, 'parque', 'Hoy', 'Los carteles ya no se pegan en la pared: se deslizan. ¿Cuál es el número, y quién lo contó?');

  checks(3, 'Tu causa', 'La prueba del cartel', PRUEBA,
    'Escoge dos ideas. La que pase las cinco preguntas es la que vas a dibujar durante dos semanas, así que escoge una que te importe.');

  act(3, 'Escoge tu causa',
    'Compara los dos pares. Contesta lo de tu propio teléfono. Después llena los seis recuadros de ideas, pasa tus dos mejores por la prueba y haz tres bocetos de un minuto antes de salir.',
    'pp. 6–8');

  // ── DÍA 4 ────────────────────────────────────────────────────────────────
  cover(4, 'Tu causa', 'Nadie imprime sin permiso.');

  beat(4, 'La propuesta', 'Hoy me convences a mí primero.', [
    'Tu causa en una oración, por qué te importa a ti, a quién le hablas, qué quieres que haga esa persona, un dato, y el símbolo que podrías usar.',
    'Te la regreso aprobada, aprobada con cambios, o «busca otra causa». Eso último no es castigo: pasa en cualquier taller.',
  ]);

  list(4, 'Lo que hunde una propuesta', 'Tres maneras de atorarse', [
    ['Una creencia sin acción', '«Parar el racismo» es una creencia. ¿Qué hace el lector esta semana? Firma, pregunta, trae, apaga, ven.'],
    ['Una causa de nadie', 'Si no la puedes decir en siete palabras, todavía no es una causa: son tres.'],
    ['Un símbolo que hay que explicar', 'Si tienes que explicarlo, en el pasillo no vas a estar tú para hacerlo.'],
  ]);

  act(4, 'La propuesta', 'Llena la propuesta completa y escoge a tu público: una persona real, no «toda la escuela».', 'p. 9');

  // ── DÍA 5 ────────────────────────────────────────────────────────────────
  cover(5, 'El eslogan', 'Siete palabras o menos. Casi siempre, un mandato.');

  S.push({cls:'list', day:5, html:
    `<div class="eyebrow">Mandatos</div><h2>La misma orden, tres públicos</h2>
     <table class="mand">
       <tr><th></th><th>a un compañero</th><th>a un adulto</th><th>a todos</th></tr>
       ${MANDATOS.map(([v, tu, ud, nos]) =>
         `<tr><td class="v">${v}</td><td class="hit">${tu}</td><td>${ud}</td><td>${nos}</td></tr>`).join('')}
     </table>`});

  beat(5, 'El acento del mandato', 'Cuando le pegas un pronombre, la palabra pide acento.', [
    'cuida → <b>cuídalo</b> · apaga → <b>apágala</b> · une → <b>únete</b> · firma → <b>fírmala</b>',
    'Dilo en voz alta: el golpe de la voz no se movió. La palabra creció, y por eso ahora el acento se escribe.',
  ], 'En negativo, el pronombre se va adelante y el acento se cae: ¡No te calles!');

  checks(5, 'Tu eslogan', 'Lo que tiene que cumplir', [
    'Siete palabras o menos',
    'Por lo menos tres de tus cinco empiezan con un mandato',
    'Uno de los cinco le habla de usted',
    'Se entiende sin leer el resto del cartel',
  ]);

  act(5, 'Escribe cinco', 'Cinco eslóganes para tu causa. Después encierra el mejor y cópialo con sus acentos y sus signos.', 'p. 10');

  // ── DÍA 6 ────────────────────────────────────────────────────────────────
  cover(6, 'La imagen', 'Un símbolo. Un foco. Tres segundos.');

  uno(6, 'luz', 'El modelo', 'Lo hizo una estudiante con tres marcadores. Un foco, letras gruesas, y un dato chiquito abajo.');

  list(6, 'Las cuatro razones', 'Por qué ese cartel funciona', [
    ['Un símbolo', 'Un foco. No un foco, un salón, un recibo y un planeta.'],
    ['Un foco visual', 'Lo más importante es lo más grande, y está en el centro.'],
    ['Letras de lejos', 'Gruesas, derechas, pocas. Se leen desde el otro lado del pasillo.'],
    ['Un dato chiquito', 'Abajo, para quien se acerque. No compite con el eslogan.'],
  ]);

  act(6, 'Tu composición', 'Escoge tu símbolo, practica las letras gruesas y haz las tres composiciones: símbolo arriba, letras arriba, símbolo gigante.', 'p. 11');

  // ── DÍA 7 · BLOQUE ───────────────────────────────────────────────────────
  cover(7, 'Taller 2', 'Ochenta minutos y un lápiz. El cartel completo.');

  checks(7, 'El borrador', 'Todo esto tiene que estar hoy', [
    'El eslogan, con sus acentos',
    'El símbolo, grande',
    'El dato, chiquito',
    'La llamada: qué hace el lector',
    'Tu firma de autor, abajo a la derecha',
  ], 'A lápiz, para poder borrar. A la media hora paramos todos y alguien más lo ve.');

  act(7, 'Borrador a lápiz', 'Dibuja el cartel completo en la página 12 y contesta las cuatro casillas de abajo: eslogan, símbolo, qué quieres que hagan y tus dos técnicas.', 'p. 12');

  // ── DÍA 8 ────────────────────────────────────────────────────────────────
  cover(8, 'La prueba de tres segundos', 'Nadie se para a estudiar un cartel.');

  list(8, 'Cómo se hace', 'Tres segundos y se tapa', [
    ['Enseña', 'Le muestras tu borrador a un compañero tres segundos. Se tapa.'],
    ['Pregunta', 'Él contesta de memoria: qué vio, de qué trata, qué le pide, qué palabra se le quedó.'],
    ['Apunta', 'Tú no discutes ni explicas. Sólo escribes lo que te dijo.'],
  ], 'Si no vio lo que querías, el problema es del cartel, no de sus ojos.');

  checks(8, 'Plan de cambios', 'Tres cambios concretos', [
    'Qué se hace más grande',
    'Qué se quita',
    'Qué se mueve de lugar',
  ], '«Hacerlo mejor» no es un cambio. «Poner el eslogan arriba y el foco más grande» sí lo es.');

  act(8, 'La prueba', 'Haz la prueba con dos personas distintas si alcanza el tiempo. Llena la tabla y escribe tus tres cambios.', 'p. 13');

  // ── DÍA 9 ────────────────────────────────────────────────────────────────
  cover(9, 'Taller 3', 'La versión final. Con color.');

  list(9, 'Antes de entregar', 'La lista del cierre', [
    ['Color', 'Marcadores o colores. El símbolo primero; el fondo, al final.'],
    ['Letras', 'Marca el contorno, luego engrosa. Nunca escribas directo con el marcador grueso.'],
    ['Acentos', 'Revisa el eslogan otra vez. En letras grandes, un acento que falta se ve a tres metros.'],
    ['Tu firma', 'Chiquita, abajo a la derecha. Es tuyo.'],
  ]);

  act(9, 'Cartel final', 'La versión final en la página 14, con los tres cambios que escribiste ayer.', 'p. 14');

  // ── DÍA 10 ───────────────────────────────────────────────────────────────
  cover(10, 'La defensa', 'Hoy explicas lo que hiciste, y haces el cartel del otro lado.');

  list(10, 'La defensa escrita', 'Entre 80 y 120 palabras, y contesta cuatro cosas', [
    ['Tu causa', 'De qué trata y por qué te importa a ti.'],
    ['Tu público', 'A quién le hablas, en persona, no «a todos».'],
    ['Tus técnicas', 'Dos, con nombre, de las nueve.'],
    ['Tu símbolo', 'Por qué ése y no otro.'],
  ]);

  beat(10, 'El contracartel', 'Ahora el otro lado, y en serio.', [
    'Alguien no está de acuerdo contigo y tiene dinero para imprimir. Con las mismas nueve técnicas, ¿qué cartel haría contra el tuyo?',
    'Escribe el eslogan que de verdad golpearía tu causa — no uno débil para quedar bien.',
  ], 'Las herramientas no tienen lado. El que las conoce, las ve venir.');

  act(10, 'Defensa, contracartel y reflexión',
    'Escribe tu defensa, haz el contracartel, contesta la reflexión y califícate con la tabla. Después colgamos los carteles.',
    'pp. 15–16');

  S.push({cls:'closer', day:10, html:
    `<h2>Tu cartel se queda colgado.</h2>
     <p class="hook">Alguien que no conoces va a pasar por el pasillo, lo va a ver tres segundos y va
     a pensar en tu causa. Eso es todo el oficio.</p>`});

  return deckHTML(S, 'El taller de carteles — Presentación | La Corresponsal',
    'El taller de carteles', DECK_CSS);
}

const DECK_CSS = `
ul.checks{list-style:none}
ul.checks li{font-size:clamp(1rem,1.85vw,1.45rem);line-height:1.4;padding:.45rem 0 .45rem 2.2rem;
  border-bottom:1px solid var(--cream-dk);position:relative}
ul.checks li::before{content:'☐';position:absolute;left:0;color:var(--terracotta)}
.duoWrap{display:grid;grid-template-columns:1fr 1fr;gap:1.6rem;align-items:start}
.duoWrap svg,.soloWrap svg{display:block;width:100%;height:auto;max-height:58vh;
  border:1px solid var(--ink-lt);box-shadow:0 6px 20px rgba(0,0,0,.18)}
.duoWrap figcaption{font-family:sans-serif;font-weight:700;text-transform:uppercase;
  letter-spacing:.1em;font-size:clamp(.72rem,1.2vw,1rem);color:var(--ink-lt);margin-top:.5rem;text-align:center}
p.sm.pie{margin-top:1rem;max-width:none;text-align:center}
.soloWrap{display:grid;grid-template-columns:minmax(0,34%) 1fr;gap:2rem;align-items:center}
.soloWrap svg{max-height:66vh}
.solo h2{margin-bottom:.3rem}
table.mand{width:100%;border-collapse:collapse;font-size:clamp(.85rem,1.5vw,1.25rem)}
table.mand th{font-family:sans-serif;font-size:.62em;text-transform:uppercase;letter-spacing:.14em;
  color:var(--ink-lt);text-align:left;padding:.2rem .6rem;font-weight:700}
table.mand td{padding:.3rem .6rem;border-bottom:1px solid var(--cream-dk)}
table.mand td.v{font-style:italic;color:var(--ink-lt)}
table.mand td.hit{font-weight:700;color:var(--terracotta)}
@media (max-width:760px){.duoWrap,.soloWrap{grid-template-columns:1fr}}
@media print{.duoWrap svg,.soloWrap svg{box-shadow:none}}
`;

// ── Write ─────────────────────────────────────────────────────────────────────
function doc(title, body, label, en = false) {
  return `<!DOCTYPE html>
<html lang="${en ? 'en' : 'es'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="_hoja.css">
</head>
<body>
<div class="noprint">
  <button onclick="window.print()">🖨️ ${label}</button>
  <a href="../maestra.html">${en ? '← Back to dashboard' : '← Volver al panel'}</a>
  <div style="margin-top:.5rem;font-size:.8rem;color:#444">${en
    ? 'When printing, set <strong>Margins: None</strong> and turn off headers and footers.'
    : 'Al imprimir, pon <strong>Márgenes: Ninguno</strong> y desactiva «Encabezados y pies de página».'}</div>
</div>
${body}
</body>
</html>
`;
}

writeFileSync(join(OUT, 'carteles.html'),
  doc('El taller de carteles | La Corresponsal',
      render(PAGES, 'La Corresponsal · El taller de carteles'),
      `Imprimir las ${PAGES.length} páginas`), 'utf8');

writeFileSync(join(OUT, 'carteles-maestra.html'),
  doc('Teacher Guide — Poster Unit | La Corresponsal',
      render(TEACHER, 'Poster unit · Teacher Guide', true),
      `Print the guide (${TEACHER.length} pages)`, true), 'utf8');

writeFileSync(join(OUT, 'carteles-claves.html'),
  doc('Clave — El taller de carteles | La Corresponsal',
      render(KEY, 'El taller de carteles · Clave'),
      `Imprimir la clave (${KEY.length} páginas)`), 'utf8');

writeFileSync(join(__dirname, 'carteles-presentacion.html'), buildDeck(), 'utf8');

console.log(`carteles.html           ${PAGES.length} páginas`);
console.log(`carteles-maestra.html    ${TEACHER.length} páginas`);
console.log(`carteles-claves.html     ${KEY.length} páginas`);
console.log(`carteles-presentacion.html  deck · ${CARTELES.length} carteles`);
