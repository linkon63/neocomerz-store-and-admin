"use client";

import type { ReactNode } from "react";

export type AdminIconName =
  | "actions"
  | "arrow-left"
  | "arrow-right"
  | "brand"
  | "calendar"
  | "category"
  | "check"
  | "chevronRight"
  | "copy"
  | "dashboard"
  | "discount"
  | "download"
  | "edit"
  | "filter"
  | "image"
  | "info"
  | "link"
  | "logout"
  | "orders"
  | "package"
  | "plus"
  | "pos"
  | "refresh"
  | "report"
  | "reviews"
  | "search"
  | "settings"
  | "stock"
  | "store"
  | "suppliers"
  | "tag"
  | "units"
  | "upload"
  | "user"
  | "variants"
  | "voucher"
  | "x"
  | "zap";

const iconPaths: Record<AdminIconName, ReactNode> = {
  actions: (
    <>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </>
  ),
  "arrow-left": <path d="M19 12H5M12 19l-7-7 7-7" />,
  "arrow-right": <path d="M5 12h14M12 5l7 7-7 7" />,
  brand: (
    <>
      <path d="M12 3l7 4v10l-7 4-7-4V7z" />
      <path d="M12 8v8" />
      <path d="M8.5 10.5l3.5-2 3.5 2" />
    </>
  ),
  calendar: (
    <>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <path d="M3 10h18" />
    </>
  ),
  category: (
    <>
      <rect height="7" rx="1" width="7" x="3" y="3" />
      <rect height="7" rx="1" width="7" x="14" y="3" />
      <rect height="7" rx="1" width="7" x="3" y="14" />
      <rect height="7" rx="1" width="7" x="14" y="14" />
    </>
  ),
  check: <path d="M20 6L9 17l-5-5" />,
  chevronRight: <path d="M9 18l6-6-6-6" />,
  copy: (
    <>
      <rect height="13" rx="2" width="13" x="9" y="9" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  dashboard: (
    <>
      <rect height="8" rx="1" width="8" x="3" y="3" />
      <rect height="5" rx="1" width="8" x="13" y="3" />
      <rect height="8" rx="1" width="8" x="13" y="13" />
      <rect height="5" rx="1" width="8" x="3" y="16" />
    </>
  ),
  discount: (
    <>
      <path d="M19 5L5 19" />
      <circle cx="7" cy="7" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  filter: (
    <>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </>
  ),
  image: (
    <>
      <rect height="18" rx="2" width="18" x="3" y="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  orders: (
    <>
      <path d="M6 2h12l2 4v16H4V6z" />
      <path d="M4 6h16" />
      <path d="M9 11h6" />
      <path d="M9 15h6" />
    </>
  ),
  package: (
    <>
      <path d="M21 8l-9-5-9 5 9 5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  pos: (
    <>
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <path d="M7 8h10" />
      <path d="M7 13h2" />
      <path d="M12 13h2" />
      <path d="M17 13h0" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M19 11a7 7 0 0 0-12-4l-3 3" />
      <path d="M5 13a7 7 0 0 0 12 4l3-3" />
    </>
  ),
  report: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-3" />
    </>
  ),
  reviews: (
    <>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2.8-2.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7.1 4l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.8 2.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4h-.1a1.7 1.7 0 0 0-1.7 1z" />
    </>
  ),
  stock: (
    <>
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M4 7l8 4 8-4" />
      <path d="M12 11v10" />
    </>
  ),
  store: (
    <>
      <path d="M3 9l1-5h16l1 5" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
      <path d="M3 9h18" />
    </>
  ),
  suppliers: (
    <>
      <path d="M16 3h4v13h-4" />
      <path d="M4 17h12V7H4z" />
      <path d="M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      <path d="M18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </>
  ),
  tag: (
    <>
      <path d="M20 13L11 22 2 13V2h11z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  units: (
    <>
      <path d="M4 19h16" />
      <path d="M7 19V5" />
      <path d="M17 19V5" />
      <path d="M7 5h10" />
      <path d="M10 9h4" />
      <path d="M10 13h4" />
    </>
  ),
  upload: (
    <>
      <path d="M12 21V9" />
      <path d="M7 14l5-5 5 5" />
      <path d="M5 3h14" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  variants: (
    <>
      <path d="M7 7h10" />
      <path d="M7 17h10" />
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
    </>
  ),
  voucher: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h14v5a2 2 0 0 0 0 4v5H5a2 2 0 0 1-2-2z" />
      <path d="M13 8v8" />
      <path d="M8 10h2" />
      <path d="M8 14h2" />
    </>
  ),
  x: (
    <>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </>
  ),
  zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
};

export function AdminIcon({
  name,
  className = "h-4 w-4",
}: {
  name: AdminIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      {iconPaths[name]}
    </svg>
  );
}
