"use client";

import OrderPageView from "../../../_components/order-page-view";

export default function ReturnedOrdersPage() {
  return (
    <OrderPageView
      title="Returned Orders"
      description="Review returned items and process refunds"
      fixedStatus="returned"
    />
  );
}
