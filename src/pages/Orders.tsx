import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { orderService } from '@/services/orderService';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { API_URL } from "@/lib/config";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getOrders();
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          Loading your orders...
        </div>
      </Layout>
    );
  }

  if (!orders.length) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <ShoppingBag className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h2 className="font-semibold text-xl mb-2">No Orders Found</h2>
          <p className="text-muted-foreground mb-6">
            You haven’t placed any orders yet.
          </p>
          <Link to="/products">
            <Button className="btn-hero">Start Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
  <Layout>
    <div className="container-custom max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        My Orders
      </h1>

      <div className="space-y-6">
        {orders.map(order => (
          <div
            key={order._id}
            className="bg-white border rounded-2xl shadow-sm p-4 sm:p-6"
          >
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-medium text-sm sm:text-base">
                  {order.orderId}
                </p>

                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-semibold text-base sm:text-lg">
                  ₹{order.total}
                </p>
              </div>
            </div>

            {/* ITEMS */}
            <div className="mt-5 space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex gap-3 sm:gap-4 items-start"
                >
                  <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="text-sm font-semibold whitespace-nowrap">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-6 pt-4 border-t">
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                  order.status === 'delivered'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {order.status.toUpperCase()}
              </span>

              <Link to={`/orders/${order.orderId}`} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Layout>
);
};

export default Orders;
