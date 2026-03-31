import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService, CartItem } from '@/services/cartService';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types';
type ImageType = {
  url: string;
  public_id: string;
};
interface CartUIItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
  image?: string | ImageType;
  name?: string;
  price?: number;
}

interface CartContextType {
  items: CartUIItem[];
  addToCart: (
    product: Product,
    size: string,
    color: string,
    quantity?: number
  ) => Promise<void>;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    action: 'inc' | 'dec'
  ) => Promise<void>;
  removeFromCart: (
    productId: string,
    size: string,
    color: string
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartUIItem[]>([]);
  const { isAuthenticated } = useAuth();

  /* ================= LOAD CART ================= */
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    loadCart();
  }, [isAuthenticated]);

  const loadCart = async () => {
    const res = await cartService.fetchServerCart();
    const serverItems = res.data.items || [];
    setItems(mapToUI(serverItems));
  };

  const mapToUI = (data: CartItem[]): CartUIItem[] =>
    data.map(i => ({
      product: {
        _id: i.productId,
        productName: i.name,
        sellingPrice: i.price,
        mrp: i.price,
        brand: i.brand,
        images: i.image ? [i.image] : [],
        category: '',
        size: [i.size],
        colors: [i.color],
        stock: 10,
      },
      quantity: i.quantity,
      size: i.size,
      color: i.color,
    }));

  /* ================= ADD ================= */
  const addToCart = async (
    product: Product,
    size: string,
    color: string,
    quantity = 1
  ) => {
    const apiItem: CartItem = {
  productId: product._id,
  name: product.productName,
  brand: product.brand || '',  // ✅ ADD THIS
  price: product.sellingPrice,
  image: product.images?.[0] || '',
  size,
  color,
  quantity,
};

    await cartService.addToServer(apiItem);
    await loadCart(); // refresh from server
  };
  

  /* ================= UPDATE ================= */
 const updateQuantity = async (
  productId: string,
  size: string,
  color: string,
  action: 'inc' | 'dec'
): Promise<void> => {
  const updated = items.map(item => {
    if (
      item.product._id === productId &&
      item.size === size &&
      item.color === color
    ) {
      let newQuantity = item.quantity;

      if (action === 'inc') newQuantity += 1;
      else if (action === 'dec') newQuantity = Math.max(1, newQuantity - 1);

      return { ...item, quantity: newQuantity };
    }
    return item;
  });

  setItems(updated);

  // 🔥 SYNC WITH BACKEND
  await cartService.syncCart(
    updated.map(i => ({
      productId: i.product._id, 
      name: i.product.productName,
      brand: i.product.brand || '',
      price: i.product.sellingPrice,
      image: i.product.images?.[0] || '',
      size: i.size,
      color: i.color,
      quantity: i.quantity,
    }))
  );
};

  /* ================= REMOVE ================= */
  const removeFromCart = async (
    productId: string,
    size: string,
    color: string
  ) => {
    const remaining = items.filter(
      i => !(i.product._id === productId && i.size === size && i.color === color)
    );

    await cartService.syncCart(
     remaining.map(i => ({
  productId: i.product._id,
  name: i.product.productName,
  brand: i.product.brand || '',   // ✅ ADD THIS
  price: i.product.sellingPrice,
  image: i.product.images?.[0] || '',
  size: i.size,
  color: i.color,
  quantity: i.quantity,
}))
    );

    setItems(remaining);
  };

  /* ================= CLEAR ================= */
  const clearCart = async () => {
    await cartService.clearServerCart();
    setItems([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const totalPrice = items.reduce(
    (sum, i) => sum + i.quantity * i.product.sellingPrice,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
