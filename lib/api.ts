export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  collection: string;
  priceNum: number;
  category: string;
  origin: string;
  subtitle: string;
  description: string;
  teas: Array<{ name: string; description: string }>;
  ingredients: string[];
  galleryImages: string[];
}

/**
 * Service client for products API requests.
 * Decouples storefront components from direct data files to support future API changes seamlessly.
 */
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch product with id: ${id}`);
    return await res.json();
  } catch (error) {
    console.error(`Error fetching product by ID (${id}):`, error);
    return null;
  }
}
