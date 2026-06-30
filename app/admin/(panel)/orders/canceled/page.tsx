"use client";

import OrderPageView from "../../../_components/order-page-view";

export default function CanceledOrdersPage() {
  return (
    <OrderPageView
      title="Canceled Orders"
      description="Review canceled ecommerce orders and refund status"
      fixedStatus="cancelled"
    />
  );
}
