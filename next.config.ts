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
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tinyecomapi.neocomerz.com",
        pathname: "/**",
      },
    ],
    domains: ["images.unsplash.com"],
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
    ];
  },
};

export default nextConfig;
