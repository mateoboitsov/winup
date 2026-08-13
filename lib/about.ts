export type TeamMember = {
  name: string;
  role: string;
  bio: string;
};

export const ABOUT_STORY = {
  eyebrow: "Nuestra historia",
  title: "De una idea a una agencia que mueve marcas.",
  paragraphs: [
    "winup. nació para resolver lo que muchas marcas necesitan y pocas agencias entregan junto: estrategia, contenido y ejecución con criterio.",
    "Empezamos haciendo lo que creíamos que faltaba: menos ruido, más claridad, y piezas que no solo se ven bien, sino que convierten.",
    "Hoy acompañamos a negocios que quieren crecer con presencia digital seria: redes, contenido, eventos, publicidad y web, siempre con el mismo foco en resultado.",
  ],
} as const;

/** Sustituye nombres, roles y bios cuando el equipo esté cerrado. */
export const TEAM: TeamMember[] = [
  {
    name: "Nombre",
    role: "Dirección",
    bio: "Visión de marca, estrategia y cierre de proyectos. La persona que alinea el qué y el para qué.",
  },
  {
    name: "Nombre",
    role: "Creatividad",
    bio: "Concepto, dirección de arte y storytelling. Convierte la estrategia en piezas que paran el scroll.",
  },
  {
    name: "Nombre",
    role: "Producción",
    bio: "Contenido, rodajes y entrega. Del brief a la pieza lista para publicar, sin fricción.",
  },
  {
    name: "Nombre",
    role: "Growth",
    bio: "Ads, medición y optimización. Que cada campaña tenga lectura clara y margen de mejora.",
  },
];
