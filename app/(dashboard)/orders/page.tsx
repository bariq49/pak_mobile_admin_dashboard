"use client";

import { useState, useMemo } from "react";
import { useAllOrdersQuery, useUpdateOrderStatusMutation, useUpdateOrderMutation } from "@/hooks/api/use-dashboard-api";
import type { Order } from "@/api/dashboard/dashboard.transformers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderFilters from "@/app/(dashboard)/dashboard/components/orders/order-filters";
import OrderDetailsModal from "@/app/(dashboard)/dashboard/components/orders/order-details-modal";
import OrderStatusBadge from "@/app/(dashboard)/dashboard/components/orders/order-status-badge";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "sonner";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const limit = 20;

  // Fetch orders
  const { data: ordersData, isLoading, isError, refetch } = useAllOrdersQuery(
    page,
    limit,
    "new_arrival"
  );

  // Status update mutations
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const updateOrderMutation = useUpdateOrderMutation();

  // Filter and search orders on frontend
  const filteredOrders = useMemo(() => {
    if (!ordersData?.orders) return [];

    let filtered = ordersData.orders;

    // Filter out orders with invalid IDs to prevent duplicate key issues
    filtered = filtered.filter(
      (order) => order._id || order.id || order.orderNumber
    );

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) =>
          (order.orderStatus || order.status)?.toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(query) ||
          order.customerName?.toLowerCase().includes(query) ||
          order.customerEmail?.toLowerCase().includes(query) ||
          order.user?.name?.toLowerCase().includes(query) ||
          order.user?.email?.toLowerCase().includes(query) ||
          order.trackingNumber?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [ordersData?.orders, statusFilter, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleOrderUpdated = () => {
    refetch();
    setIsDetailsModalOpen(false);
  };

  // Quick status update handler
  const handleQuickStatusUpdate = async (orderId: string, newStatus: string, currentStatus: string) => {
    if (newStatus === currentStatus) return;

    // Validate orderId is not empty
    if (!orderId || orderId.trim() === '') {
      console.error('Order ID is missing in handleQuickStatusUpdate');
      toast.error("Error: Order ID is missing. Cannot update status.");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: newStatus,
      });
      toast.success("Order status updated successfully");
      refetch();
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      toast.error(error.message || "Failed to update order status");
    }
  };

  // Get available next statuses based on current status
  const getAvailableStatuses = (currentStatus: string): string[] => {
    const statusFlow = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = statusFlow.indexOf(currentStatus.toLowerCase());
    
    if (currentIndex === -1) {
      // If status is cancelled or unknown, return all statuses
      return ["pending", "processing", "shipped", "delivered", "cancelled"];
    }
    
    // Can move forward in the flow or stay at current
    return statusFlow.slice(currentIndex);
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Calculate pagination for filtered results
  const totalFiltered = filteredOrders.length;
  const totalPages = Math.ceil(totalFiltered / limit);
  const startIndex = (page - 1) * limit;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);

  if (isLoading && !ordersData) {
    return (
      <div className="p-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">
          Manage and track customer orders (
          {ordersData?.total || filteredOrders.length} total)
        </p>
      </div>

      {/* Filters */}
      <OrderFilters
        statusFilter={statusFilter}
        onStatusFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
      />

      {/* Error Message */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          Failed to load orders. Please try again.
        </div>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order, index) => {
                      // Debug: Log first order to see structure
                      if (index === 0 && process.env.NODE_ENV === 'development') {
                        console.log('Sample order object structure:', {
                          _id: order._id,
                          id: order.id,
                          orderNumber: order.orderNumber,
                          allKeys: Object.keys(order),
                          fullOrder: order,
                        });
                      }
                      
                      return (
                        <TableRow 
                          key={order._id || order.id || order.orderNumber || `order-${index}`} 
                          className="hover:bg-gray-50"
                        >
                        <TableCell>
                          <div className="font-medium">{order.orderNumber}</div>
                          {order.trackingNumber && (
                            <div className="text-sm text-gray-500">
                              {order.trackingNumber}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {order.customerName && order.customerName !== "Unknown Customer" 
                              ? order.customerName 
                              : order.user?.name || "Unknown Customer"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customerEmail || order.user?.email || ""}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {order.items
                            ? order.items.reduce(
                                (sum, item) => sum + item.quantity,
                                0
                              )
                            : 0}{" "}
                          items
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.totalAmount || order.amount || 0)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm capitalize">
                            {order.paymentMethod || "N/A"}
                          </div>
                          <div
                            className={`text-sm capitalize ${
                              order.paymentStatus === "paid"
                                ? "text-green-600"
                                : order.paymentStatus === "failed"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {order.paymentStatus || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <OrderStatusBadge
                              status={order.orderStatus || order.status}
                            />
                            {/* Quick Status Update Dropdown */}
                            {order.orderStatus !== "delivered" && 
                             order.orderStatus !== "cancelled" &&
                             order.status !== "delivered" &&
                             order.status !== "cancelled" && (
                               <Select
                                 value={order.orderStatus || order.status}
                                 onValueChange={(newStatus) => {
                                   // Use MongoDB _id or id only (NOT orderNumber - that's just for display)
                                   const orderId = order._id || order.id;
                                   
                                   if (!orderId || orderId.trim() === '') {
                                     console.error('Order ID (_id or id) not found in order object:', order);
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
                                   console.log('Updating order status:', {
                                     orderId,
                                     orderNumber: order.orderNumber,
                                     newStatus,
                                   });

                                   handleQuickStatusUpdate(
                                     orderId,
                                     newStatus,
                                     order.orderStatus || order.status
                                   );
                                 }}
                                 disabled={updateStatusMutation.isPending}
                               >
                                <SelectTrigger className="w-32 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableStatuses(order.orderStatus || order.status).map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(startIndex + limit, totalFiltered)} of{" "}
                    {totalFiltered} orders
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
}

