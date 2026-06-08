import type { StorefrontConfig } from "./types";
import { humanaVintageStorefront } from "./humana-vintage";
import { londonTeaExchangeStorefront } from "./london-tea-exchange";

const DEFAULT_STOREFRONT = "london-tea-exchange";

const storefronts = {
  "humana-vintage": humanaVintageStorefront,
  "london-tea-exchange": londonTeaExchangeStorefront,
} satisfies Record<string, StorefrontConfig>;

export type StorefrontId = keyof typeof storefronts;

export function getActiveStorefront(): StorefrontConfig {
  const requestedStorefront =
    process.env.STOREFRONT ?? process.env.NEXT_PUBLIC_STOREFRONT ?? DEFAULT_STOREFRONT;

  if (requestedStorefront in storefronts) {
    return storefronts[requestedStorefront as StorefrontId];
  }

  throw new Error(
    `Unknown storefront "${requestedStorefront}". Available storefronts: ${Object.keys(
      storefronts,
    ).join(", ")}`,
  );
}
