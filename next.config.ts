import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['localhost:3000'],
};

module.exports = {
  allowedDevOrigins: ['playing-chem-big-fin.trycloudflare.com'],
}

export default nextConfig;
