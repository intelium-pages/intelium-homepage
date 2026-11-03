import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export to `out/`, ready to upload to Hostinger's public_html.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
