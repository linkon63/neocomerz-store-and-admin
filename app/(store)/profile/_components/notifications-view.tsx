"use client";
 
import { useEffect, useState } from "react";
import { FiPackage, FiUser, FiCheck, FiTrash2, FiBellOff, FiLoader } from "react-icons/fi";
import { toast } from "sonner";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type CustomerNotification,
} from "@/lib/storefront-api";
 
export default function NotificationsView() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(true);
 
  const fetchList = () => {
    getNotifications()
      .then((data) => setNotifications(data))
      .catch((err) => {
        console.error("Failed to load notifications:", err);
      })
      .finally(() => setLoading(false));
  };
 
  useEffect(() => {
    fetchList();
  }, []);
 
  const handleMarkRead = (id: string) => {
    markNotificationAsRead(id)
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        toast.success("Notification marked as read");
      })
      .catch(() => toast.error("Failed to update notification"));
  };
 
  const handleMarkAllRead = () => {
    markAllNotificationsAsRead()
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      })
      .catch(() => toast.error("Failed to update notifications"));
  };
 
  const handleDelete = (id: string) => {
    deleteNotification(id)
      .then(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success("Notification deleted");
      })
      .catch(() => toast.error("Failed to delete notification"));
  };
 
  const hasUnread = notifications.some((n) => !n.isRead);
 
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-400 mb-1">
            Notifications
          </h2>
          <p className="font-['Bembo_Std'] text-zinc-650 text-base italic">
            Recent alerts and activity updates for your account.
          </p>
        </div>
        {!loading && notifications.length > 0 && hasUnread && (
          <button
            onClick={handleMarkAllRead}
            className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#C5B382] hover:text-stone-850 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <FiCheck className="text-xs" /> Mark all as read
          </button>
        )}
      </div>
 
      {loading ? (
        <div className="flex justify-center py-16">
          <FiLoader className="w-8 h-8 text-[#C5B382] animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-200">
          <FiBellOff className="mx-auto text-4xl text-zinc-300 mb-4" />
          <p className="font-sans text-sm text-zinc-500">
            No notifications available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => {
            const formattedDate = new Date(notif.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const type = notif.title.toLowerCase().includes("order") ? "order" : "profile";
 
            return (
              <div
                key={notif.id}
                className={`flex gap-4 border p-5 rounded transition items-start relative group ${
                  notif.isRead
                    ? "border-stone-200 bg-white hover:bg-stone-50/50"
                    : "border-brand-primary/20 bg-brand-primary/[0.02] hover:bg-brand-primary/[0.04]"
                }`}
              >
                <div
                  className={`p-2 rounded-full text-zinc-500 ${
                    notif.isRead ? "bg-stone-100" : "bg-brand-primary/10 text-brand-primary"
                  }`}
                >
                  {type === "order" ? (
                    <FiPackage className="text-sm" />
                  ) : (
                    <FiUser className="text-sm" />
                  )}
                </div>
                <div className="flex-grow min-w-0 pr-8">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h4 className="font-sans font-bold text-xs uppercase text-zinc-800 tracking-wider">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    )}
                  </div>
                  <p className="font-sans text-xs text-zinc-650 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="block font-sans text-[10px] text-zinc-400 mt-2">
                    {formattedDate}
                  </span>
                </div>
 
                <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="text-stone-400 hover:text-stone-850 p-1 hover:bg-stone-100 rounded transition cursor-pointer"
                      title="Mark as read"
                    >
                      <FiCheck className="text-sm" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="text-stone-400 hover:text-red-500 p-1 hover:bg-stone-100 rounded transition cursor-pointer"
                    title="Delete"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
