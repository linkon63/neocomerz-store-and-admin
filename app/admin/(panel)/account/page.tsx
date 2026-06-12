"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../_components/admin-shell";
import { apiRequest, type AdminUser } from "../../../../lib/admin-api";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-300 px-3 font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function AccountPage() {
  const [user, setUser] = useState<AdminUser | null>(null);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    apiRequest<AdminUser>("/auth/me")
      .then((u) => {
        setUser(u);
        setName(u.name);
        setEmail(u.email);
        setPhone(u.phone ?? "");
      })
      .catch(() => setProfileMsg({ ok: false, text: "Failed to load your account" }));
  }, []);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await apiRequest("/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      setProfileMsg({ ok: true, text: "Profile updated" });
    } catch (err) {
      setProfileMsg({ ok: false, text: err instanceof Error ? err.message : "Update failed" });
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: "New password and confirmation do not match" });
      return;
    }
    setPwSaving(true);
    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPwMsg({ ok: true, text: "Password changed" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : "Password change failed" });
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="My Account"
        description="Update your personal details and change your password."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black">Profile</h2>
            {user?.role?.name && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-600">
                {user.role.name}
              </span>
            )}
          </div>
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">Full name</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">Email</span>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </label>
          </div>
          {profileMsg && (
            <p
              className={`mt-4 rounded-lg px-4 py-2.5 text-sm font-bold ${
                profileMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {profileMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={profileSaving}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {profileSaving ? "Saving..." : "Save profile"}
          </button>
        </form>

        <form onSubmit={savePassword} className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-xl font-black">Change password</h2>
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">Current password</span>
              <input
                required
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">New password</span>
              <input
                required
                minLength={6}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-700">Confirm new password</span>
              <input
                required
                minLength={6}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          {pwMsg && (
            <p
              className={`mt-4 rounded-lg px-4 py-2.5 text-sm font-bold ${
                pwMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
            >
              {pwMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={pwSaving}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {pwSaving ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
