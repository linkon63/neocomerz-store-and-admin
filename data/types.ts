export interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

export interface DropdownItem {
  label: string;
  href: string;
}

export interface NavigationProps {
  navItems: NavItem[];
  sylhetiTeaItems: DropdownItem[];
}

export interface Slide {
  videoId?: string;
  image?: string;
  title: string;
  titleItalic?: string;
  subtitle: string;
  hasDiscount?: boolean;
}

export interface HeroSliderProps {
  slides: Slide[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
}

export interface ProductCarouselProps {
  products: Product[];
}

export interface ExtendedProductCarouselProps {
  products: Product[];
  title: string;
}

export interface ButtonProps {
  href: string;
  label?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "lg";
}

export interface ProductCardProps {
  id?: string;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  slug?: string;
}
