export function SelectInput({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      onChange={(e) => onChange(e.target.value)}
      value={value}
    >
      {children}
    </select>
  );
}
