// build-periodico.mjs — the two-week school-newspaper unit.
//
// Students stop reporting on distant places and report on their own school: pick
// a story, plan and conduct a real interview, choose or draw an image, and take
// the article through drafts to a print-ready page. Everything the weekly packets
// taught — the quote, the figure, the lead, the senses, the context, the
// inverted pyramid — is used here on a real story.
//
// Outputs:
//   hojas/periodico.html          student packet (ten class days)
//   hojas/periodico-maestra.html  teacher guide: day plan, rubric, practical notes
//   periodico-presentacion.html   projector deck, day by day (shares deck-shell.mjs)
//
// Shares _hoja.css with the weekly packets. Run: node build-periodico.mjs
import { writeFileSync } from 'fs';
import { deckHTML } from './deck-shell.mjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'hojas');

const lines = n => `<div class="lines">${'<div></div>'.repeat(n)}</div>`;
const namebar = () =>
  `<div class="namebar"><span>Nombre: </span><span>Período: </span><span>Fecha: </span></div>`;
const blanks = (label, h = '.34in') =>
  `<tr><td style="width:34%"><strong>${label}</strong></td><td class="blank" style="height:${h}"></td></tr>`;

let pageNo = 0;
const PAGES = [];
function page(meta, body) {
  pageNo++;
  PAGES.push({ meta, body, n: pageNo });
}
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

// The ten days, used on the cover tracker and in the teacher guide so the two
// never disagree about what happens when.
const DIAS = [
  ['1', 'La noticia por dentro',     'Leer una noticia modelo y encontrar sus partes', 'pp. 2–3'],
  ['2', 'Encuentra tu historia',     'Lluvia de ideas y propuesta a la editora',       'pp. 4–5'],
  ['3', 'Planea la entrevista',      'Escoger fuente, pedir la entrevista, preguntas', 'p. 6'],
  ['4', 'La entrevista',             'Entrevistar y anotar citas y datos exactos',     'p. 7'],
  ['5', 'La imagen',                 'Buscar o dibujar la imagen, pie de foto, crédito','p. 8'],
  ['6', 'El esqueleto',              'Ordenar la información y escribir la entrada',   'p. 9'],
  ['7', 'Primer borrador',           'Escribir la nota completa',                      'p. 10'],
  ['8', 'Edición entre compañeros',  'Editar la nota de alguien más, recibir la tuya', 'p. 11'],
  ['9', 'Segundo borrador',          'Reescribir con lo que te dijeron',               'pp. 12–13'],
  ['10','Al cierre',                 'Versión final para imprimir y reflexión',        'pp. 14–15'],
];

// One list, two surfaces: everything below is rendered into both the paper
// packet and the projector deck (periodico-presentacion.html), so what the class
// sees on the screen is word for word what is on their page.
const MODELO = {
  kicker: 'Comunidad',
  titular: 'La cafetería cambia el menú y los estudiantes votan por la comida',
  firma: 'Por Daniela Ortiz, corresponsal de 10.º grado',
  parrafos: [
    `Por primera vez, los estudiantes decidieron qué se sirve en la
      cafetería. Durante dos semanas, más de cuatrocientos alumnos votaron entre doce platillos, y
      los tres ganadores ya están en el menú de los martes.`,
    `La idea fue de la señora Rosa Méndez, que trabaja en la cafetería desde
      hace once años. «Veía los platos regresar casi llenos», dijo. «Pensé que si ellos escogían,
      iban a comer.»`,
    `Los platillos que ganaron fueron el arroz con frijoles, los tacos de
      pollo y la sopa de fideo. La sopa ganó por sólo nueve votos.`,
    `Según la señora Méndez, desde que empezó el nuevo menú se tira casi la
      mitad de comida que antes. Marcos Lee, estudiante de 11.º grado, votó por los tacos.
      «La comida sabe a casa», dijo. «Antes ni entraba a la cafetería.»`,
    `La cafetería piensa repetir la votación cada semestre. La próxima será
      en enero.`,
  ],
};

const PARTES = [
  ['El titular', 'Dice la noticia en una línea', ''],
  ['La firma', 'Dice quién la escribió', ''],
  ['La entrada', 'Engancha al lector con lo más importante', '.5in'],
  ['La cita directa', 'La voz de una persona, entre comillas', '.5in'],
  ['El dato', 'Un número exacto que lo comprueba', ''],
  ['El contexto', 'Por qué le importa al lector', '.5in'],
  ['El cierre', 'Qué pasa después', ''],
];

const SEIS = ['¿Qué pasó?', '¿Quién?', '¿Cuándo?', '¿Dónde?', '¿Por qué?', '¿Cómo?'];

const IDEAS = [
  'Algo que cambió o es nuevo', 'Una persona que nadie conoce y debería',
  'Un problema que alguien está arreglando', 'Un evento que se acerca o que pasó',
  'Algo de la cultura de nuestra comunidad', 'Una pregunta que todos se hacen',
];

const PRUEBA = [
  '¿Es de nuestra escuela o comunidad?',
  '¿Hay alguien a quien puedo entrevistar esta semana?',
  '¿Puedo conseguir por lo menos un dato con número?',
  '¿A mis compañeros les importaría leerla?',
];

const SEGUIMIENTO = ['¿Qué quiere decir con…?', '¿Me da un ejemplo?',
  '¿Y qué pasó después?', '¿Por qué cree que…?'];

const CAMINOS = [
  ['Foto propia', `Tómala tú o con la cámara del anuario. Si
        sale una persona, pídele permiso antes. Nunca fotografíes a alguien que te dijo que no.`],
  ['Imagen de internet', `Sólo de sitios con imágenes libres, como
        <em>Wikimedia Commons</em>, <em>Unsplash</em> o <em>Pixabay</em>. No sirve «la primera que
        salió en Google»: casi todas tienen dueño. Siempre se da crédito.`],
  ['Dibujo', `Tú lo haces, a mano. Muchos periódicos usan
        ilustraciones. El crédito dice «Ilustración: tu nombre».`],
];

const ESQUELETO = [
  ['1 · Lo más importante', '.55in'],
  ['2 · Quién, dónde y cuándo', '.55in'],
  ['3 · La mejor cita (de tu libreta)', '.55in'],
  ['4 · El dato con número', '.45in'],
  ['5 · Por qué le importa al lector', '.55in'],
  ['6 · El cierre: qué pasa después', '.45in'],
];

const PIEZAS = [
  'Una entrada que engancha, no que anuncia',
  'Quién, qué, cuándo y dónde en el primer párrafo',
  'Por lo menos una cita directa entre comillas',
  'Por lo menos un dato con número',
  'Una razón clara de por qué me importa',
  'Un cierre que dice qué pasa después',
];

const ESTILO = [
  'Las preguntas llevan <strong>¿</strong> al principio y <strong>?</strong> al final',
  'Las citas van entre comillas «así» o "así"',
  'Los verbos en pasado llevan acento: <em>habló, llegó, decidió</em>',
  '<em>Qué, cómo, dónde, cuándo, por qué</em> llevan acento cuando preguntan',
  'Los nombres de personas y lugares empiezan con mayúscula',
  'Busqué en el diccionario por lo menos tres palabras de las que dudé',
];

// ─────────────────────────────────────────────────────────────────────────────
//  1 · Portada y calendario
// ─────────────────────────────────────────────────────────────────────────────
page('Proyecto · Dos semanas<br>Portada', `
  ${namebar()}
  <h1>Nuestra propia edición</h1>
  <div class="sub">Dos semanas para escribir una noticia de verdad</div>

  <div class="nota">
    <div class="kicker">Nota de la jefa de redacción</div>
    <div class="lectura" style="font-size:1rem">
      <p>Hasta ahora has escrito sobre Oaxaca, sobre un lago en Guatemala, sobre un arrecife en
      Honduras. Historias de otros lugares, contadas por gente de ahí.</p>
      <p>Ahora te toca contar la de aquí. En dos semanas vas a escoger una historia de esta
      escuela o de tu comunidad, entrevistar a una persona real, conseguir la imagen y escribir
      una nota que se va a imprimir en el periódico de la escuela, en español, con tu nombre.</p>
      <p>No la vas a escribir de una vez. Nadie en un periódico lo hace. La vas a escribir,
      alguien la va a leer, la vas a mejorar, y otra vez. Así se hace.</p>
    </div>
  </div>

  <h2>Tu calendario</h2>
  <div class="instr">Tu maestra firma cada paso cuando lo termines. No puedes pasar al siguiente
  sin la firma: así nadie llega al día 10 sin entrevista.</div>
  <table>
    <thead><tr><th style="width:8%">Día</th><th style="width:30%">Paso</th>
      <th style="width:38%">Qué haces</th><th style="width:10%">Hoja</th><th style="width:14%">Firma</th></tr></thead>
    <tbody>
      ${DIAS.map(([d, p, q, h]) =>
        `<tr><td>${d}</td><td><strong>${p}</strong></td><td>${q}</td><td>${h}</td><td></td></tr>`).join('\n      ')}
    </tbody>
  </table>`);

// ─────────────────────────────────────────────────────────────────────────────
//  2 · Una noticia modelo
// ─────────────────────────────────────────────────────────────────────────────
page('Día 1<br>La noticia por dentro', `
  ${namebar()}
  <h1>Una noticia de nuestra escuela</h1>
  <div class="sub">Día 1 — Lee la nota modelo</div>

  <div class="instr">Esta nota la escribió un estudiante de otra escuela. Léela dos veces. En la
  próxima hoja vas a encontrar sus partes.</div>

  <div class="nota">
    <div class="kicker">${MODELO.kicker}</div>
    <h3>${MODELO.titular}</h3>
    <div class="byline">${MODELO.firma}</div>
    <div class="lectura">
      ${MODELO.parrafos.map((p, i) => `<p><b class="pn">${i + 1}</b>${p}</p>`).join('\n      ')}
    </div>
  </div>

  <h2>Primera lectura</h2>
  <div class="instr">¿De qué trata la nota? Explícalo en una sola oración, como si se lo contaras a
  alguien en el pasillo.</div>
  ${lines(2)}
  <div class="instr">¿Qué dato te hizo creer que la historia era verdad?</div>
  ${lines(2)}`);

// ─────────────────────────────────────────────────────────────────────────────
//  3 · Las partes de una noticia
// ─────────────────────────────────────────────────────────────────────────────
page('Día 1<br>Las partes', `
  ${namebar()}
  <h1>Las partes de una noticia</h1>
  <div class="sub">Día 1 — Encuéntralas en la nota modelo</div>

  <div class="instr">Toda noticia tiene estas piezas. Ya las practicaste en las semanas pasadas.
  Busca cada una en la nota de la cafetería y copia un ejemplo.</div>

  <table>
    <thead><tr><th style="width:18%">Parte</th><th style="width:30%">Para qué sirve</th>
      <th style="width:52%">Ejemplo de la nota (cópialo)</th></tr></thead>
    <tbody>
      ${PARTES.map(([p, s, h]) =>
        `<tr><td><strong>${p}</strong></td><td>${s}</td><td class="blank"${h ? ` style="height:${h}"` : ''}></td></tr>`).join('\n      ')}
    </tbody>
  </table>

  <h2>Las seis preguntas</h2>
  <div class="instr">Una buena noticia contesta estas seis. Contéstalas para la nota de la
  cafetería. Si alguna no se contesta, escribe «no aparece».</div>
  <table>
    <tbody>
      ${SEIS.map(q => blanks(q)).join('\n      ')}
    </tbody>
  </table>`);

// ─────────────────────────────────────────────────────────────────────────────
//  4 · Lluvia de ideas
// ─────────────────────────────────────────────────────────────────────────────
page('Día 2<br>Encuentra tu historia', `
  ${namebar()}
  <h1>Encuentra tu historia</h1>
  <div class="sub">Día 2 — Las buenas historias están cerca</div>

  <div class="instr">Una noticia no tiene que ser enorme. Tiene que ser <strong>nueva</strong>,
  <strong>verdadera</strong> y <strong>de aquí</strong>. Piensa en tu escuela y tu barrio. Anota
  por lo menos dos ideas en cada sección.</div>

  <div class="two">
    ${[IDEAS.slice(0, 3), IDEAS.slice(3)].map(col => `<div>
      ${col.map(t => `<div class="box" style="min-height:1.25in"><div class="lbl">${t}</div></div>`).join('\n      ')}
    </div>`).join('\n    ')}
  </div>

  <div class="tip"><strong>Ideas para empezar:</strong> un club nuevo, un maestro que se jubila,
  el equipo que va ganando, la señora de la cafetería, una tradición del Día de Muertos en la
  escuela, por qué no sirven los bebederos del segundo piso, un negocio de la familia de alguien,
  un estudiante que llegó de otro país este año.</div>

  <h2>La prueba de la noticia</h2>
  <div class="instr">Escoge tus dos mejores ideas y pásalas por la prueba. Marca con ✓.</div>
  <table>
    <thead><tr><th style="width:46%">Pregunta</th><th style="width:27%">Idea 1</th><th style="width:27%">Idea 2</th></tr></thead>
    <tbody>
      ${PRUEBA.map(q => `<tr><td>${q}</td><td></td><td></td></tr>`).join('\n      ')}
    </tbody>
  </table>`);

// ─────────────────────────────────────────────────────────────────────────────
//  5 · La propuesta
// ─────────────────────────────────────────────────────────────────────────────
page('Día 2<br>La propuesta', `
  ${namebar()}
  <h1>Propón tu historia</h1>
  <div class="sub">Día 2 — En un periódico nadie escribe sin permiso de la editora</div>

  <div class="instr">Llena la propuesta con la idea que más pasó la prueba. Tu maestra la aprueba
  o te pide cambios antes de que salgas a entrevistar.</div>

  <table>
    <tbody>
      ${blanks('Mi historia en una oración', '.55in')}
      ${blanks('Sección del periódico')}
      ${blanks('¿Por qué es noticia ahora?', '.5in')}
      ${blanks('¿A quién voy a entrevistar?')}
      ${blanks('Plan B si no puedo entrevistar a esa persona')}
      ${blanks('Un dato que puedo conseguir', '.45in')}
      ${blanks('¿Qué imagen podría acompañarla?', '.45in')}
    </tbody>
  </table>

  <div class="instr">Sección (encierra una): Comunidad · Cultura · Deportes · Escuela · Opinión ·
  Personas · Medio ambiente</div>

  <h2>Tu titular de trabajo</h2>
  <div class="instr">Un titular provisional. Seguramente va a cambiar; sirve para no perder el rumbo.</div>
  ${lines(1)}

  <div class="box" style="margin-top:.6rem">
    <div class="lbl">Sólo para la editora</div>
    <p style="font-size:.9rem">☐ Aprobada tal como está &nbsp;&nbsp; ☐ Aprobada con cambios
    &nbsp;&nbsp; ☐ Busca otra idea</p>
    <div class="lines" style="margin-top:.2rem"><div></div><div></div></div>
    <p style="font-size:.85rem;margin-top:.3rem">Firma: ____________________________</p>
  </div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  6 · Planea la entrevista
// ─────────────────────────────────────────────────────────────────────────────
page('Día 3<br>Planea la entrevista', `
  ${namebar()}
  <h1>Planea tu entrevista</h1>
  <div class="sub">Día 3 — La entrevista se gana antes de empezar</div>

  <h2>1 · Pide la entrevista</h2>
  <div class="instr">Pídela en persona o por escrito. Si tu fuente no habla español, entrevístala en
  inglés y traduce sus palabras a español al escribir — eso lo hacen los corresponsales todo el tiempo.</div>
  <div class="box" style="padding:.45rem .6rem">
    <p style="font-size:.92rem">«Buenos días, me llamo __________________ y escribo para el
    periódico en español de la escuela. Estoy haciendo una nota sobre ___________________________
    y me gustaría hacerle unas preguntas. Son diez minutos. ¿Tiene tiempo el ______________ a
    las __________? ¿Me permite usar su nombre y sus palabras en la nota?»</p>
  </div>
  <table>
    <tbody>
      ${blanks('Mi fuente (nombre y puesto)')}
      ${blanks('Día, hora y lugar acordados')}
      ${blanks('¿Aceptó que use su nombre?')}
    </tbody>
  </table>

  <h2>2 · Tus preguntas</h2>
  <div class="instr">Las preguntas cerradas se contestan con «sí» o «no» y no dan citas.
  Las abiertas empiezan con <em>cómo, por qué, qué pasó cuando, cuénteme</em>.
  Escribe seis abiertas.</div>
  <div class="tip">Cerrada: «¿Le gusta su trabajo?» → «Sí.» &nbsp;·&nbsp;
  Abierta: «¿Cómo fue su primer día aquí?» → una historia.</div>
  <ol class="q" style="font-size:.93rem">
    ${Array.from({ length: 6 }, () => `<li>${lines(1)}</li>`).join('')}
  </ol>

  <h2>3 · La pregunta de seguimiento</h2>
  <div class="instr">No la puedes escribir ahora: la vas a inventar en el momento, cuando la
  respuesta te sorprenda. Hoy sólo escribe cómo vas a empezarla.</div>
  <div class="wordbank">${SEGUIMIENTO.join(' &nbsp;·&nbsp; ')}</div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  7 · La libreta de entrevista
// ─────────────────────────────────────────────────────────────────────────────
page('Día 4<br>La libreta', `
  ${namebar()}
  <h1>La libreta de entrevista</h1>
  <div class="sub">Día 4 — Llévala contigo y escribe mientras escuchas</div>

  <div class="instr">No trates de escribir todo. Escribe <strong>palabras clave</strong> y copia
  <strong>exactas</strong> sólo las frases que quieras citar. Si no alcanzaste a copiar una frase,
  pídele a la persona que la repita: «¿Me lo repite, por favor? Quiero citarlo bien.»</div>

  <table>
    <tbody>
      ${blanks('Fuente, puesto y fecha')}
    </tbody>
  </table>

  <h2>Notas de lo que dijo</h2>
  ${lines(9)}

  <h2>Citas exactas</h2>
  <div class="instr">Entre comillas, palabra por palabra. Si la dijo en inglés, escríbela en
  inglés aquí; la traduces al escribir la nota.</div>
  <table>
    <tbody>
      <tr><td style="width:6%"><strong>1</strong></td><td class="blank" style="height:.48in"></td></tr>
      <tr><td><strong>2</strong></td><td class="blank" style="height:.48in"></td></tr>
      <tr><td><strong>3</strong></td><td class="blank" style="height:.48in"></td></tr>
    </tbody>
  </table>

  <h2>Datos y números</h2>
  <table>
    <tbody>
      <tr><td style="width:6%"><strong>1</strong></td><td class="blank"></td></tr>
      <tr><td><strong>2</strong></td><td class="blank"></td></tr>
    </tbody>
  </table>

  <h2>Mi pregunta de seguimiento, y lo que contestó</h2>
  ${lines(2)}`);

// ─────────────────────────────────────────────────────────────────────────────
//  8 · La imagen
// ─────────────────────────────────────────────────────────────────────────────
page('Día 5<br>La imagen', `
  ${namebar()}
  <h1>La imagen de tu nota</h1>
  <div class="sub">Día 5 — Una imagen se lee antes que el titular</div>

  <div class="instr">Tienes tres caminos. Escoge uno.</div>
  <table>
    <thead><tr><th style="width:24%">Camino</th><th style="width:76%">Reglas</th></tr></thead>
    <tbody>
      ${CAMINOS.map(([c, r]) => `<tr><td><strong>☐ ${c}</strong></td><td>${r}</td></tr>`).join('\n      ')}
    </tbody>
  </table>

  <h2>Tu imagen</h2>
  <div class="two">
    <div>
      <div class="box" style="height:2.3in;display:flex;align-items:flex-end;justify-content:center">
        <span class="sans" style="font-size:.6rem;color:#5a5a5a">haz un boceto de tu imagen</span>
      </div>
    </div>
    <div>
      <table>
        <tbody>
          <tr><td><strong>¿Qué se ve?</strong><br><br><br></td></tr>
          <tr><td><strong>¿Por qué ésta y no otra?</strong><br><br><br></td></tr>
          <tr><td><strong>Si es de internet: sitio y autor</strong><br><br></td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <h2>El pie de foto</h2>
  <div class="instr">Una o dos oraciones debajo de la imagen. Dice quién o qué se ve, y dónde.
  No repite el titular.</div>
  <div class="tip">Ejemplo: <em>La señora Rosa Méndez sirve la sopa de fideo, el platillo que ganó
  por nueve votos.</em> &nbsp;— Foto: Daniela Ortiz</div>
  ${lines(2)}
  <div class="instr">Crédito: &nbsp;Foto / Imagen / Ilustración: ______________________________</div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  9 · El esqueleto
// ─────────────────────────────────────────────────────────────────────────────
page('Día 6<br>El esqueleto', `
  ${namebar()}
  <h1>Arma el esqueleto</h1>
  <div class="sub">Día 6 — Lo más importante va primero</div>

  <div class="instr">Antes de escribir, ordena lo que tienes. Usa la pirámide invertida: lo más
  fuerte arriba, los detalles abajo. Escribe sólo palabras clave, no oraciones completas.</div>

  <table>
    <tbody>
      ${ESQUELETO.map(([l, h]) => blanks(l, h)).join('\n      ')}
    </tbody>
  </table>

  <h2>Tres entradas</h2>
  <div class="instr">Escribe tres primeras oraciones distintas. Ninguna puede empezar con «Este
  artículo trata de…». Después encierra la mejor.</div>
  <ol class="q" style="font-size:.93rem">
    <li>Con un dato: ${lines(2)}</li>
    <li>Con una persona: ${lines(2)}</li>
    <li>Con un contraste o una sorpresa: ${lines(2)}</li>
  </ol>`);

// ─────────────────────────────────────────────────────────────────────────────
//  10 · Primer borrador
// ─────────────────────────────────────────────────────────────────────────────
page('Día 7<br>Primer borrador', `
  ${namebar()}
  <h1>Primer borrador</h1>
  <div class="sub">Día 7 — Escribe sin borrar</div>

  <div class="instr">Sigue tu esqueleto. Entre 150 y 250 palabras. Escribe en renglón por medio
  (deja una línea libre entre cada una) para que tu editor tenga dónde escribir. No te detengas a
  corregir la ortografía: eso viene después.</div>

  <table>
    <tbody>
      ${blanks('Titular de trabajo')}
    </tbody>
  </table>
  ${lines(28)}
  <div class="instr" style="margin-top:.3rem">Número aproximado de palabras: ________</div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  11 · Edición entre compañeros
// ─────────────────────────────────────────────────────────────────────────────
page('Día 8<br>Edición entre compañeros', `
  ${namebar()}
  <h1>Edita a un compañero</h1>
  <div class="sub">Día 8 — El editor trabaja para el que escribe</div>

  <div class="instr">Hoy lees el primer borrador de otra persona. Tu trabajo no es corregirle el
  español: acuérdate de la norma, <em>aquí no se corrige el español de nadie</em>. Tu trabajo es
  ayudar a que su nota se entienda y se lea con ganas.</div>

  <table>
    <tbody>
      ${blanks('Edité la nota de')}
    </tbody>
  </table>

  <h2>1 · Revisa las piezas</h2>
  <table>
    <thead><tr><th style="width:62%">¿La nota tiene…?</th><th style="width:12%">Sí</th>
      <th style="width:26%">Si no, ¿qué sugieres?</th></tr></thead>
    <tbody>
      ${PIEZAS.map(q => `<tr><td>${q}</td><td></td><td></td></tr>`).join('\n      ')}
    </tbody>
  </table>

  <h2>2 · Lo que funciona</h2>
  <div class="instr">Copia la oración más fuerte de la nota y di por qué.</div>
  ${lines(3)}

  <h2>3 · Una pregunta que me quedó</h2>
  <div class="instr">¿Qué quisiste saber y la nota no te dijo? Eso es lo que falta.</div>
  ${lines(3)}

  <h2>4 · Un solo cambio</h2>
  <div class="instr">Si pudieras pedir un solo cambio, ¿cuál sería?</div>
  ${lines(2)}`);

// ─────────────────────────────────────────────────────────────────────────────
//  12 · Plan de revisión
// ─────────────────────────────────────────────────────────────────────────────
page('Día 9<br>Plan de revisión', `
  ${namebar()}
  <h1>Lo que te dijeron, y lo que vas a hacer</h1>
  <div class="sub">Día 9 — Revisar no es pasar en limpio</div>

  <div class="instr">Lee lo que escribió tu editor. No tienes que aceptar todo, pero sí tienes que
  decidir. Anota cada sugerencia y qué vas a hacer con ella.</div>

  <table>
    <thead><tr><th style="width:44%">Lo que me sugirieron</th><th style="width:14%">¿Lo acepto?</th>
      <th style="width:42%">Qué voy a cambiar (o por qué no)</th></tr></thead>
    <tbody>
      <tr><td class="blank" style="height:.55in"></td><td></td><td></td></tr>
      <tr><td class="blank" style="height:.55in"></td><td></td><td></td></tr>
      <tr><td class="blank" style="height:.55in"></td><td></td><td></td></tr>
    </tbody>
  </table>

  <h2>Revisión de estilo del periódico</h2>
  <div class="instr">El español de tu casa no se corrige. Pero todo periódico tiene un estilo para
  escribir, igual que tiene un tamaño de letra, y en el nuestro se usan acentos y signos completos.
  Revisa tu propio borrador con esta lista.</div>
  <table>
    <thead><tr><th style="width:72%">Revisé que…</th><th style="width:14%">Sí</th><th style="width:14%">Ayuda</th></tr></thead>
    <tbody>
      ${ESTILO.map(q => `<tr><td>${q}</td><td></td><td></td></tr>`).join('\n      ')}
    </tbody>
  </table>
  <div class="tip">Si no sabes cómo se escribe una palabra, dilo sin pena: <em>«Lo sé decir pero
  no lo sé escribir.»</em> Es una de las diez frases de este salón.</div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  13 · Segundo borrador
// ─────────────────────────────────────────────────────────────────────────────
page('Día 9<br>Segundo borrador', `
  ${namebar()}
  <h1>Segundo borrador</h1>
  <div class="sub">Día 9 — La versión mejorada</div>

  <div class="instr">Escríbela otra vez completa con tus cambios. Ésta es la que va a revisar tu
  maestra antes del cierre.</div>

  <table>
    <tbody>
      ${blanks('Titular')}
    </tbody>
  </table>
  ${lines(27)}
  <div class="instr" style="margin-top:.3rem">¿Qué es lo mejor que cambiaste desde el primer
  borrador? ____________________________________________</div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  14 · Versión final para imprimir
// ─────────────────────────────────────────────────────────────────────────────
page('Día 10<br>Al cierre', `
  <div class="instr" style="margin-top:.1rem">Pasa tu nota final en limpio, con tu mejor letra, o
  escríbela a máquina y pégala aquí. Pega o dibuja tu imagen en el recuadro. Esta página es la que
  va a la imprenta.</div>

  <div style="border:2px solid #111;padding:.5rem .65rem .6rem">
    <div class="sans" style="font-size:.6rem;letter-spacing:1.6px;text-transform:uppercase;
         color:#C4622D;font-weight:700">Sección: ______________________</div>
    <div style="border-bottom:1px solid #111;height:.42in;margin:.15rem 0 .1rem"></div>
    <div class="sans" style="font-size:.62rem;color:#5a5a5a">titular</div>
    <div style="display:flex;gap:1rem;margin:.35rem 0 .15rem">
      <span style="flex:1;border-bottom:1px solid #111"></span>
    </div>
    <div class="sans" style="font-size:.62rem;color:#5a5a5a;margin-bottom:.4rem">Por (tu nombre de
    corresponsal), grado</div>

    <div class="box" style="height:2.5in;margin:.2rem 0 .1rem;display:flex;align-items:center;
         justify-content:center"><span class="sans" style="font-size:.62rem;color:#5a5a5a">
         pega o dibuja aquí tu imagen</span></div>
    <div style="border-bottom:1px solid #c9c9c9;height:.26in"></div>
    <div class="sans" style="font-size:.6rem;color:#5a5a5a;margin-bottom:.35rem">pie de foto ·
    crédito</div>

    <div class="two" style="gap:0 1.3rem">
      <div>${lines(15)}</div>
      <div>${lines(15)}</div>
    </div>
  </div>`);

// ─────────────────────────────────────────────────────────────────────────────
//  15 · Reflexión y rúbrica
// ─────────────────────────────────────────────────────────────────────────────
page('Día 10<br>Reflexión', `
  ${namebar()}
  <h1>Mira lo que hiciste</h1>
  <div class="sub">Día 10 — Reflexión y autoevaluación</div>

  <h2>1 · Compara</h2>
  <div class="instr">Copia la primera oración de tu primer borrador y la de tu versión final.</div>
  <table>
    <tbody>
      ${blanks('Primer borrador', '.5in')}
      ${blanks('Versión final', '.5in')}
    </tbody>
  </table>
  <div class="instr">¿Qué cambió y por qué es mejor?</div>
  ${lines(2)}

  <h2>2 · Piensa</h2>
  <ol class="q">
    <li>¿Qué fue lo más difícil de la entrevista? ${lines(2)}</li>
    <li>¿Qué aprendiste de la persona que entrevistaste que no sabías? ${lines(2)}</li>
  </ol>

  <h2>3 · Califica tu nota</h2>
  <div class="instr">Encierra un número en cada fila. Tu maestra usa la misma tabla.</div>
  <table class="rubric">
    <thead><tr><th style="width:22%">Criterio</th><th style="width:26%">3 · Lo logré</th>
      <th style="width:26%">2 · Casi</th><th style="width:26%">1 · Todavía no</th></tr></thead>
    <tbody>
      <tr><td><strong>Reportaje</strong></td><td>Entrevisté a alguien de verdad y lo cité exacto</td>
        <td>Entrevisté, pero cité poco</td><td>No hice entrevista</td></tr>
      <tr><td><strong>Estructura</strong></td><td>Entrada fuerte y lo importante primero</td>
        <td>Todo está, en desorden</td><td>Faltan partes</td></tr>
      <tr><td><strong>Datos</strong></td><td>Un dato exacto y contexto</td>
        <td>Un dato sin contexto</td><td>Sin datos</td></tr>
      <tr><td><strong>Proceso</strong></td><td>Revisé con lo que me dijeron y se nota</td>
        <td>Cambié poco</td><td>Pasé en limpio sin cambiar</td></tr>
      <tr><td><strong>Imagen</strong></td><td>Imagen, pie de foto y crédito</td>
        <td>Falta el pie o el crédito</td><td>Sin imagen</td></tr>
    </tbody>
  </table>`);

// ═════════════════════════════════════════════════════════════════════════════
//  Teacher guide
// ═════════════════════════════════════════════════════════════════════════════
const TEACHER = [];
TEACHER.push({ n: 1, meta: 'Teacher guide<br>Ten-day plan', body: `
  <h1>Our Own Edition — Teacher Guide</h1>
  <div class="sub">Two-week project · 15-page student packet</div>

  <table>
    <thead><tr><th style="width:7%">Day</th><th style="width:24%">Step</th>
      <th style="width:52%">In class</th><th style="width:17%">Sign off when…</th></tr></thead>
    <tbody>
      <tr><td>1</td><td><strong>Inside a news story</strong><br><em>La noticia por dentro</em></td><td>Read the model story aloud. In pairs, fill in the parts table and the six questions. Discuss: which quote is strongest, and why?</td><td>pp. 2–3 complete</td></tr>
      <tr><td>2</td><td><strong>Find your story</strong><br><em>Encuentra tu historia</em></td><td>Individual brainstorm, the "is it news?" test, then the pitch form. Approve pitches before the end of class.</td><td>Pitch approved</td></tr>
      <tr><td>3</td><td><strong>Plan the interview</strong><br><em>Planea la entrevista</em></td><td>Rehearse the interview request aloud in pairs. Convert closed questions to open ones. Students request the interview before leaving.</td><td>Interview booked + 6 questions</td></tr>
      <tr><td>4</td><td><strong>The interview</strong><br><em>La entrevista</em></td><td>Interview time, in or out of class. Anyone who can't interview today practises on a classmate and reschedules.</td><td>Notebook has 1 exact quote</td></tr>
      <tr><td>5</td><td><strong>The image</strong><br><em>La imagen</em></td><td>Mini-lesson on free-licence images and credits. Lab time or yearbook cameras. Write the caption.</td><td>Image + caption</td></tr>
      <tr><td>6</td><td><strong>The skeleton</strong><br><em>El esqueleto</em></td><td>Review the inverted pyramid (week 8) and leads (week 5). Three leads each; share the best.</td><td>Outline + lead</td></tr>
      <tr><td>7</td><td><strong>First draft</strong><br><em>Primer borrador</em></td><td>Sustained silent writing on every other line. Nobody corrects anything today.</td><td>150+ words</td></tr>
      <tr><td>8</td><td><strong>Peer editing</strong><br><em>Edición entre compañeros</em></td><td>Model it first with an anonymous draft on the projector, then pairs swap.</td><td>Editing sheet filled in</td></tr>
      <tr><td>9</td><td><strong>Second draft</strong><br><em>Segundo borrador</em></td><td>Revision plan, house-style check, full rewrite. Short conferences with anyone falling behind.</td><td>Second draft done</td></tr>
      <tr><td>10</td><td><strong>Deadline</strong><br><em>Al cierre</em></td><td>Final copy on p. 14, reflection and self-assessment. Collect p. 14 for layout.</td><td>p. 14 turned in</td></tr>
    </tbody>
  </table>

  <h2>Sort these out before day 1</h2>
  <ul style="font-size:.9rem">
    <li><strong>Staff interviews.</strong> A short heads-up to the front office and
      administration saves thirty students from arriving the same morning asking for ten minutes.</li>
    <li><strong>Yearbook cameras.</strong> Book a time with whoever keeps them for day 5.</li>
    <li><strong>Printing.</strong> Page 14 is designed to photocopy as-is. For an assembled paper,
      cut out the stories and paste them onto 11×17 or tabloid sheets.</li>
  </ul>`});

TEACHER.push({ n: 2, meta: 'Teacher guide<br>Teaching notes', body: `
  <h1>Teaching Notes</h1>
  <div class="sub">Keeping the project from stalling</div>

  <h2>The sign-offs on the cover</h2>
  <p style="font-size:.92rem">The tracker on the cover exists so nobody reaches day 10 without an
  interview. The two signatures that matter most are day 2 (the pitch) and day 4 (one exact
  quote). If a student still has no quote on day 5, let them move on to the image and the outline
  while they reschedule, but don't sign day 4 until they have it.</p>

  <h2>Interviews in English</h2>
  <p style="font-size:.92rem">Many of the most natural sources at school don't speak Spanish. That
  doesn't disqualify the story: the packet lets students interview in English and translate the
  quote when they write, which is exactly what foreign correspondents do. Translating a quote
  faithfully is also excellent writing practice for heritage speakers.</p>

  <h2>Peer editing</h2>
  <p style="font-size:.92rem">Page 11 has editors check the <em>pieces</em> — lead, quote, figure,
  context — not spelling. Model it first with an anonymous draft on the projector, and say the
  class norm out loud: <em>aquí no se corrige el español de nadie</em>. Writing conventions come
  separately on page 12, framed as the newspaper's <em>house style</em> (like a paper having a
  set font size), and students apply that checklist to their own text.</p>

  <h2>The rubric</h2>
  <p style="font-size:.92rem">The five criteria — reporting, structure, data, process, image — are
  weighted equally. Spelling is deliberately left out, as in the weekly rubric; "process" is where
  a second draft that genuinely changed gets rewarded. A well-reported story with missing accents
  is worth more than a clean one with no interview.</p>

  <table class="rubric">
    <thead><tr><th style="width:22%">Criterion</th><th style="width:26%">3</th>
      <th style="width:26%">2</th><th style="width:26%">1</th></tr></thead>
    <tbody>
      <tr><td><strong>Reporting</strong><br><em>Reportaje</em></td><td>Real interview; exact, correctly attributed quote</td><td>Interview done, little quoted</td><td>No interview</td></tr>
      <tr><td><strong>Structure</strong><br><em>Estructura</em></td><td>Strong lead; inverted pyramid</td><td>All parts present, out of order</td><td>Parts missing</td></tr>
      <tr><td><strong>Data</strong><br><em>Datos</em></td><td>Exact figure with context</td><td>Figure without context</td><td>No figures</td></tr>
      <tr><td><strong>Process</strong><br><em>Proceso</em></td><td>Second draft responds to the edit</td><td>Minor changes</td><td>No revision</td></tr>
      <tr><td><strong>Image</strong><br><em>Imagen</em></td><td>Image, caption and correct credit</td><td>Caption or credit missing</td><td>No image</td></tr>
    </tbody>
  </table>
  <p style="font-size:.85rem;color:#2D5A27;font-style:italic">Scored out of 15. Students
  self-assess with the same table on p. 15 (in Spanish); comparing the two scores makes a good
  closing conversation.</p>`});


// ═════════════════════════════════════════════════════════════════════════════
//  Projector deck — periodico-presentacion.html
//  Two to five slides per day, each day ending on the packet page to open.
// ═════════════════════════════════════════════════════════════════════════════
function buildDeck() {
  const S = [];
  const cover = (day, title, hook) => S.push({cls:'cover', day, html:
    `<div class="eyebrow">Nuestra propia edición · Día ${day} de 10</div>
     <h1>${title}</h1><p class="hook">${hook}</p>`});
  const beat = (day, eyebrow, head, paras, pull) => S.push({cls:'beat', day, html:
    `<div class="eyebrow">${eyebrow}</div><h2>${head}</h2>
     ${paras.map(p => `<p>${p}</p>`).join('')}
     ${pull ? `<div class="pull">${pull}</div>` : ''}`});
  const list = (day, eyebrow, head, items, note) => S.push({cls:'list', day, html:
    `<div class="eyebrow">${eyebrow}</div><h2>${head}</h2>
     <dl>${items.map(([l, t]) => `<dt>${l}</dt><dd>${t}</dd>`).join('')}</dl>
     ${note ? `<div class="pull">${note}</div>` : ''}`});
  const cards = (day, eyebrow, head, items, note) => S.push({cls:'list', day, html:
    `<div class="eyebrow">${eyebrow}</div><h2>${head}</h2>
     <div class="cards">${items.map(t => `<div>${t}</div>`).join('')}</div>
     ${note ? `<p class="sm" style="margin-top:1.2rem">${note}</p>` : ''}`});
  const checks = (day, eyebrow, head, items, intro) => S.push({cls:'list', day, html:
    `<div class="eyebrow">${eyebrow}</div><h2>${head}</h2>
     ${intro ? `<p class="sm">${intro}</p>` : ''}
     <ul class="checks">${items.map(t => `<li>${t}</li>`).join('')}</ul>`});
  const act = (day, head, what, page) => S.push({cls:'act', day, html:
    `<div class="eyebrow">Manos a la obra</div><h2>${head}</h2><p>${what}</p>
     <div class="page">📄 Proyecto del periódico, ${page}</div>`});

  // ── DÍA 1 ────────────────────────────────────────────────────────────────
  cover(1, 'Nuestra propia edición',
    'Dos semanas. Una historia de aquí. Tu nombre impreso en el periódico de la escuela.');

  beat(1, 'El proyecto', 'Ahora te toca contar la de aquí.', [
    'Hasta ahora has escrito sobre Oaxaca, sobre un lago en Guatemala, sobre un arrecife en Honduras. Historias de otros lugares, contadas por gente de ahí.',
    'En estas dos semanas vas a escoger una historia de esta escuela o de tu comunidad, entrevistar a una persona real, conseguir la imagen y escribir una nota que se va a imprimir, en español, con tu nombre.',
  ], 'No la vas a escribir de una vez. Nadie en un periódico lo hace.');

  list(1, 'El calendario', 'Diez días, diez pasos',
    DIAS.map(([d, p, q]) => [`${d} · ${p}`, q]));

  beat(1, 'Cómo funciona', 'Firma por firma', [
    'Cada paso de tu portada lleva mi firma cuando lo terminas. Sin la firma no pasas al siguiente.',
    'No es para vigilarte. Es para que nadie llegue al día 10 sin entrevista, sin imagen o sin borrador. Si te atrasas, lo vemos el mismo día y no la víspera del cierre.',
  ]);

  S.push({cls:'story', day:1, html:
    `<div class="eyebrow">La nota modelo · ${MODELO.kicker}</div>
     <h2>${MODELO.titular}</h2>
     <div class="by">${MODELO.firma}</div>
     <div class="cols">${MODELO.parrafos.map((p, i) => `<p><b>${i + 1}</b>${p}</p>`).join('')}</div>`});

  list(1, 'Las partes', 'Toda noticia tiene estas piezas',
    PARTES.map(([p, s]) => [p, s]),
    'Ya las practicaste en las semanas pasadas. Hoy las buscas en una nota de una escuela como ésta.');

  cards(1, 'Las seis preguntas', 'Una buena noticia contesta seis', SEIS,
    'Si alguna no se contesta en la nota de la cafetería, escribe «no aparece». Eso también es información.');

  act(1, 'La noticia por dentro',
    'Lee la nota de la cafetería dos veces. Explica de qué trata en una sola oración. Después busca cada parte, copia un ejemplo y contesta las seis preguntas.',
    'pp. 2–3');

  // ── DÍA 2 ────────────────────────────────────────────────────────────────
  cover(2, 'Encuentra tu historia',
    'Una noticia no tiene que ser enorme. Tiene que ser nueva, verdadera y de aquí.');

  cards(2, 'Dónde buscar', 'Las buenas historias están cerca', IDEAS,
    'Para empezar: un club nuevo, un maestro que se jubila, el equipo que va ganando, la señora de la cafetería, por qué no sirven los bebederos del segundo piso, un negocio de la familia de alguien, un estudiante que llegó de otro país este año.');

  checks(2, 'La prueba de la noticia', 'Antes de enamorarte de una idea', PRUEBA,
    'Escoge tus dos mejores ideas. La que pase las cuatro es tu historia.');

  beat(2, 'La propuesta', 'En un periódico nadie escribe sin permiso de la editora.', [
    'Hoy me entregas tu propuesta: tu historia en una oración, a quién vas a entrevistar y un dato que puedes conseguir.',
    'Te la regreso de tres maneras: aprobada, aprobada con cambios, o «busca otra idea». La tercera no es un castigo; es lo que pasa en cualquier redacción.',
  ], 'Pon siempre un plan B. La persona que quieres entrevistar puede decir que no.');

  act(2, 'Lluvia de ideas y propuesta',
    'Anota por lo menos dos ideas en cada recuadro. Pasa tus dos mejores por la prueba. Llena la propuesta con la ganadora y escribe un titular de trabajo.',
    'pp. 4–5');

  // ── DÍA 3 ────────────────────────────────────────────────────────────────
  cover(3, 'Planea la entrevista', 'La entrevista se gana antes de empezar.');

  beat(3, 'Paso 1', 'Pide la entrevista', [
    'En persona o por escrito, con respeto y con fecha. Di quién eres, para qué es y cuánto tiempo necesitas.',
  ], '«Buenos días, me llamo ____ y escribo para el periódico en español de la escuela. Estoy haciendo una nota sobre ____. ¿Me permite hacerle unas preguntas? Son diez minutos.»');

  S.push({cls:'list', day:3, html:
    `<div class="eyebrow">Paso 2</div><h2>Preguntas que abren</h2>
     <div class="vs">
       <div><div class="tag">Cerrada</div><p class="q">«¿Le gusta su trabajo?»</p><p class="a">→ «Sí.»</p>
         <p class="sm">Se contesta con sí o no. No te da ninguna cita.</p></div>
       <div class="win"><div class="tag">Abierta</div><p class="q">«¿Cómo fue su primer día aquí?»</p><p class="a">→ una historia.</p>
         <p class="sm">Empieza con <em>cómo, por qué, qué pasó cuando, cuénteme</em>.</p></div>
     </div>`});

  cards(3, 'Paso 3', 'La pregunta de seguimiento', SEGUIMIENTO,
    'Ésta no se escribe antes. Se inventa en el momento, cuando la respuesta te sorprende. Es la pregunta que importa.');

  beat(3, 'Si tu fuente no habla español', 'Entrevista en inglés. Escribe en español.', [
    'Eso lo hacen los corresponsales todo el tiempo. Copia la cita en inglés, exacta, en tu libreta. La traduces cuando escribas la nota.',
    'Lo que no se vale es inventar lo que la persona «quiso decir».',
  ]);

  act(3, 'Planea tu entrevista',
    'Pide la entrevista y anota día, hora y lugar. Pregunta si puedes usar su nombre. Escribe seis preguntas abiertas.',
    'p. 6');

  // ── DÍA 4 ────────────────────────────────────────────────────────────────
  cover(4, 'La entrevista', 'Hoy sales a reportear. Lleva la libreta y escribe mientras escuchas.');

  list(4, 'La libreta', 'Cómo tomar notas sin perderte nada', [
    ['Palabras clave', 'No trates de escribir todo. Anota lo necesario para acordarte.'],
    ['Citas exactas', 'Sólo las frases que quieras citar, palabra por palabra, entre comillas.'],
    ['Si no alcanzaste', '«¿Me lo repite, por favor? Quiero citarlo bien.» Nadie se ofende; al contrario.'],
    ['Datos', 'Cualquier número: años, personas, votos, dinero, minutos. Pregunta «¿cuántos?».'],
    ['Al terminar', 'Pídele que te deletree su nombre y su puesto. Dale las gracias.'],
  ], 'Una cita mal copiada es peor que ninguna cita.');

  act(4, 'La libreta de entrevista',
    'Haz la entrevista. Llena la libreta: notas, tres citas exactas, dos datos, y tu pregunta de seguimiento con lo que contestó.',
    'p. 7');

  // ── DÍA 5 ────────────────────────────────────────────────────────────────
  cover(5, 'La imagen', 'Una imagen se lee antes que el titular.');

  list(5, 'Escoge un camino', 'Tres caminos, tres reglas', CAMINOS);

  beat(5, 'El pie de foto', 'Una o dos oraciones debajo de la imagen', [
    'Dice quién o qué se ve, y dónde. No repite el titular. Y siempre lleva crédito: <em>Foto</em>, <em>Imagen</em> o <em>Ilustración</em>, con el nombre de quien la hizo.',
  ], 'La señora Rosa Méndez sirve la sopa de fideo, el platillo que ganó por nueve votos. — Foto: Daniela Ortiz');

  act(5, 'La imagen de tu nota',
    'Escoge tu camino. Haz un boceto de la imagen, explica por qué ésa y no otra, y escribe el pie de foto y el crédito.',
    'p. 8');

  // ── DÍA 6 ────────────────────────────────────────────────────────────────
  cover(6, 'El esqueleto', 'Antes de escribir, ordena. Lo más importante va primero.');

  S.push({cls:'list', day:6, html:
    `<div class="eyebrow">La pirámide invertida</div><h2>Lo más fuerte arriba</h2>
     <div class="pyr">${ESQUELETO.map(([l], i) =>
       `<div style="width:${100 - i * 9}%">${l}</div>`).join('')}</div>
     <p class="sm" style="margin-top:1rem">Si al periódico le falta espacio, se corta desde abajo.
     Tu nota tiene que seguir funcionando.</p>`});

  list(6, 'La entrada', 'Tres maneras de empezar', [
    ['Con un dato', '«Más de cuatrocientos alumnos votaron durante dos semanas por lo que se sirve en la cafetería.»'],
    ['Con una persona', '«Durante once años, Rosa Méndez vio regresar los platos casi llenos.»'],
    ['Con una sorpresa', '«La sopa de fideo entró al menú por sólo nueve votos.»'],
    ['Prohibido', '«Este artículo trata de…» — eso anuncia, no engancha.'],
  ]);

  act(6, 'Arma el esqueleto',
    'Llena las seis partes con palabras clave, no oraciones. Después escribe tres entradas distintas y encierra la mejor.',
    'p. 9');

  // ── DÍA 7 ────────────────────────────────────────────────────────────────
  cover(7, 'Primer borrador', 'Escribe sin borrar. Corregir viene después.');

  list(7, 'Las reglas del borrador', 'Hoy escribes la nota completa', [
    ['Largo', 'Entre 150 y 250 palabras.'],
    ['Renglón por medio', 'Deja una línea libre entre cada una, para que tu editor tenga dónde escribir.'],
    ['Tu mapa', 'Sigue tu esqueleto y empieza con la entrada que escogiste.'],
    ['Ortografía', 'No te detengas a corregirla. Si te detienes, no terminas.'],
  ], 'Un borrador feo y completo vale más que un párrafo perfecto.');

  act(7, 'Primer borrador',
    'Escribe tu nota completa siguiendo el esqueleto. Al final cuenta más o menos cuántas palabras escribiste.',
    'p. 10');

  // ── DÍA 8 ────────────────────────────────────────────────────────────────
  cover(8, 'Edición entre compañeros', 'El editor trabaja para el que escribe.');

  beat(8, 'La norma de siempre', 'Aquí no se corrige el español de nadie.', [
    'Hoy lees el primer borrador de otra persona. No vas a marcarle acentos ni a cambiarle palabras porque en tu casa se dicen distinto.',
    'Tu trabajo es ayudar a que su nota se entienda y se lea con ganas.',
  ]);

  checks(8, 'Paso 1', '¿La nota tiene…?', PIEZAS);

  list(8, 'Pasos 2 a 4', 'Lo que le escribes a tu compañero', [
    ['Lo que funciona', 'Copia la oración más fuerte de la nota y di por qué.'],
    ['Una pregunta', '¿Qué quisiste saber y la nota no te dijo? Eso es lo que falta.'],
    ['Un solo cambio', 'Si pudieras pedir un solo cambio, ¿cuál sería?'],
  ], 'Uno. No diez. Un cambio que se puede hacer ayuda más que diez que asustan.');

  act(8, 'Edita a un compañero',
    'Revisa las seis piezas. Después escribe lo que funciona, la pregunta que te quedó y el único cambio que pedirías.',
    'p. 11');

  // ── DÍA 9 ────────────────────────────────────────────────────────────────
  cover(9, 'Segundo borrador', 'Revisar no es pasar en limpio.');

  beat(9, 'Tú decides', 'No tienes que aceptar todo. Sí tienes que decidir.', [
    'Lee lo que escribió tu editor. Por cada sugerencia, anota si la aceptas y qué vas a cambiar, o por qué no.',
    'Un segundo borrador que se ve igual al primero no es un segundo borrador.',
  ]);

  checks(9, 'Revisión de estilo', 'El estilo de nuestro periódico', ESTILO,
    'El español de tu casa no se corrige. Pero todo periódico tiene un estilo para escribir, igual que tiene un tamaño de letra, y en el nuestro se usan acentos y signos completos.');

  act(9, 'Plan de revisión y segundo borrador',
    'Anota cada sugerencia y tu decisión. Revisa tu propio borrador con la lista de estilo. Después escribe la nota completa otra vez con tus cambios.',
    'pp. 12–13');

  // ── DÍA 10 ───────────────────────────────────────────────────────────────
  cover(10, 'Al cierre', 'Hoy tu nota va a la imprenta.');

  list(10, 'La página final', 'Lo que va en la página 14', [
    ['Sección', 'Comunidad, Cultura, Deportes, Escuela, Opinión, Personas o Medio ambiente.'],
    ['Titular y firma', 'Tu titular final y tu nombre de corresponsal, con tu grado.'],
    ['Imagen', 'Pegada o dibujada en el recuadro, con pie de foto y crédito.'],
    ['La nota', 'En limpio, en dos columnas, con tu mejor letra, o a máquina y pegada.'],
  ], 'Esta página es la que va a la imprenta. Lo que no esté en ella no sale.');

  list(10, 'Cómo se califica', 'La misma tabla para ti y para mí', [
    ['Reportaje', 'Entrevisté a alguien de verdad y lo cité exacto.'],
    ['Estructura', 'Entrada fuerte y lo importante primero.'],
    ['Datos', 'Un dato exacto, y contexto.'],
    ['Proceso', 'Revisé con lo que me dijeron, y se nota.'],
    ['Imagen', 'Imagen, pie de foto y crédito.'],
  ], 'Tres puntos cada una, quince en total. Fíjate en lo que no está: la ortografía.');

  act(10, 'Al cierre',
    'Pasa tu nota final en limpio en la página 14 y pega tu imagen. Después compara tu primera oración con la final, contesta la reflexión y califica tu nota con la tabla.',
    'pp. 14–15');

  S.push({cls:'closer', day:10, html:
    `<h2>Ésta es nuestra edición.</h2>
     <p class="hook">Hace dos semanas era una idea en un recuadro. Hoy es una nota con una voz real,
     un dato que se puede comprobar y tu nombre arriba. Así se hace un periódico.</p>`});

  return deckHTML(S, 'Proyecto del periódico — Presentación | La Corresponsal',
    'Nuestra propia edición', DECK_CSS);
}

const DECK_CSS = `
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.cards div{background:var(--white);border-top:5px solid var(--terracotta);padding:1rem 1.1rem;
  font-size:clamp(1rem,1.9vw,1.55rem);line-height:1.25;font-weight:700;border-radius:4px}
ul.checks{list-style:none}
ul.checks li{font-size:clamp(1rem,1.85vw,1.45rem);line-height:1.4;padding:.45rem 0 .45rem 2.2rem;
  border-bottom:1px solid var(--cream-dk);position:relative}
ul.checks li::before{content:'☐';position:absolute;left:0;color:var(--terracotta)}
.vs{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
.vs>div{background:var(--white);padding:1.2rem 1.4rem;border-radius:6px;border-top:6px solid var(--ink-lt)}
.vs>div.win{border-top-color:var(--terracotta)}
.vs .tag{font-family:sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.15em;
  font-size:clamp(.75rem,1.2vw,.95rem);color:var(--ink-lt);margin-bottom:.5rem}
.vs .win .tag{color:var(--terracotta)}
.vs .q{font-size:clamp(1.15rem,2.3vw,1.9rem);font-weight:700;margin-bottom:.2rem}
.vs .a{font-size:clamp(1rem,1.9vw,1.5rem);font-style:italic;color:var(--ink-lt)}
.pyr{display:flex;flex-direction:column;align-items:center;gap:.35rem}
.pyr div{background:var(--ink);color:var(--cream);text-align:center;padding:.55rem .8rem;
  font-family:sans-serif;font-weight:700;font-size:clamp(.85rem,1.6vw,1.3rem);border-radius:3px}
.pyr div:first-child{background:var(--terracotta)}
.story .by{font-family:sans-serif;font-size:clamp(.8rem,1.3vw,1rem);color:var(--ink-lt);
  margin:-.4rem 0 1rem;text-transform:uppercase;letter-spacing:.08em}
.story .cols{columns:2;column-gap:2.4rem}
.story .cols p{font-size:clamp(.95rem,1.6vw,1.28rem);line-height:1.45;max-width:none;break-inside:avoid}
.story .cols b{font-family:sans-serif;color:var(--terracotta);margin-right:.45rem;font-size:.8em}
@media (max-width:700px){.cards,.vs{grid-template-columns:1fr}.story .cols{columns:1}}
@media print{.cards div,.vs>div{border:1px solid #999}.pyr div{background:#fff;color:#111;border:1px solid #111}}
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
  <div style="margin-top:.5rem;font-size:.8rem;color:#444">${en ? 'When printing, set <strong>Margins: None</strong> and turn off headers and footers.' : 'Al imprimir, pon <strong>Márgenes: Ninguno</strong> y desactiva «Encabezados y pies de página».'}</div>
</div>
${body}
</body>
</html>
`;
}

writeFileSync(join(OUT, 'periodico.html'),
  doc('Nuestra propia edición — Proyecto | La Corresponsal',
      render(PAGES, 'La Corresponsal · Proyecto del periódico'),
      `Imprimir las ${PAGES.length} páginas`), 'utf8');
writeFileSync(join(OUT, 'periodico-maestra.html'),
  doc('Teacher Guide — Newspaper Project | La Corresponsal',
      render(TEACHER, 'Newspaper Project · Teacher Guide', true),
      `Print the guide (${TEACHER.length} pages)`, true), 'utf8');

writeFileSync(join(__dirname, 'periodico-presentacion.html'), buildDeck(), 'utf8');
console.log(`periodico.html          ${PAGES.length} páginas`);
console.log(`periodico-maestra.html   ${TEACHER.length} páginas`);
