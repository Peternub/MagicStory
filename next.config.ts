import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next" : ".next-build",
  async rewrites() {
    return [
      {
        source: "/_next/static/chunks/fallback/:path*",
        destination: "/_next/static/chunks/:path*"
      }
    ];
  }
});

export default nextConfig;
