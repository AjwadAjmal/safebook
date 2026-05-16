import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['localhost:3000'],
};

module.exports = {
  allowedDevOrigins: ['herb-convertible-passive-weblog.trycloudflare.com'],
}

export default nextConfig;
