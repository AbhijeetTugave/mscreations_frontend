import api from "@/lib/api";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  size: string;
  color: string;
  quantity: number;
}

export const cartService = {
  // addToServer(item: CartItem) {
  //   return api.post('/cart/add', item);
  // },
  addToServer(item: CartItem) {
    return api.post("/cart/add", {
      ...item,
      quantity: item.quantity > 0 ? item.quantity : 1,
    });
  },
  fetchServerCart() {
    return api.get("/cart");
  },

  clearServerCart() {
    return api.post("/cart/clear?delete=true");
  },

  syncCart(items: CartItem[]) {
    return api.post("/cart/sync", { items });
  },
};
