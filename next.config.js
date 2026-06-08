/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Уникальный buildId на каждой сборке — гарантирует, что Vercel не реиспользует
  // build cache из предыдущих деплоев. Решает split-cache на edge, когда
  // empty-commit redeploy не сбрасывает артефакты из-за shared build cache.
  generateBuildId: async () => `build-${Date.now()}`,
};

module.exports = nextConfig;
