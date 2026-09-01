import { featuredCoverDataUrl } from "@/lib/featuredCover";

export type ProjectVideo = {
  src: string;
  poster?: string;
  caption?: string;
};

export type ProjectSection = {
  title: string;
  body: string;
};

export type ProjectGallery = {
  title: string;
  images: string[];
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
  /** Galerías agrupadas (p. ej. fotos corporativas por cliente). */
  galleries?: ProjectGallery[];
  /** Etiqueta corta de la sección manifiesto. */
  label: string;
  /** Texto largo de la sección manifiesto bajo el hero. */
  statement: string;
  /** Bloques de texto adicionales intercalados en la ficha. */
  sections?: ProjectSection[];
  /** Vídeos (9:16) para el carrusel. */
  videos?: ProjectVideo[];
  /** Reels (9:16), sección aparte de los vídeos. Archivos: reel-NN.mp4 */
  reels?: ProjectVideo[];
  /** Texto introductorio encima del carrusel de reels. */
  reelIntro?: string;
  /** Vista previa embebida (p. ej. HTML interactivo). */
  previewUrl?: string;
  /** Entregables / alcance del proyecto. */
  deliverables?: string[];
  /** Resumen corto al cierre de la ficha (opcional; si no hay, usa entregables). */
  summary?: string;
  /** Cliente o marca. */
  client?: string;
  /** contain: portadas gráficas (no recortar logos ni tipografía). */
  heroFit?: "cover" | "contain";
  /** Destacado en la espiral: tarjeta sin portada (color acento + cliente). */
  featured?: boolean;
};

export type ProjectMediaKind = "video-only" | "mixed" | "photo-only";

export function projectMediaKind(
  project: Pick<Project, "images" | "videos">
): ProjectMediaKind {
  const hasImages = project.images.length > 0;
  const hasVideos = (project.videos?.length ?? 0) > 0;
  if (hasVideos && !hasImages) return "video-only";
  if (hasVideos && hasImages) return "mixed";
  return "photo-only";
}

export function isVideoOnlyProject(
  project: Pick<Project, "images" | "videos">
): boolean {
  return projectMediaKind(project) === "video-only";
}

/** Codifica segmentos de ruta (espacios, tildes, ¡¿, etc.). */
export function assetUrl(path: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return path
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(segment) : ""))
    .join("/");
}

function project(draft: Omit<Project, "cover" | "images" | "videos">): Project {
  return {
    ...draft,
    cover: `/media/${draft.id}/cover.jpg`,
    images: [],
  };
}

const NEGRO_MATE_STATEMENT =
  "Negro Mate es una cafetería de especialidad que apuesta por una estética minimalista y atemporal. Su identidad se construye a partir de una paleta monocromática en blanco y negro, que refleja elegancia, sobriedad y atención al detalle —valores que también se encuentran en cada taza de café que sirven.\n\nEl diseño visual se apoya en ilustraciones originales que representan los distintos productos que se ofrecen en la tienda. Estas ilustraciones aportan un toque distintivo y cálido, rompiendo con la rigidez del blanco y negro, y creando un universo visual propio que conecta con el público amante del café y del diseño cuidado.\n\nEl sistema gráfico se aplica de forma coherente en packaging, señalética, menús y redes sociales, reforzando una marca con personalidad, limpia pero cercana.";

export const PROJECTS_DATA: Project[] = [
  project({
    id: 1,
    title: "Negro Mate",
    category: "Branding",
    year: "2025",
    client: "Negro Mate",
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
  }),
  project({
    id: 2,
    title: "Palacio de los Deportes 30",
    category: "Motion",
    year: "2025",
    client: "Palacio de los Deportes",
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
  }),
  project({
    id: 3,
    title: "Arde Bogotá",
    category: "Motion",
    year: "2025",
    client: "Arde Bogotá",
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
  }),
  project({
    id: 4,
    title: "Cañada Honda",
    category: "Fotografía",
    year: "2025",
    client: "Cañada Honda",
    label: "Fotografía",
    statement:
      "Sesión para Cañada Honda: atmósfera, detalle y presencia de marca en entorno real. Priorizamos luz, texturas y una lectura limpia del espacio y de la experiencia.\n\nCada fotograma busca transmitir carácter sin forzar el estilo. El resultado sirve tanto para web como para redes: material versátil, coherente y listo para comunicar.\n\nTrabajamos plano general y detalle para que la marca tenga rango: desde la primera impresión hasta el close-up que se queda.",
    deliverables: ["Sesión fotográfica", "Selección final", "Retoque"],
    sections: [
      {
        title: "Luz y contexto",
        body: "Disparamos en el propio entorno para que la marca respire verdad: menos set, más lugar.",
      },
    ],
  }),
  project({
    id: 5,
    title: "La Disquera",
    category: "Evento",
    year: "2025",
    client: "La Disquera",
    label: "Evento",
    statement:
      "Un evento no se cubre solo el día que ocurre. Se prepara antes y se sigue contando después.\n\nCon La Disquera trabajamos las tres fases: la pre-campaña que genera expectación, la campaña que empuja hasta la fecha y la cobertura completa durante el evento. Fotografía y vídeo, sin perder de vista el ambiente y la cultura musical que hay detrás.\n\nMaterial para publicar en caliente y para seguir usando semanas después.",
    deliverables: ["Pre-campaña", "Campaña", "Cobertura de evento", "Reels"],
  }),
  project({
    id: 6,
    title: "Turismo Región de Murcia",
    category: "Motion",
    year: "2025",
    client: "Turismo Región de Murcia",
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
  }),
  project({
    id: 7,
    title: "XWHITE",
    category: "Branding",
    year: "2025",
    client: "XWHITE",
    label: "Branding",
    statement:
      "Identidad y piezas visuales para XWHITE: contraste, producto y lenguaje gráfico contemporáneo. Partimos de una dirección limpia para que el producto hable con fuerza.\n\nLa sesión de estudio y el motion refuerzan un universo preciso y premium. Cada imagen suma a una misma lectura de marca: clara, moderna y reconocible.\n\nDel still al sistema: coherencia en feed, lookbook y comunicación comercial.",
    deliverables: ["Dirección de arte", "Sesión de producto", "Motion de marca"],
    sections: [
      {
        title: "Contraste y producto",
        body: "Composiciones con mucho aire y foco en textura. El blanco no es vacío: es el territorio de la marca.",
      },
      {
        title: "Una identidad, varios caminos",
        body: "La pieza de motion cierra el relato: tres caminos, una identidad. Misma precisión, distinto encuadre.",
      },
    ],
  }),
  project({
    id: 8,
    title: "Sabe a Murcia",
    category: "Fotografía",
    year: "2025",
    client: "Sabe a Murcia",
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
  }),
  project({
    id: 9,
    title: "La Laguna Sound",
    category: "Motion",
    year: "2025",
    client: "La Laguna Sound",
    label: "Evento",
    statement:
      "Un festival no empieza el día que abre puertas. Empieza meses antes, cuando hay que convencer a alguien de que ese fin de semana merece la pena.\n\nCon La Laguna Sound acompañamos todo el camino: la expectativa previa, la campaña que llena el recinto y los tres días de festival cubiertos de principio a fin. Vídeo, fotografía, entrevistas y ese contenido que se sube mientras todavía suena la música.\n\nUn año de trabajo para que el público lo viva dos veces: allí y en el móvil.",
    deliverables: ["Campaña previa", "Cobertura de festival", "Reels", "Entrevistas"],
    reelIntro:
      "Todo lo que pasó, contado en vertical: aftermovie, entrevistas y el día a día del festival.",
  }),
  project({
    id: 10,
    title: "Bigup",
    category: "Motion",
    year: "2025",
    client: "Bigup",
    label: "Evento",
    statement:
      "Bigup es el escenario de los que aún no llenan estadios. Y esa es justo la historia que contamos.\n\nDirección visual y piezas de campaña con una idea clara: que cada cartel funcione como una presentación. Nombres que el público todavía no conoce, tratados con la misma fuerza que un cabeza de cartel.\n\nY el día del evento, allí: fotografía y vídeo para que el directo también viva en el feed.\n\nMenos ruido, más presencia.",
    deliverables: ["Dirección visual", "Piezas de campaña", "Cobertura de evento", "Reels"],
  }),
  project({
    id: 11,
    title: "Hotel Nelva",
    category: "Fotografía",
    year: "2025",
    client: "Hotel Nelva",
    label: "Fotografía",
    statement:
      "Hotel Nelva en Murcia: hospitalidad, espacio y detalle. Fotografiamos el hotel como se vive, no como un catálogo frío.\n\nStills y fotografía conviven para web, reservas y redes. Luz de interior, materiales y una lectura premium del servicio.\n\nEl objetivo era claro: que quien lo vea quiera quedarse.",
    deliverables: ["Fotografía de hotel", "Stills", "Material web y RRSS"],
    sections: [
      {
        title: "Hospitalidad en imagen",
        body: "Planos de espacio y de ambiente para que el hotel se entienda en un vistazo: dónde estás y cómo se siente.",
      },
    ],
  }),
  project({
    id: 12,
    title: "Odiseo",
    category: "Motion",
    year: "2025",
    client: "Odiseo",
    label: "Motion",
    statement:
      "Odiseo pide espectáculo. Extraemos stills de alta densidad visual para que el ocio se lea premium: luz, arquitectura y noche.\n\nLas piezas sirven para campaña y para redes. Una dirección de arte contenida, con el volumen justo para que el recinto hable.\n\nMurcia de noche, con criterio.",
    deliverables: ["Stills de campaña", "Dirección de arte", "Piezas RRSS"],
    sections: [
      {
        title: "Noche con dirección",
        body: "Elegimos frames que venden el lugar sin recargarlo: contraste, escala y una paleta que se reconoce.",
      },
    ],
  }),
  project({
    id: 13,
    title: "Licor 43",
    category: "Fotografía",
    year: "2025",
    client: "Licor 43",
    label: "Fotografía",
    statement:
      "Licor 43 en Cartagena: producto, territorio y una marca que ya es icono. La sesión busca el cruce entre el oro de la botella y la luz del puerto.\n\nFotografía de producto y de contexto para que la marca se sienta cercana y premium a la vez.\n\nMaterial para campaña, punto de venta y redes.",
    deliverables: ["Fotografía de producto", "Entorno y campaña", "Selección final"],
    sections: [
      {
        title: "Producto y lugar",
        body: "La botella no flota en un fondo vacío: se ancla a Cartagena. El territorio suma, no distrae.",
      },
    ],
  }),
  project({
    id: 14,
    title: "FASRM",
    category: "FASRM",
    year: "2025",
    client: "FASRM",
    label: "Redes",
    statement:
      "Con FASRM no vamos a un evento puntual: llevamos las redes durante todo el año.\n\nNos encargamos de la estrategia, el calendario y todo el contenido: fotografía, vídeo y las piezas que salen cada semana. Y cuando hay evento, estamos allí para cubrirlo entero.\n\nLa fotografía sostiene el relato; el vídeo lo cierra. Mismo criterio, dos velocidades.\n\nMaterial útil el mismo día y con recorrido después.",
    deliverables: ["Estrategia RRSS", "Calendario editorial", "Fotografía", "Vídeo", "Diseño"],
  }),
  project({
    id: 15,
    title: "Forbes · Mainkore",
    category: "Motion",
    year: "2025",
    client: "Mainkore",
    label: "Aftermovie",
    heroFit: "contain",
    statement:
      "Aftermovie para Mainkore en clave Forbes: evento, networking y una marca que se ve en movimiento.\n\nMontaje de ritmo alto, pensado para recap y para que el cliente lo enseñe como prueba de lo que ocurrió en sala.\n\nUna pieza, varios cortes, misma tensión.",
    deliverables: ["Aftermovie", "Edición de evento", "Pieza de marca"],
    sections: [
      {
        title: "El evento, compacto",
        body: "Seleccionamos los momentos que construyen estatus: llegada, escena, cierre. Sin minutos muertos.",
      },
    ],
  }),
  project({
    id: 16,
    title: "Flexomed",
    category: "Motion",
    year: "2025",
    client: "Flexomed",
    label: "Motion",
    statement:
      "Flexomed fabrica, y el vídeo tenía que enseñarlo: proceso, máquina y producto con una lectura industrial clara.\n\nRodaje y montaje para que un proceso técnico se entienda en segundos. Sirve para web, feria y comercial.\n\nMenos explicación, más evidencia.",
    deliverables: ["Vídeo industrial", "Producto en proceso", "Pieza comercial"],
    sections: [
      {
        title: "Oficio en pantalla",
        body: "La cámara se acerca al gesto y a la máquina. El resultado es una pieza que vende capacidad, no eslóganes.",
      },
    ],
  }),
  project({
    id: 17,
    title: "Auditorio Víctor Villegas",
    category: "Fotografía",
    year: "2025",
    client: "Auditorio Víctor Villegas",
    label: "Fotografía",
    statement:
      "El Auditorio Víctor Villegas es arquitectura y cultura a la vez. Fotografiamos el edificio y extraemos stills para que el recinto se lea a escala: butaca, foso, fachada.\n\nUn material híbrido, de reportaje y de campaña, pensado para programación, prensa e institucional.\n\nLa sala, antes de que baje el telón.",
    deliverables: ["Fotografía de recinto", "Stills", "Material institucional"],
    sections: [
      {
        title: "Escala y detalle",
        body: "Pasamos del plano general al asiento. El auditorio se entiende como espacio y como promesa de directo.",
      },
    ],
  }),
  project({
    id: 18,
    title: "Guía San Javier",
    category: "Diseño",
    year: "2025",
    client: "San Javier",
    label: "Editorial",
    heroFit: "contain",
    statement:
      "Diseño editorial para la guía de 7 inmersiones de San Javier: territorio, costa y experiencias en un formato pensado para desear el destino, no solo listarlo.\n\nLa pieza une tipografía, color y composición en un sistema que funciona en papel y en pantalla.\n\nSan Javier, con criterio de publicación.",
    deliverables: ["Diseño editorial", "Guía de inmersiones", "Sistema gráfico"],
    previewUrl: "/media/18/preview.html",
  }),
  project({
    id: 19,
    title: "Laura Rayos",
    category: "Fotografía",
    year: "2025",
    client: "Laura Rayos",
    label: "Fotografía",
    statement:
      "Sesión y piezas en movimiento para Laura Rayos: retrato, gesto y una dirección de arte que deja espacio al personaje.\n\nFotografía de alta definición y vídeos cortos para que la presencia se sostenga en redes y en web. Mismo tono, distinta duración.\n\nCerca, sin invadir.",
    deliverables: ["Retrato", "Piezas en vídeo", "Selección para redes"],
    sections: [
      {
        title: "Persona, no pose",
        body: "Buscamos naturalidad dirigida: suficiente control para que la imagen aguante, suficiente verdad para que se reconozca.",
      },
    ],
  }),
  project({
    id: 20,
    title: "Saborea Águilas",
    category: "Motion",
    year: "2025",
    client: "Saborea Águilas",
    label: "Evento",
    statement:
      "Saborea Águilas es gastronomía y pueblo. Montamos el recap de la inauguración y del segundo día para que el festival se vea grande y cercano a la vez.\n\nDos piezas de resumen, pensadas para redes y para memoria del evento. Plato, gente y costa.\n\nEl sabor, en movimiento.",
    deliverables: ["Recap de festival", "Edición 16:9", "Piezas de evento"],
    sections: [
      {
        title: "Dos días, un relato",
        body: "Inauguración y segundo día con el mismo criterio de montaje: ritmo, producto y público, sin perder el sitio.",
      },
    ],
  }),
  project({
    id: 21,
    title: "San Jorge · Dragon Day",
    category: "Motion",
    year: "2025",
    client: "San Jorge",
    label: "Aftermovie",
    statement:
      "Dragon Day de San Jorge: aftermovie de un día que se vive a tope. Montaje para que el recinto, el público y la marca queden en una sola pieza.\n\nRitmo de evento, cortes limpios y un cierre que invita a volver. Sirve para redes y para la siguiente edición.\n\nLa fiesta, condensada.",
    deliverables: ["Aftermovie", "Edición de evento", "Pieza RRSS"],
    sections: [
      {
        title: "Un día, una pieza",
        body: "Seleccionamos lo que construye recuerdo: entrada, pico y cierre. El resto sobra.",
      },
    ],
  }),
  project({
    id: 22,
    title: "Fotos corporativas",
    category: "Fotografía",
    year: "2025",
    client: "winup.",
    label: "Fotografía",
    statement:
      "Fotografía de negocio para clínicas, restauración, deporte y producto. Un mismo oficio aplicado a marcas distintas: que se vea el trabajo real, con luz y con orden.\n\nDe la consulta al padel, del plato al equipo. Retrato corporativo y de espacio para web, ads y redes.\n\nEmpresas que se pueden enseñar.",
    deliverables: ["Fotografía corporativa", "Espacio y equipo", "Producto"],
    sections: [
      {
        title: "Negocios con cara",
        body: "Cada sector pide un tono, pero el criterio es el mismo: claridad, oficio y fotos que se puedan usar de verdad.",
      },
    ],
  }),
];

/** Cover del proyecto (misma URL en espiral y detalle → sin parpadeo en la transición). */
export function coverUrl(id: number) {
  const project = getProject(id);
  if (!project) return "";
  if (project.featured) {
    return featuredCoverDataUrl(project.client ?? project.title);
  }
  return assetUrl(project.cover);
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
