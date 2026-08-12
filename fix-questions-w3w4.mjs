// fix-questions-w3w4.mjs — same rebuild as weeks 1-2, applied to Honduras and
// El Salvador. See fix-questions-w1w2.mjs for the rationale.
//
// Run: node fix-questions-w3w4.mjs && node balance-answers.mjs && node bake-content.mjs && node build-hojas.mjs
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, 'content', 'batch-02.json');
const data = JSON.parse(readFileSync(FILE, 'utf8'));

const REWRITES = [
  // ── Honduras_0 · el tambor garífuna ────────────────────────────────────────
  ['Honduras_0', 'article', '¿De quiénes son descendientes los garífunas?',
    ['De africanos e indígenas caribes', 'De españoles y pueblos mayas',
     'De ingleses y comerciantes holandeses', 'De aztecas y pueblos del norte'], 0],
  ['Honduras_0', 'article', '¿Qué pasa cuando suenan dos garaones juntos?',
    ['Uno lleva el ritmo y el otro conversa encima',
     'Los dos repiten exactamente el mismo golpe',
     'Uno suena fuerte y el otro casi no se oye',
     'Los dos se turnan y no suenan a la vez'], 0],
  ['Honduras_0', 'article', '¿Qué reconoció la UNESCO en 2001?',
    ['La lengua, la danza y la música garífuna',
     'La comida y las playas de la costa caribeña',
     'Los tambores y la forma de fabricarlos',
     'Las fiestas y los bailes de La Ceiba'], 0],
  ['Honduras_0', 'audio', '¿Cómo hacía los tambores el abuelo de Teodoro?',
    ['Ahuecaba el tronco con fuego y le ponía piel estirada',
     'Cortaba tablas delgadas y las unía con clavos',
     'Compraba la madera ya hueca en la ciudad',
     'Usaba tubos de plástico forrados con tela'], 0],
  ['Honduras_0', 'audio', '¿Qué extrañaba Teodoro cuando vivía en la ciudad?',
    ['El sonido y el idioma', 'El mar y la comida',
     'A su abuelo y su casa', 'La fiesta y el baile'], 0],
  ['Honduras_0', 'audio', '¿Cuántos niños vienen hoy a su escuelita?',
    ['Más de cuatro', 'Más de diez', 'Más de cuarenta', 'Más de cien'], 2],

  // ── Honduras_1 · el arrecife de Roatán ─────────────────────────────────────
  ['Honduras_1', 'article', '¿Qué es el blanqueamiento?',
    ['Cuando el coral pierde el color por el calor',
     'Cuando el coral crece encima de la roca',
     'Cuando el agua se llena de arena blanca',
     'Cuando los peces se van del arrecife'], 0],
  ['Honduras_1', 'article', '¿Qué decisión difícil tomaron los pescadores?',
    ['Cerrar algunas zonas a la pesca por varios años',
     'Vender sus lanchas y buscar trabajo en tierra',
     'Mudarse a otra isla donde hubiera más pescado',
     'Salir a pescar de noche para no ser vistos'], 0],
  ['Honduras_1', 'audio', '¿Qué notaron con los años?',
    ['Que salían más horas y volvían con menos pescado',
     'Que salían menos horas y ganaban lo mismo',
     'Que el agua estaba más fría cada temporada',
     'Que llegaban más lanchas de otras caletas'], 0],

  // ── Honduras_2 · los guías de Copán ────────────────────────────────────────
  ['Honduras_2', 'article', '¿Cuántos escalones tiene la Escalinata Jeroglífica?',
    ['Treinta y dos', 'Sesenta y tres', 'Ciento veinte', 'Doscientos diez'], 1],
  ['Honduras_2', 'article', '¿Qué cuenta el texto de la escalinata?',
    ['La historia de los reyes de Copán', 'La historia de los dioses del maíz',
     'Las recetas y comidas de la corte', 'Los mapas de la selva y los ríos'], 0],
  ['Honduras_2', 'article', '¿Qué estudian hoy los jóvenes guías?',
    ['Historia maya, epigrafía e inglés', 'Turismo, hotelería y administración',
     'Matemáticas, física y computación', 'Arqueología, geología y biología'], 0],
  ['Honduras_2', 'audio', '¿Qué le dijo su abuela al final del recorrido?',
    ['Que pasó su vida al lado de esto y no sabía que hablaba',
     'Que ella también quería aprender a leer los glifos',
     'Que su familia trabajó antes en las excavaciones',
     'Que prefería el pueblo antes de que llegaran turistas'], 0],

  // ── El Salvador_0 · la pupusa ──────────────────────────────────────────────
  ['El Salvador_0', 'article', '¿Qué es el curtido?',
    ['Repollo con zanahoria y vinagre', 'Frijoles molidos con queso blanco',
     'Masa de maíz con agua y sal', 'Carne de cerdo frita y molida'], 0],
  ['El Salvador_0', 'audio', '¿Con qué empezó Rosa Elena su negocio?',
    ['Con un comal y una mesita en la carretera',
     'Con seis comales y tres muchachas del pueblo',
     'Con un puesto grande dentro del mercado',
     'Con un camión de comida que le prestaron'], 0],
  ['El Salvador_0', 'audio', '¿Qué pasa si la pupusa queda mal cerrada?',
    ['Se abre en el comal y se sale el queso',
     'Se pega al comal y hay que tirarla',
     'Queda cruda por dentro y no se puede comer',
     'Se hincha y se revienta al voltearla'], 0],

  // ── El Salvador_1 · el café de sombra ──────────────────────────────────────
  ['El Salvador_1', 'article', '¿Qué pasa cuando el café crece más alto?',
    ['Madura más lento y concentra más sabor',
     'Madura más rápido y pierde sabor',
     'Necesita más agua y menos sombra',
     'Da más quintales pero de menor calidad'], 0],
  ['El Salvador_1', 'article', '¿Cuántas especies de aves contó un estudio en estos cafetales?',
    ['Más de veinte', 'Más de cincuenta', 'Más de ciento cincuenta', 'Más de quinientas'], 2],
  ['El Salvador_1', 'audio', '¿Por qué vende su café más caro?',
    ['Porque sabe mejor y no destruye el bosque',
     'Porque produce más quintales por hectárea',
     'Porque su finca queda cerca de la carretera',
     'Porque tiene más trabajadores que el vecino'], 0],

  // ── El Salvador_2 · las surfistas ──────────────────────────────────────────
  ['El Salvador_2', 'article', '¿Cómo son las olas de Punta Roca y El Tunco?',
    ['Largas y parejas, rompen a la derecha',
     'Cortas y bruscas, rompen a la izquierda',
     'Pequeñas y lentas, buenas para empezar',
     'Altas y revueltas, difíciles de montar'], 0],
  ['El Salvador_2', 'article', '¿Qué piden los clubes a cambio del entrenamiento?',
    ['Buenas notas en la escuela', 'Una cuota mensual por alumna',
     'Ayuda para limpiar la playa', 'Su propia tabla y su traje'], 0],
  ['El Salvador_2', 'article', '¿Por qué las tablas son prestadas?',
    ['Para que el dinero no sea una barrera',
     'Para que nadie se las lleve a su casa',
     'Para que todas usen el mismo modelo',
     'Para que duren más de una temporada'], 0],
  ['El Salvador_2', 'audio', '¿Con qué tabla empezó Mariela?',
    ['Con una tabla rota que arregló con cinta adhesiva',
     'Con una tabla nueva que le regaló su papá',
     'Con una tabla prestada del club de la playa',
     'Con una tabla de madera que le hizo su tío'], 0],
  ['El Salvador_2', 'audio', '¿Qué le decía su papá?',
    ['Que una señorita no anda en traje de baño frente a todos',
     'Que el mar de esa playa era demasiado peligroso',
     'Que debía dedicarse a estudiar y no al surf',
     'Que las competencias costaban demasiado dinero'], 0],
  ['El Salvador_2', 'audio', '¿Qué hizo su papá cuando ella ganó el campeonato nacional?',
    ['Fue a verla y lloró', 'Fue a verla y se enojó',
     'No fue y nunca lo mencionó', 'Le compró una tabla nueva'], 0],
  ['El Salvador_2', 'audio', '¿Cuál es la regla del club?',
    ['Primero la escuela, después el agua',
     'Primero el agua, después la escuela',
     'Entrenar todos los días sin faltar',
     'Pagar la cuota antes de cada mes'], 0],
];

let applied = 0;
const missing = [];
for (const [key, where, text, opts, correct] of REWRITES) {
  const list = data[key]?.[where]?.questions;
  if (!list) { missing.push(`${key}.${where} not found`); continue; }
  const q = list.find(q => q.text === text);
  if (!q) { missing.push(`${key} ${where}: "${text.slice(0, 42)}…"`); continue; }
  q.opts = opts.slice();
  q.correct = correct;
  applied++;
}

if (missing.length) {
  console.error('Could not match:\n  ' + missing.join('\n  '));
  process.exit(1);
}

writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`Rewrote ${applied} question sets in weeks 3-4.`);
