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
        source: '/(.*)',
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
  async rewrites() {
    return [
      {
        source: '/blog-static/_next/:path*',
        destination: 'https://3000-firebase-multi-zones-1752136499135.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev/blog-static/_next/:path*',
      },
      {
        source: '/blog',
        destination: 'https://3000-firebase-multi-zones-1752136499135.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev/blog',
      }
    ]
  }
};

export default nextConfig;
