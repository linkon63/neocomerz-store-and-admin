"use client";

import { useEffect, useState } from "react";
import { AdminIcon } from "../admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type Permission = { id: string; name: string };
type Role = { id: string; name: string; permissions?: Permission[] };

export function RolesSection() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [savingPerms, setSavingPerms] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        apiRequest<Role[]>("/roles"),
        apiRequest<Permission[]>("/permissions"),
      ]);
      setRoles(r);
      setPermissions(p);
      if (r.length > 0 && !selectedRole) {
        setSelectedRole(r[0]);
        setSelectedPermIds(r[0].permissions?.map((x) => x.id) ?? []);
      }
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  function selectRole(role: Role) {
    setSelectedRole(role);
    setSelectedPermIds(role.permissions?.map((p) => p.id) ?? []);
  }

  async function handleSavePerms() {
    if (!selectedRole) return;
    setSavingPerms(true);
    try {
      await apiRequest(`/roles/${selectedRole.id}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds: selectedPermIds }),
      });
      await load();
    } catch { alert("Failed to save permissions."); }
    finally { setSavingPerms(false); }
  }

  async function handleRoleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleName.trim()) return;
    setSaving(true);
    try {
      await apiRequest(editingId ? `/roles/${editingId}` : "/roles", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName.trim() }),
      });
      setIsOpen(false);
      setRoleName("");
      await load();
    } catch { alert("Failed to save role."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this role?")) return;
    try {
      await apiRequest(`/roles/${id}`, { method: "DELETE" });
      setSelectedRole(null);
      await load();
    } catch { alert("Failed to delete role."); }
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Roles & Permissions</h2>
          <p className="text-sm font-medium text-slate-500">Manage security roles and assign permissions</p>
        </div>
        <button
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => { setEditingId(null); setRoleName(""); setIsOpen(true); }}
          type="button"
        >
          <AdminIcon className="h-4 w-4" name="plus" />
          Add Role
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-[0.4fr_0.6fr]">
          {/* Roles list */}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">Available Roles</p>
            {roles.map((r) => {
              const isSelected = selectedRole?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => selectRole(r)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${
                    isSelected ? "border-blue-400 bg-blue-50/50" : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800 capitalize">{r.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{r.permissions?.length ?? 0} permissions</p>
                  </div>
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setEditingId(r.id); setRoleName(r.name); setIsOpen(true); }}
                      className="grid h-7 w-7 place-items-center rounded border border-slate-200 text-slate-500 hover:bg-white">
                      <AdminIcon className="h-3.5 w-3.5" name="edit" />
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      className="grid h-7 w-7 place-items-center rounded border border-red-100 text-red-500 hover:bg-red-50">
                      <AdminIcon className="h-3.5 w-3.5" name="x" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Permissions */}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 mb-3">
              Permissions for: <span className="text-blue-600 capitalize">{selectedRole?.name ?? "None"}</span>
            </p>
            {!selectedRole ? (
              <p className="text-sm text-slate-400 py-6 text-center">Select a role to manage permissions</p>
            ) : (
              <>
                <div className="grid gap-2 sm:grid-cols-2 flex-1">
                  {permissions.map((perm) => {
                    const checked = selectedPermIds.includes(perm.id);
                    return (
                      <label key={perm.id} className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer hover:bg-slate-50 ${
                        checked ? "border-blue-200 bg-blue-50/30" : "border-slate-100"
                      }`}>
                        <input type="checkbox" checked={checked}
                          onChange={() => setSelectedPermIds((prev) =>
                            prev.includes(perm.id) ? prev.filter((x) => x !== perm.id) : [...prev, perm.id]
                          )}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <span className="text-sm font-medium text-slate-700 capitalize">{perm.name.replace(/_/g, " ")}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
                  <button onClick={handleSavePerms} disabled={savingPerms}
                    className="h-10 px-5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400">
                    {savingPerms ? "Saving..." : "Save Permissions"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-800">{editingId ? "Edit Role" : "Add Role"}</h3>
            <form onSubmit={handleRoleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">Role Name</label>
                <input type="text" required value={roleName} onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Manager"
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)}
                  className="h-10 px-4 rounded-lg border border-slate-300 text-sm font-bold">Cancel</button>
                <button type="submit" disabled={saving}
                  className="h-10 px-4 rounded-lg bg-blue-600 text-sm font-medium text-white disabled:bg-blue-400">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
