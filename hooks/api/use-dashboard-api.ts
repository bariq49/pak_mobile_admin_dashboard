"use client";

import { useQuery } from "@tanstack/react-query";
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
      const response = await getDashboardStatsApi();
      return transformDashboardStats(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      const response = await getRevenueChartApi(period, startDate, endDate);
      return transformRevenueChartData(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/* ============ CUSTOMER STATISTICS ============ */
export const useCustomerStatisticsQuery = () => {
  return useQuery<CustomerStatistics>({
    queryKey: ["dashboard", "customers"],
    queryFn: async () => {
      const response = await getCustomerStatisticsApi();
      return transformCustomerStatistics(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  return useQuery<VisitorsReportResponse>({
    queryKey: ["dashboard", "visitors", period, startDate, endDate],
    queryFn: async () => {
      const response = await getVisitorsReportApi(period, startDate, endDate);
      return transformVisitorsReport(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

