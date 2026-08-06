"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { ConfirmModal } from "../../../_components/confirm-modal";
import { useDiscounts } from "../../../_hooks/use-discounts";
import { useSections } from "../../../_hooks/use-sections";
import { apiRequest, type Campaign } from "../../../../../lib/admin-api";
import {
  SettingsCard,
  FieldLabel,
  Input,
  Textarea,
  StatusToggle,
  SaveButton,
} from "../_components/settings-ui";

type CampaignForm = {
  id?: string;
  title: string;
  sectionId: string;
  description: string;
  status: "active" | "inactive";
  startAt: string;
  endAt: string;
  discountId: string;
  images: File[];
  existingImages: string[];
};

const EMPTY_FORM: CampaignForm = {
  title: "",
  sectionId: "",
  description: "",
  status: "active",
  startAt: new Date().toISOString().slice(0, 16),
  endAt: "",
  discountId: "",
  images: [],
  existingImages: [],
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CampaignForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { discounts } = useDiscounts();
  const { sections } = useSections();

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; campaign: Campaign | null }>({
    open: false,
    campaign: null,
  });

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Campaign[]>("/campaigns");
      setCampaigns(data);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(c: Campaign) {
    setForm({
      id: c.id,
      title: c.title,
      sectionId: c.sectionId,
      description: c.description ?? "",
      status: c.status,
      startAt: c.startAt ? c.startAt.slice(0, 16) : new Date().toISOString().slice(0, 16),
      endAt: c.endAt ? c.endAt.slice(0, 16) : "",
      discountId: c.discountId ?? "",
      images: [],
      existingImages: (c.images ?? []).flatMap((img) => img.images ?? []),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (form.images.length === 0 && form.existingImages.length === 0) {
      toast.error("At least one campaign image is required.");
      setSaving(false);
      return;
    }
    try {
      const body = new FormData();
      body.append("title", form.title);
      body.append("sectionId", form.sectionId);
      body.append("status", form.status);
      if (form.description) body.append("description", form.description);
      if (form.startAt) body.append("startAt", new Date(form.startAt).toISOString());
      if (form.endAt) body.append("endAt", new Date(form.endAt).toISOString());
      if (form.discountId) body.append("discountId", form.discountId);
      for (const file of form.images) {
        body.append("images", file);
      }

      if (form.id) {
        body.append("keepImages", JSON.stringify(form.existingImages));
        await apiRequest(`/campaigns/${form.id}`, { method: "PATCH", body });
      } else {
        await apiRequest("/campaigns", { method: "POST", body });
      }
      setModalOpen(false);
      await loadCampaigns();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(c: Campaign) {
    const newStatus = c.status === "active" ? "inactive" : "active";
    try {
      await apiRequest(`/campaigns/${c.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setCampaigns((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, status: newStatus } : item)),
      );
    } catch {
      // silent — user can refresh
    }
  }

  async function confirmDelete() {
    if (!deleteModal.campaign) return;
    try {
      await apiRequest(`/campaigns/${deleteModal.campaign.id}`, { method: "DELETE" });
      setDeleteModal({ open: false, campaign: null });
      await loadCampaigns();
    } catch {
      setDeleteModal({ open: false, campaign: null });
    }
  }

  const selectedDiscount = form.discountId
    ? discounts.find((d) => d.id === form.discountId)
    : null;

  const filtered = campaigns.filter((c) =>
    `${c.title} ${c.section?.title ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Campaigns List"
        description="Manage & customize your website content & interface."
        action={
          <SaveButton onClick={openAdd}>
            Add Campaign
          </SaveButton>
        }
      />

      <SettingsCard title="Campaign List">
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-500">
            Displaying {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
          </p>
          <label className="flex h-10 w-full max-w-xs items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
            <AdminIcon className="h-4 w-4 shrink-0 text-slate-400" name="search" />
            <input
              className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns by name & slug"
              value={search}
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {["Campaign Name", "Slug", "Description", "Status", "Actions"].map((h) => (
                  <th className="px-5 py-4 text-sm font-black text-slate-700" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-sm font-medium text-slate-400" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-sm font-medium text-slate-400" colSpan={5}>
                    No items found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr className="odd:bg-white even:bg-slate-50/60" key={c.id}>
                    <td className="px-5 py-4 text-sm font-black text-slate-800">{c.title}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">
                      {c.section?.title ?? "-"}
                    </td>
                    <td className="max-w-[200px] truncate px-5 py-4 text-sm font-medium text-slate-500">
                      {c.description ?? "-"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusToggle
                        active={c.status === "active"}
                        onChange={() => toggleStatus(c)}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                          onClick={() => openEdit(c)}
                          type="button"
                          title="Edit campaign"
                        >
                          <AdminIcon className="h-4 w-4" name="edit" />
                        </button>
                        <button
                          className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                          onClick={() => setDeleteModal({ open: true, campaign: c })}
                          type="button"
                          title="Delete campaign"
                        >
                          <AdminIcon className="h-4 w-4" name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SettingsCard>

      {/* Campaign Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="campaign-modal-title"
        >
          <form
            className="modal-panel flex w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden min-h-[480px] max-h-[calc(100vh-3rem)]"
            onSubmit={handleSubmit}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-6 pb-5 shrink-0">
              <div>
                <h2 className="text-2xl font-black" id="campaign-modal-title">
                  {form.id ? "Edit Campaign" : "Add Campaign"}
                </h2>
                <p className="mt-1 font-medium text-slate-600">
                  Fill in the details for this campaign.
                </p>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-slate-600"
                disabled={saving}
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <AdminIcon className="h-5 w-5" name="x" />
              </button>
            </div>

            <div className="flex-1 min-h-0 modal-body overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              {/* Campaign Name (section select) + Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel required>Campaign Name</FieldLabel>
                  <select
                    className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    onChange={(e) => setForm((p) => ({ ...p, sectionId: e.target.value }))}
                    required
                    value={form.sectionId}
                  >
                    <option value="">Select a section</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-3 pb-1">
                  <div className="flex-1">
                    <FieldLabel>Status</FieldLabel>
                    <div className="flex h-12 items-center">
                      <StatusToggle
                        active={form.status === "active"}
                        onChange={(v) =>
                          setForm((p) => ({ ...p, status: v ? "active" : "inactive" }))
                        }
                      />
                      <span className="ml-3 text-sm font-medium text-slate-600">
                        {form.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Title */}
              <div>
                <FieldLabel required>Title</FieldLabel>
                <Input
                  onChange={(v) => setForm((p) => ({ ...p, title: v }))}
                  placeholder="Campaign title"
                  required
                  value={form.title}
                />
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  onChange={(v) => setForm((p) => ({ ...p, description: v }))}
                  placeholder="Enter campaign description…"
                  rows={3}
                  value={form.description}
                />
              </div>

              {/* Images */}
              <div>
                <FieldLabel>Campaign Images</FieldLabel>
                <input
                  accept="image/*"
                  className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    setForm((p) => ({ ...p, images: [...p.images, ...files] }));
                  }}
                  type="file"
                />
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {form.existingImages.map((url, i) => (
                    <div className="relative" key={`e-${i}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        className="h-20 w-full rounded-lg border border-slate-200 object-cover"
                        src={url}
                      />
                      <button
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-xs text-white"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            existingImages: p.existingImages.filter((_, j) => j !== i),
                          }))
                        }
                        type="button"
                      >
                        <AdminIcon className="h-3 w-3" name="x" />
                      </button>
                    </div>
                  ))}
                  {form.images.map((file, i) => (
                    <div className="relative" key={`n-${i}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        className="h-20 w-full rounded-lg border border-slate-200 object-cover"
                        src={URL.createObjectURL(file)}
                      />
                      <button
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-xs text-white"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            images: p.images.filter((_, j) => j !== i),
                          }))
                        }
                        type="button"
                      >
                        <AdminIcon className="h-3 w-3" name="x" />
                      </button>
                    </div>
                  ))}
                </div>
                {form.images.length === 0 && form.existingImages.length === 0 && (
                  <p className="mt-2 text-xs font-medium text-slate-400">
                    At least one image is required.
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Start At</FieldLabel>
                  <Input
                    onChange={(v) => setForm((p) => ({ ...p, startAt: v }))}
                    type="datetime-local"
                    value={form.startAt}
                  />
                </div>
                <div>
                  <FieldLabel>End At</FieldLabel>
                  <Input
                    onChange={(v) => setForm((p) => ({ ...p, endAt: v }))}
                    type="datetime-local"
                    value={form.endAt}
                  />
                </div>
              </div>

              {/* Select Offer or Discount */}
              <div>
                <FieldLabel>Select Offer or Discount</FieldLabel>
                <select
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(e) => setForm((p) => ({ ...p, discountId: e.target.value }))}
                  value={form.discountId}
                >
                  <option value="">No discount</option>
                  {discounts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Discount Details */}
              {selectedDiscount && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        {["Offer or Discount Name", "Start At", "End At", "Action"].map((h) => (
                          <th className="px-4 py-3 text-sm font-black text-slate-700" key={h}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">
                          {selectedDiscount.name}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-500">
                          {selectedDiscount.startDate ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-500">
                          {selectedDiscount.endDate ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="text-sm font-black text-red-600 hover:text-red-800"
                            onClick={() => setForm((p) => ({ ...p, discountId: "" }))}
                            type="button"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

            </div>
            </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white px-6 py-5">
                <button
                  className="h-12 rounded-md border border-slate-300 bg-white px-5 font-black text-slate-700 hover:bg-slate-50 transition"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex h-12 items-center gap-1.5 rounded-md px-5 text-sm font-semibold text-white disabled:opacity-60 shadow-xs transition bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer disabled:cursor-not-allowed"
                  disabled={saving}
                  type="submit"
                >
                  <AdminIcon className="h-5 w-5" name={form.id ? "check" : "plus"} />
                  {saving ? "Saving..." : form.id ? "Update Campaign" : "Add Campaign"}
                </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        cancelText="No"
        confirmText="Yes, Delete"
        isDestructive
        isOpen={deleteModal.open}
        message={`Are you sure you want to delete "${deleteModal.campaign?.title}"? This action cannot be undone.`}
        onClose={() => setDeleteModal({ open: false, campaign: null })}
        onConfirm={confirmDelete}
        title="Delete Campaign"
      />
    </>
  );
}
