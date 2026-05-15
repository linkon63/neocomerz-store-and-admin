import React from "react";

export const Typography = {
  h1: "text-2xl font-semibold text-gray-900",
  h2: "text-xl font-semibold text-gray-900",
  h3: "text-lg font-medium text-gray-900",
  h4: "text-base font-medium text-gray-900",
  body: "text-sm text-gray-600",
  bodySmall: "text-xs text-gray-500",
  label: "text-xs font-medium text-gray-500 uppercase tracking-wider",
  labelSmall: "text-xs font-medium text-gray-400",
  caption: "text-xs text-gray-400",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "sm",
  isLoading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-sm",
  };
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    warning: "bg-amber-600 text-white hover:bg-amber-700",
    info: "bg-violet-600 text-white hover:bg-violet-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    neutral: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
}

export function Card({ children, className = "", padding = "md" }: CardProps) {
  const paddings = { none: "", sm: "p-4", md: "p-5" };
  return (
    <div className={`rounded-md border border-gray-200 bg-white ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "neutral", size = "sm", className = "" }: BadgeProps) {
  const sizes = { sm: "px-1.5 py-0.5 text-[11px]", md: "px-2 py-0.5 text-[12px]" };
  const variants = {
    primary: "bg-blue-50 text-blue-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-violet-50 text-violet-700",
    neutral: "bg-gray-50 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center rounded-md font-medium ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = "", ...props }: InputProps) {
  return (
    <div>
      {label && <label className={`mb-1.5 block ${Typography.label}`}>{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`h-9 w-full rounded-md border border-gray-300 bg-white px-3 ${icon ? "pl-9" : ""} text-sm outline-none transition-all focus:border-blue-500 focus:ring-0 disabled:bg-gray-50 disabled:text-gray-400 ${error ? "border-red-400" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = "", ...props }: SelectProps) {
  return (
    <div>
      {label && <label className={`mb-1.5 block ${Typography.label}`}>{label}</label>}
      <select
        className={`h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-0 disabled:bg-gray-50 disabled:text-gray-400 ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface AlertProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info";
  onClose?: () => void;
  className?: string;
}

export function Alert({ children, variant = "info", onClose, className = "" }: AlertProps) {
  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    danger: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-md border px-4 py-3 text-sm ${styles[variant]} ${className}`}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} className="p-0.5 rounded-md hover:bg-black/5">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 ${sizes[size]}`} />
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-gray-100">{icon}</div>}
      <h3 className={Typography.h3}>{title}</h3>
      {description && <p className={`mt-1 max-w-sm ${Typography.body}`}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; isPositive: boolean };
}

export function StatsCard({ label, value, icon, trend }: StatsCardProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className={`${Typography.label} text-gray-500`}>{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.isPositive ? "text-emerald-600" : "text-red-600"}`}>
              {trend.isPositive ? "\u2191" : "\u2193"} {trend.value}
            </p>
          )}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
}
