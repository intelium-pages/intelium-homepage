/** @type {import('next').NextConfig} */
const nextConfig = {
  // As páginas são HTML estático em public/; o middleware cuida de / → index.html
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/:file(support|viz|scenes|lead-api).js', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }] },
    ];
  },
};
export default nextConfig;
