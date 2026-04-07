export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  mainImage: string;
  gallery: string[];
  sizes: string[];
  slug: string;
  createdAt: number;
}

export interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
}
