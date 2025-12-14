import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: false,
    // Allow local images from public folder
    domains: [],
  },
};

export default nextConfig;
