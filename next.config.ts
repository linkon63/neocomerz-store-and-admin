import type { NextConfig } from "next";
import path from "path";

const backendApiUrl = process.env.API_BASE_URL ?? "http://localhost:5010/api/v1";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: {
    root: path.resolve(__dirname),
  },
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
      {
        source: "/campaigns/:path*",
        destination: `${backendApiUrl.replace("/api/v1", "")}/campaigns/:path*`,
      },
      {
        source: "/products/:path*",
        destination: `${backendApiUrl.replace("/api/v1", "")}/products/:path*`,
      },
      {
        source: "/variants/:path*",
        destination: `${backendApiUrl.replace("/api/v1", "")}/variants/:path*`,
      },
      {
        source: "/categories/:path*",
        destination: `${backendApiUrl.replace("/api/v1", "")}/categories/:path*`,
      },
      {
        source: "/avatars/:path*",
        destination: `${backendApiUrl.replace("/api/v1", "")}/avatars/:path*`,
      },
    ];
  },
};

export default nextConfig;
