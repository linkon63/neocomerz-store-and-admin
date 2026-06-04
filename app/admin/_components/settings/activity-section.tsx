"use client";

import { useEffect, useState } from "react";
import { AdminIcon } from "../admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type ActivityLog = {
  id: string;
  action: string;
  entityType?: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
};

export function ActivitySection() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await apiRequest<ActivityLog[]>("/activity-logs");
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      !q ||
      log.user?.name.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entityType?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Streamlined search and action toolbar */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <label className="flex h-10 items-center gap-3 rounded-lg border border-slate-300 bg-white px-3.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
            <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
            <input
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, action, or module..."
              value={search}
            />
          </label>
        </div>
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          onClick={load}
          type="button"
          title="Refresh Logs"
        >
          <AdminIcon className="h-4 w-4 text-slate-600" name="refresh" />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Count Indicator */}
        <div className="border-b border-slate-200 bg-slate-50/20 px-5 py-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            System Activities ({filtered.length})
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Timestamp", "User Initials", "User", "Action", "Module / Resource"].map((h) => (
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm font-medium text-slate-400">
                      No matching activity logs found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => {
                    const initials = log.user?.name ? log.user.name.charAt(0).toUpperCase() : "S";
                    const isSystem = !log.user;
                    const actionName = log.action.toLowerCase();
                    
                    let badgeStyles = "bg-blue-50 text-blue-700 border-blue-200/60";
                    if (actionName.includes("create") || actionName.includes("add") || actionName.includes("post")) {
                      badgeStyles = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
                    } else if (actionName.includes("delete") || actionName.includes("remove")) {
                      badgeStyles = "bg-rose-50 text-rose-700 border-rose-200/60";
                    } else if (actionName.includes("update") || actionName.includes("edit") || actionName.includes("patch")) {
                      badgeStyles = "bg-amber-50 text-amber-700 border-amber-200/60";
                    } else if (actionName.includes("login") || actionName.includes("auth")) {
                      badgeStyles = "bg-violet-50 text-violet-700 border-violet-200/60";
                    }

                    return (
                      <tr className="bg-white hover:bg-slate-50/50 transition-colors" key={log.id}>
                        <td className="px-5 py-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black select-none ${
                            isSystem ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-700"
                          }`}>
                            {initials}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-800">{log.user?.name ?? "System Daemon"}</p>
                          <p className="text-[11px] font-medium text-slate-400">{log.user?.email ?? "system@internal"}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${badgeStyles}`}>
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs font-bold text-slate-600 capitalize whitespace-nowrap">
                          {log.entityType || "Global Settings"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
