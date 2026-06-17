"use client";

import { fetcher, useSWRImmutable } from "@/lib/swr";

// Settings are locale-independent and used by both header and footer. SWR keys
// by URL, so the two consumers share one request and it survives remounts
// (locale switches) from cache — no refetch, no flicker.
export const useFetchSettings = () => {
    const { data, isLoading, error } = useSWRImmutable<any>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/settings`,
        fetcher,
    );

    return { data: data ?? null, isLoading, error: error ?? null };
};
