import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { API_URL } from "@/lib/config";

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [animateTotal, setAnimateTotal] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
React.useEffect(() => {
  setTimeout(() => setLoading(false), 500); // simulate loading
}, []);
React.useEffect(() => {
  setAnimateTotal(true);
  const timer = setTimeout(() => setAnimateTotal(false), 300);
  return () => clearTimeout(timer);
}, [totalPrice]);
  const shippingCharge = totalPrice < 1000 ? 80 : 0;
const finalTotal = totalPrice + shippingCharge;
const totalMrp = items.reduce(
  (sum, i) => sum + i.quantity * (i.product.mrp || i.product.sellingPrice),
  0
);


const discount = totalMrp - totalPrice;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    if (loading) {
  return (
    <Layout>
      <div className="container-custom px-4 py-8">
        <div className="animate-pulse space-y-4">

          <div className="h-6 bg-gray-200 rounded w-1/3"></div>

          {[1,2,3].map(i => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg">
              <div className="w-24 h-32 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </Layout>
  );
}
    return (
      <Layout>
        <div className="container-custom px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items yet.
            </p>
            <Link to="/products">
              <Button className="btn-hero">
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ================= CART ITEMS ================= */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const mrp = item.product.mrp || item.product.sellingPrice;
              const selling = item.product.sellingPrice;
              const discount = mrp > selling ? Math.round(((mrp - selling) / mrp) * 100) : 0;

              return (
                <div key={`${item.product._id}-${item.size}-${item.color}`} className="flex gap-4 p-4 bg-card rounded-xl border border-border">
                  {/* IMAGE */}
                  <Link to={`/product/${item.product._id}`} className="w-28 h-36 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                   <img
  src={item.product.images?.[0] || '/placeholder-product.png'}
  alt={item.product.productName}
  className="w-full h-full object-cover"
/>
                    {/* <img src={item.product.images?.[0] ? `${API_URL}/${encodeURI(item.product.images[0])}` : '/placeholder-product.png'} alt={item.product.productName} className="w-full h-full object-cover" /> */}
                  </Link>

                  {/* DETAILS */}
                  <div className="flex-1 flex flex-col">
                    {/* TOP */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span
                          className="font-medium hover:text-primary"
                        >
                          {item.product.productName}
                        </span>

                        <p className="text-xs text-muted-foreground">
                          Brand: {item.product.brand || '—'}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Size: <span className="font-medium">{item.size}</span>
                          {item.color && (
                            <> • Color: <span className="font-medium">{item.color}</span></>
                          )}
                        </p>

                        {item.product.stock <= 5 && (
                          <p className="text-xs text-red-500">
                            Only {item.product.stock} left in stock
                          </p>
                        )}
                      </div>

                      <button onClick={() => removeFromCart(item.product._id, item.size, item.color)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* PRICE */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-semibold text-lg">
                        ₹{selling}
                      </span>

                      {mrp > selling && (
                        <>
                          <span className="text-sm line-through text-muted-foreground">
                            ₹{mrp}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            {discount}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    {/* // QTY + TOTAL */}
                    <div className="flex justify-between items-end mt-auto pt-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.size,
                              item.color,
                              'dec'
                            )
                          }
                          disabled={item.quantity === 1}
                          className="p-2 hover:bg-secondary disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                       <span className="w-10 text-center text-sm transition-all duration-200">
  {item.quantity}
</span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.size,
                              item.color,
                              'inc'
                            )
                          }
                          className="p-2 hover:bg-secondary"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <span className="font-semibold">
                        ₹{(selling * item.quantity).toFixed(2)}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}

            <button
              onClick={clearCart}
              className="text-sm text-muted-foreground hover:text-destructive"
            >
              Clear Cart
            </button>
          </div>
 
          {/* ================= ORDER SUMMARY ================= */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold mb-6">
                Order Summary
              </h2>

             <div className="space-y-3 mb-6 text-sm">

  <div className="flex justify-between">
    <span className="text-muted-foreground">Subtotal</span>
    <span>₹{totalPrice.toFixed(2)}</span>
  </div>

  {discount > 0 && (
    <div className="flex justify-between text-green-600">
      <span>You Saved</span>
      <span>-₹{discount.toFixed(2)}</span>
    </div>
  )}

  <div className="flex justify-between">
    <span className="text-muted-foreground">Shipping Charges</span>
    {shippingCharge === 0 ? (
      <span className="text-green-600">Free</span>
    ) : (
      <span>₹{shippingCharge}</span>
    )}
  </div>

</div>

              <div className="border-t border-border pt-4 mb-4">
  <div className="flex justify-between font-bold text-xl">
    <span>Total</span>
    <span
  className={`text-primary font-bold text-xl transition-transform duration-300 ${
    animateTotal ? 'scale-110' : ''
  }`}
>
  ₹{finalTotal.toFixed(2)}
</span>
  </div>
</div>

              <Button
                onClick={handleCheckout}
                className="w-full btn-hero"
              >
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p
  className={`text-sm text-center mt-3 transition-all duration-300 ${
    animateTotal ? 'scale-105' : ''
  }`}
>
  {totalPrice < 1000 ? (
    <>
      🛍️ Add <span className="text-primary font-semibold">
        ₹{(1000 - totalPrice).toFixed(0)}
      </span>{" "}
     Product more to unlock <span className="text-green-600 font-semibold">FREE delivery</span>
    </>
  ) : (
    <span className="text-green-600 font-semibold">
      🎉 Yay! You unlocked FREE delivery
    </span>
  )}
</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
// testing
