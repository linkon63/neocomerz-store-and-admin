"use client";

import { useEffect, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type Role = { id: string; name: string };

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: Role | null;
  createdAt: string;
};

type UserForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  roleId: string;
};

const emptyForm: UserForm = { name: "", email: "", password: "", phone: "", roleId: "" };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [usersData, rolesData] = await Promise.all([
        apiRequest<User[]>("/users"),
        apiRequest<Role[]>("/roles"),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadData(); }, []);

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
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await apiRequest(`/users/${id}`, { method: "DELETE" });
      await loadData();
    } catch {
      alert("Failed to delete user.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId && !form.password) return alert("Password is required for new users.");
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
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save user.");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage user accounts and role assignments."
        action={
          <div className="flex gap-3">
            <button onClick={loadData} className="grid h-12 w-12 place-items-center rounded-lg border border-slate-300 bg-white">
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button onClick={openAdd} className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 font-black text-white">
              <AdminIcon className="h-5 w-5" name="plus" />
              Add User
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {["Name", "Email", "Phone", "Role", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-sm font-black text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm font-medium text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-black text-slate-800">{user.name}</td>
                    <td className="px-5 py-4 font-medium text-slate-600">{user.email}</td>
                    <td className="px-5 py-4 font-medium text-slate-500">{user.phone || "-"}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 capitalize">
                        {user.role?.name ?? "No Role"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(user)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100">
                          <AdminIcon className="h-4 w-4" name="edit" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50">
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
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-800">{editingId ? "Edit User" : "Add User"}</h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {[
                { label: "Full Name", type: "text", key: "name", required: true, placeholder: "John Doe" },
                { label: "Email", type: "email", key: "email", required: true, placeholder: "john@example.com" },
                { label: "Phone", type: "tel", key: "phone", required: false, placeholder: "+8801700..." },
              ].map(({ label, type, key, required, placeholder }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">{label}</label>
                  <input
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    value={form[key as keyof UserForm]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Password {editingId && <span className="normal-case text-slate-400">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Role</label>
                <select
                  value={form.roleId}
                  onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">No Role</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="h-11 rounded-lg border border-slate-300 px-5 font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="h-11 rounded-lg bg-blue-600 px-5 font-black text-white disabled:bg-blue-400">
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
