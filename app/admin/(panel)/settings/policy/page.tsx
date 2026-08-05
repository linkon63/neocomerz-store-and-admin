"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "../../../_components/admin-shell";
import { apiRequest, type AppPolicies } from "../../../../../lib/admin-api";
import { useSettingsSaving } from "../../../_hooks/use-settings";
import { SettingsCard, FieldLabel, Input, SaveButton } from "../_components/settings-ui";

const POLICY_TABS = [
  { key: "delivery",     label: "Delivery Policy"      },
  { key: "refund",       label: "Refund Policy"        },
  { key: "return",       label: "Return Policy"        },
  { key: "cancellation", label: "Cancellation Policy"  },
  { key: "privacy",      label: "Privacy Policy"       },
  { key: "terms",        label: "Terms and Conditions" },
] as const;

type PolicyKey = (typeof POLICY_TABS)[number]["key"];

const MAX_TITLE_LENGTH = 128;

type ToolbarItem =
  | { type: "command"; id: string; label: string; title: string; command: string; value?: string }
  | { type: "divider" };

const TOOLBAR: ToolbarItem[] = [
  { type: "command", id: "bold",          label: "B",   title: "Bold",           command: "bold"               },
  { type: "command", id: "italic",        label: "I",   title: "Italic",         command: "italic"             },
  { type: "command", id: "underline",     label: "U",   title: "Underline",      command: "underline"          },
  { type: "command", id: "strikethrough", label: "S",   title: "Strikethrough",  command: "strikeThrough"      },
  { type: "divider" },
  { type: "command", id: "code",          label: "<>",  title: "Code (inline)",  command: "insertHTML", value: "<code>{SELECTION}</code>" },
  { type: "command", id: "link",          label: "🔗",  title: "Hyperlink",      command: "createLink"         },
  { type: "divider" },
  { type: "command", id: "subscript",     label: "sub", title: "Subscript",      command: "subscript"          },
  { type: "command", id: "superscript",   label: "sup", title: "Superscript",    command: "superscript"        },
  { type: "divider" },
  { type: "command", id: "ul",            label: "≡",   title: "Unordered List", command: "insertUnorderedList" },
  { type: "command", id: "ol",            label: "1.",  title: "Ordered List",   command: "insertOrderedList"  },
  { type: "divider" },
  { type: "command", id: "align-left",    label: "⬅",  title: "Align Left",     command: "justifyLeft"        },
  { type: "command", id: "align-center",  label: "☰",  title: "Align Center",   command: "justifyCenter"      },
  { type: "command", id: "align-right",   label: "➡",  title: "Align Right",    command: "justifyRight"       },
  { type: "command", id: "justify",       label: "⬛",  title: "Justify",        command: "justifyFull"        },
];

export default function PolicyPage() {
  const [policies, setPolicies] = useState<AppPolicies>({});
  const [activeTab, setActiveTab] = useState<PolicyKey>("delivery");
  const [loading, setLoading] = useState(true);
  const { saving, saveSettings } = useSettingsSaving();
  const editorRef = useRef<HTMLDivElement>(null);
  const editorTabRef = useRef<PolicyKey>("delivery");

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AppPolicies>("/policies");
      if (data) setPolicies(data);
    } catch {
      // no policies yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPolicies(); }, [loadPolicies]);

  useEffect(() => {
    if (!editorRef.current || loading) return;
    editorTabRef.current = activeTab;
    editorRef.current.innerHTML = policies[activeTab]?.content ?? "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, loading]);

  async function save() {
    const latestHtml = editorRef.current?.innerHTML ?? "";
    const latestPolicies: AppPolicies = {
      ...policies,
      [activeTab]: { ...(policies[activeTab] ?? { title: "", content: "" }), content: latestHtml },
    };
    setPolicies(latestPolicies);
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...payload } = latestPolicies;
    await saveSettings("/policies", payload, { successMessage: "Policies saved successfully." });
  }

  function updateTitle(value: string) {
    setPolicies((prev) => ({
      ...prev,
      [activeTab]: { ...(prev[activeTab] ?? { title: "", content: "" }), title: value },
    }));
  }

  function handleEditorInput() {
    if (!editorRef.current) return;
    const key = editorTabRef.current;
    setPolicies((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? { title: "", content: "" }), content: editorRef.current!.innerHTML },
    }));
  }

  function execToolbarCommand(item: ToolbarItem) {
    if (item.type === "divider") return;
    const { command, value } = item;

    if (command === "createLink") {
      const url = window.prompt("Enter the URL:", "https://");
      if (url && url !== "https://" && url.trim()) {
        document.execCommand("createLink", false, url.trim());
      }
      editorRef.current?.focus();
      return;
    }

    if (command === "insertHTML" && value?.includes("{SELECTION}")) {
      const sel = window.getSelection();
      const selected = sel && sel.rangeCount > 0 ? sel.toString() : "";
      document.execCommand("insertHTML", false, value.replace("{SELECTION}", selected || "code"));
      editorRef.current?.focus();
      return;
    }

    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
  }

  const current = policies[activeTab] ?? { title: "", content: "" };

  return (
    <>
      <PageHeader
        title="Manage Policy"
        description="Manage & customize your website content & interface."
        action={<SaveButton onClick={save} saving={saving}>Save Policy</SaveButton>}
      />

      <SettingsCard title="Policies">
        <div className="mb-6 flex gap-0 overflow-x-auto border-b border-slate-200">
          {POLICY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 border-b-2 px-4 pb-3 pt-1 text-sm font-black transition ${
                tab.key === activeTab
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-8 text-sm font-medium text-slate-400">Loading...</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <FieldLabel required>
                  {POLICY_TABS.find((t) => t.key === activeTab)?.label} Title
                </FieldLabel>
                <Input
                  value={current.title ?? ""}
                  placeholder="Enter policy title"
                  onChange={(v) => { if (v.length <= MAX_TITLE_LENGTH) updateTitle(v); }}
                />
              </div>
              <span className="mb-1 shrink-0 text-xs font-medium text-slate-400">
                {(current.title ?? "").length}/{MAX_TITLE_LENGTH} characters
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
                {TOOLBAR.map((item, idx) =>
                  item.type === "divider" ? (
                    <span key={`div-${idx}`} className="mx-0.5 h-5 w-px self-center bg-slate-300" />
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      title={item.title}
                      className="grid h-7 min-w-[28px] place-items-center rounded px-1.5 text-xs font-black text-slate-600 hover:bg-slate-200 active:bg-slate-300 transition-colors select-none"
                      onMouseDown={(e) => { e.preventDefault(); execToolbarCommand(item); }}
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                data-placeholder="Enter policy content…"
                className="min-h-[480px] w-full bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none"
                style={{ whiteSpace: "pre-wrap" }}
              />
            </div>

            <style>{`
              [data-placeholder]:empty::before {
                content: attr(data-placeholder);
                color: #9ca3af;
                pointer-events: none;
                display: block;
              }
            `}</style>

            <div className="border-t border-slate-100 pt-2" />
          </div>
        )}
      </SettingsCard>
    </>
  );
}
