export type Project = {
  id: number;
  title: string;
  category: string;
  year: string;
  /** Cover / hero (espiral + detalle). Versión optimizada en /media. */
  cover: string;
  /** Imágenes de galería (sin incluir el cover). */
  images: string[];
  /** Etiqueta corta de la sección manifiesto. */
  label: string;
  /** Texto largo de la sección manifiesto bajo el hero. */
  statement: string;
};

const NEGRO_MATE_STATEMENT =
  "Negro Mate es una cafetería de especialidad que apuesta por una estética minimalista y atemporal. Su identidad se construye a partir de una paleta monocromática en blanco y negro, que refleja elegancia, sobriedad y atención al detalle —valores que también se encuentran en cada taza de café que sirven.\n\nEl diseño visual se apoya en ilustraciones originales que representan los distintos productos que se ofrecen en la tienda. Estas ilustraciones aportan un toque distintivo y cálido, rompiendo con la rigidez del blanco y negro, y creando un universo visual propio que conecta con el público amante del café y del diseño cuidado.\n\nEl sistema gráfico se aplica de forma coherente en packaging, señalética, menús y redes sociales, reforzando una marca con personalidad, limpia pero cercana.";

export const PROJECTS_DATA: Project[] = [
  {
    id: 1,
    title: "Negro Mate",
    category: "Branding",
    year: "2025",
    cover: "/media/1/cover.jpg",
    images: [
      "/media/1/01.jpg",
      "/media/1/02.jpg",
      "/media/1/03.jpg",
      "/media/1/04.jpg",
      "/media/1/05.jpg",
      "/media/1/06.jpg",
      "/media/1/07.jpg",
    ],
    label: "Branding",
    statement: NEGRO_MATE_STATEMENT,
  },
  {
    id: 2,
    title: "Palacio de los Deportes 30",
    category: "Motion",
    year: "2025",
    cover: "/media/2/cover.jpg",
    images: [
      "/media/2/01.jpg",
      "/media/2/02.jpg",
      "/media/2/03.jpg",
      "/media/2/04.jpg",
      "/media/2/05.jpg",
    ],
    label: "Evento",
    statement:
      "Campaña visual para el 30 aniversario del Palacio de los Deportes: piezas de motion y stills que celebran tres décadas de cultura, deporte y público en Murcia.",
  },
  {
    id: 3,
    title: "Arde Bogotá",
    category: "Motion",
    year: "2025",
    cover: "/media/3/cover.jpg",
    images: [],
    label: "Motion",
    statement:
      "Pieza audiovisual para Arde Bogotá: energía en directo, ritmo y narrativa visual pensada para redes y directo.",
  },
  {
    id: 4,
    title: "La Cañada",
    category: "Fotografía",
    year: "2025",
    cover: "/media/4/cover.jpg",
    images: [
      "/media/4/01.jpg",
      "/media/4/02.jpg",
      "/media/4/03.jpg",
      "/media/4/04.jpg",
    ],
    label: "Fotografía",
    statement:
      "Sesión fotográfica para La Cañada: atmósfera, detalle y presencia de marca en entorno real.",
  },
  {
    id: 5,
    title: "La Disquera",
    category: "Fotografía",
    year: "2025",
    cover: "/media/5/cover.jpg",
    images: ["/media/5/01.jpg"],
    label: "Fotografía",
    statement:
      "Retrato de La Disquera: vinilos, espacio y cultura musical en una lectura visual limpia.",
  },
  {
    id: 6,
    title: "Turismo Región de Murcia",
    category: "Motion",
    year: "2025",
    cover: "/media/6/cover.jpg",
    images: [],
    label: "Turismo",
    statement:
      "Comunicación audiovisual para Turismo de la Región de Murcia: destino, luz y territorio.",
  },
  {
    id: 7,
    title: "XWHITE",
    category: "Branding",
    year: "2025",
    cover: "/media/7/cover.jpg",
    images: ["/media/7/01.jpg"],
    label: "Branding",
    statement:
      "Identidad y piezas visuales para XWHITE: contraste, producto y lenguaje gráfico contemporáneo.",
  },
  {
    id: 8,
    title: "Sabe a Murcia",
    category: "Fotografía",
    year: "2025",
    cover: "/media/8/cover.jpg",
    images: [
      "/media/8/01.jpg",
      "/media/8/02.jpg",
      "/media/8/03.jpg",
      "/media/8/04.jpg",
      "/media/8/05.jpg",
      "/media/8/06.jpg",
      "/media/8/07.jpg",
      "/media/8/08.jpg",
      "/media/8/09.jpg",
      "/media/8/10.jpg",
      "/media/8/11.jpg",
    ],
    label: "Fotografía",
    statement:
      "Cobertura fotográfica de Sabe a Murcia: producto, gente y territorio con mirada documental.",
  },
];

/** Cover del proyecto (misma URL en espiral y detalle → sin parpadeo en la transición). */
export function coverUrl(id: number) {
  return getProject(id)?.cover ?? "";
}

/** @deprecated Preferir coverUrl — se mantiene por compatibilidad. */
export function gradientUrl(id: number) {
  return coverUrl(id);
}

export function getProject(id: number): Project | undefined {
  return PROJECTS_DATA.find((p) => p.id === id);
}

export function getNextProject(id: number): Project {
  const index = PROJECTS_DATA.findIndex((p) => p.id === id);
  const nextIndex = index < 0 ? 0 : (index + 1) % PROJECTS_DATA.length;
  return PROJECTS_DATA[nextIndex]!;
}
