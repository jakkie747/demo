/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";
import runtimeCaching from "next-pwa/cache";

const withPWA = withPWAInit({
  dest: "public",
  // Explicitly enable PWA and service worker generation in development
  disable: false,
  // Add standard caching rules to enable offline functionality
  runtimeCaching,
  fallbacks: {
    document: "/offline", // Fallback page for when offline
  },
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default withPWA(nextConfig);
