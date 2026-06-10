// app/profile/dashboard/page.tsx
'use client';

import { useAuth } from '@/app/_components/auth-context';
import { useCart } from '@/app/_components/cart-context';
import { useWishlist } from '@/app/_components/wishlist-context';
import Link from 'next/link';
import { FiShoppingBag, FiHeart, FiMapPin, FiPackage, FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';

// Mock data for orders - Replace with API call
const recentOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'Delivered',
    total: 189.00,
    items: 3,
  },
  {
    id: 'ORD-002',
    date: '2024-01-10',
    status: 'Shipped',
    total: 129.00,
    items: 2,
  },
  {
    id: 'ORD-003',
    date: '2024-01-05',
    status: 'Processing',
    total: 245.00,
    items: 4,
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Delivered':
      return <FiCheckCircle className="text-green-600" />;
    case 'Shipped':
      return <FiTruck className="text-blue-600" />;
    case 'Processing':
      return <FiClock className="text-amber-600" />;
    default:
      return <FiPackage className="text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Shipped':
      return 'bg-blue-100 text-blue-800';
    case 'Processing':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { items: cartItems, subtotal: cartSubtotal } = useCart();
  const { wishlistItems } = useWishlist();
  
  // Mock address count - Replace with API call
  const addressCount = 2;

  const stats = [
    {
      label: 'Cart Items',
      value: cartItems.length,
      icon: FiShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      link: '/profile/cart',
    },
    {
      label: 'Wishlist Items',
      value: wishlistItems.length,
      icon: FiHeart,
      color: 'bg-red-50 text-red-600',
      link: '/profile/wishlist',
    },
    {
      label: 'Saved Addresses',
      value: addressCount,
      icon: FiMapPin,
      color: 'bg-green-50 text-green-600',
      link: '/profile/address',
    },
    {
      label: 'Total Orders',
      value: recentOrders.length,
      icon: FiPackage,
      color: 'bg-purple-50 text-purple-600',
      link: '/profile/orders',
    },
  ];

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-gray-600">Here is an overview of your account</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.link}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="text-2xl" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiShoppingBag className="text-blue-600" />
              Cart Summary
            </h2>
            <Link href="/profile/cart" className="text-blue-600 hover:underline text-sm">
              View Cart →
            </Link>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div>
              <p className="text-sm text-gray-600">{cartItems.length} items in cart</p>
              <p className="text-2xl font-bold mt-1">€{cartSubtotal.toFixed(2)}</p>
            </div>
            <Link
              href="/profile/cart"
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiPackage className="text-purple-600" />
            Recent Orders
          </h2>
          <Link href="/profile/orders" className="text-blue-600 hover:underline text-sm">
            View All Orders →
          </Link>
        </div>

        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold">{order.id}</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {order.items} items • €{order.total.toFixed(2)} • {order.date}
                </p>
              </div>
              <Link
                href={`/profile/orders/${order.id}`}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition text-sm"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>

        {recentOrders.length === 0 && (
          <div className="text-center py-8">
            <FiPackage className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No orders yet</p>
            <Link
              href="/shop"
              className="inline-block mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}