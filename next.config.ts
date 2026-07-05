import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Next.js static export does not support Image Optimization API by default without a custom loader
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
