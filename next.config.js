/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // assetPrefix eliminado: usamos rutas por defecto (/_next/...) porque Next
  // se ejecuta como servidor embebido dentro de Electron.
};

module.exports = nextConfig;
