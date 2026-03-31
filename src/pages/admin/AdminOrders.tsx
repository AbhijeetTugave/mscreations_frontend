import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Package, Search } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminService, Order } from '@/services/adminService';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from "@/lib/config";

/* ================= CONSTANTS ================= */
const PAGE_SIZES = [10, 20, 50];

const AdminOrders = () => {
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editStatus, setEditStatus] =
    useState<Order['status']>('pending');
  const [editPayment, setEditPayment] =
    useState<Order['paymentStatus']>('unpaid');

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const res = await adminService.getAllOrders();
    setOrders(res.data);
  };

  /* ================= FILTER ================= */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'all' || o.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  /* ================= MODAL ================= */
  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditPayment(order.paymentStatus);
  };

  const updateOrder = async () => {
  if (!selectedOrder) return;

  let finalPaymentStatus = editPayment;

  // ================= BUSINESS RULES =================

  // If delivered → must be paid
  if (editStatus === "delivered") {
    finalPaymentStatus = "paid";
  }

  // If cancelled → check previous payment
  if (editStatus === "cancelled") {
    if (selectedOrder.paymentStatus === "paid") {
      finalPaymentStatus = "refunded";
    } else {
      finalPaymentStatus = "unpaid";
    }
  }

  await adminService.updateOrder(selectedOrder.orderId, {
    status: editStatus,
    paymentStatus: finalPaymentStatus,
  });

  toast({
    title: "Order updated",
    description: "Status & payment handled correctly",
  });

  setSelectedOrder(null);
  loadOrders();
};

  /* ================= COLORS ================= */
  const statusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  const paymentColor = (payment: string) => {
    switch (payment) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700';
      case 'refunded':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* ================= HEADER ================= */}
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders
          </p>
        </div>

        {/* ================= FILTERS ================= */}
        <div className="flex gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ================= TABLE ================= */}
        <div className="admin-card overflow-auto max-h-[100vh]">
          <table className="w-full table-fixed">
            <thead className="sticky top-0 bg-background z-1 border-b">
              <tr className="font-medium ">
                <th className="py-3 w-12 text-center">#</th>
                <th className="w-[180px] text-center">Order ID</th>
                <th className="w-[260px] text-center">Customer</th>
                <th className="w-[140px] text-center">Amount</th>
                <th className="w-[140px] text-center">Status</th>
                <th className="w-[140px] text-center">Payment</th>
                <th className="w-[120px] text-center">Action</th>
              </tr>

            </thead>

            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Package}
                      title={orders.length === 0 ? 'No orders yet' : 'No orders found'}

                      description={
                        orders.length === 0 ? 'Orders will appear here once customers start placing them.' : 'Try changing your search or filter criteria.'}
                    />
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o, index) => (
                  <tr key={o._id} className="border-b hover:bg-secondary/30">
                    <td className="text-center">
                      {(page - 1) * pageSize + index + 1}
                    </td>

                    <td className="text-center">
                      {o.orderId}
                    </td>

                    <td className="text-center">
                      <p className="font-medium">{o.userName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {o.userEmail}
                      </p>
                    </td>

                    <td className="text-center">
                      ₹{o.total.toFixed(2)}
                    </td>

                    <td className="text-center">
                      <span className={`px-3 py-1 rounded-full text-xs ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>

                    <td className="text-center">
                      <span className={`px-3 py-1 rounded-full text-xs ${paymentColor(o.paymentStatus)}`}>
                        {o.paymentStatus}
                      </span>
                    </td>

                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openModal(o)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages || 1}
          </p>

          <div className="flex items-center gap-3">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[100vh] overflow-y-auto animate-in zoom-in-95">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Order {selectedOrder.orderId}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </DialogHeader>

              {/* ================= ORDER META ================= */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium sm:text-right">{selectedOrder.paymentMethod}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs ${paymentColor(
                      selectedOrder.paymentStatus
                    )}`}
                  >
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              {/* ================= STATUS EDIT ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Status</p>
                  <Select
                    value={editStatus}
                    onValueChange={(v) =>
                      setEditStatus(v as Order['status'])
                    }
                  >
                    <SelectTrigger className={statusColor(editStatus)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Payment</p>
                  <Select
                    value={editPayment}
                    onValueChange={(v) =>
                      setEditPayment(v as Order['paymentStatus'])
                    }
                  >
                    <SelectTrigger className={paymentColor(editPayment)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
  <SelectItem value="paid">Paid</SelectItem>
  <SelectItem value="unpaid">Unpaid</SelectItem>

  {editStatus === "cancelled" && (
    <SelectItem value="refunded">Refunded</SelectItem>
  )}
</SelectContent>
                  </Select>
                </div>
              </div>

              {/* ================= CUSTOMER + SHIPPING ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {/* CUSTOMER INFO */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Customer Info</h4>

                  <div className="text-sm space-y-1">
                    <p className="font-medium sm:text-right">{selectedOrder.userName}</p>

                    <p className="text-muted-foreground">
                      📧 {selectedOrder.userEmail}
                    </p>

                    <p className="text-muted-foreground">
                      🆔 {selectedOrder.userId}
                    </p>
                  </div>
                </div>

                {/* SHIPPING ADDRESS */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Shipping Address</h4>

                  {typeof selectedOrder.shippingAddress === 'string' ? (
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.shippingAddress}
                    </p>
                  ) : (
                    <div className="text-sm space-y-1">
                      <p className="font-medium sm:text-right">
                        {selectedOrder.shippingAddress.fullName}
                      </p>

                      <p className="text-muted-foreground">
                        📞 {selectedOrder.shippingAddress.mobile}
                      </p>

                      <p>
                        {selectedOrder.shippingAddress.addressLine1}
                        {selectedOrder.shippingAddress.addressLine2 && (
                          <> , {selectedOrder.shippingAddress.addressLine2}</>
                        )}
                      </p>

                      <p>
                        {selectedOrder.shippingAddress.city},{' '}
                        {selectedOrder.shippingAddress.state} –{' '}
                        {selectedOrder.shippingAddress.postalCode}
                      </p>

                      <p className="text-muted-foreground">
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ================= ITEMS ================= */}
              <div>
                <h4 className="font-semibold mb-3">Items</h4>

                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 rounded-lg bg-secondary/40">
                      <div className="flex gap-3 items-center">

                        {/* PRODUCT IMAGE */}
                        {/* <img src={item.image ? `${API_URL}/${encodeURI(item.image)}` : "/placeholder-product.png"} alt={item.productName} className="w-14 h-14 rounded-md object-cover border" /> */}
                        <img
                      src={item.image || '/placeholder.svg'}
                      // alt={item.name}
                      // className="w-full h-full object-cover"
                      className="w-14 h-14 rounded-md object-cover border"
                    />

                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty {item.quantity} • Size {item.size || '—'}
                          </p>
                        </div>
                      </div>

                      <p className="font-medium sm:text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}

                </div>
              </div>

              {/* ================= TOTAL ================= */}
              <div className="flex justify-between items-center border-t pt-4">
                <span className="font-medium">Total Amount</span>
                <span className="text-xl font-bold">
                  ₹{selectedOrder.total.toFixed(2)}
                </span>
              </div>
              {/* ================= PAYMENT SCREENSHOT ================= */}
              {selectedOrder.meta?.paymentScreenshot && (
                <div className="border rounded-lg p-4 space-y-2">
                  <p className="text-sm">
  <span className="font-medium">UPI Txn ID:</span> {selectedOrder.meta?.upiTxnId}
</p>
<p className="text-xs text-muted-foreground">
  Submitted at: {new Date(selectedOrder.meta?.paymentSubmittedAt).toLocaleString()}
</p>
{selectedOrder.meta?.upiNote && (
  <p className="text-xs">
    <span className="font-medium">UPI Note:</span> {selectedOrder.meta.upiNote}
  </p>
)}
                  <h4 className="font-semibold text-sm">Payment Screenshot</h4>

                  <a
                    href={selectedOrder.meta.paymentScreenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <img
                      src={selectedOrder.meta.paymentScreenshot}
                      alt="Payment Screenshot"
                      className="w-[100px] h-[100px] object-cover rounded-md border cursor-pointer"
                    />
                  </a>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={async () => {
                        await adminService.updateOrder(selectedOrder.orderId, {
                          paymentStatus: 'paid',
                        });
                        toast({ title: 'Payment marked as PAID' });
                        setSelectedOrder(null);
                        loadOrders();
                      }}
                    >
                      Approve Payment
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        await adminService.updateOrder(selectedOrder.orderId, {
                          paymentStatus: 'unpaid',
                        });
                        toast({ title: 'Payment rejected' });
                        setSelectedOrder(null);
                        loadOrders();
                      }}
                    >
                      Reject
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Click image to view full size
                  </p>
                </div>
              )}


              <Button className="w-full mt-2" onClick={updateOrder}>
                Update Order
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
};

export default AdminOrders;
