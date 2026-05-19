"use client";

import { useEffect, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { apiRequest } from "../../../../lib/admin-api";

type Permission = {
  id: string;
  name: string;
};

type Role = {
  id: string;
  name: string;
  permissions?: Permission[];
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Role Form State
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [savingRole, setSavingRole] = useState(false);

  // Active Role for Permission Assignment
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermIds(role.permissions?.map((p) => p.id) ?? []);
  };

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [rolesData, permissionsData] = await Promise.all([
        apiRequest<Role[]>("/roles"),
        apiRequest<Permission[]>("/permissions"),
      ]);

      setRoles(rolesData);
      setPermissions(permissionsData);

      // Auto select first role if none selected yet
      if (rolesData.length > 0 && !selectedRole) {
        handleSelectRole(rolesData[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load security roles & permission lists.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const openAddRole = () => {
    setEditingRoleId(null);
    setRoleName("");
    setIsRoleOpen(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setIsRoleOpen(true);
  };

  async function handleDeleteRole(id: string) {
    if (!confirm("Are you sure you want to delete this role? Users assigned to this role might lose access.")) return;
    try {
      await apiRequest(`/roles/${id}`, { method: "DELETE" });
      setSelectedRole(null);
      await loadData();
    } catch (err) {
      alert("Failed to delete role.");
    }
  }

  async function handleRoleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleName) return;

    setSavingRole(true);
    try {
      if (editingRoleId) {
        await apiRequest(`/roles/${editingRoleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: roleName.trim() }),
        });
      } else {
        await apiRequest("/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: roleName.trim() }),
        });
      }

      setIsRoleOpen(false);
      setRoleName("");
      await loadData();
    } catch (err) {
      alert("Failed to save security role.");
    } finally {
      setSavingRole(false);
    }
  }

  const togglePermission = (id: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  async function handleSavePermissions() {
    if (!selectedRole) return;

    setSavingPermissions(true);
    try {
      await apiRequest(`/roles/${selectedRole.id}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds: selectedPermIds }),
      });

      alert("Permissions successfully assigned!");
      await loadData();
    } catch (err) {
      alert("Failed to update role permissions.");
    } finally {
      setSavingPermissions(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 font-black text-slate-600">Loading roles & permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Roles & Security Permissions"
        description="Define security profiles and configure explicit feature permissions for store operators."
        action={
          <button
            onClick={openAddRole}
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-600 px-6 font-black text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10"
          >
            <AdminIcon className="h-5 w-5" name="plus" />
            Add Security Role
          </button>
        }
      />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl font-bold">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[0.4fr_0.6fr]">
        {/* Roles List */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3">Available Roles</h3>
          <div className="space-y-2">
            {roles.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center font-medium">No roles created yet.</p>
            ) : (
              roles.map((r) => {
                const isSelected = selectedRole?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleSelectRole(r)}
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 text-blue-700 font-bold"
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div>
                      <p className="font-black text-sm capitalize">{r.name}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        {r.permissions?.length || 0} permissions assigned
                      </p>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditRole(r)}
                        className="grid h-7 w-7 place-items-center rounded border border-slate-200 text-slate-500 hover:bg-white"
                      >
                        <AdminIcon className="h-3.5 w-3.5" name="edit" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(r.id)}
                        className="grid h-7 w-7 place-items-center rounded border border-red-100 text-red-500 hover:bg-red-50"
                      >
                        <AdminIcon className="h-3.5 w-3.5" name="x" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Permissions Configuration for Selected Role */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Permissions Map: <span className="capitalize text-blue-600">{selectedRole?.name || "None Selected"}</span>
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">Check options below to assign to this role.</p>
              </div>
            </div>

            {!selectedRole ? (
              <p className="text-sm text-slate-400 py-12 text-center font-medium">Select a role from the left pane to edit permissions.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {permissions.map((perm) => {
                  const isChecked = selectedPermIds.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors ${
                        isChecked ? "border-blue-200 bg-blue-50/10" : "border-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4.5 w-4.5"
                      />
                      <div>
                        <p className="text-sm font-black text-slate-700 capitalize">{perm.name.replace(/_/g, " ")}</p>
                        <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">{perm.name}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {selectedRole && (
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
              <button
                onClick={handleSavePermissions}
                disabled={savingPermissions}
                className="h-11 px-6 rounded-lg bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors disabled:bg-blue-400 shadow-md shadow-blue-600/10"
              >
                {savingPermissions ? "Saving..." : "Save Assigned Permissions"}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Role Creation/Editing Modal */}
      {isRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsRoleOpen(false)} />
          <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-800">{editingRoleId ? "Edit Role" : "Add Role"}</h3>

            <form onSubmit={handleRoleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Moderator"
                  className="w-full h-11 border border-slate-300 rounded-lg px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRoleOpen(false)}
                  className="h-11 px-5 rounded-lg border border-slate-300 font-bold hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={savingRole}
                  className="h-11 px-5 rounded-lg bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {savingRole ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
