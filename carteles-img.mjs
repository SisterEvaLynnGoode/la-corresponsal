// carteles-img.mjs — the eight real posters the unit is built on.
//
// Replaces the drawn SVGs: these are actual historical posters, which is what
// makes the analysis worth doing. Scans live in img-src/ and are processed by
// prep-carteles-img.mjs into two derivatives — grayscale for the photocopied
// packet, colour for the projector.
//
// `local: true` means the poster is still in copyright. Those files live in
// gitignored img-local/, so they print from Tommy's own machine and the
// published site shows a labelled box instead (see `figCartel`). Everything
// else is public domain and ships with the site.
//
// `hechos` are the facts the answer key is generated from, so the key can never
// drift from what is actually printed on the page.

export const TECNICAS = [
  ['el eslogan',        'mandato',        'Una orden corta que se queda pegada. Casi siempre es un mandato: ¡Únete! ¡No compres! ¡Apaga!'],
  ['la repetición',     'repeticion',     'La misma palabra o la misma forma vuelve, hasta que suena a verdad.'],
  ['el nosotros',       'nosotros',       'Te mete en un grupo al que ya perteneces: «we», «nuestra causa», «la fábrica somos todos».'],
  ['el ellos',          'ellos',          'Alguien tiene la culpa — un país, una empresa, una enfermedad — y nunca es quien hizo el cartel.'],
  ['el tú directo',     'tu-directo',     'Te mira, te señala, te habla de tú: «I want YOU», «¿Tú te has alistado?»'],
  ['la imagen heroica', 'imagen-heroica', 'Una persona grande, fuerte, vista desde abajo. Nadie está cansado ni tiene miedo.'],
  ['el dato',           'dato',           'Un número exacto que suena a prueba. A veces lo es; a veces nadie lo revisa.'],
  ['todos lo hacen',    'todos-lo-hacen', 'Si todos ya firmaron, ya compraron, ya se unieron, ¿qué esperas tú?'],
  ['la llamada',        'llamada',        'Te dice exactamente qué hacer y dónde: firma, preséntate, hazte la prueba, no compres.'],
  ['el humor',          'humor',          'Te hace reír, y lo que te hace reír se te queda. Cuesta enojarse con un chiste.'],
];

export const tecNombre = slug => (TECNICAS.find(t => t[1] === slug) || ['—'])[0];

const P = [
  {
    id: 'wecandoit',
    titulo: '«We Can Do It!»',
    pie: 'J. Howard Miller para Westinghouse, Estados Unidos, 1943',
    credito: 'National Archives · dominio público',
    traduccion: '«¡Nosotros podemos hacerlo!»',
    lado: 'La empresa, en plena guerra',
    tecnicas: ['nosotros', 'imagen-heroica', 'mandato'],
    hechos: {
      primero: 'El brazo y la cara que te mira de frente',
      nosotros: 'Las trabajadoras de Westinghouse y la empresa, juntas en un mismo «we»',
      pide: 'Que produzcas más y que no faltes al turno',
      calla: 'Cuánto les pagaban, cuántas horas, y que el cartel colgó sólo dos semanas dentro de las fábricas de la empresa',
    },
  },
  {
    id: 'huelga',
    local: true,
    titulo: '«¡Viva la huelga!»',
    pie: 'United Farm Workers, California, años sesenta',
    credito: 'Con derechos de autor · sólo para uso en clase',
    traduccion: null,
    lado: 'Los trabajadores del campo',
    tecnicas: ['nosotros', 'llamada', 'imagen-heroica'],
    hechos: {
      primero: 'El águila negra, que es el símbolo del sindicato',
      nosotros: 'Los campesinos en huelga — y quien compra, si deja de comprar',
      pide: 'Que apoyes la huelga y no compres la uva',
      calla: 'Cuánto dura una huelga sin sueldo, y qué pierde el que la hace',
    },
  },
  {
    id: 'samtio',
    titulo: '«I Want You for U.S. Army»',
    pie: 'James Montgomery Flagg, Estados Unidos, 1917',
    credito: 'Library of Congress · dominio público',
    traduccion: '«Te quiero a TI para el ejército de Estados Unidos»',
    lado: 'El gobierno de Estados Unidos',
    tecnicas: ['tu-directo', 'mandato', 'llamada'],
    hechos: {
      primero: 'El dedo, que apunta a quien sea que lo esté viendo',
      nosotros: 'El país entero, representado por un señor inventado: el Tío Sam',
      pide: 'Que te alistes, hoy, en la oficina más cercana',
      calla: 'La guerra. No se ve un soldado, ni un arma, ni una trinchera',
    },
  },
  {
    id: 'moor',
    titulo: '«¿Tú te has alistado como voluntario?»',
    pie: 'Dmitri Moor, Rusia soviética, 1920',
    credito: 'Dominio público',
    traduccion: 'En ruso: «Ты записался добровольцем?»',
    lado: 'El Ejército Rojo, en plena guerra civil',
    tecnicas: ['tu-directo', 'imagen-heroica', 'nosotros'],
    hechos: {
      primero: 'El mismo dedo, tres años después y del otro lado del mundo',
      nosotros: 'Los obreros y soldados de la revolución; detrás se ven las fábricas',
      pide: 'Que te presentes de voluntario',
      calla: 'Lo mismo que calla el Tío Sam: cómo es la guerra de verdad',
    },
  },
  {
    id: 'keepfit',
    titulo: '«Keep Fit — Get Your Test Now»',
    pie: 'WPA Federal Art Project, Chicago, hacia 1939',
    credito: 'Library of Congress · dominio público',
    traduccion: '«Mantente sano — hazte la prueba ahora»',
    lado: 'La salud pública',
    tecnicas: ['ellos', 'mandato', 'llamada'],
    hechos: {
      primero: 'Los corredores saltando vallas',
      nosotros: 'Todos los que pueden enfermarse, o sea todos',
      pide: 'Que te hagas la prueba de la tuberculosis, ahora',
      calla: 'Cuánto costaba la prueba y quién podía faltar al trabajo para ir',
    },
  },
  {
    id: 'anuncio',
    titulo: '«How Many More Can You Eat?»',
    pie: 'Anuncio de Pillsbury, The Saturday Evening Post, 18 de septiembre de 1920',
    credito: 'Dominio público',
    traduccion: '«¿Cuántos más te puedes comer?»',
    lado: 'Una empresa de harina',
    tecnicas: ['tu-directo', 'todos-lo-hacen', 'mandato'],
    hechos: {
      primero: 'La señora sonriendo con la torre de panqueques',
      nosotros: 'Las familias — y la mamá que cocina y nunca alcanza a comer',
      pide: 'Que compres esa harina y no otra',
      calla: 'Que los panqueques salen igual con harina de cualquier marca',
    },
  },
  {
    id: 'boomboom',
    local: true,
    titulo: '«Sister Boom Boom for Supervisor»',
    pie: 'Campaña municipal, San Francisco, 2 de noviembre de 1982',
    credito: 'Con derechos de autor · sólo para uso en clase',
    traduccion: '«Sister Boom Boom para supervisora»',
    lado: 'Una candidata de protesta',
    tecnicas: ['humor', 'tu-directo', 'repeticion'],
    hechos: {
      primero: 'La monja volando en una escoba',
      nosotros: 'Los votantes a los que nadie les hace caso',
      pide: 'Que votes el 2 de noviembre',
      calla: 'Qué haría en el puesto. El chiste es el mensaje',
    },
  },
  {
    id: 'falso',
    titulo: '«Labor · Liberty · Union»',
    pie: 'Dice «American-Soviet Commonwealth, 1936». No existió nunca',
    credito: 'Imagen generada por inteligencia artificial, 2026',
    traduccion: '«Trabajo · Libertad · Unión» / «Defiende · Construye · Únete»',
    lado: 'Nadie: es una invención',
    tecnicas: ['nosotros', 'imagen-heroica', 'repeticion'],
    falso: true,
    hechos: {
      primero: 'El obrero con el puño arriba y las banderas',
      nosotros: 'Nadie real: «un pueblo, un futuro» no es de ningún país que haya existido',
      pide: 'Nada. No lo hizo un sindicato ni un gobierno: lo hizo una máquina',
      calla: 'Que nunca hubo una «mancomunidad americano-soviética». Las letras de abajo se deshacen si te acercas, y las banderas no son banderas de nada',
    },
  },
];

export const CARTELES = P;
export const byId = id => P.find(c => c.id === id);

const carpeta = c => (c.local ? '../img-local/carteles' : '../img/carteles');

// Packet figure: grayscale image, credit line, and — when the file is missing
// because it is one of the in-copyright ones on the public site — a labelled
// box in its place, so the page still prints and still makes sense.
export function figCartel(id, { nota = '', clase = '' } = {}) {
  const c = byId(id);
  return `<figure class="cartel ${clase}">
  <img src="${carpeta(c)}/${c.id}-gris.jpg" alt="${c.titulo}"
       onerror="this.closest('figure').classList.add('falta')">
  <div class="falta-caja">${c.titulo}<br><span>Cartel con derechos de autor:
    proyéctalo desde la carpeta de la clase</span></div>
  <figcaption><b>${c.titulo}</b> · ${c.pie}${nota ? ` · ${nota}` : ''}
    <span class="cred">${c.credito}</span></figcaption>
</figure>`;
}

// Deck figure: colour, no credit clutter — the credit goes in the eyebrow.
export function imgCartel(id, { clase = '' } = {}) {
  const c = byId(id);
  return `<img class="cartelImg ${clase}" src="${c.local ? 'img-local/carteles' : 'img/carteles'}/${c.id}.jpg"
     alt="${c.titulo}" onerror="this.classList.add('falta')">`;
}
