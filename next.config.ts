import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/_next/static/chunks/fallback/:path*",
        destination: "/_next/static/chunks/:path*"
      }
    ];
  }
};

export default nextConfig;
