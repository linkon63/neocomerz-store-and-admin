// app/profile/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPackage, FiShoppingBag, FiXCircle, FiClock, FiCheckCircle, FiTruck, FiEye, FiAlertCircle } from 'react-icons/fi';
import { getMyOrders, cancelOrder, Order, formatMoney, formatDate } from '@/lib/admin-api';

type OrderStats = {
  totalOrders: number;
  totalItems: number;
  cancelledOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalSpent: number;
};

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

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'unpaid':
      return 'bg-yellow-100 text-yellow-800';
    case 'refunded':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Calculate statistics
  const stats: OrderStats = orders.reduce(
    (acc, order) => {
      acc.totalOrders += 1;
      acc.totalItems += (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
      acc.totalSpent += Number(order.total);

      if (order.status === 'cancelled') acc.cancelledOrders += 1;
      if (order.status === 'pending') acc.pendingOrders += 1;
      if (order.status === 'delivered') acc.deliveredOrders += 1;

      return acc;
    },
    {
      totalOrders: 0,
      totalItems: 0,
      cancelledOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      totalSpent: 0,
    }
  );

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: FiPackage,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      label: 'Total Items',
      value: stats.totalItems,
      icon: FiShoppingBag,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: FiClock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      label: 'Delivered',
      value: stats.deliveredOrders,
      icon: FiCheckCircle,
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
      label: 'Cancelled',
      value: stats.cancelledOrders,
      icon: FiXCircle,
      color: 'bg-red-50 text-red-600 border-red-200',
    },
    {
      label: 'Total Spent',
      value: formatMoney(stats.totalSpent),
      icon: FiPackage,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white p-4 rounded-lg border ${stat.color.split(' ')[2]} shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Order History</h2>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">No orders yet</p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/profile/orders/${order.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiPackage className="text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(order.placedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(order.items || []).reduce((sum, item) => sum + item.quantity, 0)} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {formatMoney(order.total)}
                      </span>
                      {Number(order.discount) > 0 && (
                        <span className="ml-2 text-xs text-green-600">
                          (-{formatMoney(order.discount)})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/profile/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiEye className="text-sm" />
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
