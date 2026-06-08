This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# neocomerz-store-and-admin

## Client storefronts

Admin routes stay shared under `app/admin`. The public storefront at `/` is selected from the modular client folders in `storefronts/`.

To choose the storefront for development or production builds, set:

```bash
STOREFRONT=humana-vintage
```

The build output stays in the normal Next.js `.next` directory. The env value only decides which storefront code is included in that build.

To add a client UI:

1. Add a new folder under `storefronts/<client-id>/`.
2. Export its `StorefrontConfig` from `storefronts/<client-id>/index.ts`.
3. Register it in `storefronts/index.ts`.
4. Build with `STOREFRONT=<client-id> pnpm build`.
