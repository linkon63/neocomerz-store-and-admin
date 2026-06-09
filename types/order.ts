export type OrderItemData = {
  id: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product: {
    id: string;
    name: string;
    slug: string;
    media?: { media?: { url: string }; isFeatured: boolean }[];
  };
  variant?: {
    id: string;
    price: string;
    attributes?: {
      attributeValue?: { value: string; attribute?: { name: string } };
    }[];
  };
};

export type OrderData = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  discount: string;
  placedAt: string;
  items: OrderItemData[];
  address: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};
