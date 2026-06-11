import type { NextConfig } from "next";

const backendApiUrl = process.env.API_BASE_URL ?? "http://localhost:5010/api/v1";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "tinyecomapi.neocomerz.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5010",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3007",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5010",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3007",
      },
    ],
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
        source: "/products/:path*",
        destination: `${backendApiUrl.replace("/api/v1", "")}/products/:path*`,
      },
      {
        source: "/categories/:path*",
        destination: `${backendApiUrl.replace("/api/v1", "")}/categories/:path*`,
      },
      {
        source: "/campaigns/:path*",
        destination: `${backendApiUrl.replace("/api/v1", "")}/campaigns/:path*`,
      },
      {
        source: "/avatars/:path*",
        destination: `${backendApiUrl.replace("/api/v1", "")}/avatars/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendApiUrl.replace("/api/v1", "")}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
