import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['localhost:3000'],
};

module.exports = {
  allowedDevOrigins: ['kit-webster-logs-knowledgestorm.trycloudflare.com'],
}

export default nextConfig;
