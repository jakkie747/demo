/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false, // Force PWA to be enabled in development
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline",
  },
});


const nextConfig = {
  // Your Next.js config
};

export default withPWA(nextConfig);
