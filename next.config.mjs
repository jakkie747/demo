/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // This is a workaround for a build error related to the 'handlebars' library,
    // a dependency of Genkit. Handlebars attempts to use Node.js's 'fs' module,
    // which is not available in the browser and causes the client-side build to fail.
    // By setting `config.resolve.fallback.fs = false`, we instruct Webpack to
    // exclude this module from the client bundle, resolving the build error.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
};

export default nextConfig;
