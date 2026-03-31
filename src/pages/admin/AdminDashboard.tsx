import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Users, ShoppingCart, Package, ArrowUpRight, ArrowDownRight, } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/adminService';
import { socket } from '@/lib/socket';
import EmptyState from '@/components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';
const isThisMonth = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const isLastMonth = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return d.getMonth() === lastMonth && d.getFullYear() === year;
};

const calculateTrend = (current: number, previous: number) => {
  if (previous === 0 && current > 0) {
    return { change: '+100%', trend: 'up' };
  }
  if (previous === 0 && current === 0) {
    return { change: '0%', trend: 'up' };
  }

  const diff = ((current - previous) / previous) * 100;
  return {
    change: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`,
    trend: diff >= 0 ? 'up' : 'down',
  };
};

const AdminDashboard: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);

  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [totalOrders, setTotalOrders] = React.useState(0);
  const [totalCustomers, setTotalCustomers] = React.useState(0);
  const [totalProducts, setTotalProducts] = React.useState(0);
  const [pendingOrders, setPendingOrders] = React.useState(0);
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
  const [trends, setTrends] = React.useState<any>(null);

  /* =======================
     SOCKET (LIVE UPDATES)
  ======================= */
  React.useEffect(() => {
    socket.on('order:new', (order) => {
      setRecentOrders((prev) => [order, ...prev].slice(0, 5));
      setTotalOrders((p) => p + 1);
      if (order.paymentStatus === 'paid') {
        setTotalRevenue((p) => p + order.total);
      }
    });

    socket.on('order:update', (order) => {
      setRecentOrders((prev) =>
        prev.map((o) => (o.orderId === order.orderId ? { ...o, ...order } : o)),
      );
    });

    return () => {
      socket.off('order:new');
      socket.off('order:update');
    };
  }, []);

  /* =======================
     AUTH GUARD
  ======================= */
  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  /* =======================
     LOAD DASHBOARD
  ======================= */
  React.useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [customersRes, productsRes, ordersRes] = await Promise.all([
          adminService.getAllCustomers(),
          adminService.getProducts(),
          adminService.getAllOrders(),
        ]);

        const customers = customersRes.data;
        const products = productsRes.data;
        const orders = ordersRes.data;

        setTotalCustomers(customers.length);
        setTotalProducts(products.length);
        setTotalOrders(orders.length);

        const paidOrders = orders.filter((o: any) => o.paymentStatus === 'paid');
        const revenue = paidOrders.reduce(
          (sum: number, o: any) => sum + (o.total || 0),
          0,
        );
        setTotalRevenue(revenue);

        setPendingOrders(
          orders.filter(
            (o: any) => o.status === 'pending' || o.status === 'processing',
          ).length,
        );

        setRecentOrders(
          [...orders]
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 5),
        );

        /* =======================
           TREND CALCULATION
        ======================= */
        const currentRevenue = orders
          .filter(
            (o: any) =>
              o.paymentStatus === 'paid' && isThisMonth(o.createdAt),
          )
          .reduce((s: number, o: any) => s + o.total, 0);

        const previousRevenue = orders
          .filter(
            (o: any) =>
              o.paymentStatus === 'paid' && isLastMonth(o.createdAt),
          )
          .reduce((s: number, o: any) => s + o.total, 0);

        setTrends({
          revenue: calculateTrend(currentRevenue, previousRevenue),
          orders: calculateTrend(
            orders.filter((o: any) => isThisMonth(o.createdAt)).length,
            orders.filter((o: any) => isLastMonth(o.createdAt)).length,
          ),
          customers: calculateTrend(
            customers.filter((c: any) => isThisMonth(c.createdAt)).length,
            customers.filter((c: any) => isLastMonth(c.createdAt)).length,
          ),
          products: calculateTrend(
            products.filter((p: any) => isThisMonth(p.createdAt)).length,
            products.filter((p: any) => isLastMonth(p.createdAt)).length,
          ),
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading || !trends) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-card animate-pulse h-32" />
          ))}
        </div>
      </AdminLayout>
    );
  }


  /* =======================
     STATS CONFIG
  ======================= */
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(v);

  const stats = [
    {
      name: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      ...trends.revenue,
      icon: IndianRupee,
    },
    {
      name: 'Total Customers',
      value: totalCustomers,
      ...trends.customers,
      icon: Users,
    },
    {
      name: 'Total Orders',
      value: totalOrders,
      ...trends.orders,
      icon: ShoppingCart,
    },
    {
      name: 'Products',
      value: totalProducts,
      ...trends.products,
      icon: Package,
    },
  ];

  const getStatusBadge = (status: string) =>
    status === 'delivered'
      ? 'badge-completed'
      : status === 'cancelled'
        ? 'badge-cancelled'
        : 'badge-pending';

  const getPaymentBadge = (payment: string) =>
    payment === 'paid'
      ? 'badge-completed'
      : payment === 'refunded'
        ? 'badge-cancelled'
        : 'badge-pending';

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back 👋 Here’s a quick snapshot of your store today.
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="stat-card">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span
                  className={`flex items-center text-sm font-medium ${stat.trend === 'up'
                    ? 'text-emerald-600'
                    : 'text-red-600'
                    }`}
                >
                  {stat.change}
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 ml-1" />
                  )}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT ORDERS TABLE */}
        <div className="admin-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl font-bold">Recent Orders</h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon={ShoppingBag}
                        title="No orders yet"
                        description="New orders will appear here as soon as customers start purchasing."
                      />
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/admin/orders?search=${order.orderId}`)}
                      className="border-b border-border/50 cursor-pointer hover:bg-secondary/30"
                    >
                      <td className="py-4 px-4 font-medium">{order.orderId}</td>

                      <td className="py-4 px-4">
                        <p className="font-medium">{order.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.userEmail}
                        </p>
                      </td>

                      <td className="py-4 px-4">₹{order.total}</td>

                      <td className="py-4 px-4">
                        <span className={`badge-status ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`badge-status ${getPaymentBadge(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))

                )}
              </tbody>

            </table>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/admin/products')}
            className="admin-card text-left"
          >
            <Package className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold">Add New Product</h3>
            <p className="text-sm text-muted-foreground">
              Add products to your store inventory
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/orders')}
            className="admin-card text-left"
          >
            <ShoppingCart className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold flex items-center gap-2">
              Pending Orders
              {pendingOrders > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {pendingOrders}
                </span>
              )}
            </h3>

            <p className="text-sm text-muted-foreground">
              Process and manage customer orders
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/customers')}
            className="admin-card text-left"
          >
            <Users className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold">View Customers</h3>
            <p className="text-sm text-muted-foreground">
              Manage registered customers
            </p>
          </button>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
