export type ProductStatus = 'available' | 'sold_out' | 'hidden';

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  reference: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  material: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  specs: Spec[];
  sizes: string[];
  images: string[];
  status: ProductStatus;
  isNew: boolean;
  isBestseller: boolean;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  whatsappNumber: string;
  whatsappGreeting: string;
  instagramHandle: string;
  location: string;
  categories: string[];
}
