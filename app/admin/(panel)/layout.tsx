import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AdminShell } from "../_components/admin-shell";

export default function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Toaster richColors closeButton position="top-right" duration={2500} />
      <AdminShell>{children}</AdminShell>
    </>
  );
}
