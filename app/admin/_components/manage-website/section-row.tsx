export function SectionRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 border-b border-slate-100 py-8 last:border-0 md:grid-cols-[260px_1fr]">
      <div>
        <h3 className="font-black text-slate-800">{title}</h3>
        {description && (
          <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
