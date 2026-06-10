// app/profile/address/page.tsx
'use client';

import { useState } from 'react';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

// Mock data - Replace with API call
const initialAddresses: Address[] = [
  {
    id: '1',
    name: 'Home',
    street: '123 Main St',
    city: 'New York',
    zip: '10001',
    country: 'USA',
    isDefault: true,
  },
];

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Address Book</h1>
        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          {isAddingNew ? 'Cancel' : 'Add New Address'}
        </button>
      </div>

      {/* Add New Address Form */}
      {isAddingNew && (
        <div className="bg-gray-50 p-6 rounded mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Add New Address</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name" className="border p-2 rounded" />
            <input type="text" placeholder="Street Address" className="border p-2 rounded" />
            <input type="text" placeholder="City" className="border p-2 rounded" />
            <input type="text" placeholder="ZIP / Postal Code" className="border p-2 rounded" />
            <input type="text" placeholder="Country" className="border p-2 rounded" />
            <div className="md:col-span-2">
              <button type="submit" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`border p-6 rounded relative ${
              address.isDefault ? 'border-black bg-gray-50' : 'border-gray-200'
            }`}
          >
            {address.isDefault && (
              <span className="absolute top-4 right-4 text-xs font-bold bg-black text-white px-2 py-1 rounded">
                DEFAULT
              </span>
            )}
            <h3 className="font-bold text-lg mb-2">{address.name}</h3>
            <p className="text-gray-600">{address.street}</p>
            <p className="text-gray-600">
              {address.city}, {address.zip}
            </p>
            <p className="text-gray-600">{address.country}</p>

            <div className="mt-4 flex gap-4 text-sm">
              <button
                onClick={() => handleSetDefault(address.id)}
                disabled={address.isDefault}
                className="text-blue-600 hover:underline disabled:opacity-50"
              >
                Set as Default
              </button>
              <button
                onClick={() => handleDelete(address.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
              <button className="text-gray-600 hover:underline">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}