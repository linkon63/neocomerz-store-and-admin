"use client";

import { useState } from "react";
import { PageHeader, SectionCard, ToggleRow, SaveBar } from "./shared-ui";

export function NotificationsSection() {
  const [newOrder, setNewOrder] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [newReview, setNewReview] = useState(false);
  const [newUser, setNewUser] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  return (
    <>
      <PageHeader title="Notification Settings" description="Choose what you want to be notified about." />
      <div className="space-y-5">
        <SectionCard title="Events" description="Get notified when these events occur.">
          <div className="divide-y divide-slate-100">
            <ToggleRow label="New Order" description="Notify when a new order is placed." checked={newOrder} onChange={setNewOrder} />
            <ToggleRow label="Low Stock Alert" description="Notify when product stock falls below threshold." checked={lowStock} onChange={setLowStock} />
            <ToggleRow label="New Review" description="Notify when a customer leaves a review." checked={newReview} onChange={setNewReview} />
            <ToggleRow label="New Customer" description="Notify when a new customer registers." checked={newUser} onChange={setNewUser} />
          </div>
        </SectionCard>
        <SectionCard title="Channels" description="How you want to receive notifications.">
          <div className="divide-y divide-slate-100">
            <ToggleRow label="Email Notifications" description="Receive notifications via email." checked={emailNotif} onChange={setEmailNotif} />
            <ToggleRow label="SMS Notifications" description="Receive notifications via SMS." checked={smsNotif} onChange={setSmsNotif} />
          </div>
        </SectionCard>
        <SaveBar onSave={() => {}} />
      </div>
    </>
  );
}
