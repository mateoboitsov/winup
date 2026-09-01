const U = "/media/18/uploads";

export function guiaImage(name: string) {
  const base = name.replace(/\.(png|PNG|jpeg|JPEG)$/i, ".jpg");
  return `${U}/${base}`;
}

export type GuiaPage = { src: string; label: string };

export const GUIA_PAGES: GuiaPage[] = [
  { src: guiaImage("IMG_0119.jpg"), label: "Portada y créditos" },
  { src: guiaImage("IMG_0120.jpg"), label: "Autores" },
  { src: guiaImage("IMG_0121.jpg"), label: "San Javier, destino turístico" },
  { src: guiaImage("IMG_0122.jpg"), label: "Zona de inmersiones · Isla Grosa y El Farallón" },
  { src: guiaImage("IMG_0123.jpg"), label: "Mapa de inmersiones y tabla técnica" },
  { src: guiaImage("IMG_0124.jpg"), label: "Buceo responsable y sostenible" },
  { src: guiaImage("IMG_0125.jpg"), label: "Índice de las 7 inmersiones · portadilla Punta de León" },
  { src: guiaImage("IMG_0126.PNG"), label: "Punta de León · el arco de Isla Grosa" },
  { src: guiaImage("IMG_0127.jpg"), label: "La Gruta · buceando entre cormoranes" },
  { src: guiaImage("IMG_0128.jpg"), label: "La Virgen · el pulmón de San Javier" },
  { src: guiaImage("IMG_0129.jpg"), label: "El Gran Cañón · la vida oculta de las praderas" },
  { src: guiaImage("IMG_0130.jpg"), label: "Los Callejones · explosión de color" },
  { src: guiaImage("IMG_0131.jpg"), label: "Los Callejones · corales y nudibranquios" },
  { src: guiaImage("IMG_0132.jpg"), label: "Los Callejones · abanicos de vida" },
  { src: guiaImage("IMG_0133.jpg"), label: "La Laja · entre romanos y fenicios" },
  { src: guiaImage("IMG_0134.jpg"), label: "La Laja · ilustración batimétrica" },
  { src: guiaImage("IMG_0135.jpg"), label: "El Anfiteatro · formaciones de ensueño" },
  { src: guiaImage("IMG_0136.jpg"), label: "El Anfiteatro · ilustración y barracudas" },
  { src: guiaImage("IMG_0137.jpg"), label: "Grandes serránidos y pelágicos" },
  { src: guiaImage("IMG_0138.jpg"), label: "Las Columnas · naufragios enigmáticos" },
  { src: guiaImage("IMG_0139.jpg"), label: "Las Columnas · ilustración y pecio" },
  { src: guiaImage("IMG_0140.jpg"), label: "Señales visuales de seguridad" },
  { src: guiaImage("IMG_0141.jpg"), label: "Cubierta · 7 puntos de buceo" },
  { src: guiaImage("IMG_0142.jpg"), label: "Punta de León · el arco de Isla Grosa" },
];

export const GUIA_SPREAD_INDICES = [0, 1, 2, 3, 5];

export type GuiaDive = {
  num: string;
  name: string;
  kicker: string;
  depth: string;
  level: string;
  pages: string;
  body: string;
  imageIndices: number[];
};

export const GUIA_DIVES: GuiaDive[] = [
  {
    num: "01",
    name: "Punta de León",
    kicker: "El arco de Isla Grosa",
    depth: "0–20 m",
    level: "Básico",
    pages: "18–23",
    body: "El arco que atraviesa Isla Grosa: 120 metros de recorrido y 6 metros de profundidad máxima. La portadilla se resolvió a sangre, con la fotografía ocupando la doble página y el nombre de la inmersión en vertical sobre banda crema.",
    imageIndices: [7],
  },
  {
    num: "02",
    name: "La Gruta",
    kicker: "Buceando entre cormoranes",
    depth: "0–14 m",
    level: "Avanzado",
    pages: "24–29",
    body: "La colonia de cormorán moñudo de la cara este de Isla Grosa da nombre y contenido a esta inmersión. Texto científico revisado por biólogo, siempre en dos columnas: castellano arriba, inglés abajo, en menor cuerpo.",
    imageIndices: [8],
  },
  {
    num: "03",
    name: "La Virgen",
    kicker: "El pulmón de San Javier",
    depth: "0–18 m",
    level: "Básico",
    pages: "30–36",
    body: "Las praderas de Posidonia y Cymodocea como eje del capítulo. Aquí entran las ilustraciones batimétricas: una vista mitad aire, mitad agua que sitúa al buceador antes de sumergirse, con su tabla de datos y QR al vídeo.",
    imageIndices: [9],
  },
  {
    num: "04",
    name: "Los Callejones",
    kicker: "Explosión de color",
    depth: "0–12 m",
    level: "Básico",
    pages: "37–43",
    body: "El capítulo más cromático de la guía: comunidades esciáfilas, gorgonias y nudibranquios. Las fotos macro se imprimen a sangre y a página completa para que el color mande sobre el texto.",
    imageIndices: [11],
  },
  {
    num: "05",
    name: "La Laja",
    kicker: "Entre romanos y fenicios",
    depth: "2–20 m",
    level: "Básico",
    pages: "44–49",
    body: "El Bajo de la Campana y el pecio fenicio más grande hallado en el Mediterráneo. Historia y biología comparten página con recortes tipo etiqueta rasgada para nombrar especies.",
    imageIndices: [14],
  },
  {
    num: "06",
    name: "El Anfiteatro",
    kicker: "Formaciones de ensueño",
    depth: "14–17 m",
    level: "Básico",
    pages: "50–55",
    body: "Un afloramiento rocoso en medio de la pradera. Fichas de grandes serránidos y pelágicos sobre fondo papel, con los peces recortados para poder identificarlos de un vistazo.",
    imageIndices: [16],
  },
  {
    num: "07",
    name: "Las Columnas",
    kicker: "Naufragios enigmáticos",
    depth: "24–27 m",
    level: "Avanzado",
    pages: "56–61",
    body: "La inmersión más profunda de la guía, sobre la carga de un barco a 27 metros. Cierra el bloque de inmersiones y enlaza con el capítulo de seguridad y señales visuales.",
    imageIndices: [19],
  },
];

export type GuiaStep = {
  num: string;
  title: string;
  body: string;
  imageIndex: number;
};

export const GUIA_STEPS: GuiaStep[] = [
  {
    num: "01",
    title: "Estructura",
    body: "Definimos el recorrido de las 65 páginas: introducción y territorio, zona de inmersiones, mapa general, buceo responsable, las 7 inmersiones y seguridad. Cada bloque tiene su propio pie de página con jerarquía y numeración.",
    imageIndex: 4,
  },
  {
    num: "02",
    title: "Sistema visual",
    body: "Rejilla a dos y tres columnas, azul institucional sobre papel, crema para portadillas y una cursiva para los subtítulos. Iconografía propia para nivel, recomendaciones, paisaje y fauna, más un código de color para las autorizaciones de la CARM.",
    imageIndex: 6,
  },
  {
    num: "03",
    title: "Fotografía e ilustración",
    body: "Todo el material es propio: fotografía y vídeo submarino en Isla Grosa, El Farallón y La Laja, más ilustraciones batimétricas dibujadas para cada punto de buceo y QR a los vídeos de cada inmersión.",
    imageIndex: 15,
  },
  {
    num: "04",
    title: "Edición bilingüe",
    body: "Maquetación en español e inglés con revisión científica de un biólogo. Cerramos con el bloque de seguridad —señales visuales fotografiadas expresamente— y la preparación de artes finales para imprenta y para digital.",
    imageIndex: 21,
  },
];

export const GUIA_MARQUEE = [
  "Punta de León",
  "La Gruta",
  "La Virgen",
  "Los Callejones",
  "La Laja",
  "El Anfiteatro",
  "Las Columnas",
];

export const GUIA_HERO_IMAGE = guiaImage("IMG_0115.jpg");
