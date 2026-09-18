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
//
// Shares _hoja.css with the weekly packets. Run: node build-periodico.mjs
import { writeFileSync } from 'fs';
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
function render(pages, footLabel) {
  return pages.map(p => `
<div class="sheet">
  <div class="hdr">
    <div class="brand">El Mundo Nuestro</div>
    <div class="meta">${p.meta}</div>
  </div>
  ${p.body}
  <div class="foot"><span>${footLabel}</span><span>Página ${p.n} de ${pages.length}</span></div>
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
    <div class="kicker">Comunidad</div>
    <h3>La cafetería cambia el menú y los estudiantes votan por la comida</h3>
    <div class="byline">Por Daniela Ortiz, corresponsal de 10.º grado</div>
    <div class="lectura">
      <p><b class="pn">1</b>Por primera vez, los estudiantes decidieron qué se sirve en la
      cafetería. Durante dos semanas, más de cuatrocientos alumnos votaron entre doce platillos, y
      los tres ganadores ya están en el menú de los martes.</p>
      <p><b class="pn">2</b>La idea fue de la señora Rosa Méndez, que trabaja en la cafetería desde
      hace once años. «Veía los platos regresar casi llenos», dijo. «Pensé que si ellos escogían,
      iban a comer.»</p>
      <p><b class="pn">3</b>Los platillos que ganaron fueron el arroz con frijoles, los tacos de
      pollo y la sopa de fideo. La sopa ganó por sólo nueve votos.</p>
      <p><b class="pn">4</b>Según la señora Méndez, desde que empezó el nuevo menú se tira casi la
      mitad de comida que antes. Marcos Lee, estudiante de 11.º grado, votó por los tacos.
      «La comida sabe a casa», dijo. «Antes ni entraba a la cafetería.»</p>
      <p><b class="pn">5</b>La cafetería piensa repetir la votación cada semestre. La próxima será
      en enero.</p>
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
      <tr><td><strong>El titular</strong></td><td>Dice la noticia en una línea</td><td class="blank"></td></tr>
      <tr><td><strong>La firma</strong></td><td>Dice quién la escribió</td><td class="blank"></td></tr>
      <tr><td><strong>La entrada</strong></td><td>Engancha al lector con lo más importante</td><td class="blank" style="height:.5in"></td></tr>
      <tr><td><strong>La cita directa</strong></td><td>La voz de una persona, entre comillas</td><td class="blank" style="height:.5in"></td></tr>
      <tr><td><strong>El dato</strong></td><td>Un número exacto que lo comprueba</td><td class="blank"></td></tr>
      <tr><td><strong>El contexto</strong></td><td>Por qué le importa al lector</td><td class="blank" style="height:.5in"></td></tr>
      <tr><td><strong>El cierre</strong></td><td>Qué pasa después</td><td class="blank"></td></tr>
    </tbody>
  </table>

  <h2>Las seis preguntas</h2>
  <div class="instr">Una buena noticia contesta estas seis. Contéstalas para la nota de la
  cafetería. Si alguna no se contesta, escribe «no aparece».</div>
  <table>
    <tbody>
      ${blanks('¿Qué pasó?')}
      ${blanks('¿Quién?')}
      ${blanks('¿Cuándo?')}
      ${blanks('¿Dónde?')}
      ${blanks('¿Por qué?')}
      ${blanks('¿Cómo?')}
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
    <div>
      <div class="box" style="min-height:1.25in"><div class="lbl">Algo que cambió o es nuevo</div></div>
      <div class="box" style="min-height:1.25in"><div class="lbl">Una persona que nadie conoce y debería</div></div>
      <div class="box" style="min-height:1.25in"><div class="lbl">Un problema que alguien está arreglando</div></div>
    </div>
    <div>
      <div class="box" style="min-height:1.25in"><div class="lbl">Un evento que se acerca o que pasó</div></div>
      <div class="box" style="min-height:1.25in"><div class="lbl">Algo de la cultura de nuestra comunidad</div></div>
      <div class="box" style="min-height:1.25in"><div class="lbl">Una pregunta que todos se hacen</div></div>
    </div>
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
      <tr><td>¿Es de nuestra escuela o comunidad?</td><td></td><td></td></tr>
      <tr><td>¿Hay alguien a quien puedo entrevistar esta semana?</td><td></td><td></td></tr>
      <tr><td>¿Puedo conseguir por lo menos un dato con número?</td><td></td><td></td></tr>
      <tr><td>¿A mis compañeros les importaría leerla?</td><td></td><td></td></tr>
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
  <div class="wordbank">¿Qué quiere decir con…? &nbsp;·&nbsp; ¿Me da un ejemplo? &nbsp;·&nbsp;
    ¿Y qué pasó después? &nbsp;·&nbsp; ¿Por qué cree que…?</div>`);

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
      <tr><td><strong>☐ Foto propia</strong></td><td>Tómala tú o con la cámara del anuario. Si
        sale una persona, pídele permiso antes. Nunca fotografíes a alguien que te dijo que no.</td></tr>
      <tr><td><strong>☐ Imagen de internet</strong></td><td>Sólo de sitios con imágenes libres, como
        <em>Wikimedia Commons</em>, <em>Unsplash</em> o <em>Pixabay</em>. No sirve «la primera que
        salió en Google»: casi todas tienen dueño. Siempre se da crédito.</td></tr>
      <tr><td><strong>☐ Dibujo</strong></td><td>Tú lo haces, a mano. Muchos periódicos usan
        ilustraciones. El crédito dice «Ilustración: tu nombre».</td></tr>
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
      ${blanks('1 · Lo más importante', '.55in')}
      ${blanks('2 · Quién, dónde y cuándo', '.55in')}
      ${blanks('3 · La mejor cita (de tu libreta)', '.55in')}
      ${blanks('4 · El dato con número', '.45in')}
      ${blanks('5 · Por qué le importa al lector', '.55in')}
      ${blanks('6 · El cierre: qué pasa después', '.45in')}
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
      <tr><td>Una entrada que engancha, no que anuncia</td><td></td><td></td></tr>
      <tr><td>Quién, qué, cuándo y dónde en el primer párrafo</td><td></td><td></td></tr>
      <tr><td>Por lo menos una cita directa entre comillas</td><td></td><td></td></tr>
      <tr><td>Por lo menos un dato con número</td><td></td><td></td></tr>
      <tr><td>Una razón clara de por qué me importa</td><td></td><td></td></tr>
      <tr><td>Un cierre que dice qué pasa después</td><td></td><td></td></tr>
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
      <tr><td>Las preguntas llevan <strong>¿</strong> al principio y <strong>?</strong> al final</td><td></td><td></td></tr>
      <tr><td>Las citas van entre comillas «así» o "así"</td><td></td><td></td></tr>
      <tr><td>Los verbos en pasado llevan acento: <em>habló, llegó, decidió</em></td><td></td><td></td></tr>
      <tr><td><em>Qué, cómo, dónde, cuándo, por qué</em> llevan acento cuando preguntan</td><td></td><td></td></tr>
      <tr><td>Los nombres de personas y lugares empiezan con mayúscula</td><td></td><td></td></tr>
      <tr><td>Busqué en el diccionario por lo menos tres palabras de las que dudé</td><td></td><td></td></tr>
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
TEACHER.push({ n: 1, meta: 'Guía de la maestra<br>Plan de los diez días', body: `
  <h1>Nuestra propia edición — guía</h1>
  <div class="sub">Proyecto de dos semanas · paquete de 15 páginas</div>

  <table>
    <thead><tr><th style="width:7%">Día</th><th style="width:24%">Paso</th>
      <th style="width:52%">En clase</th><th style="width:17%">Firma si…</th></tr></thead>
    <tbody>
      <tr><td>1</td><td><strong>La noticia por dentro</strong></td><td>Leer la nota modelo en voz alta. En parejas, llenar la tabla de partes y las seis preguntas. Discutir: ¿cuál es la cita más fuerte?</td><td>pp. 2–3 completas</td></tr>
      <tr><td>2</td><td><strong>Encuentra tu historia</strong></td><td>Lluvia de ideas individual; la prueba de la noticia; llenar la propuesta. Aprobar propuestas al final de la clase.</td><td>Propuesta aprobada</td></tr>
      <tr><td>3</td><td><strong>Planea la entrevista</strong></td><td>Practicar la petición en voz alta en parejas. Pasar preguntas cerradas a abiertas. Pedir la entrevista antes de salir.</td><td>Cita agendada y 6 preguntas</td></tr>
      <tr><td>4</td><td><strong>La entrevista</strong></td><td>Tiempo para entrevistar (dentro o fuera de clase). Quien no pueda hoy, practica entrevistando a un compañero y reagenda.</td><td>Libreta con 1 cita exacta</td></tr>
      <tr><td>5</td><td><strong>La imagen</strong></td><td>Mini lección sobre imágenes libres y crédito. Laboratorio o cámara del anuario. Pie de foto.</td><td>Imagen y pie de foto</td></tr>
      <tr><td>6</td><td><strong>El esqueleto</strong></td><td>Repasar la pirámide invertida (semana 8) y las entradas (semana 5). Tres entradas; compartir la mejor.</td><td>Esqueleto y entrada</td></tr>
      <tr><td>7</td><td><strong>Primer borrador</strong></td><td>Escritura sostenida, en silencio, renglón por medio. Nadie corrige hoy.</td><td>150+ palabras</td></tr>
      <tr><td>8</td><td><strong>Edición entre compañeros</strong></td><td>Modelar primero con un borrador anónimo en el proyector. Luego parejas intercambian.</td><td>Hoja de edición llena</td></tr>
      <tr><td>9</td><td><strong>Segundo borrador</strong></td><td>Plan de revisión, lista de estilo, reescritura completa. Conferencias breves con quienes van atrás.</td><td>Segundo borrador</td></tr>
      <tr><td>10</td><td><strong>Al cierre</strong></td><td>Versión final en la página 14, reflexión y autoevaluación. Recoger la p. 14 para maquetar.</td><td>Página 14 entregada</td></tr>
    </tbody>
  </table>

  <h2>Lo que conviene resolver antes del día 1</h2>
  <ul style="font-size:.9rem">
    <li><strong>Permisos de fotos.</strong> Averigua si el permiso del anuario cubre fotos de
      estudiantes en un periódico que se reparte. Si no, la regla del paquete ya dice: nunca
      fotografiar a quien dijo que no. En caso de duda, el camino del dibujo siempre funciona.</li>
    <li><strong>Entrevistas al personal.</strong> Un aviso breve a la dirección y a la oficina
      evita que treinta estudiantes lleguen el mismo día a pedir diez minutos.</li>
    <li><strong>Cámaras del anuario.</strong> Aparta un horario con quien las tenga para el día 5.</li>
    <li><strong>Impresión.</strong> La p. 14 está hecha para fotocopiarse tal cual. Si quieres un
      periódico armado, recorta las notas y pégalas en hojas tamaño doble carta o tabloide.</li>
  </ul>`});

TEACHER.push({ n: 2, meta: 'Guía de la maestra<br>Notas de enseñanza', body: `
  <h1>Notas de enseñanza</h1>
  <div class="sub">Para que el proyecto no se atore</div>

  <h2>Las firmas del calendario</h2>
  <p style="font-size:.92rem">El calendario de la portada existe para que nadie llegue al día 10
  sin entrevista. Las dos firmas que más importan son la del día 2 (propuesta) y la del día 4
  (una cita exacta). Si un estudiante no tiene cita el día 5, que siga con la imagen y el esqueleto
  mientras reagenda: no lo detengas, pero no firmes el día 4 hasta que la tenga.</p>

  <h2>Entrevistas en inglés</h2>
  <p style="font-size:.92rem">Muchas fuentes naturales de la escuela no hablan español. Eso no
  descalifica la historia: el paquete permite entrevistar en inglés y traducir la cita al
  escribir, que es exactamente lo que hacen los corresponsales. Traducir una cita con fidelidad es
  además un ejercicio de escritura muy bueno para estudiantes de herencia.</p>

  <h2>La edición entre compañeros</h2>
  <p style="font-size:.92rem">La p. 11 está escrita para que el editor revise <em>piezas</em>
  (entrada, cita, dato, contexto) y no ortografía. Modélalo antes con un borrador anónimo en el
  proyector, y di en voz alta la norma: aquí no se corrige el español de nadie. Las convenciones
  de escritura van aparte, en la p. 12, presentadas como el <em>estilo del periódico</em> — igual
  que un periódico tiene un tamaño de letra — y el estudiante las revisa en su propio texto.</p>

  <h2>La rúbrica</h2>
  <p style="font-size:.92rem">Los cinco criterios (reportaje, estructura, datos, proceso, imagen)
  valen lo mismo. La ortografía no aparece a propósito, igual que en la rúbrica de las semanas;
  «proceso» es donde se premia que el segundo borrador de verdad cambió. Una nota bien reportada
  con acentos faltantes vale más que una nota limpia sin entrevista.</p>

  <table class="rubric">
    <thead><tr><th style="width:22%">Criterio</th><th style="width:26%">3</th>
      <th style="width:26%">2</th><th style="width:26%">1</th></tr></thead>
    <tbody>
      <tr><td><strong>Reportaje</strong></td><td>Entrevista real, cita exacta y bien atribuida</td><td>Entrevista con poca cita</td><td>Sin entrevista</td></tr>
      <tr><td><strong>Estructura</strong></td><td>Entrada fuerte; pirámide invertida</td><td>Completa pero desordenada</td><td>Faltan partes</td></tr>
      <tr><td><strong>Datos</strong></td><td>Dato exacto con contexto</td><td>Dato sin contexto</td><td>Sin datos</td></tr>
      <tr><td><strong>Proceso</strong></td><td>El segundo borrador responde a la edición</td><td>Cambios menores</td><td>Sin revisión</td></tr>
      <tr><td><strong>Imagen</strong></td><td>Imagen, pie de foto y crédito correcto</td><td>Falta pie o crédito</td><td>Sin imagen</td></tr>
    </tbody>
  </table>
  <p style="font-size:.85rem;color:#2D5A27;font-style:italic">Total sobre 15. La autoevaluación
  de la p. 15 usa la misma tabla; comparar las dos es una buena conversación de cierre.</p>`});

// ── Write ─────────────────────────────────────────────────────────────────────
function doc(title, body, label) {
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
  <button onclick="window.print()">🖨️ ${label}</button>
  <a href="../maestra.html">← Volver al panel</a>
  <div style="margin-top:.5rem;font-size:.8rem;color:#444">Al imprimir, pon <strong>Márgenes: Ninguno</strong> y desactiva «Encabezados y pies de página».</div>
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
  doc('Guía de la maestra — Proyecto del periódico | La Corresponsal',
      render(TEACHER, 'Proyecto del periódico · Guía de la maestra'),
      `Imprimir la guía (${TEACHER.length} páginas)`), 'utf8');

console.log(`periodico.html          ${PAGES.length} páginas`);
console.log(`periodico-maestra.html   ${TEACHER.length} páginas`);
