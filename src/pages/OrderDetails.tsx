import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { orderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/config";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrderDetails: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrder(orderId);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  // ================= SIMPLE CLEAN INVOICE =================
  const downloadInvoice = () => {
    if (!order) return;

    const doc = new jsPDF();

    // Company Header
    doc.setFontSize(18);
    doc.text("MS CREATIONS", 14, 20);

    doc.setFontSize(10);
    doc.text("Email: mscreations3010@gmail.com", 14, 28);

    // Invoice Info
    doc.setFontSize(14);
    doc.text("INVOICE", 150, 20);

    doc.setFontSize(11);
    doc.text(`Invoice No: ${order.orderId}`, 150, 28);
    doc.text(
      `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
      150,
      34
    );
    doc.text(
      `Payment Status: ${order.paymentStatus?.toUpperCase() || "PENDING"}`,
      150,
      40
    );

    // Bill To
    doc.setFontSize(12);
    doc.text("Bill To:", 14, 45);

    doc.setFontSize(11);
    doc.text(order.shippingAddress?.fullName || order.userName || "-", 14, 53);
    doc.text(order.shippingAddress?.addressLine1 || "-", 14, 59);
    doc.text(order.shippingAddress?.addressLine2 || "", 14, 65);
    doc.text(
      `${order.shippingAddress?.city || ""}, ${
        order.shippingAddress?.state || ""
      } - ${order.shippingAddress?.postalCode || ""}`,
      14,
      71
    );
    doc.text(`Phone: ${order.shippingAddress?.mobile || "-"}`, 14, 77);

    // Items Table
    autoTable(doc, {
      startY: 85,
      head: [["Product", "Price", "Qty", "Total"]],
      body: order.items.map((item: any) => [
        item.name,
        `Rs. ${item.price}`,
        item.quantity,
        `Rs. ${item.price * item.quantity}`,
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [240, 240, 240], textColor: 0 },
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // Total
    doc.setFontSize(12);
    doc.text(`Grand Total: Rs. ${order.total}`, 140, finalY + 15);

    // Thank You Message
    doc.setFontSize(10);
    doc.text(
      "Thank you for trusting MS CREATIONS.",
      14,
      finalY + 30
    );
    doc.text(
      "We truly appreciate your business and hope to serve you again soon.",
      14,
      finalY + 36
    );

    doc.save(`Invoice-${order.orderId}.pdf`);
  };

  if (loading)
    return (
      <Layout>
        <div className="text-center py-20">Loading...</div>
      </Layout>
    );

  if (!order)
    return (
      <Layout>
        <div className="text-center py-20">Order not found</div>
      </Layout>
    );

  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";

  return (
    <Layout>
      <div className="container-custom max-w-6xl py-8 space-y-6">

        {/* HEADER */}
        <div
          className={`relative rounded-xl shadow-sm p-6 border overflow-hidden
          ${
            isCancelled
              ? "bg-red-50 border-red-200"
              : isDelivered
              ? "bg-green-50 border-green-200"
              : "bg-white"
          }`}
        >
          {isCancelled && (
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <span className="text-red-600 text-5xl font-extrabold rotate-[-20deg]">
                CANCELLED
              </span>
            </div>
          )}

          {isDelivered && (
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <span className="text-green-600 text-5xl font-extrabold rotate-[-20deg]">
                DELIVERED
              </span>
            </div>
          )}

          <h1 className="text-2xl font-bold relative z-10">
            Order #{order.orderId}
          </h1>
          <p className="text-muted-foreground relative z-10">
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ITEMS */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="font-semibold text-lg mb-4">Items</h2>

            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4 border-b pb-4">
                  <div className="w-20 h-24 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Rs. {item.price} × {item.quantity}
                    </p>
                  </div>

                  <div className="font-semibold">
                    Rs. {item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUMMARY */}
          <div className="space-y-6">

            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {order.total}</span>
                </div>

                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span>{order.paymentMethod}</span>
                </div>

                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <span>{order.paymentStatus}</span>
                </div>

                <div className="flex justify-between font-bold text-base border-t pt-3 mt-3">
                  <span>Total</span>
                  <span>Rs. {order.total}</span>
                </div>
              </div>
            </div>

            {isDelivered && (
              <Button onClick={downloadInvoice} className="w-full">
                Download Invoice
              </Button>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetails;