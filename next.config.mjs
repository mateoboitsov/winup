/** @type {import('next').NextConfig} */
const nextConfig = {
  // App WebGL: evitamos el doble montaje del efecto en dev (Three.js se
  // inicializaría dos veces y consumiría el estado de transición de retorno).
  reactStrictMode: false,
  // attachProjectMedia usa fs en /proyecto/[id]; sin esto Netlify empaqueta
  // todo public/media (~330 MB) dentro de la función serverless y el deploy falla.
  outputFileTracingExcludes: {
    "/*": ["./public/media/**"],
    "/proyecto/**": ["./public/media/**"],
  },
  async rewrites() {
    return [{ source: "/briefing", destination: "/briefing.html" }];
  },
};

export default nextConfig;
