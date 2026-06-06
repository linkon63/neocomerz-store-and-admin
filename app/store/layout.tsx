import type { ReactNode } from "react";
import { StoreShell } from "./_components/store-shell";
import { ToastContainer } from "./_components/toast";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="neocomerz-store flex-1 flex flex-col">
      <StoreShell>{children}</StoreShell>
      <ToastContainer />
    </div>
  );
}
