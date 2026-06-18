"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  assignRolePermissions,
  createRole,
  createStaff,
  deleteRole,
  deleteStaff,
  formatDate,
  listPermissions,
  listRoles,
  listStaff,
  updateRoleName,
  updateStaff,
  type AdminPermission,
  type AdminRole,
  type StaffUser,
} from "../../../../lib/admin-api";
import { ADMIN_SECTIONS, SUPERADMIN_ROLE } from "../../../../lib/admin-sections";

const PROTECTED_ROLES = new Set([SUPERADMIN_ROLE, "admin"]);

type Tab = "staff" | "roles";

type StaffForm = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  password: string;
};

const emptyStaffForm: StaffForm = {
  name: "",
  email: "",
  phone: "",
  roleId: "",
  password: "",
};

export default function StaffPage() {
  const [tab, setTab] = useState<Tab>("staff");
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // permission name -> id, used to translate section keys into permission ids
  const permissionIdByName = useMemo(() => {
    const map = new Map<string, string>();
    permissions.forEach((p) => map.set(p.name, p.id));
    return map;
  }, [permissions]);

  async function loadAll() {
    setError("");
    setIsLoading(true);
    try {
      const [staffList, roleList, permList] = await Promise.all([
        listStaff(),
        listRoles(),
        listPermissions(),
      ]);
      setStaff(staffList);
      setRoles(roleList);
      setPermissions(permList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  return (
    <div>
      <PageHeader
        title="Staff & Roles"
        description="Create staff accounts, set their passwords, and control which sections each role can access."
      />

      {error && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {notice}
        </p>
      )}

      <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setTab("staff")}
          className={`rounded-lg px-5 py-2 text-sm font-black transition ${
            tab === "staff" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Staff Accounts
        </button>
        <button
          type="button"
          onClick={() => setTab("roles")}
          className={`rounded-lg px-5 py-2 text-sm font-black transition ${
            tab === "roles" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Roles & Access
        </button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center rounded-xl border border-slate-200 bg-white py-20 font-black text-slate-500">
          Loading...
        </div>
      ) : tab === "staff" ? (
        <StaffTab
          staff={staff}
          roles={roles}
          onChanged={(msg) => {
            flash(msg);
            loadAll();
          }}
          onError={setError}
        />
      ) : (
        <RolesTab
          roles={roles}
          permissionIdByName={permissionIdByName}
          onChanged={(msg) => {
            flash(msg);
            loadAll();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

// ─── Staff Accounts tab ─────────────────────────────────────────────────────

function StaffTab({
  staff,
  roles,
  onChanged,
  onError,
}: {
  staff: StaffUser[];
  roles: AdminRole[];
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [form, setForm] = useState<StaffForm>(emptyStaffForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toDelete, setToDelete] = useState<StaffUser | null>(null);

  const isEditing = Boolean(form.id);

  function openCreate() {
    setForm({ ...emptyStaffForm, roleId: roles[0]?.id ?? "" });
    setIsModalOpen(true);
  }

  function openEdit(user: StaffUser) {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      roleId: user.role?.id ?? "",
      password: "",
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    onError("");
    try {
      if (isEditing && form.id) {
        await updateStaff(form.id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          roleId: form.roleId || undefined,
          ...(form.password ? { password: form.password } : {}),
        });
        onChanged("Staff account updated");
      } else {
        await createStaff({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          roleId: form.roleId || undefined,
        });
        onChanged("Staff account created");
      }
      setIsModalOpen(false);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to save staff account");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    onError("");
    try {
      await deleteStaff(toDelete.id);
      onChanged("Staff account removed");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to remove staff account");
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <p className="text-sm font-black text-slate-500">{staff.length} staff account(s)</p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700"
        >
          <AdminIcon name="plus" className="h-4 w-4" /> Add staff
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-black uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((user) => {
              const isSuper = user.role?.name === SUPERADMIN_ROLE;
              return (
                <tr key={user.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-6 py-4 font-black">{user.name}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{user.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-700">
                      {user.role?.name ?? "no role"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500">
                    {user.createdAt ? formatDate(user.createdAt) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50"
                      >
                        <AdminIcon name="edit" className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={isSuper}
                        onClick={() => setToDelete(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-black text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        title={isSuper ? "Superadmin cannot be deleted" : "Delete"}
                      >
                        <AdminIcon name="x" className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {staff.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center font-bold text-slate-400">
                  No staff accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <h2 className="text-2xl font-black">
                {isEditing ? "Edit staff account" : "Add staff account"}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <AdminIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4">
              <Field label="Full name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Email address">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Phone (optional)">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Role">
                <select
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">No role (no panel access)</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id} className="capitalize">
                      {role.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={isEditing ? "New password (leave blank to keep current)" : "Password"}>
                <input
                  type="password"
                  required={!isEditing}
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputClass}
                  placeholder={isEditing ? "••••••••" : ""}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : isEditing ? "Save changes" : "Create account"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete staff account"
        message={`Remove ${toDelete?.name ?? "this account"}? They will lose all access immediately.`}
        confirmText="Delete"
      />
    </div>
  );
}

// ─── Roles & Access tab ─────────────────────────────────────────────────────

function RolesTab({
  roles,
  permissionIdByName,
  onChanged,
  onError,
}: {
  roles: AdminRole[];
  permissionIdByName: Map<string, string>;
  onChanged: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [newRoleName, setNewRoleName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminRole | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!newRoleName.trim()) return;
    setIsCreating(true);
    onError("");
    try {
      await createRole(newRoleName.trim());
      setNewRoleName("");
      onChanged("Role created");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setIsCreating(false);
    }
  }

  async function toggleSection(role: AdminRole, sectionKey: string) {
    const current = new Set(role.permissions.map((p) => p.name));
    if (current.has(sectionKey)) current.delete(sectionKey);
    else current.add(sectionKey);

    const permissionIds = ADMIN_SECTIONS.map((s) => s.key)
      .filter((key) => current.has(key))
      .map((key) => permissionIdByName.get(key))
      .filter((id): id is string => Boolean(id));

    setSavingRoleId(role.id);
    onError("");
    try {
      await assignRolePermissions(role.id, permissionIds);
      onChanged(`Updated access for "${role.name}"`);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to update role access");
    } finally {
      setSavingRoleId(null);
    }
  }

  async function handleRename(role: AdminRole, name: string) {
    if (!name.trim() || name === role.name) return;
    onError("");
    try {
      await updateRoleName(role.id, name.trim());
      onChanged("Role renamed");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to rename role");
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    onError("");
    try {
      await deleteRole(toDelete.id);
      onChanged("Role deleted");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete role");
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5"
      >
        <Field label="New role name">
          <input
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="e.g. Store Manager"
            className={inputClass}
          />
        </Field>
        <button
          type="submit"
          disabled={isCreating}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <AdminIcon name="plus" className="h-4 w-4" /> Create role
        </button>
      </form>

      <div className="grid gap-5">
        {roles.map((role) => {
          const isSuper = role.name === SUPERADMIN_ROLE;
          const isProtected = PROTECTED_ROLES.has(role.name);
          const granted = new Set(role.permissions.map((p) => p.name));
          return (
            <div key={role.id} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    defaultValue={role.name}
                    disabled={isProtected}
                    onBlur={(e) => handleRename(role, e.target.value)}
                    className="rounded-lg border border-transparent px-2 py-1 text-xl font-black capitalize hover:border-slate-200 focus:border-blue-400 focus:outline-none disabled:bg-transparent"
                  />
                  {isProtected && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                      Protected
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-400">
                    {role.users?.length ?? 0} member(s)
                  </span>
                  {savingRoleId === role.id && (
                    <span className="text-xs font-bold text-blue-500">Saving…</span>
                  )}
                </div>
                {!isProtected && (
                  <button
                    type="button"
                    onClick={() => setToDelete(role)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-black text-red-600 hover:bg-red-50"
                  >
                    <AdminIcon name="x" className="h-3.5 w-3.5" /> Delete role
                  </button>
                )}
              </div>

              {isSuper ? (
                <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
                  The superadmin always has full, unrestricted access to every section.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ADMIN_SECTIONS.map((section) => {
                    const checked = granted.has(section.key);
                    return (
                      <label
                        key={section.key}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                          checked ? "border-blue-500 bg-blue-50/60" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={savingRoleId === role.id}
                          onChange={() => toggleSection(role, section.key)}
                          className="mt-0.5 h-4 w-4 accent-blue-600"
                        />
                        <span>
                          <span className="block text-sm font-black text-slate-800">{section.label}</span>
                          <span className="block text-xs font-medium text-slate-500">
                            {section.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete role"
        message={`Delete the "${toDelete?.name ?? ""}" role? This cannot be undone. Roles that are still assigned to staff cannot be deleted.`}
        confirmText="Delete role"
      />
    </div>
  );
}

// ─── Small shared bits ──────────────────────────────────────────────────────

const inputClass =
  "h-11 w-full rounded-lg border border-slate-300 px-3 font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-black text-slate-700">{label}</span>
      {children}
    </label>
  );
}
