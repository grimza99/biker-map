import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true
  },
  turbopack: {
    root: repoRoot,
    resolveAlias: {
      "@package-shared": path.resolve(__dirname, "../package-shared/src")
    }
  }
};

export default nextConfig;
