/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Add externals for websocket polyfills
    config.externals = [...(config.externals || []), 'bufferutil', 'utf-8-validate'];

    return config;
  },
};

module.exports = nextConfig; 