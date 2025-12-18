"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StatusUpdateModalProps {
  currentStatus: string;
  currentPaymentStatus: string;
  paymentMethod: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (orderStatus: string, paymentStatus?: string) => Promise<void>;
}

export default function StatusUpdateModal({
  currentStatus,
  currentPaymentStatus,
  paymentMethod,
  isOpen,
  onClose,
  onUpdate,
}: StatusUpdateModalProps) {
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>(
    currentStatus
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<
    string | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine available next statuses based on current status
  const getAvailableStatuses = (): string[] => {
    const statusFlow = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = statusFlow.indexOf(currentStatus.toLowerCase());

    if (currentIndex === -1) return [currentStatus]; // cancelled or invalid

    // Can move forward or stay in current status
    return statusFlow.slice(currentIndex);
  };

  const availableStatuses = getAvailableStatuses();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      selectedOrderStatus === currentStatus &&
      !selectedPaymentStatus
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdate(selectedOrderStatus, selectedPaymentStatus);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show payment status update option for COD orders when marking as delivered
  const showPaymentStatusUpdate =
    paymentMethod?.toLowerCase() === "cod" &&
    selectedOrderStatus === "delivered" &&
    currentPaymentStatus !== "paid";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Status */}
          <div>
            <Label htmlFor="order-status">Order Status</Label>
            <Select
              value={selectedOrderStatus}
              onValueChange={setSelectedOrderStatus}
            >
              <SelectTrigger id="order-status" className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              Current: {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </p>
          </div>

          {/* Payment Status (for COD when delivering) */}
          {showPaymentStatusUpdate && (
            <div>
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select
                value={selectedPaymentStatus || currentPaymentStatus}
                onValueChange={(value) =>
                  setSelectedPaymentStatus(value as string)
                }
              >
                <SelectTrigger id="payment-status" className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-gray-500">
                Mark payment as paid when order is delivered (COD)
              </p>
            </div>
          )}

          {/* Status Flow Indicator */}
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Status Flow:
            </p>
            <div className="flex items-center gap-2 text-xs">
              {["pending", "processing", "shipped", "delivered"].map(
                (status, index) => {
                  const statusIndex = [
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                  ].indexOf(currentStatus.toLowerCase());
                  const isPast = index <= statusIndex;
                  const isCurrent = status === currentStatus.toLowerCase();
                  const isSelected =
                    status === selectedOrderStatus.toLowerCase();

                  return (
                    <div key={status} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCurrent
                            ? "bg-blue-600 text-white"
                            : isSelected && !isCurrent
                            ? "bg-blue-200 text-blue-800"
                            : isPast
                            ? "bg-green-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <div
                          className={`w-8 h-0.5 ${
                            isPast ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                  );
                }
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Pending</span>
              <span>Processing</span>
              <span>Shipped</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


