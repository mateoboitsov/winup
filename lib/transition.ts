// Estado de transición compartido entre la espiral y la página de detalle.
// Sobrevive a la navegación cliente de Next (no hay recarga), así que sirve
// para "recordar" desde qué tarjeta salimos y reproducir el morph inverso al
// volver. Si hay una recarga dura, se resetea y el retorno es normal (sin morph).
export type GalleryView = "spiral" | "grid";

export const transition = {
  active: false, // hay un retorno pendiente que debe animarse
  scroll: 0, // posición de scroll de la galería en el momento del click
  virtIdx: 0, // índice virtual exacto de la tarjeta clicada
  projectId: 0, // proyecto abierto
  viewMode: "spiral" as GalleryView, // vista activa (sobrevive al ir/volver del detalle)
};
