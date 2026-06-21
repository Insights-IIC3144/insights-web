import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  cacheComponents: true,
  cacheLife: {
    daily: {
      stale: 3600,
      revalidate: 86400,
      expire: 172800,
    },
  },
}

export default nextConfig;
