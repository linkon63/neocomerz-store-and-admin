"use client";

import { useState, useEffect, useRef } from "react";
import { FiLoader, FiCamera, FiTrash2, FiChevronDown, FiUser, FiLock } from "react-icons/fi";
import { toast } from "sonner";
import { useAuth } from "@/app/_providers/auth-provider";
import { uploadAvatar, deleteAvatar, changePassword } from "@/lib/storefront-api";
import ResolvedImage from "./image-resolver";

// ─── Shared design tokens ────────────────────────────────────────────────────
const SECTION_LABEL = "text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400";
const FIELD_LABEL   = "block text-[10px] font-bold tracking-[0.14em] uppercase text-zinc-400 mb-1.5";
const INPUT_BASE    = "w-full border border-stone-200 bg-white px-4 py-3 text-sm font-sans text-zinc-800 outline-none transition focus:border-stone-400 focus:ring-0 rounded-lg placeholder:text-zinc-300";
const BTN_PRIMARY   = "inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-stone-800 text-white font-sans text-[10px] font-bold tracking-[0.16em] uppercase px-10 py-3.5 rounded-full transition cursor-pointer shadow-sm disabled:opacity-50";
const BTN_SECONDARY = "inline-flex items-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 text-zinc-700 font-sans text-[10px] font-bold tracking-[0.16em] uppercase px-10 py-3.5 rounded-full transition cursor-pointer shadow-sm disabled:opacity-50";
// ─────────────────────────────────────────────────────────────────────────────

export default function AccountDetailsView() {
  const { user, updateProfile, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName]           = useState("");
  const [lastName, setLastName]             = useState("");
  const [phoneNumber, setPhoneNumber]       = useState("");
  const [countryCode, setCountryCode]       = useState("+880");
  const [avatarUrl, setAvatarUrl]           = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword]   = useState("");
  const [newPassword, setNewPassword]           = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    const parts = (user.name || "").trim().split(/\s+/);
    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");

    let phone = user.phone || "";
    if (phone.startsWith("+")) {
      const m = phone.match(/^(\+\d{1,4})(.*)$/);
      if (m) { setCountryCode(m[1]); phone = m[2]; }
    }
    setPhoneNumber(phone);
    setAvatarUrl(user.avatarUrl || null);
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const name  = `${firstName.trim()} ${lastName.trim()}`.trim();
      const phone = `${countryCode}${phoneNumber.trim()}`;
      await updateProfile(name, user?.email || "", phone);
      await refreshUser();
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setUpdatingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select a valid image file."); return; }
    setUploadingAvatar(true);
    try {
      const res = await uploadAvatar(file);
      setAvatarUrl(res.avatarUrl);
      await refreshUser();
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("Remove your profile photo?")) return;
    try {
      await deleteAvatar();
      setAvatarUrl(null);
      await refreshUser();
      toast.success("Profile photo removed.");
    } catch {
      toast.error("Failed to remove photo.");
    }
  };

  return (
    <div className="space-y-14">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div>
        <p className={SECTION_LABEL}>Personal Information</p>
        <h2 className="font-['Bembo_Std'] text-2xl text-zinc-850 font-normal mt-1">
          Account Details
        </h2>
        <p className="font-['Bembo_Std'] text-zinc-400 text-sm italic mt-0.5">
          Manage your personal information and login credentials.
        </p>
      </div>

      {/* ── Avatar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20 shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-stone-100 bg-stone-50 shadow-sm flex items-center justify-center">
            {uploadingAvatar ? (
              <FiLoader className="w-6 h-6 text-[#C5B382] animate-spin" />
            ) : (
              <ResolvedImage
                src={avatarUrl}
                alt={user?.name || "Avatar"}
                className="object-cover rounded-full"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center shadow hover:bg-stone-700 transition cursor-pointer"
            title="Change photo"
          >
            <FiCamera className="text-[11px]" />
          </button>
        </div>

        <div>
          <p className="font-sans font-bold text-sm text-zinc-800">{user?.name || "—"}</p>
          <p className="font-sans text-xs text-zinc-400 mt-0.5">{user?.email || "—"}</p>
          <div className="flex items-center gap-3 mt-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-sans text-[10px] font-bold tracking-wider uppercase text-[#C5B382] hover:text-stone-800 transition cursor-pointer"
            >
              Change Photo
            </button>
            {avatarUrl && (
              <>
                <span className="text-stone-200">|</span>
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  className="font-sans text-[10px] font-bold tracking-wider uppercase text-red-400 hover:text-red-600 transition cursor-pointer flex items-center gap-1"
                >
                  <FiTrash2 className="text-[10px]" /> Remove
                </button>
              </>
            )}
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" aria-label="Upload profile image" />
      </div>

      {/* ── Profile Form ─────────────────────────────────────────────────── */}
      <div className="border-t border-stone-100 pt-10">
        <div className="flex items-center gap-2.5 mb-6">
          <FiUser className="text-zinc-300 text-sm" />
          <p className={SECTION_LABEL}>Profile Details</p>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-5 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={FIELD_LABEL}>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={INPUT_BASE} placeholder="First name" required />
            </div>
            <div>
              <label className={FIELD_LABEL}>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={INPUT_BASE} placeholder="Last name" required />
            </div>
          </div>

          <div>
            <label className={FIELD_LABEL}>Email Address</label>
            <input type="email" value={user?.email || ""} className={`${INPUT_BASE} bg-stone-50 text-zinc-400 cursor-not-allowed`} disabled />
          </div>

          <div>
            <label className={FIELD_LABEL}>Phone Number</label>
            <div className="flex border border-stone-200 rounded-lg overflow-hidden bg-white focus-within:border-stone-400 transition">
              <div className="relative flex items-center bg-stone-50 border-r border-stone-200 px-3 shrink-0">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-transparent text-xs font-sans font-bold appearance-none pr-5 outline-none cursor-pointer text-zinc-700"
                  aria-label="Country code"
                >
                  <option value="+880">🇧🇩 +880</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+86">🇨🇳 +86</option>
                </select>
                <FiChevronDown className="absolute right-1.5 text-zinc-400 text-[10px] pointer-events-none" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                className="flex-grow px-4 py-3 text-sm outline-none font-sans text-zinc-800 placeholder:text-zinc-300"
                placeholder="01xxxxxxxxx"
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={updatingProfile} className={BTN_PRIMARY}>
              {updatingProfile ? <><FiLoader className="animate-spin w-3.5 h-3.5" /> Saving…</> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Password Form ─────────────────────────────────────────────────── */}
      <div className="border-t border-stone-100 pt-10">
        <div className="flex items-center gap-2.5 mb-6">
          <FiLock className="text-zinc-300 text-sm" />
          <p className={SECTION_LABEL}>Change Password</p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-5 max-w-2xl">
          <div>
            <label className={FIELD_LABEL}>Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={INPUT_BASE} placeholder="••••••••" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={FIELD_LABEL}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={INPUT_BASE} placeholder="••••••••" required />
            </div>
            <div>
              <label className={FIELD_LABEL}>Confirm New Password</label>
              <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={INPUT_BASE} placeholder="••••••••" required />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={updatingPassword} className={BTN_SECONDARY}>
              {updatingPassword ? <><FiLoader className="animate-spin w-3.5 h-3.5" /> Updating…</> : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
