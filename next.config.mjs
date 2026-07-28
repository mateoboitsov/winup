/** @type {import('next').NextConfig} */
const nextConfig = {
  // App WebGL: evitamos el doble montaje del efecto en dev (Three.js se
  // inicializaría dos veces y consumiría el estado de transición de retorno).
  reactStrictMode: false,
};

export default nextConfig;
