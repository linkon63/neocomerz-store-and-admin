"use client";

import { useEffect, useState } from "react";
import { AdminIcon } from "../admin-shell";
import { Button, Input } from "../enterprise-ui";
import { apiRequest } from "../../../../lib/admin-api";

type Permission = { id: string; name: string };
type Role = { id: string; name: string; permissions?: Permission[] };

// ─── Permission Categorizer ──────────────────────────────────────────────────
function getPermissionGroup(permName: string): string {
  const lower = permName.toLowerCase();
  if (lower.includes("user")) return "Users Management";
  if (lower.includes("role") || lower.includes("permission")) return "Security & Access Controls";
  if (lower.includes("product") || lower.includes("variant")) return "Products Catalog";
  if (lower.includes("category") || lower.includes("brand") || lower.includes("tag") || lower.includes("unit") || lower.includes("supplier")) return "Inventory Metadata";
  if (lower.includes("order")) return "Sales & Orders";
  if (lower.includes("setting") || lower.includes("policy") || lower.includes("campaign")) return "Settings & Marketing";
  if (lower.includes("log") || lower.includes("activity")) return "System Audit Logs";
  return "General Operations";
}

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
      if (r.length > 0) {
        const currentSelected = selectedRole ? r.find(x => x.id === selectedRole.id) : r[0];
        if (currentSelected) {
          setSelectedRole(currentSelected);
          setSelectedPermIds(currentSelected.permissions?.map((x) => x.id) ?? []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

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
      alert("Permissions successfully updated!");
      await load();
    } catch {
      alert("Failed to save permissions.");
    } finally {
      setSavingPerms(false);
    }
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
    } catch {
      alert("Failed to save role.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this role?")) return;
    try {
      await apiRequest(`/roles/${id}`, { method: "DELETE" });
      if (selectedRole?.id === id) {
        setSelectedRole(null);
      }
      await load();
    } catch {
      alert("Failed to delete role.");
    }
  }

  const groupedPermissions: Record<string, Permission[]> = {};
  permissions.forEach((perm) => {
    const group = getPermissionGroup(perm.name);
    if (!groupedPermissions[group]) {
      groupedPermissions[group] = [];
    }
    groupedPermissions[group].push(perm);
  });

  return (
    <>
      {/* Streamlined controls header without duplicate titles */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Define Roles & Permission Matrix
          </p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
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
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Roles list */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 shadow-sm h-fit">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-200">Available Roles</p>
            <div className="space-y-2">
              {roles.map((r) => {
                const isSelected = selectedRole?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => selectRole(r)}
                    className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? "border-blue-500 bg-white shadow-sm ring-1 ring-blue-500/20"
                        : "border-transparent bg-transparent hover:bg-slate-100/70"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-bold capitalize ${isSelected ? "text-blue-700" : "text-slate-800"}`}>{r.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{r.permissions?.length ?? 0} permissions</p>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => { setEditingId(r.id); setRoleName(r.name); setIsOpen(true); }}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <AdminIcon className="h-3.5 w-3.5" name="edit" />
                      </button>
                      {r.name.toLowerCase() !== "admin" && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="grid h-7 w-7 place-items-center rounded-lg border border-red-100 text-red-500 bg-white hover:bg-red-50 transition-colors"
                        >
                          <AdminIcon className="h-3.5 w-3.5" name="x" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Permissions Group Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
            <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">
                Permissions for role: <span className="text-blue-600 capitalize font-black">{selectedRole?.name ?? "—"}</span>
              </p>
              {selectedRole && (
                <Button size="sm" variant="success" disabled={savingPerms} onClick={handleSavePerms}>
                  {savingPerms ? "Saving..." : "Save Permissions"}
                </Button>
              )}
            </div>

            {!selectedRole ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <AdminIcon className="h-10 w-10 text-slate-300 mb-2" name="settings" />
                <p className="text-sm font-medium">Select a role on the left to configure permissions</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([groupName, perms]) => (
                  <div key={groupName} className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">{groupName}</h4>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {perms.map((perm) => {
                        const checked = selectedPermIds.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer hover:bg-slate-50 transition-all ${
                              checked
                                ? "border-blue-200 bg-blue-50/20 text-blue-900"
                                : "border-slate-100 text-slate-600 bg-slate-50/30"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setSelectedPermIds((prev) =>
                                prev.includes(perm.id) ? prev.filter((x) => x !== perm.id) : [...prev, perm.id]
                              )}
                              className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold capitalize select-none">{perm.name.replace(/_/g, " ")}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Role Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-800">{editingId ? "Edit Role" : "Add Role"}</h3>
            <form onSubmit={handleRoleSubmit} className="mt-4 space-y-4">
              <div>
                <Input
                  label="Role Name"
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Sales Manager"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-10 px-4 rounded-lg border border-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" size="md" variant="primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
