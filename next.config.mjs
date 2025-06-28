
import withPWA from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your regular Next.js config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

const withPWAConfig = withPWA({
  dest: 'public',
  // This is the crucial change. By default, PWA features are disabled in development.
  // Setting this to false forces them to be enabled.
  disable: false, 
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
});

export default withPWAConfig(nextConfig);
