/** Mismo aspect que las tarjetas de la espiral (3.6 × 2.4). */
const CARD_ASPECT = 3.6 / 2.4;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Portada sin foto: fondo acento + etiqueta del cliente centrada. */
export function featuredCoverDataUrl(label: string, aspect = CARD_ASPECT): string {
  const w = 1600;
  const h = Math.max(1, Math.round(w / aspect));
  const fontSize = Math.round(h * 0.13);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<rect width="100%" height="100%" fill="#c8ff00"/>`,
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#050505"`,
    ` font-family="Bricolage Grotesque, system-ui, sans-serif" font-size="${fontSize}" font-weight="600">`,
    escapeXml(label),
    `</text></svg>`,
  ].join("");
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
