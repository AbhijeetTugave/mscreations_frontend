import api from '@/lib/api';

export interface Product {
  _id: string;
  productName: string;
  category: string;
  subcategory?: string;
  productType?: string;
  brand?: string;
  mrp: number;
  sellingPrice: number;
  discount?: string;
  stock: number;
  lowStock?: number;
  size: string[];
  colors?: string[];
  shortDesc?: string;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTree {
  [category: string]: {
    [subcategory: string]: string[];
  };
}

export const productService = {
  // Get all products (public)
  getProducts: (params?: Record<string, string>) =>
    api.get<Product[]>('/product', { params }),

  // Get single product (public)
  getProduct: (id: string) =>
    api.get<Product>(`/product/${id}`),

  // Get all categories with tree structure
  getAllCategories: () =>
    api.get<CategoryTree>('/categories/all'),

  // Get category names only
  getCategories: () =>
    api.get<string[]>('/categories'),

  // Get subcategories for a category
  getSubcategories: (category: string) =>
    api.get<string[]>(`/categories/${category}`),

  // Get product types for subcategory
  getProductTypes: (category: string, subcategory: string) =>
    api.get<string[]>(`/categories/${category}/${subcategory}`),
};
