export const summaryCards = [
  { label: "Total sales", value: "৳482,950", trend: "12.4%", tone: "blue" },
  { label: "Total orders", value: "1,284", trend: "8.1%", tone: "emerald" },
  { label: "Pending orders", value: "42", trend: "4.3%", tone: "amber" },
  { label: "Low stock products", value: "17", trend: "2.0%", tone: "rose" },
  { label: "Total customers", value: "8,420", trend: "9.8%", tone: "violet" },
  { label: "Total products", value: "346", trend: "5.6%", tone: "slate" },
];

export const products = [
  {
    name: "3 PCS Combo of Black, Chocolate and Dark Grey Elegante Zero",
    sku: "5PA95A",
    category: "Dad Caps",
    brand: "Nike",
    supplier: "Flexfit",
    stock: 998,
    price: "৳1,899.00",
    status: "Active",
    createdAt: "Feb 18, 2026",
    color: "bg-stone-700",
  },
  {
    name: "Head Gear Basic Blue Grey Bucket Hat",
    sku: "TRU892",
    category: "Bucket Hats",
    brand: "New Era",
    supplier: "New Era Cap Company",
    stock: 997,
    price: "৳899.00",
    status: "Active",
    createdAt: "Feb 18, 2026",
    color: "bg-blue-600",
  },
  {
    name: "Head Gear Silver Green Suede Cord Limited Edition Cap",
    sku: "DOCEB0",
    category: "Baseball Caps",
    brand: "Vans",
    supplier: "New Era Cap Company",
    stock: 998,
    price: "৳1,399.00",
    status: "Active",
    createdAt: "Feb 18, 2026",
    color: "bg-emerald-900",
  },
  {
    name: "Head Gear Triple AAA Cap",
    sku: "HATD5A",
    category: "Trucker Caps",
    brand: "Adidas",
    supplier: "New Era Cap Company",
    stock: 1000,
    price: "৳899.00",
    status: "Active",
    createdAt: "Feb 18, 2026",
    color: "bg-olive-600",
  },
  {
    name: "Head Gear Basic Pink Bucket Hat",
    sku: "5PAF42",
    category: "Bucket Hats",
    brand: "Under Armour",
    supplier: "Flexfit",
    stock: 997,
    price: "৳699.00",
    status: "Draft",
    createdAt: "Feb 18, 2026",
    color: "bg-pink-300",
  },
];

export const brands = [
  "New Era",
  "Supreme",
  "Vans",
  "H&M",
  "Zara",
  "Nike",
  "Adidas",
  "Under Armour",
].map((name) => ({
  name,
  slug: name.toLowerCase().replaceAll(" ", "-").replace("&", "and"),
  products: Math.floor(18 + name.length * 7),
  createdAt: "February 17, 2026",
}));

export const categories = [
  "Dad Caps",
  "Trucker Caps",
  "Bucket Hats",
  "Docker Hat",
  "5 Panel Cap",
  "Beanies",
  "Hat & Cap",
  "Baseball Caps",
].map((name, index) => ({
  name,
  slug: name.toLowerCase().replaceAll(" ", "-").replace("&", "and"),
  parent: index < 2 ? "Hat & Cap" : "-",
  products: 12 + index * 5,
  createdAt: "February 17, 2026",
}));

export const orders = [
  { no: "FYXAOCNU7Q", total: "BDT 1959", status: "Order Placed" },
  { no: "LPVSAXKGTD", total: "BDT 2019", status: "Packaging" },
  { no: "LKPTLYLEHA", total: "BDT 3858", status: "Ready to Ship" },
  { no: "Y3NBULI8CH", total: "BDT 1560", status: "On the Way" },
  { no: "X5BS15GSOY", total: "BDT 959", status: "Delivered" },
  { no: "ZLV9ATJB1S", total: "BDT 1959", status: "Failed" },
];

export const recentOrders = orders.slice(0, 4).map((order, index) => ({
  ...order,
  customer: ["Imran Hossain", "Sadia Rahman", "Rakib Hasan", "Nusrat Jahan"][
    index
  ],
  payment: index === 3 ? "Paid" : "Unpaid",
}));
