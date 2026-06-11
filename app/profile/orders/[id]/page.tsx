'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiArrowLeft, 
  FiPackage, 
  FiMapPin, 
  FiCreditCard, 
  FiClock,
  FiXCircle 
} from 'react-icons/fi';
import { getOrderById, cancelOrder, Order, formatMoney, formatDate, createProductReview } from '@/lib/admin-api';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState("");
  const [reviewProductName, setReviewProductName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const refreshOrder = async () => {
    if (!params.id) return;
    try {
      const data = await getOrderById(params.id as string);
      setOrder(data);
    } catch (err) {
      console.error('Failed to refresh order details after review submission:', err);
    }
  };

  const handleOpenReviewModal = (productId: string, productName: string) => {
    setReviewProductId(productId);
    setReviewProductName(productName);
    setReviewRating(5);
    setReviewComment("");
    setReviewSuccess(false);
    setReviewError("");
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError("");
    try {
      await createProductReview(reviewProductId, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
        orderId: order?.id,
      });
      setReviewSuccess(true);
      await refreshOrder();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getOrderById(params.id as string);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const handleCancelOrder = async () => {
    if (!order || !confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCanceling(true);
      const updatedOrder = await cancelOrder(order.id);
      setOrder(updatedOrder);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setCanceling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'returned':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-xs" />;
      case 'processing':
        return <FiPackage className="text-xs" />;
      case 'shipped':
        return <FiPackage className="text-xs" />;
      case 'delivered':
        return <FiClock className="text-xs" />;
      case 'cancelled':
        return <FiXCircle className="text-xs" />;
      case 'returned':
        return <FiXCircle className="text-xs" />;
      default:
        return <FiClock className="text-xs" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 mb-4">{error || 'Order not found'}</p>
        <Link
          href="/profile/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          <FiArrowLeft />
          Back to Orders
        </Link>
      </div>
    );
  }

  const canCancel = order.status === 'pending' || order.status === 'processing';
  const subtotal = (order.items || []).reduce((sum, item) => sum + Number(item.totalPrice), 0);

  return (
    <div>
      {/* Breadcrumb - Responsive */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/profile/orders"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
        >
          <FiArrowLeft />
          Back to Orders
        </Link>
      </div>

      {/* Header - Responsive */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Order Details</h1>
            <p className="text-gray-600 mt-1">Order #{order.orderNumber}</p>
          </div>
          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={canceling}
              className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {canceling ? 'Canceling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Order Info Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Order Status</p>
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusIcon(order.status)}
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Payment Status</p>
          <span
            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
              order.paymentStatus
            )}`}
          >
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </span>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Order Date</p>
          <p className="font-semibold">{formatDate(order.placedAt)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-xl font-bold text-gray-900">{formatMoney(order.total)}</p>
        </div>
      </div>

      {/* Shipping Address & Payment Info - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        {/* Shipping Address */}
        {order.address && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiMapPin className="text-gray-600" />
                Shipping Address
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-2 text-sm sm:text-base">
                <p className="font-medium text-gray-900">{order.address.fullName}</p>
                <p className="text-gray-600">{order.address.addressLine1}</p>
                {order.address.addressLine2 && (
                  <p className="text-gray-600">{order.address.addressLine2}</p>
                )}
                <p className="text-gray-600">
                  {order.address.city}, {order.address.state} {order.address.postalCode}
                </p>
                <p className="text-gray-600">{order.address.country}</p>
                {order.address.phone && (
                  <p className="text-gray-600 mt-2">
                    <span className="font-medium">Phone:</span> {order.address.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {order.payments && order.payments.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiCreditCard className="text-gray-600" />
                Payment Information
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-600">Method:</span>
                      <span className="font-medium text-sm sm:text-base">{payment.method}</span>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="font-medium text-sm sm:text-base">{formatMoney(payment.amount)}</span>
                    </div>
                    {payment.transactionId && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-600">Transaction ID:</span>
                        <span className="font-mono text-xs sm:text-sm break-all">{payment.transactionId}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Items - Responsive Table/Cards */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6 sm:mb-8">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Order Items</h2>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-200">
          {(order.items || []).map((item) => {
            const featuredImage = item.product?.media?.find(m => m.isFeatured)?.media.url 
              || item.product?.media?.[0]?.media.url 
              || null;

            return (
              <div key={item.id} className="p-4">
                <div className="flex gap-4">
                  {featuredImage ? (
                    <img
                      src={featuredImage}
                      alt={item.product?.name || 'Product'}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <FiPackage className="text-gray-400 text-2xl" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-2 truncate">
                      {item.product?.name || 'Unknown Product'}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">SKU:</span>
                        <span className="text-gray-900">{item.variant?.sku || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="text-gray-900">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="text-gray-900">{formatMoney(item.unitPrice)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="font-medium">Total:</span>
                        <span className="font-semibold text-gray-900">{formatMoney(item.totalPrice)}</span>
                      </div>
                    </div>
                    {order.status === 'delivered' && item.product?.id && (
                      order.reviews?.some(r => r.productId === item.product!.id) ? (
                        <button
                          disabled
                          className="mt-3 w-full bg-neutral-100 text-neutral-400 py-1.5 rounded text-xs font-black uppercase tracking-wider border border-neutral-200 cursor-not-allowed"
                        >
                          Reviewed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenReviewModal(item.product!.id, item.product!.name)}
                          className="mt-3 w-full bg-black text-white py-1.5 rounded text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition"
                        >
                          Write Review
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(order.items || []).map((item) => {
                // Get featured image URL
                const featuredImage = item.product?.media?.find(m => m.isFeatured)?.media.url 
                  || item.product?.media?.[0]?.media.url 
                  || null;

                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {featuredImage ? (
                          <img
                            src={featuredImage}
                            alt={item.product?.name || 'Product'}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <FiPackage className="text-gray-400 text-2xl" />
                          </div>
                        )}
                        <div className="font-medium text-gray-900">
                          <div>{item.product?.name || 'Unknown Product'}</div>
                          {order.status === 'delivered' && item.product?.id && (
                            order.reviews?.some(r => r.productId === item.product!.id) ? (
                              <button
                                disabled
                                className="mt-1.5 inline-flex bg-neutral-100 text-neutral-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border border-neutral-200 cursor-not-allowed"
                              >
                                Reviewed
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenReviewModal(item.product!.id, item.product!.name)}
                                className="mt-1.5 inline-flex bg-black text-white px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider hover:bg-neutral-800 transition"
                              >
                                Write Review
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.variant?.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {formatMoney(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatMoney(item.totalPrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Summary & Order History - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
        {/* Price Summary */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold">Price Summary</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatMoney(subtotal)}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">-{formatMoney(order.discount)}</span>
              </div>
            )}
            {Number(order.shippingCost) > 0 && (
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">+{formatMoney(order.shippingCost)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-semibold text-base sm:text-lg">Total</span>
              <span className="font-bold text-lg sm:text-xl">{formatMoney(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Order History Timeline */}
        {order.statusLogs && order.statusLogs.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold">Order History</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {order.statusLogs.map((log, index) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiClock className="text-blue-600 text-sm" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base capitalize">{log.status}</p>
                      {log.note && <p className="text-xs sm:text-sm text-gray-600 mt-1">{log.note}</p>}
                      <p className="text-xs text-gray-500 mt-1">{formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {reviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReviewModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white p-6 shadow-2xl rounded-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-lg font-black uppercase tracking-[0.06em]">
                Review Product
              </h2>
              <button
                type="button"
                className="text-2xl leading-none font-bold"
                onClick={() => setReviewModalOpen(false)}
              >
                ×
              </button>
            </div>
            <p className="mt-2 text-xs font-bold uppercase text-neutral-500">
              Product: <span className="text-black">{reviewProductName}</span>
            </p>

            {reviewSuccess ? (
              <div className="mt-6 bg-green-50 border border-green-200 p-4 text-center">
                <p className="text-sm font-bold text-green-700">
                  ✓ Review submitted successfully! It is pending moderation.
                </p>
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="mt-4 bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] hover:bg-neutral-800 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4">
                {reviewError && (
                  <div className="bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
                    {reviewError}
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.06em] text-neutral-500">
                    Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl transition-colors ${
                          star <= reviewRating ? "text-[#ffd02f]" : "text-neutral-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.06em] text-neutral-500">
                    Comment (optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us what you think of this product..."
                    rows={4}
                    className="w-full border border-neutral-200 p-3 text-sm outline-none focus:border-black resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full bg-black text-white py-3 text-xs font-black uppercase tracking-[0.12em] hover:bg-neutral-800 transition disabled:bg-neutral-300"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
