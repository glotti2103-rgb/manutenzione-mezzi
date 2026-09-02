import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // La foto della ricevuta può arrivare a 10 MB (vedi requisiti.md).
      // Margine extra per l'overhead multipart e gli altri campi del form.
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
