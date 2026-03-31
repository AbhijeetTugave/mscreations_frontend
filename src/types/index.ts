// Product type for API responses
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

// Category with images for display
export interface CategoryDisplay {
  id: string;
  name: string;
  image: string;
}
