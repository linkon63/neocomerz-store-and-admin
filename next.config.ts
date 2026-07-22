import type { NextConfig } from "next";

const backendApiUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";
// Origin only (no /api/v1) — used for proxying static file paths like /products/*.webp
const backendOrigin = backendApiUrl.replace(/\/api\/v\d+$/, "");

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
      // production path resolver for TinyEcom API - Humana Vintage
      {
        protocol: "https",
        hostname: "tinyecomapi.neocomerz.com",
        pathname: "/**",
      },
      // development path resolver for LTE
      {
        protocol: "https",
        hostname: "api-lte.neocomerz.com",
        pathname: "/**",
      },
      // main production path resolver for LTE
       {
        protocol: "https",
        hostname: "api-lte-bd.neocomerz.com",
        pathname: "/**",
      },
      // localhost images are proxied through Next.js rewrites below,
      // so next/image only ever sees relative or HTTPS URLs in production.
      // Keep this entry so the dev server itself can still serve them directly
      // if needed (e.g. plain <img> tags in admin).
      {
        protocol: "http",
        hostname: "localhost",
        port: "5010",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      // API calls
      {
        source: "/api/v1/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
      // Global static assets proxy (products, uploads, brands, variants, categories, etc.)
      // Matches any path ending with a common image extension, routing it to the NestJS backend.
      {
        source: "/:path*\\.:ext(png|jpg|jpeg|gif|webp|svg|ico|PNG|JPG|JPEG|WEBP|SVG|ICO)",
        destination: `${backendOrigin}/:path*.:ext`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/account",
        destination: "/profile",
        permanent: true,
      },
      {
        source: "/orders",
        destination: "/profile?tab=orders",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
