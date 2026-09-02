/**
 * Site Configuration & Feature Flags
 * 
 * To switch the site to LIVE mode:
 * 1. Change NEXT_PUBLIC_COMING_SOON="false" in your .env / deployment environment variables,
 *    OR change IS_COMING_SOON_DEFAULT to false below.
 */

export const IS_COMING_SOON_DEFAULT = true;

export function isComingSoonActive(): boolean {
  // If explicitly set in environment variable
  if (process.env.NEXT_PUBLIC_COMING_SOON !== undefined) {
    return process.env.NEXT_PUBLIC_COMING_SOON === "true";
  }
  return IS_COMING_SOON_DEFAULT;
}
