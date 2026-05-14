export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <input
      className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      type={type}
      value={value}
    />
  );
}
