import { SimpleAdminPage } from "../../_components/simple-admin-page";

export default function TagsPage() {
  return (
    <SimpleAdminPage
      title="Tags"
      description="Organize products with searchable merchandising tags"
      listTitle="Tags list"
      countLabel="Displaying 7 tags"
      addLabel="Add Tag"
      searchPlaceholder="Search tags"
      rows={[
        { name: "Summer Drop", detail: "Campaign collection", meta: "46 products", status: "Active" },
        { name: "Limited Edition", detail: "Scarcity label", meta: "12 products", status: "Active" },
        { name: "Low Stock", detail: "Inventory attention", meta: "17 products", status: "Active" },
        { name: "Clearance", detail: "Discount campaign", meta: "8 products", status: "Draft" },
      ]}
    />
  );
}
