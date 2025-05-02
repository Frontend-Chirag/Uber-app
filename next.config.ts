import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
