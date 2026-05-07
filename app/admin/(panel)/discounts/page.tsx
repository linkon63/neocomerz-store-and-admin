import { SimpleAdminPage } from "../../_components/simple-admin-page";

export default function DiscountsPage() {
  return (
    <SimpleAdminPage
      title="Discount"
      description="Manage coupons, campaign discounts, and checkout promotions"
      listTitle="Discount list"
      countLabel="Displaying 4 discounts"
      addLabel="Add Discount"
      searchPlaceholder="Search discounts"
      rows={[
        { name: "SUMMER30", detail: "30% percentage discount", meta: "Expires May 31, 2026", status: "Active" },
        { name: "FREESHIP", detail: "Delivery charge waiver", meta: "Used 128 times", status: "Active" },
        { name: "WELCOME100", detail: "৳100 fixed discount", meta: "New customers", status: "Draft" },
      ]}
    />
  );
}
