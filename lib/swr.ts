"use client";

import useSWRImmutable from "swr/immutable";

// Shared SWR fetcher for storefront client data. JSON GET with error throwing
// so SWR's `error` is populated on non-2xx.
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

// `useSWRImmutable` = no revalidate on focus/reconnect/mount-if-stale. These
// storefront resources are locale-independent, so we key them by URL only and
// fetch once per session; remounts (e.g. locale switches) reuse the cache with
// no network call and no loading flash.
export { useSWRImmutable };
