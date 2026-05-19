import type { ReactNode } from "react";
import { StoreShell } from "./_components/store-shell";
import { ToastContainer } from "./_components/toast";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreShell>{children}</StoreShell>
      <ToastContainer />
    </>
  );
}
