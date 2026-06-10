"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "../../_components/auth-context";

export default function ProfileDetails() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name, email, phone: phone || undefined });
      toast.success("Changes saved successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

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
