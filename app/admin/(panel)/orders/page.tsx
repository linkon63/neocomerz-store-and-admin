"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminIcon,
  PageHeader,
} from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Alert,
  StatsCard,
  EmptyState,
  Typography,
} from "../../_components/enterprise-ui";
import {
  apiRequest,
  formatDate,
  type Order,
  type OrderStatus,
} from "../../../../lib/admin-api";
import {
  calculateDueAmount,
  calculatePaidAmount,
} from "../../lib/order-utils";

const TABS: { label: string; statuses: OrderStatus[] }[] = [
  { label: "Order Placed",  statuses: ["pending"] },
  { label: "Packaging",     statuses: ["processing"] },
  { label: "Ready to Ship", statuses: ["shipped"] },
  { label: "On the Way",    statuses: ["shipped"] },
  { label: "Delivered",     statuses: ["delivered"] },
  { label: "Failed",        statuses: ["returned", "cancelled"] },
];

type FilterState = {
  paymentStatus: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
};

const emptyFilter: FilterState = {
  paymentStatus: "",
  paymentMethod: "",
  startDate: "",
  endDate: "",
};

function NoOrderSelected() {
  return (
    <Card className="min-h-[600px] flex items-center justify-center">
      <EmptyState
        icon={<AdminIcon className="h-8 w-8 text-gray-400" name="reviews" />}
        title="No Order Selected"
        description="Please select an order from the list on the left to view its details."
      />
    </Card>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const loadOrders = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const data = await apiRequest<Order[]>("/orders");
      setOrders(data);
      if (data.length > 0 && !selectedId) {
         const firstInTab = data.find(o => TABS[activeTab].statuses.includes(o.status as OrderStatus));
         if (firstInTab) setSelectedId(firstInTab.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrders();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadOrders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesTab = TABS[activeTab].statuses.includes(o.status as OrderStatus);
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.user?.phone?.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q);
      
      const matchesPaymentStatus = !filters.paymentStatus || o.paymentStatus === filters.paymentStatus;
      const matchesPaymentMethod = !filters.paymentMethod || o.payments?.[0]?.method === filters.paymentMethod;
      
      let matchesDateRange = true;
      if (filters.startDate) {
        matchesDateRange = matchesDateRange && new Date(o.placedAt) >= new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchesDateRange = matchesDateRange && new Date(o.placedAt) <= new Date(filters.endDate);
      }

      return matchesTab && matchesSearch && matchesPaymentStatus && matchesPaymentMethod && matchesDateRange;
    });
  }, [orders, activeTab, search, filters]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const totalPages = Math.ceil(filtered.length / limit);
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const selected = useMemo(() => {
    return orders.find((o) => o.id === selectedId) ?? null;
  }, [orders, selectedId]);

  const handleUpdateStatus = useCallback(async (status: OrderStatus, note?: string) => {
    if (!selected) return;
    setActionError("");
    setIsActioning(true);
    try {
      await apiRequest(`/orders/${selected.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: note ?? "" }),
      });
      await loadOrders();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setIsActioning(false);
    }
  }, [selected, loadOrders]);

  const handleCancel = useCallback(async () => {
    if (!selected) return;
    setActionError("");
    setIsActioning(true);
    try {
      await apiRequest(`/orders/${selected.id}/cancel`, { method: "DELETE" });
      setCancelModalOpen(false);
      await loadOrders();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setIsActioning(false);
    }
  }, [selected, loadOrders]);

  const paidAmount = useMemo(() => calculatePaidAmount(selected?.payments), [selected]);
  const dueAmount = useMemo(() => calculateDueAmount(selected?.total || 0, paidAmount), [selected, paidAmount]);

  const handleMakePayment = useCallback(async () => {
    if (!selected || dueAmount <= 0) return;
    setActionError("");
    setIsActioning(true);
    try {
      await apiRequest("/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selected.id,
          amount: dueAmount,
          method: "Online",
          transactionId: `MANUAL-${Date.now()}`
        }),
      });
      await loadOrders();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsActioning(false);
    }
  }, [selected, dueAmount, loadOrders]);

  function clearFilters() {
    setFilters(emptyFilter);
    setPage(1);
  }

  return (
    <>
      <PageHeader
        title={TABS[activeTab].label}
        description={`Manage and track orders in ${TABS[activeTab].label.toLowerCase()} status, handle fulfillment and payments.`}
        action={
          <div className="flex gap-3">
            <Button
              variant="neutral"
              size="md"
              icon={<AdminIcon className="h-5 w-5" name="download" />}
              onClick={() => {
                // Future: Implement export logic
                alert("Exporting current view...");
              }}
            >
              Export List
            </Button>
          </div>
        }
      />

      {/* Enterprise Stats Dashboard */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Orders"
          value={orders.length}
          icon={<AdminIcon className="h-6 w-6" name="orders" />}
          trend={{ value: "+12.5%", isPositive: true }}
        />
        <StatsCard
          label="Processing"
          value={orders.filter(o => o.status === 'processing').length}
          icon={<AdminIcon className="h-6 w-6" name="package" />}
          trend={{ value: "+8.2%", isPositive: true }}
        />
        <StatsCard
          label="Delivered"
          value={orders.filter(o => o.status === 'delivered').length}
          icon={<AdminIcon className="h-6 w-6" name="check" />}
          trend={{ value: "+15.3%", isPositive: true }}
        />
        <StatsCard
          label="Revenue"
          value={`BDT ${orders.reduce((sum, o) => sum + Number(o.total || 0), 0).toLocaleString()}`}
          icon={<AdminIcon className="h-6 w-6" name="report" />}
          trend={{ value: "+22.1%", isPositive: true }}
        />
      </div>

      {/* Flat Tab Navigation */}
      <div className="mb-8 border-b border-slate-200">
        <div className="flex overflow-x-auto">
          {TABS.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(index);
                setPage(1);
                const firstInTab = orders.find(o => tab.statuses.includes(o.status as OrderStatus));
                setSelectedId(firstInTab?.id || null);
              }}
              className={`shrink-0 whitespace-nowrap px-6 py-3 text-[15px] font-bold transition-all border-b-2 rounded-t-md ${
                activeTab === index
                  ? "border-blue-600 text-blue-600 bg-blue-50/10"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-6" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="flex flex-col overflow-hidden p-0 h-fit border-slate-200">
          {/* Enhanced Search & Filter Header */}
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-100 p-3 bg-white">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <AdminIcon className="h-4 w-4" name="search" />
                </div>
                <input
                  placeholder="Order no. / Phone no."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-10 border border-slate-200 bg-slate-50 pl-10 pr-3 text-[14px] outline-none rounded-md focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`grid h-10 w-10 shrink-0 place-items-center border rounded-md transition-all ${
                showFilters || hasActiveFilters
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              <AdminIcon className="h-4 w-4" name="filter" />
            </button>
          </div>

          {/* Premium Filter Panel */}
          {showFilters && (
            <div className="border-b border-slate-200 bg-blue-50/50 p-4 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className={`${Typography.h4} text-blue-900`}>Advanced Filters</h4>
                {hasActiveFilters && (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Payment Status"
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "paid", label: "Paid" },
                    { value: "unpaid", label: "Unpaid" },
                    { value: "refunded", label: "Refunded" },
                  ]}
                  value={filters.paymentStatus}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, paymentStatus: e.target.value }));
                    setPage(1);
                  }}
                />
                <Select
                  label="Payment Method"
                  options={[
                    { value: "", label: "All Methods" },
                    { value: "COD", label: "Cash on Delivery" },
                    { value: "Online", label: "Online Payment" },
                    { value: "Card", label: "Card Payment" },
                  ]}
                  value={filters.paymentMethod}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, paymentMethod: e.target.value }));
                    setPage(1);
                  }}
                />
                <Input
                  label="Start Date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, startDate: e.target.value }));
                    setPage(1);
                  }}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, endDate: e.target.value }));
                    setPage(1);
                  }}
                />
              </div>
            </div>
          )}

          {/* Enhanced Order List */}
          <div key={activeTab} className="flex-1 overflow-y-auto max-h-[700px] animate-in fade-in slide-in-from-left-2 duration-300">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-24">
                <div className="text-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
                  <p className={`${Typography.body} text-slate-500`}>Loading premium orders...</p>
                </div>
              </div>
            ) : paginatedOrders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-24">
                <EmptyState
                  icon={<AdminIcon className="h-8 w-8 text-slate-400" name="orders" />}
                  title="No Orders Found"
                  description="No orders match your current filters or search criteria."
                />
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {paginatedOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedId(order.id)}
                      className={`flex w-full items-start justify-between gap-4 px-4 py-5 text-left transition-all duration-200 hover:bg-slate-50 ${
                        selectedId === order.id 
                          ? "bg-blue-50 border-r-[3px] border-r-blue-600" 
                          : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-black text-slate-950 uppercase">{order.orderNumber}</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">{formatDate(order.placedAt)}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-black border rounded-md ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            order.paymentStatus === 'unpaid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {order.paymentStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[15px] font-black text-slate-950">BDT {Number(order.total || 0).toLocaleString()}</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">
                          {order.items?.length || 0} Items
                        </p>
                        <div className="mt-3 flex justify-end">
                           <span className={`px-2 py-0.5 text-[10px] font-black border bg-red-50 text-red-600 border-red-100 rounded-md`}>
                            {(order.payments?.[0]?.method || "COD").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Premium Pagination */}
                {totalPages > 1 && (
                  <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
                    <p className={`${Typography.body} text-slate-600`}>
                      Page <span className="font-bold text-blue-600">{page}</span> of <span className="font-bold text-blue-600">{totalPages}</span>
                      <span className="ml-2 text-slate-400">({filtered.length} total orders)</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="neutral"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        icon={<AdminIcon className="h-4 w-4 rotate-180" name="chevronRight" />}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="neutral"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        icon={<AdminIcon className="h-4 w-4" name="chevronRight" />}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Premium Order Details Panel */}
        <div key={selectedId || 'none'} className="animate-in fade-in slide-in-from-right-2 duration-300">
          {selected ? (
            <div className="flex flex-col gap-6 min-h-[600px]">
              {actionError && (
                <Alert variant="danger" onClose={() => setActionError("")}>
                  {actionError}
                </Alert>
              )}

              {/* Enhanced Order Header */}
              <Card className="p-4 bg-white border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600 text-white">
                      <AdminIcon className="h-5 w-5" name="orders" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Order {selected.orderNumber}
                      </p>
                      <p className="text-xs font-bold text-slate-500">
                        {formatDate(selected.placedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {dueAmount > 0 && (
                      <Button 
                        variant="success"
                        size="md"
                        disabled={isActioning}
                        isLoading={isActioning}
                        onClick={handleMakePayment}
                        className="font-black bg-[#10b981] hover:bg-[#059669] border-none"
                      >
                        Make Payment
                      </Button>
                    )}
                    {selected.status !== 'cancelled' && selected.status !== 'delivered' && (
                      <Button
                        variant="neutral"
                        size="md"
                        disabled={isActioning}
                        onClick={() => setCancelModalOpen(true)}
                        className="text-red-500 border-red-200 hover:bg-red-50 font-black rounded-md"
                      >
                        Cancel Order
                      </Button>
                    )}
                    
                    {selected.status === "pending" && (
                      <Button
                        variant="primary"
                        size="md"
                        disabled={isActioning}
                        isLoading={isActioning}
                        onClick={() => handleUpdateStatus("processing", "Order accepted")}
                        className="bg-blue-500 hover:bg-blue-600 font-black"
                      >
                        Accept
                      </Button>
                    )}

                    {selected.status === "processing" && (
                      <Button
                        variant="primary"
                        size="md"
                        disabled={isActioning}
                        isLoading={isActioning}
                        onClick={() => handleUpdateStatus("shipped", "Order is ready to ship")}
                        className="bg-blue-500 hover:bg-blue-600 font-black"
                      >
                        Ready to Ship
                      </Button>
                    )}

                    {selected.status === "shipped" && (
                      <Button
                        variant="primary"
                        size="md"
                        disabled={isActioning}
                        isLoading={isActioning}
                        onClick={() => handleUpdateStatus("delivered", "Order delivered")}
                        className="bg-emerald-500 hover:bg-emerald-600 font-black"
                      >
                        Mark as Delivered
                      </Button>
                    )}

                    {(selected.status === "cancelled" || selected.status === "returned") && (
                      <Button
                        variant="primary"
                        size="md"
                        disabled={isActioning}
                        isLoading={isActioning}
                        onClick={() => handleUpdateStatus("pending", "Order restored")}
                        className="bg-blue-500 hover:bg-blue-600 font-black"
                      >
                        Restore Order
                      </Button>
                    )}

                    <button className="h-10 w-10 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-md">
                      <AdminIcon name="actions" />
                    </button>
                  </div>
                </div>
              </Card>              {/* Order Details Body */}
              <Card className="overflow-hidden border-slate-200">
                <div className="p-6">
                  {/* Customer Information */}
                  <div className="mb-8 border-b border-slate-100 pb-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">
                          {selected.user?.name || "Regular Customer"} ({selected.user?.phone || "N/A"})
                        </h3>
                        
                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipping & Billing Address</p>
                             <button className="text-blue-500">
                               <AdminIcon className="h-3.5 w-3.5" name="edit" />
                             </button>
                          </div>
                          <p className="text-[14px] font-bold text-slate-700">
                            {selected.address?.addressLine1}, {selected.address?.city}, {selected.address?.state}, {selected.address?.postalCode}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 text-right">
                         <div className="flex gap-8 mb-4">
                            <div>
                               <p className="text-xs font-bold text-slate-400 mb-1">Order #</p>
                               <p className="text-sm font-black text-slate-900">{selected.orderNumber}</p>
                            </div>
                            <div>
                               <p className="text-xs font-bold text-slate-400 mb-1">Order Date</p>
                               <p className="text-sm font-black text-slate-900">{formatDate(selected.placedAt)}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                             <p className="text-xs font-bold text-slate-400">Payment Status</p>
                             <div className="flex gap-2">
                                <span className="px-2 py-0.5 text-[10px] font-black border bg-red-50 text-red-600 border-red-100 uppercase rounded-md">
                                   {selected.paymentStatus}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-black border bg-red-50 text-red-600 border-red-100 uppercase rounded-md">
                                   {(selected.payments?.[0]?.method || "COD")}
                                </span>
                             </div>
                         </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 border border-red-100 text-[11px] font-black rounded-md">
                          <AdminIcon className="h-3 w-3" name="zap" />
                          Normal Delivery
                       </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-6 mb-12">
                    {(selected.items || []).map((item) => {
                      const variantImg = item.variant?.media?.[0]?.media?.url;
                      const productImg = item.product?.media?.[0]?.media?.url;
                      const imgSrc = variantImg || productImg;
                      return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-16 w-20 shrink-0 bg-slate-50 border border-slate-100 flex items-center justify-center rounded-md overflow-hidden">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={item.product?.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <AdminIcon className="h-8 w-8 text-slate-300" name="package" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-black text-slate-900">{item.product?.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase">
                            SKU: {item.variant?.sku || "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2 mb-1">
                             <p className="text-sm font-black text-slate-900">{item.quantity} Item(s)</p>
                          </div>
                          <p className="text-[15px] font-black text-slate-900">BDT {Number(item.totalPrice).toLocaleString()}</p>
                        </div>
                      </div>
                      );
                    })}
                  </div>

                  {/* Order Summary */}
                  <div className="ml-auto max-w-xs space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-slate-500">Subtotal</span>
                        <span className="text-sm font-black text-slate-900">
                          BDT {(Number(selected.total) - Number(selected.shippingCost)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-slate-500">Delivery charge</span>
                        <span className="text-sm font-bold text-slate-900">
                          + BDT {Number(selected.shippingCost).toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-3">
                        <div className="flex justify-between">
                          <span className="text-base font-black text-slate-900">Total</span>
                          <span className="text-base font-black text-slate-900">BDT {Number(selected.total).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="pt-3 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-black text-emerald-600">Paid Amount</span>
                          <span className="text-sm font-black text-emerald-600">BDT {paidAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-black text-red-600">Due Amount</span>
                          <span className="text-sm font-black text-red-600">BDT {dueAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <NoOrderSelected />
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message={`Are you sure you want to cancel order ${selected?.orderNumber}? This action cannot be undone.`}
        confirmText={isActioning ? "Cancelling…" : "Yes, Cancel Order"}
        isDestructive
      />
    </>
  );
}
