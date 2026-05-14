import { AdminIcon } from "../admin-shell";

export function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
      <AdminIcon className="mx-auto mb-3 h-8 w-8 text-slate-300" name="settings" />
      <p className="font-black text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-medium text-slate-400">Coming soon</p>
    </div>
  );
}
