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

const SECTION_LABEL = "text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400";

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loading, setLoading]             = useState(true);

  const fetchList = () => {
    getNotifications()
      .then(setNotifications)
      .catch(() => {/* silent */})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchList(); }, []);

  const handleMarkRead = (id: string) => {
    markNotificationAsRead(id)
      .then(() => setNotifications((p) => p.map((n) => n.id === id ? { ...n, isRead: true } : n)))
      .catch(() => toast.error("Failed to update."));
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead()
      .then(() => setNotifications((p) => p.map((n) => ({ ...n, isRead: true }))))
      .catch(() => toast.error("Failed to update."));
  };

  const handleDelete = (id: string) => {
    deleteNotification(id)
      .then(() => {
        setNotifications((p) => p.filter((n) => n.id !== id));
        toast.success("Notification removed.");
      })
      .catch(() => toast.error("Failed to delete."));
  };

  const hasUnread   = notifications.some((n) => !n.isRead);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={SECTION_LABEL}>Inbox</p>
          <h2 className="font-['Bembo_Std'] text-2xl text-zinc-850 font-normal mt-1 flex items-baseline gap-3">
            Notifications
            {!loading && unreadCount > 0 && (
              <span className="font-sans text-xs font-bold bg-[#C5B382] text-white rounded-full px-2 py-0.5 leading-none">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="font-['Bembo_Std'] text-zinc-400 text-sm italic mt-0.5">
            Recent alerts and activity updates for your account.
          </p>
        </div>
        {!loading && hasUnread && (
          <button
            onClick={handleMarkAllRead}
            className="shrink-0 inline-flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-[0.16em] uppercase text-[#C5B382] hover:text-zinc-800 transition cursor-pointer"
          >
            <FiCheck className="text-xs" /> Mark all read
          </button>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <FiLoader className="w-7 h-7 text-[#C5B382] animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-stone-200 rounded-xl">
          <FiBellOff className="text-4xl text-zinc-200 mb-4" />
          <p className="font-['Bembo_Std'] text-zinc-400 text-base italic">No notifications yet.</p>
          <p className="font-sans text-xs text-zinc-300 mt-1">
            We&apos;ll notify you about orders, offers, and updates.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const isOrder = notif.title.toLowerCase().includes("order");
            const date    = new Date(notif.createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            });

            return (
              <div
                key={notif.id}
                className={`group relative flex gap-4 px-5 py-4 rounded-xl border transition-all duration-200 ${
                  notif.isRead
                    ? "border-stone-100 bg-white hover:bg-stone-50/60"
                    : "border-[#C5B382]/20 bg-[#C5B382]/[0.03] hover:bg-[#C5B382]/[0.05]"
                }`}
              >
                {/* Icon */}
                <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 ${
                  notif.isRead ? "bg-stone-100 text-zinc-400" : "bg-[#C5B382]/15 text-[#8a7440]"
                }`}>
                  {isOrder ? <FiPackage className="text-sm" /> : <FiUser className="text-sm" />}
                </div>

                {/* Body */}
                <div className="flex-grow min-w-0 pr-16">
                  <div className="flex items-center gap-2">
                    <p className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-800 leading-snug">
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5B382] shrink-0" />
                    )}
                  </div>
                  <p className="font-sans text-xs text-zinc-500 mt-1 leading-relaxed">{notif.message}</p>
                  <p className="font-sans text-[10px] text-zinc-300 mt-2 tracking-wide">{date}</p>
                </div>

                {/* Hover actions */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-stone-100 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                      title="Mark as read"
                    >
                      <FiCheck className="text-sm" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-zinc-300 hover:text-red-500 transition cursor-pointer"
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
