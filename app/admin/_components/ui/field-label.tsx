export function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="mb-1.5 block text-sm font-black text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </span>
  );
}
