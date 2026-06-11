export type ShopProduct = {
  id?: string;
  slug?: string;
  name: string;
  category: string;
  team: string;
  price: number;
  color: string;
  size: string;
  image: string;
  variantId?: string;
  colors?: string[];
  sizes?: string[];
  discountedPrice?: number;
};

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface MediaFile {
  id: string;
  url: string;
}

export interface ProductMedia {
  id: string;
  isFeatured: boolean;
  media?: MediaFile;
}

export interface Attribute {
  id: string;
  name: string;
}

export interface AttributeValue {
  id: string;
  value: string;
  attribute?: Attribute;
}

export interface VariantAttribute {
  id: string;
  attributeValue?: AttributeValue;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: string | number;
  stockQuantity: number;
  stockAlertThreshold: number;
  isDefault: boolean;
  attributes: VariantAttribute[];
}

export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
  media?: ProductMedia[];
  tags?: { id: string; name: string; slug: string }[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  product: DBProduct;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  orderNumber: string;
  placedAt?: string;
  paymentStatus: string;
  status: string;
  discount: number | string;
  total: number | string;
  address?: Address;
  user?: { email: string };
  items?: OrderItem[];
}



export function productSlug(product: Pick<ShopProduct, "name" | "slug">) {
  if (product.slug) return product.slug;
  return product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Resolves product image URLs from the backend API.
 * The backend may store localhost URLs (from local development uploads).
 * These are rewritten to the correct public API host.
 */
export function resolveImageUrl(url: string | undefined | null): string {
  const fallback =
    "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85";

  if (!url) return fallback;

  // Already a public HTTPS URL — pass through unchanged
  if (url.startsWith("https://")) return url;

  if (url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1")) {
    try {
      const parsed = new URL(url);
      return parsed.pathname;
    } catch {
      return fallback;
    }
  }

  return url;
}



export const shopProducts: ShopProduct[] = [
  {
    name: "Juventus 2002/03 training top",
    category: "Football Corner",
    team: "Juventus",
    price: 69,
    color: "Black",
    size: "L",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Manchester United red drill top",
    category: "English Clubs",
    team: "Manchester United",
    price: 59,
    color: "Red",
    size: "M",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Juventus 2012/13 black shirt",
    category: "Football Corner",
    team: "Juventus",
    price: 39,
    color: "Black",
    size: "S",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Juventus 2017/18 track jacket",
    category: "Football Corner",
    team: "Juventus",
    price: 39,
    color: "Yellow",
    size: "XL",
    image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Blackburn Rovers vintage polo",
    category: "English Clubs",
    team: "Blackburn Rovers",
    price: 49,
    color: "Green",
    size: "M",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Juventus navy hooded jacket",
    category: "Football Corner",
    team: "Juventus",
    price: 79,
    color: "Blue",
    size: "L",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Kappa green archive jacket",
    category: "Archive Jackets",
    team: "Kappa",
    price: 89,
    color: "Green",
    size: "XL",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "AC Milan red training jacket",
    category: "Italian Clubs",
    team: "AC Milan",
    price: 65,
    color: "Red",
    size: "M",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Bayern Munich long sleeve jersey",
    category: "European Clubs",
    team: "Bayern Munich",
    price: 98,
    color: "Red",
    size: "XXL",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Blue Italy retro polo shirt",
    category: "National Teams",
    team: "Italy",
    price: 45,
    color: "Blue",
    size: "S",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Liverpool red match vest",
    category: "English Clubs",
    team: "Liverpool",
    price: 49,
    color: "Red",
    size: "L",
    image: "https://images.unsplash.com/photo-1506629905607-d9d297d19e35?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Germany white training jersey",
    category: "National Teams",
    team: "Germany",
    price: 72,
    color: "White",
    size: "M",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Roma orange goalkeeper top",
    category: "Italian Clubs",
    team: "Roma",
    price: 55,
    color: "Orange",
    size: "XL",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Inter black travel jacket",
    category: "Italian Clubs",
    team: "Inter",
    price: 84,
    color: "Black",
    size: "L",
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Chelsea blue stadium shirt",
    category: "English Clubs",
    team: "Chelsea",
    price: 58,
    color: "Sky Blue",
    size: "S",
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Arsenal maroon anthem jacket",
    category: "English Clubs",
    team: "Arsenal",
    price: 76,
    color: "Brown",
    size: "M",
    image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Paris black warm-up top",
    category: "European Clubs",
    team: "Paris Saint-Germain",
    price: 68,
    color: "Black",
    size: "XL",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Ajax white away jersey",
    category: "European Clubs",
    team: "Ajax",
    price: 64,
    color: "White",
    size: "M",
    image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Fiorentina purple track top",
    category: "Italian Clubs",
    team: "Fiorentina",
    price: 62,
    color: "Purple",
    size: "L",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Lazio sky blue vintage shirt",
    category: "Italian Clubs",
    team: "Lazio",
    price: 57,
    color: "Sky Blue",
    size: "S",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=85",
  },
];
