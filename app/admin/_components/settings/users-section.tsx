"use client";

import { useEffect, useState } from "react";
import { AdminIcon } from "../admin-shell";
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
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

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
    try { await apiRequest(`/users/${id}`, { method: "DELETE" }); await load(); }
    catch { alert("Failed to delete user."); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId && !form.password) return alert("Password required for new users.");
    setIsSaving(true);
    try {
      const payload: Record<string, string> = {
        name: form.name, email: form.email,
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
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to save user."); }
    finally { setIsSaving(false); }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Users Management</h2>
          <p className="text-sm font-medium text-slate-500">Displaying {filtered.length} users</p>
        </div>
        <div className="flex gap-3">
          <button className="grid h-11 w-11 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50" onClick={load} type="button">
            <AdminIcon className="h-4 w-4" name="refresh" />
          </button>
          <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700" onClick={openAdd} type="button">
            <AdminIcon className="h-4 w-4" name="plus" />
            Add User
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 p-4">
          <label className="flex h-11 max-w-xl items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
            <input className="w-full bg-transparent text-sm font-medium outline-none" onChange={(e) => setSearch(e.target.value)} placeholder="Search users by name or email" value={search} />
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
                  {["Name", "Email", "Phone", "Role", "Joined", "Actions"].map((h) => (
                    <th className="px-5 py-3.5 text-sm font-black text-slate-700" key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm font-medium text-slate-400">No users found.</td></tr>
                ) : (
                  filtered.map((user) => (
                    <tr className="bg-white hover:bg-slate-50/60" key={user.id}>
                      <td className="px-5 py-4 font-black text-slate-800">{user.name}</td>
                      <td className="px-5 py-4 font-medium text-slate-600">{user.email}</td>
                      <td className="px-5 py-4 font-medium text-slate-500">{user.phone || "—"}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 capitalize">
                          {user.role?.name ?? "No Role"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(user)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
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
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-black text-slate-800">{editingId ? "Edit User" : "Add User"}</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {[
                { label: "Full Name", type: "text", key: "name", required: true, placeholder: "John Doe" },
                { label: "Email", type: "email", key: "email", required: true, placeholder: "john@example.com" },
                { label: "Phone", type: "tel", key: "phone", required: false, placeholder: "+8801700..." },
              ].map(({ label, type, key, required, placeholder }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">{label}</label>
                  <input type={type} required={required} placeholder={placeholder}
                    value={form[key as keyof UserForm]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                  Password {editingId && <span className="normal-case text-slate-400">(leave blank to keep)</span>}
                </label>
                <input type="password" required={!editingId} placeholder="Min 6 characters"
                  value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Role</label>
                <select value={form.roleId} onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500">
                  <option value="">No Role</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="h-10 rounded-lg border border-slate-300 px-4 font-bold">Cancel</button>
                <button type="submit" disabled={isSaving} className="h-10 rounded-lg bg-blue-600 px-4 font-black text-white disabled:bg-blue-400">
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
