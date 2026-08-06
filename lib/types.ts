export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  description?: string;
  id?: string;
  productId?: string;
  variantId?: string;
  attributes?: Record<string, string>;
  [key: string]: any;
};

export type WishlistProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  color: string;
  size: string;
  category: string;
  team: string;
  description?: string;
  variantId?: string;
  attributes?: Record<string, string>;
  [key: string]: any;
};

export interface BackendCartItem {
  id: string;
  variantId: string;
  quantity: number;
  cartId: string;
  variant: {
    id: string;
    sku: string;
    price: string;
    cost: string | null;
    stockQuantity: number;
    stockAlertThreshold: number;
    isDefault: boolean;
    productId: string;
    discountAmount?: string | number | null;
    discountedPrice?: string | number | null;
    media?: { id: string; isFeatured: boolean; sortOrder: number; media: { url: string; type: string } }[];
    attributes?: {
      id: string;
      variantId: string;
      attributeValueId: string;
      attributeValue: {
        id: string;
        value: string;
        attribute: {
          id: string;
          name: string;
        };
      };
    }[];
    product: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      media: { id: string; isFeatured: boolean; sortOrder: number; media: { url: string; type: string } }[];
    };
  };
}

export interface BackendCartResponse {
  id: string;
  sessionId: string | null;
  createdAt: string;
  userId: string;
  items: BackendCartItem[];
  subtotal: number;
}

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  initialised: boolean;
  addItem: (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
    options?: { silent?: boolean }
  ) => void | Promise<void>;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCartItem: (
    itemId: string,
    updates: {
      quantity?: number;
      variantId?: string;
      name?: string;
      price?: number;
      image?: string;
      color?: string;
      size?: string;
      attributes?: Record<string, string>;
    }
  ) => Promise<void>;
  clearCart: () => void;
}

export interface BackendWishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string | null;
    category?: { name: string };
    brand?: { name: string };
    media?: { id: string; isFeatured: boolean; sortOrder: number; media: { url: string } }[];
    variants?: {
      id: string;
      price: string;
      isDefault: boolean;
      attributes: Record<string, string>;
    }[];
  };
}

export interface WishlistContextValue {
  items: WishlistProduct[];
  itemCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: WishlistProduct) => void;
  clearWishlist: () => void;
}

export type AddressForm = {
  email: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type OrderResultItem = {
  name: string;
  quantity: number;
  price: number;
  image: string;
};

export type OrderResult = {
  orderNumber: string;
  total: number;
  items: OrderResultItem[];
  address: AddressForm;
  paymentMethod?: string;
  orderNote?: string;
};
