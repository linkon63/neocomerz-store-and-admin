"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "../../../_components/admin-shell";
import { apiRequest, type AppPolicies } from "../../../../../lib/admin-api";
import {
  SettingsCard,
  FieldLabel,
  Input,
  SaveButton,
  ErrorBanner,
  SuccessBanner,
} from "../_components/settings-ui";

const POLICY_TABS = [
  { key: "delivery",     label: "Delivery Policy"       },
  { key: "return",       label: "Refund & Return"        },
  { key: "cancellation", label: "Cancellation Policy"    },
  { key: "privacy",      label: "Privacy Policy"         },
  { key: "terms",        label: "Terms and Conditions"   },
] as const;

type PolicyKey = (typeof POLICY_TABS)[number]["key"];

const TOOLBAR_BUTTONS: { id: string; label: string; title: string }[] = [
  { id: "bold",          label: "B",   title: "Bold"           },
  { id: "italic",        label: "I",   title: "Italic"         },
  { id: "strikethrough", label: "S",   title: "Strikethrough"  },
  { id: "code",          label: "<>",  title: "Code"           },
  { id: "underline",     label: "U",   title: "Underline"      },
  { id: "link",          label: "🔗",  title: "Link"           },
  { id: "subscript",     label: "sub", title: "Subscript"      },
  { id: "superscript",   label: "sup", title: "Superscript"    },
  { id: "ul",            label: "≡",   title: "Unordered List" },
  { id: "ol",            label: "1.",  title: "Ordered List"   },
  { id: "align-left",    label: "⬅",   title: "Align Left"     },
  { id: "align-center",  label: "☰",   title: "Align Center"   },
  { id: "align-right",   label: "➡",   title: "Align Right"    },
  { id: "justify",       label: "⬛",   title: "Justify"        },
];

const MAX_TITLE_LENGTH = 128;

export default function PolicyPage() {
  const [policies, setPolicies] = useState<AppPolicies>({});
  const [activeTab, setActiveTab] = useState<PolicyKey>("delivery");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AppPolicies>("/policies");
      if (data) setPolicies(data);
    } catch {
      // empty on first run
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  async function save() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiRequest("/policies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policies),
      });
      setSuccess("Policies saved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save policies");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: "title" | "content", value: string) {
    setPolicies((prev) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] ?? { title: "", content: "" }),
        [field]: value,
      },
    }));
  }

  const current = policies[activeTab] ?? { title: "", content: "" };

  return (
    <>
      <PageHeader
        title="Manage Policy"
        description="Manage & customize your website content & interface."
      />

      <SettingsCard title="Policies">
        {/* Tab Nav */}
        <div className="mb-6 flex gap-0 overflow-x-auto border-b border-slate-200">
          {POLICY_TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                className={`shrink-0 border-b-2 px-4 pb-3 pt-1 text-sm font-black transition ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <p className="py-8 text-sm font-medium text-slate-400">Loading...</p>
        ) : (
          <div className="space-y-5">
            {/* Title row */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <FieldLabel required>
                  {POLICY_TABS.find((t) => t.key === activeTab)?.label} Title
                </FieldLabel>
                <Input
                  onChange={(v) => {
                    if (v.length <= MAX_TITLE_LENGTH) updateField("title", v);
                  }}
                  placeholder="Enter policy title"
                  value={current.title ?? ""}
                />
              </div>
              <span className="mb-1 shrink-0 text-xs font-medium text-slate-400">
                {(current.title ?? "").length}/{MAX_TITLE_LENGTH} characters
              </span>
            </div>

            {/* Rich-text editor (visual toolbar + textarea) */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
                {TOOLBAR_BUTTONS.map((btn) => (
                  <button
                    className="grid h-7 min-w-[28px] place-items-center rounded px-1.5 text-xs font-black text-slate-600 hover:bg-slate-200"
                    key={btn.id}
                    title={btn.title}
                    type="button"
                    onClick={(e) => e.preventDefault()}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              {/* Content area */}
              <textarea
                className="w-full resize-none bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none"
                onChange={(e) => updateField("content", e.target.value)}
                placeholder="Enter policy content…"
                rows={20}
                value={current.content ?? ""}
              />
            </div>

            {error && <ErrorBanner message={error} />}
            {success && <SuccessBanner message={success} />}

            <div className="flex justify-end">
              <SaveButton onClick={save} saving={saving}>
                Save Policy
              </SaveButton>
            </div>
          </div>
        )}
      </SettingsCard>
    </>
  );
}
