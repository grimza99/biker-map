import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: repoRoot,
    resolveAlias: {
      "@package-shared": path.resolve(__dirname, "../package-shared/src"),
    },
  },
  images: {
    remotePatterns: SUPABASE_URL
      ? [
          {
            protocol: new URL(SUPABASE_URL).protocol.replace(":", ""),
            hostname: new URL(SUPABASE_URL).hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
