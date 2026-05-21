import type { AdminIconName } from "./admin-icons";

export type NavItem = {
  label: string;
  href: string;
  icon: AdminIconName;
  child?: boolean;
  active?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const menuGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" }],
  },
  {
    title: "Inventory & Procurement",
    items: [
      { label: "Product", href: "/admin/products", icon: "package", active: true },
      { label: "Tags", href: "/admin/tags", icon: "tag", child: true },
      { label: "Brands", href: "/admin/brands", icon: "brand", child: true },
      { label: "Categories", href: "/admin/categories", icon: "category", child: true },
      { label: "Variant Options", href: "/admin/variant-options", icon: "variants", child: true },
      { label: "Units of Measurement", href: "/admin/units", icon: "units", child: true },
      { label: "Suppliers", href: "/admin/suppliers", icon: "store", child: true },
      { label: "Stock Management", href: "/admin/stock", icon: "stock" },
    ],
  },
  {
    title: "Sales & Billing",
    items: [
      { label: "Discount", href: "/admin/discounts", icon: "discount" },
      { label: "Gift Voucher", href: "/admin/gift-vouchers", icon: "voucher" },
    ],
  },
  {
    title: "Online Store",
    items: [
      { label: "E-Commerce", href: "/admin/orders", icon: "store", active: true },
      { label: "New Orders", href: "/admin/orders", icon: "orders", child: true },
      { label: "Canceled Orders", href: "/admin/orders/canceled", icon: "x", child: true },
      { label: "Completed Orders", href: "/admin/orders/completed", icon: "check", child: true },
      { label: "Reviews", href: "/admin/reviews", icon: "reviews", child: true },
    ],
  },
  {
    title: "Finance",
    items: [{ label: "Report", href: "/admin/reports", icon: "report" }],
  },
  {
    title: "Administration",
    items: [
      { label: "Settings", href: "/admin/settings", icon: "settings" },
      { label: "Manage Website", href: "/admin/manage-website", icon: "store", child: true },
    ],
  },
];
