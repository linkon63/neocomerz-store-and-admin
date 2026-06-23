"use client";

import OrderPageView from "../../../_components/order-page-view";

export default function CompletedOrdersPage() {
  return (
    <OrderPageView
      title="Completed Orders"
      description="Delivered and fully paid customer orders"
      fixedStatus="delivered"
    />
  );
}
