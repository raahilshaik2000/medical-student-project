import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdf2pic", "@napi-rs/canvas", "@napi-rs/canvas-darwin-arm64", "pngjs", "youtube-transcript"],
};

export default nextConfig;
