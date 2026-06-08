/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Уникальный buildId на каждой сборке.
  generateBuildId: async () => `build-${Date.now()}`,
  // Принудительный no-store на /methodology — на случай, если edge всё ещё
  // пытается вернуть закешированный HTML. Вместе с `force-dynamic` на самой
  // странице это гарантирует, что Vercel CDN не отдаст старый артефакт ни
  // одному узлу.
  async headers() {
    return [
      {
        source: '/methodology',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, max-age=0',
          },
          { key: 'CDN-Cache-Control', value: 'no-store' },
          { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
