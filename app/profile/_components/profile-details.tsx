"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../_components/auth-context";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api/v1";

export default function ProfileDetails() {
  const { token, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  async function fetchProfile() {
    setLoading(true);
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
    }
    setLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setProfileMessage("");
    setProfileError("");
    setPasswordMessage("");
    setPasswordError("");

    const profilePromise = fetch(`${BASE_URL}/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, phone: phone || undefined }),
    });

    const hasPasswordChange = currentPassword && newPassword;
    let passwordPromise: Promise<Response> | null = null;

    if (hasPasswordChange) {
      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match");
        setSaving(false);
        return;
      }
      passwordPromise = fetch(`${BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    }

    const [profileRes, passwordRes] = await Promise.all([
      profilePromise,
      passwordPromise,
    ]);

    if (profileRes.ok) {
      setProfileMessage("Profile updated successfully");
      refreshUser();
    } else {
      const err = await profileRes.json().catch(() => ({ message: "Failed to update profile" }));
      setProfileError((err as { message?: string }).message || "Failed to update profile");
    }

    if (hasPasswordChange && passwordRes) {
      if (passwordRes.ok) {
        setPasswordMessage("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const err = await passwordRes.json().catch(() => ({ message: "Failed to change password" }));
        setPasswordError((err as { message?: string }).message || "Failed to change password");
      }
    }

    setSaving(false);
  }

  if (!token) return null;

  if (loading) {
    return (
      <div>
        <h2 className="font-bembo text-3xl font-bold">Account Details</h2>
        <p className="mt-2 text-sm text-neutral-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-bembo text-3xl font-bold">Account Details</h2>
      <p className="mt-2 text-sm text-neutral-500">Update your profile and password</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-5">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Full name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Phone number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        {profileMessage && (
          <p className="text-xs font-semibold text-green-600">{profileMessage}</p>
        )}
        {profileError && (
          <p className="text-xs font-semibold text-red-500">{profileError}</p>
        )}

        <hr className="border-neutral-200" />

        <p className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-500">
          Password change
        </p>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Current password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            New password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">
            Confirm new password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        {passwordMessage && (
          <p className="text-xs font-semibold text-green-600">{passwordMessage}</p>
        )}
        {passwordError && (
          <p className="text-xs font-semibold text-red-500">{passwordError}</p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
