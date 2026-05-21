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

  useEffect(() => {
    apiRequest<ActivityLog[]>("/activity-logs")
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
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
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Activity Logs</h2>
          <p className="text-sm font-medium text-slate-500">
            Audit trail of all admin actions
          </p>
        </div>
        <button
          className="grid h-11 w-11 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
          onClick={() => {
            setLoading(true);
            apiRequest<ActivityLog[]>("/activity-logs")
              .then(setLogs)
              .catch(() => {})
              .finally(() => setLoading(false));
          }}
          type="button"
        >
          <AdminIcon className="h-4 w-4" name="refresh" />
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 p-4">
          <label className="flex h-11 max-w-xl items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
            <input
              className="w-full bg-transparent text-sm font-medium outline-none"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, action or module..."
              value={search}
            />
          </label>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Timestamp", "User", "Action", "Module"].map((h) => (
                    <th className="px-5 py-3.5 text-sm font-black text-slate-700" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm font-medium text-slate-400">
                      No activity logs found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr className="bg-white hover:bg-slate-50/60" key={log.id}>
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-black text-slate-800">{log.user?.name ?? "System"}</p>
                        <p className="text-xs font-medium text-slate-400">{log.user?.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-black capitalize ${
                          log.action.includes("create") || log.action.includes("add")
                            ? "bg-emerald-50 text-emerald-700"
                            : log.action.includes("delete") || log.action.includes("remove")
                            ? "bg-rose-50 text-rose-700"
                            : "bg-blue-50 text-blue-700"
                        }`}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-700 capitalize">
                        {log.entityType || "Global"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
