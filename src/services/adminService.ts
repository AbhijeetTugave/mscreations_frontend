import api from "@/lib/api";

export interface ProductData {
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
  colors: string[];
  shortDesc?: string;
  // images: string[];
  images: { url: string; public_id: string }[];
}

export interface ProductResponse {
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
  colors: string[];
  shortDesc?: string;
  // images: string[];
  images: { url: string; public_id: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  sellingPrice?: number;
  size: string;
  color: string;
  image?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus:
    | "paid"
    | "unpaid"
    | "pending"
    | "verification_pending"
    | "refunded";
  paid: boolean;
  shippingAddress: ShippingAddress | string;
  paymentMethod?: string;
  meta?: {
    paymentScreenshot?: string; // ✅ ADD THIS
    upiTxnId?: string;
    upiNote?: string;
    paymentSubmittedAt: string;
  };
  createdAt: string;
}

export interface CustomerResponse {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;

  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export const adminService = {
  // Products
  getProducts: (params?: Record<string, string>) =>
    api.get<ProductResponse[]>("/product", { params }),

  getProduct: (id: string) => api.get<ProductResponse>(`/product/${id}`),

  createProduct: (data: ProductData) =>
    api.post<ProductResponse>("/product", data),

  updateProduct: (id: string, data: Partial<ProductData>) =>
    api.put<ProductResponse>(`/product/${id}`, data),

  deleteProduct: (id: string) => api.delete(`/product/${id}`),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<{ url: string; public_id: string }>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Orders
  getAllOrders: () => api.get<Order[]>("/orders/admin/all"),

  updateOrder: (
    orderId: string,
    data: { status?: string; paymentStatus?: string },
  ) => api.post<Order>(`/orders/admin/update/${orderId}`, data),

  // Customers
  getAllCustomers: () => api.get<CustomerResponse[]>("/users"),

  // Categories
  getCategories: () => api.get<string[]>("/categories"),

  getSubcategories: (category: string) =>
    api.get<string[]>(`/categories/${category}`),

  getProductTypes: (category: string, subcategory: string) =>
    api.get<string[]>(`/categories/${category}/${subcategory}`),
};
