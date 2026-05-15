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
    <header className="mb-8 flex flex-col justify-between gap-5 border-b border-slate-200 pb-9 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-4xl font-black tracking-normal">{title}</h1>
        <p className="mt-1 text-lg font-medium text-slate-600">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function StatusToggle() {
  return (
    <span className="inline-flex h-8 w-14 items-center rounded-full bg-blue-600 p-1">
      <span className="ml-auto h-6 w-6 rounded-full bg-white" />
    </span>
  );
}

export function ProductThumb({ color }: { color: string }) {
  return (
    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-slate-50">
      <div className={`absolute bottom-3 left-4 h-6 w-9 ${color}`} />
      <div className="absolute bottom-2 left-2 h-3 w-12 bg-black/20" />
    </div>
  );
}
