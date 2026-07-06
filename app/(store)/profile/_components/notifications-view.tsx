"use client";

import { FiPackage, FiUser } from "react-icons/fi";

const NOTIFICATIONS = [
  {
    id: "1",
    title: "Order Placed Successfully",
    message: "Your order #LTE-99482 has been received and is being processed.",
    time: "2 hours ago",
    type: "order"
  },
  {
    id: "2",
    title: "Avatar Updated",
    message: "Your profile photo was successfully changed.",
    time: "1 day ago",
    type: "profile"
  },
  {
    id: "3",
    title: "Welcome to London Tea Exchange",
    message: "Thank you for creating your account! We are excited to have you.",
    time: "3 days ago",
    type: "profile"
  }
];

export default function NotificationsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-400 mb-1">
          Notifications
        </h2>
        <p className="font-['Bembo_Std'] text-zinc-650 text-base italic">
          Recent alerts and activity updates for your account.
        </p>
      </div>

      <div className="space-y-4">
        {NOTIFICATIONS.map((notif) => (
          <div key={notif.id} className="flex gap-4 border border-stone-200 p-5 rounded hover:bg-stone-50 transition items-start">
            <div className="p-2 bg-stone-100 rounded-full text-zinc-500">
              {notif.type === "order" ? <FiPackage className="text-sm" /> : <FiUser className="text-sm" />}
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h4 className="font-sans font-bold text-xs uppercase text-zinc-800 tracking-wider">
                  {notif.title}
                </h4>
                <span className="font-sans text-[10px] text-zinc-400">
                  {notif.time}
                </span>
              </div>
              <p className="font-sans text-xs text-zinc-650 mt-1">
                {notif.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
