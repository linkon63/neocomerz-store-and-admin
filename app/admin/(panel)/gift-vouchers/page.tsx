import { SimpleAdminPage } from "../../_components/simple-admin-page";

export default function GiftVouchersPage() {
  return (
    <SimpleAdminPage
      title="Gift Voucher"
      description="Issue and track customer gift vouchers"
      listTitle="Gift voucher list"
      countLabel="Displaying 3 vouchers"
      addLabel="Add Voucher"
      searchPlaceholder="Search vouchers"
      rows={[
        { name: "GV-1000-A", detail: "৳1,000 balance", meta: "Unused", status: "Active" },
        { name: "GV-2500-B", detail: "৳2,500 balance", meta: "Partially used", status: "Active" },
        { name: "GV-500-C", detail: "৳500 balance", meta: "Draft issue", status: "Draft" },
      ]}
    />
  );
}
