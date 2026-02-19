
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features if needed
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: { and: [/\.[jt]sx?$/] },
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            icon: true,
          },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
