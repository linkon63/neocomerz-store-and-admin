import { SimpleAdminPage } from "../../_components/simple-admin-page";

export default function VariantOptionsPage() {
  return (
    <SimpleAdminPage
      title="Variant Options"
      description="Manage product attributes like size, color, fit, and material"
      listTitle="Variant options list"
      countLabel="Displaying 5 option groups"
      addLabel="Add Option"
      searchPlaceholder="Search variant options"
      rows={[
        { name: "Color", detail: "Black, Blue, Pink, Green", meta: "4 values", status: "Active" },
        { name: "Size", detail: "S, M, L, XL", meta: "4 values", status: "Active" },
        { name: "Fit", detail: "Regular, Slim, Oversized", meta: "3 values", status: "Active" },
        { name: "Material", detail: "Cotton, Suede, Denim", meta: "3 values", status: "Draft" },
      ]}
    />
  );
}
