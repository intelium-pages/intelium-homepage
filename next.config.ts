import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export to `out/`, ready to upload to Hostinger's public_html.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Sub-folder of the GitHub Pages test site; unset in production (site at the domain root).
  basePath: process.env.BASE_PATH || undefined,
};

export default nextConfig;
