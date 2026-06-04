"use client";

import { useEffect, useState } from "react";
import { AdminIcon } from "../admin-shell";
import { Button, Input } from "../enterprise-ui";
import { apiRequest } from "../../../../lib/admin-api";

type Role = { id: string; name: string };
type User = { id: string; name: string; email: string; phone?: string; role?: Role | null; createdAt: string };
type UserForm = { name: string; email: string; password: string; phone: string; roleId: string };

const emptyForm: UserForm = { name: "", email: "", password: "", phone: "", roleId: "" };

export function UsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);

  async function load() {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        apiRequest<User[]>("/users"),
        apiRequest<Role[]>("/roles"),
      ]);
      setUsers(u);
      setRoles(r);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, roleId: roles[0]?.id ?? "" });
    setIsOpen(true);
  }

  function openEdit(user: User) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, password: "", phone: user.phone ?? "", roleId: user.role?.id ?? "" });
    setIsOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user?")) return;
    try {
      await apiRequest(`/users/${id}`, { method: "DELETE" });
      await load();
    } catch {
      alert("Failed to delete user.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId && !form.password) return alert("Password required for new users.");
    setIsSaving(true);
    try {
      const payload: Record<string, string> = {
        name: form.name,
        email: form.email,
        ...(form.phone && { phone: form.phone }),
        ...(form.roleId && { roleId: form.roleId }),
        ...(form.password && { password: form.password }),
      };
      await apiRequest(editingId ? `/users/${editingId}` : "/users", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setIsOpen(false);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save user.");
    } finally {
      setIsSaving(false);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
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
              placeholder="Search users by name or email..."
              value={search}
            />
          </label>
        </div>
        <div className="flex gap-2.5">
          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            onClick={load}
            type="button"
            title="Refresh List"
          >
            <AdminIcon className="h-4 w-4 text-slate-600" name="refresh" />
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm animate-in fade-in duration-200"
            onClick={openAdd}
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="plus" />
            Add User
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Count Indicator */}
        <div className="border-b border-slate-200 bg-slate-50/20 px-5 py-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            User Accounts ({filtered.length})
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Name", "Email", "Phone", "Role", "Joined Date", "Actions"].map((h) => (
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap" key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm font-medium text-slate-400">
                      No user accounts found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr className="bg-white hover:bg-slate-50/50 transition-colors" key={user.id}>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800 whitespace-nowrap">{user.name}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">{user.email}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">{user.phone || "—"}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-blue-700">
                          {user.role?.name ?? "No Role"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-400 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEdit(user)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                          >
                            <AdminIcon className="h-4 w-4" name="edit" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <AdminIcon className="h-4 w-4" name="x" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-800">{editingId ? "Edit User" : "Add User"}</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <Input
                  label="Full Name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+8801700..."
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  label={`Password ${editingId ? "(leave blank to keep)" : ""}`}
                  type="password"
                  required={!editingId}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Security Role</label>
                <select
                  value={form.roleId}
                  onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                >
                  <option value="">No Role</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-10 px-4 rounded-lg border border-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" size="md" variant="primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
