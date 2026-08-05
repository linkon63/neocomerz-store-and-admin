import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md py-3.5 mb-6 border-b border-slate-200/80 shadow-2xs -mx-2 px-3 sm:-mx-4 sm:px-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center transition-all">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight truncate">{title}</h1>
        <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500 truncate">{description}</p>
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">{action}</div>}
    </header>
  );
}
