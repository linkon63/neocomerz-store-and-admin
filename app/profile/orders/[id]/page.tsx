// app/profile/orders/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPackage, FiArrowLeft, FiMapPin, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiAlertCircle, FiCreditCard } from 'react-icons/fi';
import { getOrderById, cancelOrder, Order, formatMoney, formatDate } from '@/lib/admin-api';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
      return <FiCheckCircle className="text-green-600" />;
    case 'shipped':
      return <FiTruck className="text-blue-600" />;
    case 'processing':
      return <FiClock className="text-amber-600" />;
    case 'cancelled':
      return <FiXCircle className="text-red-600" />;
    case 'returned':
      return <FiAlertCircle className="text-purple-600" />;
    default:
      return <FiPackage className="text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'shipped':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'processing':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'returned':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCanceling(true);
      await cancelOrder(orderId);
      router.push('/profile/orders');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setCanceling(false);
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
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/profile/orders"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft />
          Back to Orders
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Order Details</h1>
          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={canceling}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canceling ? 'Canceling...' : 'Cancel Order'}
            </button>
          )}
        </div>
        <p className="text-gray-600">Order #{order.orderNumber}</p>
      </div>

      {/* Order Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              order.paymentStatus === 'paid'
                ? 'bg-green-100 text-green-800'
                : order.paymentStatus === 'unpaid'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Order Date</p>
          <p className="text-lg font-semibold">{formatDate(order.placedAt)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-lg font-bold">{formatMoney(order.total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Shipping Address */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiMapPin className="text-blue-600" />
            Shipping Address
          </h2>
          {order.address ? (
            <div className="text-gray-700">
              <p className="font-semibold mb-2">{order.address.fullName || order.user?.name || 'N/A'}</p>
              <p>{order.address.addressLine1}</p>
              {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
              <p>
                {order.address.city}, {order.address.state || ''} {order.address.postalCode}
              </p>
              <p>{order.address.country}</p>
              {order.address.phone && <p className="mt-2">Phone: {order.address.phone}</p>}
              {order.user?.email && <p>Email: {order.user.email}</p>}
            </div>
          ) : (
            <p className="text-gray-500">No address information available</p>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiCreditCard className="text-green-600" />
            Payment Information
          </h2>
          {order.payments && order.payments.length > 0 ? (
            <div className="space-y-3">
              {order.payments.map((payment) => (
                <div key={payment.id} className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Method: {payment.method}</p>
                  <p className="text-sm text-gray-600">Amount: {formatMoney(payment.amount)}</p>
                  {payment.transactionId && (
                    <p className="text-sm text-gray-600">Transaction: {payment.transactionId}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No payment information available</p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Order Items</h2>
        </div>

        <div className="overflow-x-auto">
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
                          {item.product?.name || 'Unknown Product'}
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

      {/* Price Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h2 className="text-xl font-bold mb-4">Price Summary</h2>
        <div className="space-y-2 max-w-md ml-auto">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatMoney(order.discount)}</span>
            </div>
          )}
          {Number(order.shippingCost) > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{formatMoney(order.shippingCost)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatMoney(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Order Status Timeline */}
      {order.statusLogs && order.statusLogs.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiClock className="text-purple-600" />
            Order History
          </h2>
          <div className="space-y-4">
            {order.statusLogs.map((log, index) => (
              <div key={log.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {getStatusIcon(log.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(log.createdAt)}</p>
                  </div>
                  {log.note && <p className="text-sm text-gray-600 mt-1">{log.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
