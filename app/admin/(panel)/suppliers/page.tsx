import { defaultRows, SimpleAdminPage } from "../../_components/simple-admin-page";

export default function SuppliersPage() {
  return (
    <SimpleAdminPage
      title="Suppliers"
      description="Manage vendors and procurement sources"
      listTitle="Suppliers list"
      countLabel="Displaying 6 suppliers"
      addLabel="Add Supplier"
      searchPlaceholder="Search suppliers"
      rows={[
        { name: "Flexfit", detail: "Caps and headwear supplier", meta: "128 products", status: "Active" },
        { name: "New Era Cap Company", detail: "Premium cap manufacturer", meta: "94 products", status: "Active" },
        { name: "Dhaka Apparel Hub", detail: "Local apparel sourcing", meta: "31 products", status: "Draft" },
        ...defaultRows,
      ]}
    />
  );
}
