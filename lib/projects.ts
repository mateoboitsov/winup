export type ProjectVideo = {
  src: string;
  poster?: string;
  caption?: string;
};

export type ProjectSection = {
  title: string;
  body: string;
};

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
  /** Bloques de texto adicionales intercalados en la ficha. */
  sections?: ProjectSection[];
  /** Vídeos verticales (9:16) para el carrusel. */
  videos?: ProjectVideo[];
  /** Entregables / alcance del proyecto. */
  deliverables?: string[];
  /** Cliente o marca. */
  client?: string;
};

/** Codifica segmentos de ruta (espacios, tildes, ¡¿, etc.). */
export function assetUrl(path: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return path
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(segment) : ""))
    .join("/");
}

const NEGRO_MATE_STATEMENT =
  "Negro Mate es una cafetería de especialidad que apuesta por una estética minimalista y atemporal. Su identidad se construye a partir de una paleta monocromática en blanco y negro, que refleja elegancia, sobriedad y atención al detalle —valores que también se encuentran en cada taza de café que sirven.\n\nEl diseño visual se apoya en ilustraciones originales que representan los distintos productos que se ofrecen en la tienda. Estas ilustraciones aportan un toque distintivo y cálido, rompiendo con la rigidez del blanco y negro, y creando un universo visual propio que conecta con el público amante del café y del diseño cuidado.\n\nEl sistema gráfico se aplica de forma coherente en packaging, señalética, menús y redes sociales, reforzando una marca con personalidad, limpia pero cercana.";

const XWHITE_SESSION = [
  70, 75, 80, 85, 90, 95, 100, 105, 110,
].map((n) => `/proyectos/SESIÓN DE FOTOS/xwhite /${n}.png`);

export const PROJECTS_DATA: Project[] = [
  {
    id: 1,
    title: "Negro Mate",
    category: "Branding",
    year: "2025",
    client: "Negro Mate",
    cover: "/media/1/cover.jpg",
    images: [
      "/media/1/01.jpg",
      "/media/1/02.jpg",
      "/media/1/03.jpg",
      "/media/1/04.jpg",
      "/media/1/05.jpg",
      "/media/1/06.jpg",
      "/media/1/07.jpg",
      "/proyectos/BRANDING/Cafetería Negro Mate/Fachada.jpg",
      "/proyectos/BRANDING/Cafetería Negro Mate/Menú.jpg",
      "/proyectos/BRANDING/Cafetería Negro Mate/Uniformes.jpg",
      "/proyectos/BRANDING/Cafetería Negro Mate/Valla.jpg",
      "/proyectos/BRANDING/Cafetería Negro Mate/Ticket.jpg",
      "/proyectos/BRANDING/Cafetería Negro Mate/Aplicaciones RRSS.jpg",
      "/proyectos/BRANDING/Cafetería Negro Mate/Vaso de Café.png",
      "/proyectos/BRANDING/Cafetería Negro Mate/Recursos de Marca.png",
    ],
    label: "Branding",
    statement: NEGRO_MATE_STATEMENT,
    deliverables: [
      "Identidad visual",
      "Ilustraciones de producto",
      "Packaging y señalética",
      "Aplicaciones RRSS",
    ],
    sections: [
      {
        title: "Sistema gráfico",
        body: "Definimos una base tipográfica y un universo ilustrado que se reconoce en vaso, ticket, menú y fachada. Cada aplicación refuerza la misma idea: sobriedad con calor humano.",
      },
      {
        title: "Presencia en el local",
        body: "Del uniforme a la valla: el branding no se queda en el PDF. Se vive en el espacio y en el día a día del café.",
      },
    ],
  },
  {
    id: 2,
    title: "Palacio de los Deportes 30",
    category: "Motion",
    year: "2025",
    client: "Palacio de los Deportes",
    cover: "/media/2/cover.jpg",
    images: [
      "/media/2/01.jpg",
      "/media/2/02.jpg",
      "/media/2/03.jpg",
      "/media/2/04.jpg",
      "/media/2/05.jpg",
      "/proyectos/PROYECTO 30 PALACIO DE LOS DEPORTES/IMG_5173.PNG",
      "/proyectos/PROYECTO 30 PALACIO DE LOS DEPORTES/IMG_5174.PNG",
      "/proyectos/PROYECTO 30 PALACIO DE LOS DEPORTES/IMG_5175.PNG",
      "/proyectos/PROYECTO 30 PALACIO DE LOS DEPORTES/IMG_5177.PNG",
      "/proyectos/PROYECTO 30 PALACIO DE LOS DEPORTES/IMG_5179.PNG",
      "/proyectos/PROYECTO 30 PALACIO DE LOS DEPORTES/IMG_5180.PNG",
    ],
    label: "Evento",
    statement:
      "El Palacio de los Deportes cumple 30 años y la campaña tenía que sentirse como una celebración, no como un aniversario corporativo. Trabajamos motion, stills y piezas para redes con un tono directo, energético y muy murciano.\n\nEl objetivo era movilizar público y recordar por qué este espacio sigue siendo referente de cultura, deporte y directo. Cada frame empuja al siguiente: ritmo de evento, tipografía grande y un mensaje claro.\n\nEl resultado es un ecosistema visual listo para stories, feed y pantallas: la misma idea, distintos formatos, misma intensidad.",
    deliverables: ["Motion", "Stills", "Piezas RRSS", "Campaña aniversario"],
    sections: [
      {
        title: "De la idea al scroll",
        body: "Diseñamos piezas pensadas para parar el dedo: titulares cortos, contraste alto y una lectura inmediata del mensaje del 30 aniversario.",
      },
      {
        title: "Formato vertical",
        body: "Además de los stills, preparamos vídeo en formato vertical para Instagram y TikTok: el mismo claim, adaptado al ritmo del feed.",
      },
    ],
    videos: [
      {
        src: "/proyectos/PROYECTO 30 PALACIO DE LOS DEPORTES/¡El Palacio cumple 30 años y viene MUY fuerte!¿Te creías que esto iba a ser un cumple cualquiera.mp4",
        poster: "/media/2/cover.jpg",
        caption: "Reel aniversario",
      },
    ],
  },
  {
    id: 3,
    title: "Arde Bogotá",
    category: "Motion",
    year: "2025",
    client: "Arde Bogotá",
    cover: "/media/3/cover.jpg",
    images: [
      "/proyectos/PROYECTO ARDE BOGOTA/IMG_4765.JPG",
    ],
    label: "Motion",
    statement:
      "Arde Bogotá pide energía en directo. Esta pieza audiovisual traduce el directo a lenguaje de redes: cortes rápidos, presencia de banda y una narrativa pensada para Instagram.\n\nNo buscamos un teaser genérico. Buscamos que quien lo vea sienta la sala: volumen, público y esa tensión previa al primer tema.\n\nEl formato vertical es el canal natural: se consume en el móvil, se comparte y mantiene la intensidad del concierto en 15–30 segundos.",
    deliverables: ["Motion vertical", "Pieza Instagram", "Stills de campaña"],
    sections: [
      {
        title: "Ritmo de directo",
        body: "Editamos al tempo de la banda: entradas fuertes, respiraciones cortas y un cierre que deja ganas de más.",
      },
    ],
    videos: [
      {
        src: "/proyectos/PROYECTO ARDE BOGOTA/SonBuenos - Arde Bogotá (instagram).mp4",
        poster: "/media/3/cover.jpg",
        caption: "Reel Instagram",
      },
    ],
  },
  {
    id: 4,
    title: "La Cañada",
    category: "Fotografía",
    year: "2025",
    client: "La Cañada",
    cover: "/media/4/cover.jpg",
    images: [
      "/media/4/01.jpg",
      "/media/4/02.jpg",
      "/media/4/03.jpg",
      "/media/4/04.jpg",
      "/proyectos/PROYECTO LA CAÑADA/_MG_0078.jpg",
      "/proyectos/PROYECTO LA CAÑADA/b1fe5e62-1aff-4fdc-9f59-9d7b09ef2d3a.JPG",
      "/proyectos/PROYECTO LA CAÑADA/b841ecb0-5dd0-4049-8e57-7993e37903dd.JPG",
      "/proyectos/PROYECTO LA CAÑADA/WhatsApp Image 2025-04-27 at 18.02.09-5.jpeg",
      "/proyectos/PROYECTO LA CAÑADA/WhatsApp Image 2025-04-27 at 18.02.10-3.jpeg",
    ],
    label: "Fotografía",
    statement:
      "Sesión fotográfica para La Cañada: atmósfera, detalle y presencia de marca en entorno real. Priorizamos luz natural, texturas y una lectura limpia del producto y del espacio.\n\nCada fotograma busca transmitir calma y carácter sin forzar el estilo. El resultado sirve tanto para web como para redes: material versátil, coherente y listo para editar.\n\nTrabajamos plano general y detalle para que la marca tenga rango: desde la primera impresión hasta el close-up que se queda en la memoria.",
    deliverables: ["Sesión fotográfica", "Selección final", "Retoque"],
    sections: [
      {
        title: "Luz y contexto",
        body: "Disparamos en el propio entorno para que la marca respire verdad: menos set, más lugar.",
      },
    ],
  },
  {
    id: 5,
    title: "La Disquera",
    category: "Fotografía",
    year: "2025",
    client: "La Disquera",
    cover: "/media/5/cover.jpg",
    images: [
      "/media/5/01.jpg",
      "/proyectos/PROYECTO LA DISQUERA/La Disquera-6.jpg",
      "/proyectos/PROYECTO LA DISQUERA/La Disquera-9.jpg",
    ],
    label: "Fotografía",
    statement:
      "Retrato de La Disquera: vinilos, espacio y cultura musical en una lectura visual limpia. Queríamos que se notara el oficio y el ambiente sin sobrecargar la imagen.\n\nLa sesión combina detalle de producto y planos que explican el local. Ideal para comunicación de marca y para quien descubre el espacio por primera vez en redes.\n\nMenos pose, más presencia: la fotografía deja hablar al sitio.",
    deliverables: ["Retrato de espacio", "Detalle de producto", "Piezas RRSS"],
    sections: [
      {
        title: "Cultura en el encuadre",
        body: "Composiciones sobrias que ponen el foco en lo esencial: el disco, la luz y el carácter del local.",
      },
    ],
  },
  {
    id: 6,
    title: "Turismo Región de Murcia",
    category: "Motion",
    year: "2025",
    client: "Turismo Región de Murcia",
    cover: "/media/6/cover.jpg",
    images: [
      "/proyectos/PROYECTO TURISMO DE LA REGION DE MURCIA/murcia-la-manga-2.jpeg",
    ],
    label: "Turismo",
    statement:
      "Comunicación audiovisual para Turismo de la Región de Murcia: destino, luz y territorio. El brief pedía una pieza con vocación MICE y una lectura clara del atractivo regional.\n\nConstruimos un relato visual que equilibra paisaje, actividad y hospitalidad. El motion sirve para ferias, pantallas y redes: mismo mensaje, distinto contexto de visionado.\n\nLa Región se cuenta sin catálogo: se siente.",
    deliverables: ["Motion MICE", "Stills", "Adaptaciones verticales"],
    sections: [
      {
        title: "Destino en movimiento",
        body: "Secuencias pensadas para transmitir amplitud y ritmo: del territorio a la experiencia, sin perder elegancia institucional.",
      },
    ],
    videos: [
      {
        src: "/proyectos/PROYECTO TURISMO DE LA REGION DE MURCIA/V3 - MICE - Regio_n de Murcia.mp4",
        poster: "/media/6/cover.jpg",
        caption: "Pieza MICE",
      },
    ],
  },
  {
    id: 7,
    title: "XWHITE",
    category: "Branding",
    year: "2025",
    client: "XWHITE",
    cover: "/media/7/cover.jpg",
    images: [
      "/media/7/01.jpg",
      "/proyectos/PROYECTO XWHITE/73 (1).png",
      "/proyectos/PROYECTO XWHITE/89 (1).png",
      ...XWHITE_SESSION,
    ],
    label: "Branding",
    statement:
      "Identidad y piezas visuales para XWHITE: contraste, producto y lenguaje gráfico contemporáneo. Partimos de una dirección limpia para que el producto hable con fuerza.\n\nLa sesión y las aplicaciones refuerzan un universo blanco, preciso y premium. Cada imagen suma a una misma lectura de marca: clara, moderna y reconocible.\n\nDel still al sistema: coherencia en feed, lookbook y comunicación comercial.",
    deliverables: ["Dirección de arte", "Sesión de producto", "Piezas de marca"],
    sections: [
      {
        title: "Contraste y producto",
        body: "Composiciones con mucho aire y foco en textura. El blanco no es vacío: es el territorio de la marca.",
      },
      {
        title: "Serie fotográfica",
        body: "Una secuencia pensada para scroll: variaciones de pose, detalle y atmósfera que mantienen el mismo criterio visual.",
      },
    ],
  },
  {
    id: 8,
    title: "Sabe a Murcia",
    category: "Fotografía",
    year: "2025",
    client: "Sabe a Murcia",
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
      "/proyectos/SABEAMURCIA/DSC06622.JPG",
      "/proyectos/SABEAMURCIA/DSC06646.JPG",
      "/proyectos/SABEAMURCIA/DSC06685.JPG",
      "/proyectos/SABEAMURCIA/DSC06709.JPG",
      "/proyectos/SABEAMURCIA/DSC06742.JPG",
      "/proyectos/SABEAMURCIA/DSC06781.JPG",
    ],
    label: "Fotografía",
    statement:
      "Cobertura fotográfica de Sabe a Murcia: producto, gente y territorio con mirada documental. Capturamos el evento sin perder el sabor del lugar.\n\nHay planos de producto, de público y de ambiente. El conjunto cuenta una historia de región: lo que se cocina, quién lo comparte y cómo se vive.\n\nMaterial listo para prensa, redes y memoria del evento.",
    deliverables: ["Cobertura de evento", "Selección editorial", "Piezas RRSS"],
    sections: [
      {
        title: "Documento con criterio",
        body: "Entre el reportaje y la marca: imágenes útiles, honestas y con dirección clara para que el festival se recuerde bien.",
      },
    ],
  },
];

/** Cover del proyecto (misma URL en espiral y detalle → sin parpadeo en la transición). */
export function coverUrl(id: number) {
  return assetUrl(getProject(id)?.cover ?? "");
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
