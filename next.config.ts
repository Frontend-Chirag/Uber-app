import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cn-geo1.uber.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'mobile-content.uber.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'd1a3f4spazzrp4.cloudfront.net',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'mobile-content.uber.com',
        port: '',
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path',
        headers: [
          {
            key: 'X-Forwarded-For',
            value: 'trust'
          },
          {
            key: 'X-Real-IP',
            value: 'trust',
          },
        ]
      }
    ]
  },
};

export default nextConfig;
