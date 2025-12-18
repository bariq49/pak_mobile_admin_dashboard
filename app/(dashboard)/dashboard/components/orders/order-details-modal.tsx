"use client";

import { useState } from "react";
import type { Order } from "@/api/dashboard/dashboard.transformers";
import { useUpdateOrderStatusMutation, useUpdateOrderMutation } from "@/hooks/api/use-dashboard-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import OrderStatusBadge from "./order-status-badge";
import StatusUpdateModal from "./status-update-modal";
import { toast } from "sonner";

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}: OrderDetailsModalProps) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const updateOrderMutation = useUpdateOrderMutation();

  const handleStatusUpdate = async (
    newStatus: string,
    paymentStatus?: string
  ) => {
    // Use MongoDB _id or id only (NOT orderNumber - that's just for display)
    const orderId = order._id || order.id;
    
    // Validate orderId is not empty
    if (!orderId || orderId.trim() === '') {
      console.error('Order ID (_id or id) is missing in order object:', order);
      console.error('Available order properties:', {
        _id: order._id,
        id: order.id,
        orderNumber: order.orderNumber,
        allKeys: Object.keys(order),
      });
      toast.error("Error: Order ID is missing. Cannot update status.");
      return;
    }
    
    // Debug log to verify we have the correct ID
    console.log('Updating order status from modal:', {
      orderId,
      orderNumber: order.orderNumber,
      newStatus,
      paymentStatus,
    });

    try {
      if (paymentStatus) {
        await updateOrderMutation.mutateAsync({
          orderId,
          updates: {
            orderStatus: newStatus,
            paymentStatus,
          },
        });
      } else {
        await updateStatusMutation.mutateAsync({
          orderId,
          status: newStatus,
        });
      }

      toast.success("Order status updated successfully");
      onOrderUpdated();
      setIsStatusModalOpen(false);
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      toast.error(error.message || "Failed to update order status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const isUpdating = updateStatusMutation.isPending || updateOrderMutation.isPending;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{order.orderNumber}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <OrderStatusBadge status={order.orderStatus || order.status} />
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">
                      {order.customerName || order.user?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">
                      {order.customerEmail || order.user?.email || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">
                      {order.shippingAddress.fullName || "N/A"}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.streetAddress || ""}
                    </p>
                    {order.shippingAddress.apartment && (
                      <p className="text-gray-600">
                        {order.shippingAddress.apartment}
                      </p>
                    )}
                    <p className="text-gray-600">
                      {order.shippingAddress.city || ""}
                      {order.shippingAddress.state
                        ? `, ${order.shippingAddress.state}`
                        : ""}{" "}
                      {order.shippingAddress.postalCode || ""}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.country || ""}
                    </p>
                    {order.shippingAddress.phoneNumber && (
                      <p className="text-gray-600 mt-2">
                        Phone: {order.shippingAddress.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Order Items
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">
                            Product
                          </TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </TableHead>
                          <TableHead className="text-right text-xs font-medium text-gray-500 uppercase">
                            Price
                          </TableHead>
                          <TableHead className="text-right text-xs font-medium text-gray-500 uppercase">
                            Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, index) => (
                          <TableRow key={`${order._id}-item-${index}-${item.name}`}>
                            <TableCell>
                              <div className="flex items-center">
                                {item.image && (
                                  <img
                                    src={
                                      item.image.thumbnail ||
                                      item.image.original ||
                                      item.product?.image ||
                                      ""
                                    }
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded mr-4"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {item.name}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 text-right">
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell className="text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {formatCurrency(order.subtotal || order.amount || 0)}
                    </span>
                  </div>
                  {order.shippingFee !== undefined && order.shippingFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Fee:</span>
                      <span className="font-medium">
                        {formatCurrency(order.shippingFee)}
                      </span>
                    </div>
                  )}
                  {order.discount !== undefined && order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">
                        -{formatCurrency(order.discount)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(order.totalAmount || order.amount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Payment Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Method:</span>
                      <span className="ml-2 font-medium capitalize">
                        {order.paymentMethod || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <Badge
                        className={`ml-2 capitalize ${
                          order.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.paymentStatus || "N/A"}
                      </Badge>
                    </div>
                    {order.paymentIntentId && (
                      <div>
                        <span className="text-gray-600">Payment ID:</span>
                        <span className="ml-2 font-mono text-xs">
                          {order.paymentIntentId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Order Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2">
                        <OrderStatusBadge
                          status={order.orderStatus || order.status}
                        />
                      </span>
                    </div>
                    {order.trackingNumber && (
                      <div>
                        <span className="text-gray-600">Tracking:</span>
                        <span className="ml-2 font-mono text-xs">
                          {order.trackingNumber}
                        </span>
                      </div>
                    )}
                    {order.updatedAt && (
                      <div>
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="ml-2">
                          {formatDate(order.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {order.orderStatus !== "delivered" &&
                  order.orderStatus !== "cancelled" &&
                  order.status !== "delivered" &&
                  order.status !== "cancelled" && (
                    <Button
                      onClick={() => setIsStatusModalOpen(true)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Update Status"}
                    </Button>
                  )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <StatusUpdateModal
          currentStatus={order.orderStatus || order.status}
          currentPaymentStatus={order.paymentStatus || ""}
          paymentMethod={order.paymentMethod || ""}
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          onUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
}

