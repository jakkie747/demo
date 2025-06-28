/** @type {import('next').NextConfig} */

import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  disable: false, // Force PWA in dev
  register: true,
  skipWaiting: true,
});

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


export default pwaConfig(nextConfig);
