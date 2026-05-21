"use client";

import { useState } from "react";
import { AdminIcon } from "../admin-shell";
import { StatusToggle } from "../ui/status-toggle";

type Branch = { id: string; name: string; address: string; isActive: boolean };

export function BranchesSection() {
  const [search, setSearch] = useState("");
  const [branches, setBranches] = useState<Branch[]>([
    { id: "1", name: "Main Branch", address: "Dhaka", isActive: true },
  ]);

  const filtered = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Branch list</h2>
          <p className="text-sm font-medium text-slate-500">
            Displaying {filtered.length} branch
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="grid h-11 w-11 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="refresh" />
          </button>
          <button
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="plus" />
            Add Branch
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 p-4">
          <label className="flex h-11 max-w-xl items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
            <input
              className="w-full bg-transparent text-sm font-medium outline-none"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Branches by name, address"
              value={search}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {["Name", "Address", "Status", "Actions"].map((h) => (
                  <th className="px-5 py-3.5 text-sm font-semibold text-slate-700" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((branch) => (
                <tr className="bg-white hover:bg-slate-50/60" key={branch.id}>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-800">{branch.name}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-600">{branch.address}</td>
                  <td className="px-5 py-4">
                    <StatusToggle
                      checked={branch.isActive}
                      onChange={(v) =>
                        setBranches((prev) =>
                          prev.map((b) => (b.id === branch.id ? { ...b, isActive: v } : b)),
                        )
                      }
                    />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
                      type="button"
                    >
                      <AdminIcon className="h-4 w-4" name="edit" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
