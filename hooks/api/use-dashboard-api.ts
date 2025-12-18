"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Period } from "@/api/dashboard/dashboard.api";
import {
  getDashboardStatsApi,
  getRevenueChartApi,
  getCustomerStatisticsApi,
  getRecentTransactionsApi,
  getRecentOrdersApi,
  getTopProductsApi,
  getTopCustomersApi,
  getVisitorsReportApi,
  getAllOrdersApi,
  getOrderByIdApi,
  updateOrderStatusApi,
  updateOrderApi,
} from "@/api/dashboard/dashboard.api";
import {
  transformDashboardStats,
  transformRevenueChartData,
  transformCustomerStatistics,
  transformTransactions,
  transformOrders,
  transformTopProducts,
  transformTopCustomers,
  transformVisitorsReport,
} from "@/api/dashboard/dashboard.transformers";
import type {
  DashboardStats,
  RevenueChartResponse,
  CustomerStatistics,
  Transaction,
  Order,
  TopProduct,
  TopCustomer,
  VisitorsReportResponse,
} from "@/api/dashboard/dashboard.transformers";

/* ============ DASHBOARD STATS ============ */
export const useDashboardStatsQuery = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      try {
        const response = await getDashboardStatsApi();
        return transformDashboardStats(response);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/* ============ REVENUE CHART ============ */
export const useRevenueChartQuery = (
  period: Period = "30days",
  startDate?: string,
  endDate?: string
) => {
  return useQuery<RevenueChartResponse>({
    queryKey: ["dashboard", "revenue", period, startDate, endDate],
    queryFn: async () => {
      try {
        const response = await getRevenueChartApi(period, startDate, endDate);
        return transformRevenueChartData(response);
      } catch (error) {
        console.error("Error fetching revenue chart:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/* ============ CUSTOMER STATISTICS ============ */
export const useCustomerStatisticsQuery = () => {
  return useQuery<CustomerStatistics>({
    queryKey: ["dashboard", "customers"],
    queryFn: async () => {
      try {
        const response = await getCustomerStatisticsApi();
        return transformCustomerStatistics(response);
      } catch (error) {
        console.error("Error fetching customer statistics:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/* ============ RECENT TRANSACTIONS ============ */
export const useRecentTransactionsQuery = (
  page: number = 1,
  limit: number = 10,
  status?: string,
  paymentMethod?: string
) => {
  return useQuery<{
    transactions: Transaction[];
    total: number;
    page: number;
    pages: number;
  }>({
    queryKey: ["dashboard", "transactions", page, limit, status, paymentMethod],
    queryFn: async () => {
      const response = await getRecentTransactionsApi(
        page,
        limit,
        status,
        paymentMethod
      );
      return transformTransactions(response);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/* ============ RECENT ORDERS ============ */
export const useRecentOrdersQuery = (
  page: number = 1,
  limit: number = 10,
  status?: string,
  sortBy?: string
) => {
  return useQuery<{
    orders: Order[];
    total: number;
    page: number;
    pages: number;
  }>({
    queryKey: ["dashboard", "orders", page, limit, status, sortBy],
    queryFn: async () => {
      const response = await getRecentOrdersApi(page, limit, status, sortBy);
      return transformOrders(response);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/* ============ TOP PRODUCTS ============ */
export const useTopProductsQuery = (limit: number = 10) => {
  return useQuery<{ products: TopProduct[]; total: number }>({
    queryKey: ["dashboard", "top-products", limit],
    queryFn: async () => {
      const response = await getTopProductsApi(limit);
      return transformTopProducts(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/* ============ TOP CUSTOMERS ============ */
export const useTopCustomersQuery = (limit: number = 10) => {
  return useQuery<{ customers: TopCustomer[]; total: number }>({
    queryKey: ["dashboard", "top-customers", limit],
    queryFn: async () => {
      const response = await getTopCustomersApi(limit);
      return transformTopCustomers(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/* ============ VISITORS REPORT ============ */
export const useVisitorsReportQuery = (
  period: Period = "30days",
  startDate?: string,
  endDate?: string
) => {
  return useQuery<{ data: Array<{ date: string; visitors: number; pageViews: number }> }>({
    queryKey: ["dashboard", "visitors", period, startDate, endDate],
    queryFn: async () => {
      try {
        const response = await getVisitorsReportApi(period, startDate, endDate);
        return transformVisitorsReport(response);
      } catch (error) {
        console.error("Error fetching visitors report:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/* ============ ALL ORDERS (ADMIN) ============ */
export const useAllOrdersQuery = (
  page: number = 1,
  limit: number = 20,
  sort_by?: string
) => {
  return useQuery<{
    orders: Order[];
    total: number;
    page: number;
    pages: number;
  }>({
    queryKey: ["orders", "all", page, limit, sort_by],
    queryFn: async () => {
      const response = await getAllOrdersApi(page, limit, sort_by);
      return transformOrders(response);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/* ============ ORDER BY ID ============ */
export const useOrderByIdQuery = (orderId: string | null) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await getOrderByIdApi(orderId);
      return response.data.order;
    },
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/* ============ UPDATE ORDER STATUS MUTATION ============ */
export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await updateOrderStatusApi(orderId, status);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
};

/* ============ UPDATE ORDER MUTATION ============ */
export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      updates,
    }: {
      orderId: string;
      updates: { paymentStatus?: string; orderStatus?: string };
    }) => {
      return await updateOrderApi(orderId, updates);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
};

