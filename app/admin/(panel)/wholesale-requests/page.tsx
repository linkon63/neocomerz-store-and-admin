"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  apiRequest,
  formatDate,
  formatMoney,
  type WholesaleOrderRequest,
  type WholesaleRequestItem,
  type WholesaleRequestStatus,
} from "../../../../lib/admin-api";

type StatusFilter = WholesaleRequestStatus | "all";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "info_requested", label: "Info Requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "converted", label: "Converted" },
];

const STATUS_PILL: Record<WholesaleRequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-300",
  info_requested: "bg-sky-50 text-sky-700 border border-sky-300",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-300",
  rejected: "bg-rose-50 text-rose-700 border border-rose-300",
  converted: "bg-violet-50 text-violet-700 border border-violet-300",
};

function statusPill(status: WholesaleRequestStatus) {
  return `inline-block rounded-md px-3 py-1 text-sm font-semibold capitalize ${STATUS_PILL[status]}`;
}

function itemName(item: WholesaleRequestItem) {
  return item.product?.name ?? "Unknown product";
}

function itemCount(request: WholesaleOrderRequest) {
  return request.items?.length ?? 0;
}

function totalQty(request: WholesaleOrderRequest) {
  return (
    request.items?.reduce((sum, item) => sum + (item.requestedQuantity ?? 0), 0) ??
    0
  );
}

type ConvertLine = {
  requestItemId: string;
  productName: string;
  quantity: string;
  unitPrice: string;
};

type ConvertForm = {
  addressId: string;
  items: ConvertLine[];
  discount: string;
  shippingCost: string;
  tax: string;
};

const emptyConvertForm: ConvertForm = {
  addressId: "",
  items: [],
  discount: "0",
  shippingCost: "0",
  tax: "0",
};

export default function WholesaleRequestsPage() {
  const [requests, setRequests] = useState<WholesaleOrderRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  // detail / actions modal
  const [selected, setSelected] = useState<WholesaleOrderRequest | null>(null);
  const [actionError, setActionError] = useState("");
  const [isActing, setIsActing] = useState(false);
  const [noteMode, setNoteMode] = useState<null | "rejected" | "info_requested">(
    null,
  );
  const [noteText, setNoteText] = useState("");
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);

  // convert modal
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertForm, setConvertForm] = useState<ConvertForm>(emptyConvertForm);
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState("");
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(
    null,
  );

  async function loadRequests(status: StatusFilter = statusFilter) {
    setError("");
    setIsLoading(true);
    try {
      const qs = status && status !== "all" ? `?status=${status}` : "";
      setRequests(
        await apiRequest<WholesaleOrderRequest[]>(`/wholesale-requests${qs}`),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load wholesale requests",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRequests("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectStatus(status: StatusFilter) {
    setStatusFilter(status);
    loadRequests(status);
  }

  const visibleRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requests;
    return requests.filter((request) =>
      `${request.requestNumber ?? request.id} ${request.user?.name ?? ""} ${
        request.user?.email ?? ""
      }`
        .toLowerCase()
        .includes(query),
    );
  }, [requests, search]);

  async function openDetail(request: WholesaleOrderRequest) {
    setActionError("");
    setNoteMode(null);
    setNoteText("");
    setConvertOpen(false);
    setCreatedOrderNumber(null);
    setConvertError("");
    // Show immediately from the list row, then refresh with full detail (addresses, etc.).
    setSelected(request);
    try {
      const full = await apiRequest<WholesaleOrderRequest>(
        `/wholesale-requests/${request.id}`,
      );
      setSelected(full);
    } catch {
      // keep the list-row data if the detail fetch fails
    }
  }

  function closeDetail() {
    if (isActing) return;
    setSelected(null);
    setNoteMode(null);
    setNoteText("");
    setActionError("");
  }

  async function submitStatus(status: WholesaleRequestStatus, note?: string) {
    if (!selected) return;
    setActionError("");
    setIsActing(true);
    try {
      await apiRequest(`/wholesale-requests/${selected.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(note?.trim() ? { note: note.trim() } : {}),
        }),
      });
      setRejectConfirmOpen(false);
      setNoteMode(null);
      setNoteText("");
      setSelected(null);
      await loadRequests();
    } catch (err) {
      setRejectConfirmOpen(false);
      setActionError(
        err instanceof Error ? err.message : "Failed to update request",
      );
    } finally {
      setIsActing(false);
    }
  }

  function openConvert() {
    if (!selected) return;
    setConvertError("");
    setCreatedOrderNumber(null);
    const defaultAddress =
      selected.user?.addresses?.find((a) => a.isDefault) ??
      selected.user?.addresses?.[0];
    setConvertForm({
      addressId: defaultAddress?.id ?? "",
      discount: "0",
      shippingCost: "0",
      tax: "0",
      items: (selected.items ?? []).map((item) => ({
        requestItemId: item.id,
        productName: itemName(item),
        quantity: String(item.requestedQuantity ?? 0),
        unitPrice: item.targetPrice != null ? String(item.targetPrice) : "",
      })),
    });
    setConvertOpen(true);
  }

  function closeConvert() {
    if (isConverting) return;
    setConvertOpen(false);
  }

  function updateLine(index: number, field: "quantity" | "unitPrice", value: string) {
    setConvertForm((current) => ({
      ...current,
      items: current.items.map((line, i) =>
        i === index ? { ...line, [field]: value } : line,
      ),
    }));
  }

  const convertTotals = useMemo(() => {
    const subtotal = convertForm.items.reduce(
      (sum, line) =>
        sum + Number(line.quantity || 0) * Number(line.unitPrice || 0),
      0,
    );
    const discount = Number(convertForm.discount || 0);
    const shippingCost = Number(convertForm.shippingCost || 0);
    const tax = Number(convertForm.tax || 0);
    const grandTotal = subtotal - discount + shippingCost + tax;
    return { subtotal, discount, shippingCost, tax, grandTotal };
  }, [convertForm]);

  async function submitConvert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setConvertError("");
    setIsConverting(true);
    try {
      const order = await apiRequest<{ id: string; orderNumber?: string }>(
        `/wholesale-requests/${selected.id}/convert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            addressId: convertForm.addressId,
            items: convertForm.items.map((line) => ({
              requestItemId: line.requestItemId,
              quantity: Number(line.quantity || 0),
              unitPrice: Number(line.unitPrice || 0),
            })),
            discount: Number(convertForm.discount || 0),
            shippingCost: Number(convertForm.shippingCost || 0),
            tax: Number(convertForm.tax || 0),
          }),
        },
      );
      setCreatedOrderNumber(order.orderNumber ?? order.id);
      await loadRequests();
    } catch (err) {
      setConvertError(
        err instanceof Error ? err.message : "Failed to convert request",
      );
    } finally {
      setIsConverting(false);
    }
  }

  const canSubmitConvert =
    Boolean(convertForm.addressId) &&
    convertForm.items.length > 0 &&
    convertForm.items.every(
      (line) => Number(line.quantity) >= 1 && line.unitPrice !== "",
    ) &&
    convertTotals.grandTotal >= 0;

  return (
    <>
      <PageHeader
        title="Wholesale Requests"
        description="Review B2B wholesale order requests, approve or reject them, and convert approved requests into orders."
        action={
          <button
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
            onClick={() => loadRequests()}
            type="button"
          >
            <AdminIcon className="h-5 w-5" name="refresh" />
          </button>
        }
      />

      <section>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Wholesale requests</h2>
              <p className="text-sm font-medium text-slate-600">
                Displaying {visibleRequests.length} requests
              </p>
            </div>
            <label className="flex h-11 w-full max-w-md items-center gap-3 rounded-lg border-2 border-slate-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
              <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
              <input
                className="w-full bg-transparent text-sm font-medium outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by request #, customer name or email"
                value={search}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 px-5 pb-4">
            {STATUS_TABS.map((tab) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  statusFilter === tab.value
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
                key={tab.value}
                onClick={() => selectStatus(tab.value)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <p className="mx-5 mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Request #",
                    "Customer",
                    "Items",
                    "Total Qty",
                    "Status",
                    "Created",
                    "Actions",
                  ].map((heading) => (
                    <th className="px-4 py-4 text-sm font-semibold text-slate-700" key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-5 py-8 font-semibold text-slate-500" colSpan={7}>
                      Loading wholesale requests...
                    </td>
                  </tr>
                ) : visibleRequests.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 font-semibold text-slate-500" colSpan={7}>
                      No wholesale requests found.
                    </td>
                  </tr>
                ) : (
                  visibleRequests.map((request) => (
                    <tr
                      className="cursor-pointer odd:bg-white even:bg-slate-50/70 hover:bg-slate-50"
                      key={request.id}
                      onClick={() => openDetail(request)}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {request.requestNumber ?? request.id}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {request.user?.name ?? "-"}
                        </p>
                        <p className="text-sm font-medium text-slate-400">
                          {request.user?.email ?? ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {itemCount(request)}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {totalQty(request)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={statusPill(request.status)}>
                          {request.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                          onClick={(event) => {
                            event.stopPropagation();
                            openDetail(request);
                          }}
                          type="button"
                        >
                          <AdminIcon className="h-4 w-4" name="edit" />
                          View / Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selected && !convertOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wholesale-detail-title"
        >
          <div className="modal-panel max-h-[calc(100vh-3rem)] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800" id="wholesale-detail-title">
                  Request {selected.requestNumber ?? selected.id}
                </h2>
                <span className={`mt-2 ${statusPill(selected.status)}`}>
                  {selected.status.replace("_", " ")}
                </span>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-xl font-semibold text-slate-600"
                disabled={isActing}
                onClick={closeDetail}
                type="button"
              >
                <AdminIcon className="h-5 w-5" name="x" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </p>
                <p className="mt-1 font-semibold text-slate-800">
                  {selected.user?.name ?? "-"}
                </p>
                <p className="font-medium text-slate-600">
                  {selected.user?.email ?? ""}
                </p>
                <p className="font-medium text-slate-600">
                  {selected.contactPhone ?? selected.user?.phone ?? "No phone"}
                </p>
              </div>
              {selected.customerNote && (
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Customer note
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {selected.customerNote}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {["Product", "Variant", "Requested Qty", "Target Price", "Note"].map(
                      (heading) => (
                        <th className="px-4 py-4 text-sm font-semibold text-slate-700" key={heading}>
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selected.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                        {itemName(item)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {item.variant?.sku ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.requestedQuantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {formatMoney(item.targetPrice)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {item.note ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selected.status === "rejected" && selected.adminNote && (
              <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Rejection note: {selected.adminNote}
              </p>
            )}
            {selected.status === "converted" && (
              <p className="mt-4 rounded-lg bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">
                Converted to order:{" "}
                {selected.order?.orderNumber ?? selected.orderId ?? "—"}
              </p>
            )}

            {actionError && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {actionError}
              </p>
            )}

            {noteMode && (
              <div className="mt-4 rounded-lg border border-slate-200 p-4">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  {noteMode === "rejected"
                    ? "Reason for rejection (optional)"
                    : "What information do you need from the customer?"}
                </span>
                <textarea
                  autoFocus
                  className="h-24 w-full rounded-lg border border-slate-300 px-4 py-3 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) => setNoteText(event.target.value)}
                  placeholder="Add a note for the customer..."
                  value={noteText}
                />
                <div className="mt-3 flex justify-end gap-3">
                  <button
                    className="h-11 rounded-lg border border-slate-300 bg-white px-4 font-semibold text-slate-700"
                    disabled={isActing}
                    onClick={() => {
                      setNoteMode(null);
                      setNoteText("");
                    }}
                    type="button"
                  >
                    Back
                  </button>
                  {noteMode === "info_requested" ? (
                    <button
                      className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-500 px-4 font-semibold text-white disabled:bg-slate-400"
                      disabled={isActing}
                      onClick={() => submitStatus("info_requested", noteText)}
                      type="button"
                    >
                      Send request for info
                    </button>
                  ) : (
                    <button
                      className="inline-flex h-11 items-center gap-2 rounded-lg bg-red-600 px-4 font-semibold text-white disabled:bg-slate-400"
                      disabled={isActing}
                      onClick={() => setRejectConfirmOpen(true)}
                      type="button"
                    >
                      Reject request
                    </button>
                  )}
                </div>
              </div>
            )}

            {!noteMode && (
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                {(selected.status === "pending" ||
                  selected.status === "info_requested") && (
                  <>
                    <button
                      className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white disabled:bg-slate-400"
                      disabled={isActing}
                      onClick={() => submitStatus("approved")}
                      type="button"
                    >
                      <AdminIcon className="h-5 w-5" name="check" />
                      Approve
                    </button>
                    <button
                      className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber-500 px-5 text-sm font-semibold text-white disabled:bg-slate-400"
                      disabled={isActing}
                      onClick={() => {
                        setNoteText("");
                        setNoteMode("info_requested");
                      }}
                      type="button"
                    >
                      Request More Info
                    </button>
                    <button
                      className="inline-flex h-11 items-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white disabled:bg-slate-400"
                      disabled={isActing}
                      onClick={() => {
                        setNoteText("");
                        setNoteMode("rejected");
                      }}
                      type="button"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selected.status === "approved" && (
                  <>
                    <button
                      className="inline-flex h-11 items-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white disabled:bg-slate-400"
                      disabled={isActing}
                      onClick={() => {
                        setNoteText("");
                        setNoteMode("rejected");
                      }}
                      type="button"
                    >
                      Reject
                    </button>
                    <button
                      className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:bg-slate-400"
                      disabled={isActing}
                      onClick={openConvert}
                      type="button"
                    >
                      <AdminIcon className="h-5 w-5" name="orders" />
                      Convert to Order
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {selected && convertOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wholesale-convert-title"
        >
          <form
            className="modal-panel max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl"
            onSubmit={submitConvert}
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 bg-gradient-to-r from-slate-50 to-white shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-slate-800" id="wholesale-convert-title">
                  Convert to order
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Request {selected.requestNumber ?? selected.id} for{" "}
                  {selected.user?.name}
                </p>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-xl font-semibold text-slate-600"
                disabled={isConverting}
                onClick={closeConvert}
                type="button"
              >
                <AdminIcon className="h-5 w-5" name="x" />
              </button>
            </div>

            {createdOrderNumber ? (
              <div className="space-y-5">
                <div className="rounded-lg bg-emerald-50 px-4 py-4 font-semibold text-emerald-700">
                  Order created successfully — {createdOrderNumber}
                </div>
                <div className="flex justify-end">
                  <button
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    onClick={() => {
                      setConvertOpen(false);
                      setSelected(null);
                    }}
                    type="button"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[640px] text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        {["Product", "Quantity", "Unit Price", "Line Total"].map(
                          (heading) => (
                             <th
                               className="px-4 py-4 text-sm font-semibold text-slate-700"
                               key={heading}
                             >
                               {heading}
                             </th>
                           ),
                         )}
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {convertForm.items.map((line, index) => (
                         <tr key={line.requestItemId}>
                           <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                             {line.productName}
                           </td>
                           <td className="px-4 py-4">
                             <input
                               className="h-11 w-28 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                               min="1"
                               onChange={(event) =>
                                 updateLine(index, "quantity", event.target.value)
                               }
                               type="number"
                               value={line.quantity}
                             />
                           </td>
                           <td className="px-4 py-4">
                             <input
                               className="h-11 w-32 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                               min="0"
                               onChange={(event) =>
                                 updateLine(index, "unitPrice", event.target.value)
                               }
                               placeholder="0.00"
                               step="0.01"
                               type="number"
                               value={line.unitPrice}
                             />
                           </td>
                           <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                             {formatMoney(
                               Number(line.quantity || 0) *
                                 Number(line.unitPrice || 0),
                             )}
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Delivery address
                  </span>
                  {selected.user?.addresses &&
                  selected.user.addresses.length > 0 ? (
                    <select
                      className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      onChange={(event) =>
                        setConvertForm((current) => ({
                          ...current,
                          addressId: event.target.value,
                        }))
                      }
                      required
                      value={convertForm.addressId}
                    >
                      <option value="">Select an address</option>
                      {selected.user.addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {[
                            address.fullName,
                            address.addressLine1,
                            address.city,
                            address.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                      This customer has no saved addresses. Ask them to add a
                      delivery address before converting.
                    </p>
                  )}
                </label>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Discount
                    </span>
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                      min="0"
                      onChange={(event) =>
                        setConvertForm((current) => ({
                          ...current,
                          discount: event.target.value,
                        }))
                      }
                      step="0.01"
                      type="number"
                      value={convertForm.discount}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Shipping
                    </span>
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                      min="0"
                      onChange={(event) =>
                        setConvertForm((current) => ({
                          ...current,
                          shippingCost: event.target.value,
                        }))
                      }
                      step="0.01"
                      type="number"
                      value={convertForm.shippingCost}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Tax
                    </span>
                    <input
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
                      min="0"
                      onChange={(event) =>
                        setConvertForm((current) => ({
                          ...current,
                          tax: event.target.value,
                        }))
                      }
                      step="0.01"
                      type="number"
                      value={convertForm.tax}
                    />
                  </label>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatMoney(convertTotals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>− Discount</span>
                    <span>{formatMoney(convertTotals.discount)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>+ Shipping</span>
                    <span>{formatMoney(convertTotals.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>+ Tax</span>
                    <span>{formatMoney(convertTotals.tax)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-lg font-semibold text-slate-900">
                    <span>Grand Total</span>
                    <span>{formatMoney(convertTotals.grandTotal)}</span>
                  </div>
                </div>

                {convertError && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {convertError}
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    className="h-11 rounded-lg border-2 border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    disabled={isConverting}
                    onClick={closeConvert}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:bg-slate-400"
                    disabled={isConverting || !canSubmitConvert}
                    type="submit"
                  >
                    <AdminIcon className="h-5 w-5" name="check" />
                    {isConverting ? "Creating order..." : "Create Order"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={rejectConfirmOpen}
        onClose={() => setRejectConfirmOpen(false)}
        onConfirm={() => submitStatus("rejected", noteText)}
        title="Reject wholesale request"
        message={`Reject request "${
          selected?.requestNumber ?? selected?.id ?? ""
        }"? The customer will be notified${
          noteText.trim() ? " with your note." : "."
        }`}
        confirmText="Reject"
        cancelText="Cancel"
        isDestructive
      />
    </>
  );
}
