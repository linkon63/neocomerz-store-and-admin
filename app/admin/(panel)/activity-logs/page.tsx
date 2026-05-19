"use client";

import { useEffect, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type ActivityLog = {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  async function loadLogs() {
    try {
      setLoading(true);
      setError("");
      const logsData = await apiRequest<ActivityLog[]>("/activity-logs");
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve audit trail logs from database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLogs();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  // Filter logs based on search and action dropdown
  useEffect(() => {
    let result = logs;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (log) =>
          log.user?.name.toLowerCase().includes(q) ||
          log.user?.email.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.entityType?.toLowerCase().includes(q)
      );
    }

    if (actionFilter) {
      result = result.filter((log) => log.action === actionFilter);
    }

    const timeoutId = window.setTimeout(() => {
      setFilteredLogs(result);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [search, actionFilter, logs]);

  // Extract unique actions for dropdown filter
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 font-black text-slate-600">Loading audit activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Security Audit & Activity Logs"
        description="Review chronological records of administrator changes, login attempts, settings updates, and inventory adjustments."
        action={
          <button
            onClick={loadLogs}
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 font-black text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10"
          >
            <AdminIcon className="h-5 w-5" name="refresh" />
            Refresh Logs
          </button>
        }
      />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl font-bold">
          {error}
        </div>
      )}

      {/* Filters bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name, email or entity type..."
              className="w-full text-sm font-medium outline-none placeholder:text-slate-400"
            />
          </label>
        </div>
        <div className="w-56">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-black bg-white outline-none focus:border-blue-500"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Timestamp", "User", "Action", "Module", "IP Address"].map((h) => (
                  <th className="px-5 py-4 font-black text-slate-600 text-sm" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium">
                    No activity entries found matching filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr className="hover:bg-slate-50/50 transition-colors" key={log.id}>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      {log.user ? (
                        <div>
                          <p className="font-black text-slate-800 text-sm">{log.user.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{log.user.email}</p>
                        </div>
                      ) : (
                        <p className="font-black text-slate-400 text-sm">System Process</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-black border capitalize ${
                        log.action.includes("create") || log.action.includes("add")
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : log.action.includes("delete") || log.action.includes("remove")
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-700 capitalize">
                        {log.entityType || "Global"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-500 text-xs">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
