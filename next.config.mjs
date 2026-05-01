/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isso ajuda o Next.js a entender que deve usar ESM
  experimental: {
    // Caso use bibliotecas externas problemáticas
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
