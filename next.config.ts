import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['localhost:3000'],
};

module.exports = {
  allowedDevOrigins: ['shine-junior-old-lifestyle.trycloudflare.com'],
}

export default nextConfig;
