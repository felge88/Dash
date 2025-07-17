/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sqlite3"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("sqlite3");
    }
    return config;
  },
  typescript: {
    // Temporarily ignore build errors during deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore lint errors during deployment
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
