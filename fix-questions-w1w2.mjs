// fix-questions-w1w2.mjs — rebuilds the guessable multiple-choice items in
// weeks 1-2 (México, Guatemala).
//
// The defect: the correct option was written as a full sentence while the three
// distractors were stubs, so the longest option was the answer roughly every
// time. The fix is not to pad the distractors — it is to make all four
// structurally parallel ("Porque…" x4, "Que antes…" x4, "A X y a Y" x4) and to
// build them from details that actually appear in the same text, so a student
// who half-read is genuinely tempted.
//
// Options are written here in any order with `correct` pointing at the right
// one; balance-answers.mjs afterwards rotates each set onto its assigned letter,
// so the A/B/C/D distribution stays even.
//
// Run: node fix-questions-w1w2.mjs && node balance-answers.mjs && node bake-content.mjs && node build-hojas.mjs
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, 'content', 'batch-01.json');
const data = JSON.parse(readFileSync(FILE, 'utf8'));

// [session, 'article'|'audio', question text, [4 options], index of correct]
const REWRITES = [
  // ── México_0 ───────────────────────────────────────────────────────────────
  ['México_0', 'article', '¿Cuántos años lleva la tradición de mercado en el centro de Oaxaca?',
    ['Más de cien años', 'Más de quinientos años', 'Más de mil años', 'Más de veinte años'], 1],
  ['México_0', 'audio', '¿Por qué le duele el corazón a Doña Esperanza?',
    ['Porque los turistas dicen que sus cobijas son baratas',
     'Porque ya casi no llegan artesanas al mercado',
     'Porque los diseños zapotecas se están olvidando',
     'Porque su madre ya no puede tejer con ella'], 0],

  // ── México_1 ───────────────────────────────────────────────────────────────
  ['México_1', 'article', '¿De dónde vienen volando las mariposas?',
    ['De Canadá y Estados Unidos', 'De Guatemala y Belice',
     'De Colombia y Venezuela', 'De España y Portugal'], 0],
  ['México_1', 'article', '¿Qué tiene de especial la generación que llega a Michoacán?',
    ['Vive hasta ocho meses y hace sola el viaje al sur',
     'Vive unas pocas semanas y no sale del bosque',
     'Nace en Michoacán y nunca viaja hacia el norte',
     'Vuela sólo de noche y descansa todo el día'], 0],
  ['México_1', 'article', '¿A qué se dedican hoy muchas familias de Angangueo?',
    ['A ser guías y guardabosques', 'A cortar y vender madera',
     'A la minería y la construcción', 'A la pesca y el comercio'], 0],
  ['México_1', 'audio', '¿Qué dice Rubén sobre su trabajo actual?',
    ['Gana más que su papá con el hacha', 'Gana menos pero está más tranquilo',
     'Gana igual que cuando cortaba árboles', 'Gana poco y piensa cambiar de oficio'], 0],

  // ── México_2 ───────────────────────────────────────────────────────────────
  ['México_2', 'article', '¿Quiénes pintaron los murales del barrio?',
    ['Jóvenes que viven en las mismas calles',
     'Artistas extranjeros de paso por la ciudad',
     'Pintores contratados por el gobierno',
     'Estudiantes de una universidad privada'], 0],
  ['México_2', 'article', '¿Qué querían Diego Rivera y Siqueiros?',
    ['Que el arte fuera para todos', 'Que el arte se quedara en los museos',
     'Que el arte se vendiera en Europa', 'Que el arte enseñara sólo religión'], 0],
  ['México_2', 'article', '¿A quién pintó Yolanda Reyes?',
    ['A su vecina que vende tamales', 'A su abuela que vive en Oaxaca',
     'A la maestra de su primaria', 'A un futbolista de la selección'], 0],
  ['México_2', 'article', '¿Cuántos jóvenes participan ahora en el proyecto?',
    ['Más de quince', 'Más de treinta', 'Más de sesenta', 'Más de cien'], 2],
  ['México_2', 'audio', '¿Por qué empezó a pintar Yolanda?',
    ['Porque estaba enojada por cómo hablaban de su barrio',
     'Porque una maestra la inscribió en un taller',
     'Porque quería vender sus cuadros en el centro',
     'Porque le regalaron pintura y no sabía qué hacer'], 0],
  ['México_2', 'audio', '¿Quién fue su primer mural?',
    ['La señora Lupita, la de los tamales',
     'Don Beto, el que arregla bicicletas',
     'Su mamá, la que sale a trabajar temprano',
     'Una futbolista de la selección nacional'], 0],

  // ── Guatemala_0 ────────────────────────────────────────────────────────────
  ['Guatemala_0', 'article', '¿Qué información dan los diseños de un huipil?',
    ['De qué pueblo viene la persona', 'Cuántos años tiene la persona',
     'Cuánto dinero gana la persona', 'En qué trabaja la persona'], 0],
  ['Guatemala_0', 'audio', '¿Cómo le enseñaba su abuela?',
    ['Con las manos, no con palabras', 'Con libros escritos en k\'iche\'',
     'Con clases en la escuela del pueblo', 'Con canciones y no con ejemplos'], 0],
  ['Guatemala_0', 'audio', '¿Dónde se amarra el telar de cintura?',
    ['A un poste y a la cintura de la tejedora',
     'A la pared y al techo de la casa',
     'A dos sillas puestas frente a frente',
     'A una mesa y al respaldo de un banco'], 0],
  ['Guatemala_0', 'audio', '¿Qué les dice Elena a las muchachas que quieren irse a la capital?',
    ['Que estudien, pero que se lleven el telar',
     'Que se queden y no dejen nunca el pueblo',
     'Que vendan el telar antes de irse',
     'Que aprendan español y olviden el k\'iche\''], 0],

  // ── Guatemala_1 ────────────────────────────────────────────────────────────
  ['Guatemala_1', 'article', '¿Qué causa la capa verde en el agua?',
    ['Jabones, fertilizantes y aguas sucias', 'Las cenizas de los tres volcanes',
     'Las lanchas de motor de los turistas', 'El calor del sol en temporada seca'], 0],
  ['Guatemala_1', 'article', '¿Qué hacen los estudiantes cada mes?',
    ['Recogen basura y miden la calidad del agua',
     'Siembran plantas en las orillas del lago',
     'Reparten jabones biodegradables por las casas',
     'Enseñan a nadar a los niños del pueblo'], 0],
  ['Guatemala_1', 'audio', '¿Qué cuenta el abuelo de Marta sobre el lago?',
    ['Que antes se podía ver el fondo desde la lancha',
     'Que antes había muchos más peces que ahora',
     'Que antes el lago era bastante más grande',
     'Que antes nadie del pueblo se metía a nadar'], 0],
  ['Guatemala_1', 'audio', '¿Qué hacen los sábados?',
    ['Salen en lancha a recoger basura y tomar muestras',
     'Van a la escuela a tomar clases de biología',
     'Ayudan a sus padres con la pesca del día',
     'Limpian las calles del pueblo con el comité'], 0],

  // ── Guatemala_2 ────────────────────────────────────────────────────────────
  ['Guatemala_2', 'article', '¿Por qué son necesarias las radios comunitarias?',
    ['Porque muchas personas no entienden los mensajes en español',
     'Porque en el campo no llega la señal de televisión',
     'Porque son mucho más baratas que un periódico',
     'Porque a la gente le gusta más la música local'], 0],
  ['Guatemala_2', 'article', '¿Qué tipo de avisos dan estas radios?',
    ['Vacunas, tormentas y reuniones del comité',
     'Horarios de buses y precios del mercado',
     'Resultados de fútbol y noticias del mundo',
     'Anuncios de tiendas y ofertas de trabajo'], 0],
  ['Guatemala_2', 'audio', '¿Cómo es la cabina de la radio?',
    ['Un cuarto chiquito con paredes de cartón de huevo',
     'Un estudio moderno con equipo profesional',
     'Un camión adaptado que va de pueblo en pueblo',
     'Una oficina prestada por la municipalidad'], 0],
  ['Guatemala_2', 'audio', '¿Qué le dijo su tía?',
    ['Que un idioma se muere cuando los jóvenes dejan de hablarlo',
     'Que un idioma se pierde cuando el gobierno lo prohíbe',
     'Que un idioma sirve sólo para hablar con los viejos',
     'Que un idioma se aprende mejor fuera de la casa'], 0],
];

let applied = 0;
const missing = [];
for (const [key, where, text, opts, correct] of REWRITES) {
  const list = data[key]?.[where]?.questions;
  if (!list) { missing.push(`${key}.${where} not found`); continue; }
  const q = list.find(q => q.text === text);
  if (!q) { missing.push(`${key} ${where}: "${text.slice(0, 42)}…"`); continue; }
  if (opts.length !== 4) { missing.push(`${key}: not 4 options`); continue; }
  q.opts = opts.slice();
  q.correct = correct;
  applied++;
}

if (missing.length) {
  console.error('Could not match:\n  ' + missing.join('\n  '));
  process.exit(1);
}

writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`Rewrote ${applied} question sets in weeks 1-2.`);
