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
    <header className="my-8 flex flex-col justify-between gap-5 border-b border-slate-200 pb-9 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-4xl font-black tracking-normal">{title}</h1>
        <p className="mt-1 text-lg font-medium text-slate-600">{description}</p>
      </div>
      {action}
    </header>
  );
}
