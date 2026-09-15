import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP as the fallback — the browser's Accept header picks.
    // AVIF runs roughly 20–30% smaller than WebP on photographs like the
    // hero; the cost is a slower first encode, which the image cache absorbs.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
