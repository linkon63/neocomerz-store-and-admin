import { SimpleAdminPage } from "../../_components/simple-admin-page";

export default function ReviewsPage() {
  return (
    <SimpleAdminPage
      title="Reviews"
      description="Moderate product reviews before they appear in the store"
      listTitle="Reviews list"
      countLabel="Displaying 5 reviews"
      addLabel="Add Review"
      searchPlaceholder="Search reviews"
      rows={[
        { name: "Imran Hossain", detail: "5 stars on Elegante Zero", meta: "Approved", status: "Active" },
        { name: "Sadia Rahman", detail: "4 stars on Bucket Hat", meta: "Pending moderation", status: "Draft" },
        { name: "Rakib Hasan", detail: "3 stars on Triple AAA Cap", meta: "Needs response", status: "Draft" },
      ]}
    />
  );
}
