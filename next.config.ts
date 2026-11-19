import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Profile photos and menu item images are hosted on ImgBB (and other CDNs).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
