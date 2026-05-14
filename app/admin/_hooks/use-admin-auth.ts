"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiRequest,
  clearAdminSession,
  type AdminUser,
} from "../../../lib/admin-api";

type UseAdminAuthResult = {
  user: AdminUser | null;
  isChecking: boolean;
  handleLogout: () => void;
};

export function useAdminAuth(): UseAdminAuthResult {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    apiRequest<AdminUser>("/auth/me")
      .then((currentUser) => {
        if (!isMounted) return;

        if (currentUser.role?.name !== "admin") {
          clearAdminSession();
          router.replace("/admin/login");
          return;
        }

        setUser(currentUser);
      })
      .catch(() => {
        clearAdminSession();
        router.replace("/admin/login");
      })
      .finally(() => {
        if (isMounted) setIsChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  function handleLogout() {
    clearAdminSession();
    router.replace("/admin/login");
    router.refresh();
  }

  return { user, isChecking, handleLogout };
}
