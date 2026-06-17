"use client";

import { useState, type FormEvent } from "react";

export default function ProfileDetails() {
  const [name, setName] = useState("Alex Johnson");
  const [email, setEmail] = useState("alex@example.com");
  const [phone, setPhone] = useState("+39 123 456 7890");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
            className="bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
          >
            Save changes
          </button>
          {saved && (
            <span className="text-xs font-semibold text-green-600">
              Changes saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
