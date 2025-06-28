
import withPWAInit from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
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

const withPWA = withPWAInit({
  dest: 'public',
  disable: false, // This forces PWA features on in development
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: '/offline',
  },
});

export default withPWA(nextConfig);
