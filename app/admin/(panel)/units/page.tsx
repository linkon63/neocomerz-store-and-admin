import { SimpleAdminPage } from "../../_components/simple-admin-page";

export default function UnitsPage() {
  return (
    <SimpleAdminPage
      title="Units of Measurement"
      description="Control product stock and sales measurement units"
      listTitle="Units list"
      countLabel="Displaying 4 units"
      addLabel="Add Unit"
      searchPlaceholder="Search units"
      rows={[
        { name: "Pieces", detail: "Default product unit", meta: "pcs", status: "Active" },
        { name: "Box", detail: "Bulk purchase unit", meta: "box", status: "Active" },
        { name: "Pair", detail: "Footwear and accessories", meta: "pair", status: "Active" },
      ]}
    />
  );
}
