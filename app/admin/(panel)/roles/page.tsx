"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RolesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/settings?tab=roles");
  }, [router]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 font-bold text-slate-600">Redirecting to Roles Settings...</p>
      </div>
    </div>
  );
}
