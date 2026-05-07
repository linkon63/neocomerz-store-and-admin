import type { NextConfig } from "next";

const backendApiUrl = process.env.API_BASE_URL ?? "http://localhost:3001/api/v1";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
      {
        source: "/brands/:path*",
        destination: `${backendApiUrl.replace("/api/v1", "")}/brands/:path*`,
      },
    ];
  },
};

export default nextConfig;
