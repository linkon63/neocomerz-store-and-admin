"use client";

import { useState, useEffect, useRef } from "react";
import { FiLoader, FiEdit2, FiTrash2, FiChevronDown } from "react-icons/fi";
import { toast } from "sonner";
import { useAuth } from "@/app/_providers/auth-provider";
import { uploadAvatar, deleteAvatar, changePassword } from "@/lib/storefront-api";
import ResolvedImage from "./image-resolver";

export default function AccountDetailsView() {
  const { user, updateProfile, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile data states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+880");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password update form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").trim().split(/\s+/);
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");

      let phoneStr = user.phone || "";
      if (phoneStr.startsWith("+")) {
        const match = phoneStr.match(/^(\+\d{1,4})(.*)$/);
        if (match) {
          setCountryCode(match[1]);
          phoneStr = match[2];
        }
      }
      setPhoneNumber(phoneStr);
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const fullPhone = `${countryCode}${phoneNumber.trim()}`;
      await updateProfile(fullName, user?.email || "", fullPhone);
      await refreshUser();
      toast.success("Profile details updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in current and new passwords.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Confirm passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await uploadAvatar(file);
      setAvatarUrl(res.avatarUrl);
      await refreshUser();
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("Delete profile picture?")) return;
    try {
      await deleteAvatar();
      setAvatarUrl(null);
      await refreshUser();
      toast.success("Profile photo deleted.");
    } catch {
      toast.error("Failed to delete photo.");
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-400 mb-1">
          Personal Information
        </h2>
        <p className="font-['Bembo_Std'] text-zinc-650 text-base italic">
          To track your order please enter your invoice ID.
        </p>
      </div>

      {/* Avatar Uploader Section */}
      <div className="flex justify-center">
        <div className="relative w-24 h-24 rounded-full">
          <div className="w-full h-full rounded-full overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center shadow-xs">
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
            className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-stone-300 rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition cursor-pointer"
            title="Update profile picture"
          >
            <FiEdit2 className="text-stone-600 text-xs" />
          </button>
          
          {avatarUrl && (
            <button
              type="button"
              onClick={handleDeleteAvatar}
              className="absolute top-0 right-0 w-6 h-6 bg-white border border-red-200 hover:border-red-450 hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-sm transition cursor-pointer"
              title="Delete photo"
            >
              <FiTrash2 className="text-[10px]" />
            </button>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
          aria-label="Upload profile image"
        />
      </div>

      {/* Profile Details Edit Form */}
      <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-['Bembo_Std'] text-zinc-800 text-base italic mb-1.5">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-stone-200 px-4 py-3 rounded-lg text-sm focus:border-stone-400 outline-none font-sans font-semibold text-zinc-800 bg-white"
              required
              placeholder="First Name"
            />
          </div>
          <div>
            <label className="block font-['Bembo_Std'] text-zinc-800 text-base italic mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-stone-200 px-4 py-3 rounded-lg text-sm focus:border-stone-400 outline-none font-sans font-semibold text-zinc-800 bg-white"
              required
              placeholder="Last Name"
            />
          </div>
        </div>

        <div>
          <label className="block font-['Bembo_Std'] text-zinc-800 text-base italic mb-1.5">
            Phone Number
          </label>
          <div className="flex w-full border border-stone-200 rounded-lg overflow-hidden bg-white">
            <div className="relative flex items-center bg-stone-50 border-r border-stone-200 px-3 cursor-pointer">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-transparent text-xs font-sans font-semibold appearance-none pr-6 outline-none cursor-pointer text-zinc-800"
                aria-label="Select Country Code"
              >
                <option value="+880">+880</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+86">+86</option>
                <option value="+91">+91</option>
              </select>
              <FiChevronDown className="absolute right-2 text-zinc-400 text-xs pointer-events-none" />
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              className="flex-grow px-4 py-3 text-sm focus:border-stone-400 outline-none font-sans font-semibold text-zinc-800"
              placeholder="Phone Number (e.g. 1738552161)"
            />
          </div>
        </div>

        <div className="flex justify-start pt-4">
          <button
            type="submit"
            disabled={updatingProfile}
            className="bg-white hover:bg-stone-50 border border-stone-200 px-10 py-3 rounded-full text-zinc-800 font-sans text-xs font-bold tracking-[0.14em] uppercase transition shadow-md shadow-zinc-150/40 flex items-center gap-2 cursor-pointer"
          >
            {updatingProfile ? (
              <>
                <FiLoader className="animate-spin text-black w-4 h-4" />
                UPDATING...
              </>
            ) : (
              "UPDATE"
            )}
          </button>
        </div>
      </form>

      {/* Change Password Section */}
      <div className="border-t border-stone-150 pt-10">
        <h3 className="text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-400 mb-6">
          Change Password
        </h3>
        
        <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl">
          <div>
            <label className="block font-['Bembo_Std'] text-zinc-800 text-base italic mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-stone-200 px-4 py-3 rounded-lg text-sm focus:border-stone-400 outline-none font-sans bg-white"
              required
              placeholder="Current Password"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block font-['Bembo_Std'] text-zinc-800 text-base italic mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-stone-200 px-4 py-3 rounded-lg text-sm focus:border-stone-400 outline-none font-sans bg-white"
                required
                placeholder="New Password"
              />
            </div>
            <div>
              <label className="block font-['Bembo_Std'] text-zinc-800 text-base italic mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full border border-stone-200 px-4 py-3 rounded-lg text-sm focus:border-stone-400 outline-none font-sans bg-white"
                required
                placeholder="Confirm New Password"
              />
            </div>
          </div>

          <div className="flex justify-start pt-4">
            <button
              type="submit"
              disabled={updatingPassword}
              className="bg-white hover:bg-stone-50 border border-stone-200 px-10 py-3.5 rounded-full text-zinc-800 font-sans text-xs font-bold tracking-[0.14em] uppercase transition shadow-md shadow-zinc-150/40 flex items-center gap-2 cursor-pointer"
            >
              {updatingPassword ? (
                <>
                  <FiLoader className="animate-spin text-black w-4 h-4" />
                  CHANGING...
                </>
              ) : (
                "Save Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
