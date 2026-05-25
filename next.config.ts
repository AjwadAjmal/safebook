import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['localhost:3000'],
};

module.exports = {
  allowedDevOrigins: ['exp-relationship-sea-larry.trycloudflare.com'],
}

export default nextConfig;
