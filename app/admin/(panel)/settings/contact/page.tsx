"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FaTiktok,
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa6";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import {
  apiRequest,
  getContactEntries,
  packContactEntries,
  type AppSettings,
  type SettingsContactEntry,
} from "../../../../../lib/admin-api";
import {
  SettingsCard,
  FieldLabel,
  Input,
  SaveButton,
  ErrorBanner,
  SuccessBanner,
} from "../_components/settings-ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type SocialKey = "tiktok" | "instagram" | "twitter" | "facebook" | "linkedin" | "youtube";

// ─── Constants ────────────────────────────────────────────────────────────────

const SOCIAL_FIELDS: {
  key: SocialKey;
  label: string;
  placeholder: string;
  bg: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "tiktok",    label: "TikTok",      placeholder: "https://www.tiktok.com/@yourhandle",           bg: "bg-[#010101]",  Icon: FaTiktok      },
  { key: "instagram", label: "Instagram",   placeholder: "https://www.instagram.com/yourhandle",         bg: "bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]", Icon: FaInstagram   },
  { key: "twitter",   label: "Twitter / X", placeholder: "https://twitter.com/yourhandle",               bg: "bg-[#0f1419]",  Icon: FaXTwitter    },
  { key: "facebook",  label: "Facebook",    placeholder: "https://www.facebook.com/yourpage",            bg: "bg-[#1877f2]",  Icon: FaFacebookF   },
  { key: "linkedin",  label: "LinkedIn",    placeholder: "https://www.linkedin.com/company/yourcompany", bg: "bg-[#0a66c2]",  Icon: FaLinkedinIn  },
  { key: "youtube",   label: "YouTube",     placeholder: "https://www.youtube.com/@yourchannel",          bg: "bg-[#ff0000]",  Icon: FaYoutube     },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  // Store editable arrays locally — packed back to object on save
  const [emails, setEmails] = useState<SettingsContactEntry[]>([{ title: "", value: "" }]);
  const [contacts, setContacts] = useState<SettingsContactEntry[]>([{ title: "", value: "" }]);
  const [social, setSocial] = useState<AppSettings["socialContact"]>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AppSettings>("/settings");
      if (data) {
        setEmails(getContactEntries(data.email));
        setContacts(getContactEntries(data.contactNumber));
        setSocial(data.socialContact ?? {});
      }
    } catch {
      // empty on first run
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // ── Email helpers ──────────────────────────────────────────────────────────

  function updateEmail(idx: number, field: keyof SettingsContactEntry, val: string) {
    setEmails((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: val } : e));
  }
  function addEmail() {
    setEmails((prev) => [...prev, { title: "", value: "" }]);
  }
  function removeEmail(idx: number) {
    setEmails((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Contact number helpers ─────────────────────────────────────────────────

  function updateContact(idx: number, field: keyof SettingsContactEntry, val: string) {
    setContacts((prev) => prev.map((e, i) => i === idx ? { ...e, [field]: val } : e));
  }
  function addContact() {
    setContacts((prev) => [...prev, { title: "", value: "" }]);
  }
  function removeContact(idx: number) {
    setContacts((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function save() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiRequest("/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: packContactEntries(emails),
          contactNumber: packContactEntries(contacts),
          socialContact: social,
        }),
      });
      setSuccess("Contact settings saved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        title="Contact & Social Media"
        description="Manage & customize your website content & interface."
      />

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-medium text-slate-400">Loading...</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Emails ── */}
          <SettingsCard title="Set E-mail Address">
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-[220px_1fr]">
              <div className="pt-1">
                <p className="text-sm font-black text-slate-800">Set E-mail address</p>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                  You can set up to 2 email addresses.
                </p>
              </div>
              <div className="space-y-3">
                {emails.map((entry, idx) => (
                  <div className="flex items-end gap-3" key={idx}>
                    <div className="flex-1">
                      <FieldLabel required>
                        Title {idx === 0 ? "(Primary)" : `(${idx + 1})`}
                      </FieldLabel>
                      <Input
                        onChange={(v) => updateEmail(idx, "title", v)}
                        placeholder="e.g. Support Email"
                        value={entry.title}
                      />
                    </div>
                    <div className="flex-1">
                      <FieldLabel required>Email</FieldLabel>
                      <Input
                        onChange={(v) => updateEmail(idx, "value", v)}
                        placeholder="email@example.com"
                        type="email"
                        value={entry.value}
                      />
                    </div>
                    {idx > 0 && (
                      <button
                        aria-label="Remove email"
                        className="mb-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                        onClick={() => removeEmail(idx)}
                        type="button"
                      >
                        <AdminIcon className="h-4 w-4" name="x" />
                      </button>
                    )}
                  </div>
                ))}
                {emails.length < 2 && (
                  <button
                    className="text-sm font-black text-blue-600 hover:underline"
                    onClick={addEmail}
                    type="button"
                  >
                    + Add Another
                  </button>
                )}
              </div>
            </div>
          </SettingsCard>

          {/* ── Contact Numbers ── */}
          <SettingsCard title="Set Contact Numbers">
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-[220px_1fr]">
              <div className="pt-1">
                <p className="text-sm font-black text-slate-800">Set Contact Numbers</p>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                  You can set up to 3 contact numbers.
                </p>
              </div>
              <div className="space-y-3">
                {contacts.map((entry, idx) => (
                  <div className="flex items-end gap-3" key={idx}>
                    <div className="flex-1">
                      <FieldLabel required>
                        Title {idx === 0 ? "(Primary)" : `(${idx + 1})`}
                      </FieldLabel>
                      <Input
                        onChange={(v) => updateContact(idx, "title", v)}
                        placeholder="e.g. Customer Support"
                        value={entry.title}
                      />
                    </div>
                    <div className="flex-1">
                      <FieldLabel required>Number</FieldLabel>
                      <Input
                        onChange={(v) => updateContact(idx, "value", v)}
                        placeholder="01XXXXXXXXX"
                        type="tel"
                        value={entry.value}
                      />
                    </div>
                    {idx > 0 && (
                      <button
                        aria-label="Remove contact"
                        className="mb-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                        onClick={() => removeContact(idx)}
                        type="button"
                      >
                        <AdminIcon className="h-4 w-4" name="x" />
                      </button>
                    )}
                  </div>
                ))}
                {contacts.length < 3 && (
                  <button
                    className="text-sm font-black text-blue-600 hover:underline"
                    onClick={addContact}
                    type="button"
                  >
                    + Add Another
                  </button>
                )}
              </div>
            </div>
          </SettingsCard>

          {/* ── Social Profiles ── */}
          <SettingsCard title="Social Profiles">
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-[220px_1fr]">
              <div className="pt-1">
                <p className="text-sm font-black text-slate-800">Social Profiles</p>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                  Share the links that redirect to your social media profiles.
                </p>
              </div>
              <div className="space-y-3">
                {SOCIAL_FIELDS.map(({ key, label, placeholder, bg, Icon }) => (
                  <div key={key}>
                    <FieldLabel>{label}</FieldLabel>
                    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center text-white ${bg}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <input
                        className="h-12 flex-1 bg-transparent px-3 text-sm font-medium text-slate-800 outline-none"
                        onChange={(e) =>
                          setSocial((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        placeholder={placeholder}
                        type="url"
                        value={social?.[key] ?? ""}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SettingsCard>

          {/* ── Feedback + Save ── */}
          {error && <ErrorBanner message={error} />}
          {success && <SuccessBanner message={success} />}
          <div className="flex justify-end">
            <SaveButton onClick={save} saving={saving}>
              Save Contact Settings
            </SaveButton>
          </div>

        </div>
      )}
    </>
  );
}
