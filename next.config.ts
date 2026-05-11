import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [' https://sec-overnight-parking-kai.trycloudflare.com'],
};

export default nextConfig;
