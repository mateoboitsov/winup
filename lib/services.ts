export type CaseStudy = {
  client: string;
  result: string;
  desc: string;
};

export type FAQ = {
  q: string;
  a: string;
};

export type ServiceMetric = {
  label: string;
  value: string;
  detail?: string;
};

export type ServiceShowcaseItem = {
  kind: "image" | "video";
  src: string;
  caption?: string;
  poster?: string;
};

export type InfluencerCreator = {
  handle: string;
  followers: string;
  avatar?: string;
};

export type InfluencerStat = {
  value: string;
  label: string;
};

export type InfluencersShowcaseData = {
  creators: InfluencerCreator[];
  stats: InfluencerStat[];
};

export type Service = {
  slug: string;
  title: string;
  /** Título principal del hero, orientado a conversión. */
  heroTitle: string;
  /** Etiqueta corta de la sección manifiesto. */
  label: string;
  /** Texto corto bajo el título del hero. */
  eyebrow: string;
  /** Texto del manifiesto (un párrafo). */
  statement: string;
  /** Título creativo de la sección de casos. */
  casesTitle?: string;
  /** Título opcional para bloque de métricas. */
  metricsTitle?: string;
  /** Métricas destacadas del servicio. */
  metrics?: ServiceMetric[];
  /** Etiqueta para carrusel visual del servicio. */
  showcaseLabel?: string;
  /** Elementos del carrusel visual. */
  showcaseItems?: ServiceShowcaseItem[];
  /** Bloque de creadores + métricas (solo influencers). */
  influencersShowcase?: InfluencersShowcaseData;
  /** Título del bloque de diagrama. */
  diagramLabel?: string;
  /** Ruta del diagrama cuando esté cargado. */
  diagramSrc?: string;
  /** Título del CTA final, específico al servicio. */
  ctaTitle?: string;
  items?: string[];
  cases?: CaseStudy[];
  faqs?: FAQ[];
};

export const SERVICES: Service[] = [
  {
    slug: "redes-sociales",
    title: "Redes Sociales",
    heroTitle: "Tu marca con voz propia en redes, sin que tengas que estar pendiente.",
    label: "¿Por qué nosotros?",
    eyebrow: "Gestión y comunidad",
    showcaseLabel: "Carrusel de redes sociales",
    ctaTitle: "Cuéntanos tu marca y te decimos qué haríamos con ella.",
    statement:
      "No subcontratamos, no usamos plantillas y no publicamos por publicar. Cada cuenta que gestionamos tiene una estrategia detrás, un tono propio y una persona real que entiende tu negocio.",
    items: [
      "Estrategia de contenido",
      "Creatividad que enamora",
      "Crecimiento orgánico y engagement",
    ],
    showcaseItems: [
      { kind: "video", src: "/media/10/reel-01.mp4", poster: "/media/10/cover.jpg" },
      { kind: "video", src: "/media/9/reel-01.mp4", poster: "/media/9/cover.jpg" },
      { kind: "video", src: "/media/10/reel-04.mp4" },
      { kind: "image", src: "/media/10/01.jpg", caption: "Bigup" },
      { kind: "image", src: "/media/9/01.jpg", caption: "La Laguna Sound" },
    ],
    cases: [
      {
        client: "Restaurante local",
        result: "+340% de engagement en 3 meses",
        desc: "Pasaron de publicar sin criterio a tener una comunidad activa que llena las mesas los fines de semana.",
      },
      {
        client: "Marca de moda",
        result: "De 800 a 12.000 seguidores orgánicos",
        desc: "Sin un solo euro en publicidad. Solo contenido honesto, constancia y una estrategia pensada para su público.",
      },
      {
        client: "Clínica dental",
        result: "60% más de consultas desde Instagram",
        desc: "Humanizamos la marca y mostramos el día a día del equipo. Los pacientes llegaban sintiéndose ya de la casa.",
      },
    ],
    faqs: [
      {
        q: "¿Con qué frecuencia publicáis?",
        a: "Depende del plan, pero trabajamos mínimo 3-4 publicaciones semanales. La consistencia es clave, no el volumen.",
      },
      {
        q: "¿Necesito darte acceso a mis cuentas?",
        a: "Sí, gestionamos directamente desde tus perfiles. Todo con acceso controlado y reversible en cualquier momento.",
      },
      {
        q: "¿Cuánto tarda en verse resultados?",
        a: "Los primeros indicadores (alcance, interacciones) se mueven en 4-6 semanas. El crecimiento sostenido, en 3 meses.",
      },
      {
        q: "¿Creáis el contenido visual vosotros o lo pongo yo?",
        a: "Las dos opciones son posibles. Podemos trabajar con material que nos facilites o encargarnos de toda la producción. Te lo adaptamos según tu presupuesto.",
      },
      {
        q: "¿Puedo revisar las publicaciones antes de que salgan?",
        a: "Sí. Enviamos un calendario de contenido para aprobación. Tú tienes la última palabra antes de publicar.",
      },
      {
        q: "¿Qué pasa si no me convencen los resultados?",
        a: "Trabajamos con contratos mensuales sin permanencia. Si en algún momento sientes que no encajamos, puedes cancelar sin penalización.",
      },
    ],
  },
  {
    slug: "contenido",
    title: "Contenido",
    heroTitle: "El contenido que hace que la gente se detenga, mire y compre.",
    label: "¿Por qué nosotros?",
    eyebrow: "Foto, video y storytelling",
    showcaseLabel: "Carrusel de contenido",
    ctaTitle: "Dinos qué quieres contar y organizamos la sesión.",
    statement:
      "El contenido que funciona no es el más bonito, es el más honesto. Llevamos la cámara, el criterio y la dirección: tú solo tienes que ser tú mismo.",
    items: [
      "Producción de fotos y videos",
      "Contenido estratégico para cada plataforma",
      "Storytelling que conecta con tu audiencia",
    ],
    showcaseItems: [
      { kind: "image", src: "/media/5/01.jpg", caption: "La Disquera" },
      { kind: "image", src: "/media/14/fotografia/01.jpg", caption: "FASRM" },
      { kind: "video", src: "/media/9/video-01.mp4", poster: "/media/9/cover.jpg" },
      { kind: "image", src: "/media/4/01.jpg", caption: "Cañada Honda" },
      { kind: "video", src: "/media/14/video-01.mp4", poster: "/media/14/cover.jpg" },
    ],
    cases: [
      {
        client: "Estudio de arquitectura",
        result: "Contenido que cerró 2 proyectos grandes",
        desc: "Un reel bien producido de su proceso de trabajo les llegó a clientes que nunca habrían contactado por otro canal.",
      },
      {
        client: "E-commerce de cosmética",
        result: "CTR x3 en campañas con contenido nuestro",
        desc: "Cambiaron las fotos de catálogo por vídeos auténticos. La diferencia en conversión fue inmediata.",
      },
    ],
    faqs: [
      {
        q: "¿Necesito un espacio bonito para rodar?",
        a: "No. Sabemos sacar partido a cualquier entorno. A veces lo más natural funciona mejor que un set perfecto.",
      },
      {
        q: "¿Cuánto duran las sesiones?",
        a: "Normalmente medio día o un día completo. Salimos con material para semanas de publicaciones.",
      },
      {
        q: "¿Entregáis el contenido editado?",
        a: "Sí, siempre. Fotos retocadas, vídeos montados y formateados para cada plataforma.",
      },
      {
        q: "¿En cuántos formatos entregáis el material?",
        a: "Adaptamos cada pieza al formato que necesita: feed, stories, reels, YouTube Shorts, web... Sin coste extra.",
      },
      {
        q: "¿Necesito preparar algo antes de la sesión?",
        a: "Solo una llamada previa para alinear el mensaje. Nosotros llevamos el guion, el equipo y la dirección de arte.",
      },
      {
        q: "¿Podéis grabar en exteriores o solo en interior?",
        a: "Rodamos donde el proyecto lo pida: oficinas, locales, exteriores, eventos. El espacio es parte del storytelling.",
      },
    ],
  },
  {
    slug: "eventos",
    title: "Eventos",
    heroTitle: "El evento que organizas hoy puede seguir generando impacto semanas después.",
    label: "¿Por qué nosotros?",
    eyebrow: "Presencia que se recuerda",
    diagramLabel: "Diagrama",
    diagramSrc: "/media/servicios/eventos-proceso.svg",
    casesTitle: "Nuestros eventos los sigues viviendo semanas después.",
    ctaTitle: "Cuéntanos tu próximo evento y te decimos cómo lo haríamos.",
    statement:
      "Pensamos cada evento con la cámara en mente desde el primer momento. Lo que pasa en el espacio se convierte en contenido que trabaja mucho después de que apaguen las luces.",
    showcaseItems: [
      { kind: "video", src: "/media/2/reel-01.mp4", poster: "/media/2/cover.jpg" },
      { kind: "video", src: "/media/9/reel-03.mp4" },
      { kind: "video", src: "/media/5/reel-03.mp4", poster: "/media/5/cover.jpg" },
      { kind: "video", src: "/media/21/video-01.mp4", poster: "/media/21/cover.jpg" },
    ],
    cases: [
      {
        client: "Lanzamiento de producto tech",
        result: "200K reproducciones del recap en 48h",
        desc: "Planificamos el evento pensando en las piezas de contenido desde el primer momento, no al final.",
      },
      {
        client: "Activación de marca en festival",
        result: "Trending topic local durante el evento",
        desc: "Coordinamos la estrategia de redes en tiempo real con el equipo en el stand.",
      },
    ],
    faqs: [
      {
        q: "¿Os encargáis de la logística del evento?",
        a: "Nos enfocamos en la estrategia digital y la documentación. Para la logística presencial trabajamos con partners de confianza.",
      },
      {
        q: "¿Con cuánta antelación hay que contactaros?",
        a: "Idealmente 4-6 semanas antes. Para eventos grandes, más. La planificación previa es lo que marca la diferencia.",
      },
      {
        q: "¿Qué tipo de contenido generáis durante el evento?",
        a: "Fotos de ambiente, reels en tiempo real, stories, vídeo recap y material de archivo para campañas futuras. Todo en un solo día.",
      },
      {
        q: "¿Publicáis durante el evento o solo después?",
        a: "Las dos cosas. Publicamos contenido en caliente para generar conversación y entregamos el material editado en los días siguientes.",
      },
      {
        q: "¿Trabajáis con eventos pequeños o solo grandes producciones?",
        a: "Con ambos. Desde una presentación íntima de producto hasta una activación en festival. El presupuesto define el equipo, no el criterio.",
      },
    ],
  },
  {
    slug: "influencers",
    title: "Influencers",
    heroTitle: "Influencers que mueven a tu audiencia a comprar, no solo a mirar.",
    label: "¿Por qué nosotros?",
    eyebrow: "Alcance con criterio",
    showcaseLabel: "Red de creadores",
    ctaTitle: "Dinos tu producto y te proponemos los perfiles ideales.",
    statement:
      "Los seguidores no pagan facturas, las conversiones sí. Buscamos perfiles que encajan de verdad con tu marca, negociamos condiciones justas y medimos cada colaboración con datos reales.",
    influencersShowcase: {
      creators: [
        { handle: "@mariaferjol", followers: "509K" },
        { handle: "@miriamalegria", followers: "956K" },
        { handle: "@laurimatheu", followers: "69,1K" },
        { handle: "@yosoymario", followers: "144K" },
        { handle: "@alexarama", followers: "84,8K" },
        { handle: "@airamchacon", followers: "211K" },
        { handle: "@luisbeltran", followers: "90K" },
        { handle: "@carlabravo", followers: "312K" },
      ],
      stats: [
        { value: "+180", label: "Creadores" },
        { value: "+2.400", label: "Vídeos" },
        { value: "96%", label: "Repiten" },
        { value: "+120", label: "Marcas" },
      ],
    },
    cases: [
      {
        client: "Marca de alimentación saludable",
        result: "+1.200 ventas directas en una semana",
        desc: "Una colaboración con un micro-influencer de nicho superó en ventas a campañas con perfiles masivos.",
      },
      {
        client: "Aplicación móvil",
        result: "5.000 descargas en el mes del lanzamiento",
        desc: "Seleccionamos 8 creadores afines al producto. Briefing claro, libertad creativa y métricas en tiempo real.",
      },
    ],
    faqs: [
      {
        q: "¿Trabajáis solo con grandes influencers?",
        a: "No. En muchos casos los micro-influencers (10K-100K) generan más conversión que los perfiles masivos. Depende del objetivo.",
      },
      {
        q: "¿Cómo medís el retorno?",
        a: "Con links de seguimiento, códigos de descuento únicos y análisis de métricas antes y después de la campaña.",
      },
      {
        q: "¿Negociáis vosotros las condiciones?",
        a: "Sí. Nos encargamos de todo el proceso: contacto, briefing, negociación y seguimiento.",
      },
      {
        q: "¿Qué pasa si el influencer no cumple lo acordado?",
        a: "Siempre trabajamos con contratos y briefings firmados. Si hay incumplimiento, gestionamos la situación directamente con el creador.",
      },
      {
        q: "¿Podéis gestionar campañas con varios influencers a la vez?",
        a: "Sí. Coordinamos campañas multi-creador con calendarios de publicación escalonados para maximizar el alcance en el tiempo.",
      },
      {
        q: "¿Qué nicho de influencers gestionáis?",
        a: "Lifestyle, gastronomía, fitness, tecnología, moda, viajes... Trabajamos en el nicho que mejor encaja con tu producto, no con los que están de moda.",
      },
    ],
  },
  {
    slug: "web",
    title: "Web",
    heroTitle: "Una web diseñada para que quien entra, actúe.",
    label: "¿Por qué nosotros?",
    eyebrow: "Diseño y desarrollo",
    ctaTitle: "Cuéntanos tu negocio y te enseñamos cómo sería tu nueva web.",
    statement:
      "Diseñamos para que el usuario compre, contacte o vuelva, no para ganar premios de diseño. Cada decisión visual tiene un argumento de negocio detrás.",
    items: [
      "Diseño atractivo y funcional",
      "Adaptado a todos los dispositivos",
      "Optimizado para SEO",
    ],
    cases: [
      {
        client: "Consultoría de RRHH",
        result: "+85% de solicitudes de contacto",
        desc: "Rediseñamos la web con foco en conversión. Un botón en el lugar correcto puede cambiarlo todo.",
      },
      {
        client: "Tienda de decoración",
        result: "Tiempo de carga reducido de 8s a 1,2s",
        desc: "La web antigua perdía el 70% de usuarios móviles. La nueva convierte en todos los dispositivos.",
      },
    ],
    faqs: [
      {
        q: "¿Cuánto tarda un proyecto web?",
        a: "Entre 4 y 10 semanas dependiendo de la complejidad. Los proyectos con contenido claro van siempre más rápido.",
      },
      {
        q: "¿Incluye mantenimiento?",
        a: "Entregamos la web lista para que la gestiones tú, o podemos incluir un plan de mantenimiento mensual. Tú decides.",
      },
      {
        q: "¿Con qué tecnologías trabajáis?",
        a: "Principalmente Next.js, Webflow y WordPress según el caso. Elegimos la herramienta que mejor encaja con tus necesidades operativas.",
      },
      {
        q: "¿Necesito tener el contenido listo antes de empezar?",
        a: "No es imprescindible, pero acelera el proceso. Si no tienes textos ni fotos, podemos ayudarte a crearlos o orientarte para conseguirlos.",
      },
      {
        q: "¿La web queda optimizada para móvil?",
        a: "Siempre. Diseñamos mobile-first. Más del 60% del tráfico viene de móvil y no nos podemos permitir ignorarlo.",
      },
      {
        q: "¿Puedo actualizar la web yo mismo después?",
        a: "Sí. Te formamos para que puedas gestionar el contenido sin depender de nosotros. Si prefieres que lo hagamos nosotros, también podemos.",
      },
    ],
  },
  {
    slug: "publicidad",
    title: "Publicidad",
    heroTitle: "Anuncios que generan clientes, no solo impresiones.",
    label: "¿Por qué nosotros?",
    eyebrow: "Inversión con resultados",
    metricsTitle: "Resultados acumulados en publicidad",
    ctaTitle: "Cuéntanos tu objetivo y analizamos si podemos ayudarte.",
    statement:
      "No lanzamos campañas y rezamos. Testeamos, optimizamos y escalamos solo lo que funciona. Tu presupuesto se trata como si fuera nuestro.",
    items: ["Meta Ads (Facebook & Instagram)", "Google Ads"],
    metrics: [
      {
        label: "Inversión gestionada",
        value: "€1,2M+",
        detail: "en Meta Ads y Google Ads con todos nuestros clientes.",
      },
      {
        label: "Leads generados",
        value: "+300 mil",
        detail: "contactos cualificados captados en campañas de conversión.",
      },
      {
        label: "Campañas lanzadas",
        value: "+320",
        detail: "entre awareness, tráfico y ventas en sectores muy distintos.",
      },
      {
        label: "ROAS medio global",
        value: "x3,1",
        detail: "de retorno acumulado en cuentas con seguimiento de conversiones.",
      },
    ],
    cases: [
      {
        client: "Academia de formación online",
        result: "CPA reducido un 62% en 6 semanas",
        desc: "Reestructuramos la cuenta, limpiamos audiencias y centramos el presupuesto en lo que ya convertía.",
      },
      {
        client: "Inmobiliaria local",
        result: "47 leads cualificados en el primer mes",
        desc: "Campaña de Google Ads con landing específica. Sin fugas, sin ruido, solo gente con intención real de compra.",
      },
    ],
    faqs: [
      {
        q: "¿Cuál es el presupuesto mínimo recomendado?",
        a: "Para Meta Ads, desde 500€/mes en inversión publicitaria. Para Google Ads, desde 800€/mes. Por debajo es difícil obtener datos suficientes para optimizar.",
      },
      {
        q: "¿Los resultados son garantizados?",
        a: "Ninguna agencia honesta garantiza resultados específicos. Lo que garantizamos es gestión transparente, optimización continua y datos claros.",
      },
      {
        q: "¿Puedo pausar las campañas cuando quiera?",
        a: "Sí, en cualquier momento. El presupuesto publicitario es tuyo y tú decides cuándo activarlo o pausarlo.",
      },
      {
        q: "¿Vosotros también creáis los anuncios o solo los gestionáis?",
        a: "Nos encargamos de todo: copy, creatividades, segmentación, lanzamiento y optimización. Tú solo revisas y apruebas.",
      },
      {
        q: "¿Qué diferencia hay entre Meta Ads y Google Ads?",
        a: "Meta Ads llega a personas que aún no te buscan pero encajan con tu público. Google Ads captura a quien ya tiene intención de compra. Lo ideal es combinar ambos.",
      },
      {
        q: "¿Con qué frecuencia reportáis los resultados?",
        a: "Enviamos un informe mensual con métricas clave y explicamos qué hemos cambiado y por qué. Sin tecnicismos innecesarios.",
      },
    ],
  },
  {
    slug: "seo",
    title: "SEO",
    heroTitle: "Cuando alguien busca lo que vendes, queremos que te encuentre a ti primero.",
    label: "¿Por qué nosotros?",
    eyebrow: "Ser encontrado",
    metricsTitle: "Resultados acumulados en SEO",
    ctaTitle: "Dinos tu web y analizamos gratis por qué Google no te muestra.",
    statement:
      "El SEO barato te puede hundir en Google durante meses. Trabajamos con estrategia a largo plazo, contenido que responde preguntas reales y técnica limpia que los motores de búsqueda premian.",
    items: ["Optimización de contenido", "Estrategia de palabras clave"],
    metrics: [
      {
        label: "Keywords en Top 10",
        value: "+2,4 mil",
        detail: "posicionadas en Google con todos nuestros clientes.",
      },
      {
        label: "Visitas orgánicas",
        value: "+15M",
        detail: "generadas en webs que gestionamos con estrategia SEO.",
      },
      {
        label: "Webs optimizadas",
        value: "+90",
        detail: "con auditoría técnica, contenido y seguimiento continuo.",
      },
      {
        label: "Páginas publicadas",
        value: "+1.800",
        detail: "optimizadas para captar búsquedas de intención real.",
      },
    ],
    cases: [
      {
        client: "Clínica veterinaria",
        result: "Top 3 en Google para 12 keywords locales",
        desc: "En 4 meses pasaron de la tercera página a liderar búsquedas de intención alta en su zona.",
      },
      {
        client: "Software B2B",
        result: "+230% de tráfico orgánico en 6 meses",
        desc: "Estrategia de contenido orientada a búsquedas del sector. Cada artículo, pensado para un momento del funnel.",
      },
    ],
    faqs: [
      {
        q: "¿Cuánto tiempo tarda en verse resultados?",
        a: "El SEO es una inversión a medio plazo. Los primeros movimientos en 6-8 semanas; resultados sólidos en 4-6 meses.",
      },
      {
        q: "¿Hacéis black hat SEO?",
        a: "No. Solo técnicas limpias. El SEO agresivo puede darte un pico rápido y luego una penalización que tarda meses en recuperarse.",
      },
      {
        q: "¿Necesito tener blog?",
        a: "No es imprescindible, pero ayuda mucho. Si no tienes, te ayudamos a crear uno con contenido estratégico desde cero.",
      },
      {
        q: "¿El SEO local es diferente al SEO general?",
        a: "Sí. Si tu negocio depende de clientes en una zona concreta, el SEO local (Google Maps, búsquedas geolocalizadas) puede ser más rentable que el posicionamiento nacional.",
      },
      {
        q: "¿Qué incluye exactamente el servicio?",
        a: "Auditoría inicial, investigación de palabras clave, optimización on-page, mejoras técnicas, estrategia de contenido y seguimiento mensual de posiciones.",
      },
      {
        q: "¿Trabajáis con cualquier tipo de web?",
        a: "Sí, aunque dependiendo del CMS (WordPress, Shopify, custom) el nivel de intervención técnica varía. Te lo explicamos antes de empezar.",
      },
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getNextService(slug: string): Service {
  const index = SERVICES.findIndex((s) => s.slug === slug);
  const nextIndex = index < 0 ? 0 : (index + 1) % SERVICES.length;
  return SERVICES[nextIndex]!;
}

export function serviceHref(slug: string) {
  return `/servicios/${slug}`;
}
