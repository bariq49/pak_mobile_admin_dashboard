import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";

/* ============ TYPES ============ */

export type Period = "30days" | "12months" | "custom";

export interface DashboardStatsResponse {
  status: string;
  data: {
    totalSales: number;
    todayOrders: number;
    completedOrders: number;
    pendingOrders: number;
  };
}

export interface RevenueChartResponse {
  status: string;
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface CustomerStatisticsResponse {
  status: string;
  data: {
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
  };
}

export interface TransactionsResponse {
  status: string;
  data: {
    transactions: Array<{
      _id: string;
      orderNumber: string;
      customerId: string;
      customerName: string;
      customerImage?: string;
      amount: number;
      paymentMethod: string;
      status: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    pages: number;
  };
}

export interface OrdersResponse {
  status: string;
  data: {
    orders: Array<{
      _id: string;
      orderNumber: string;
      customerId: string;
      customerName: string;
      amount: number;
      status: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    pages: number;
  };
}

export interface TopProductsResponse {
  status: string;
  data: {
    products: Array<{
      _id: string;
      name: string;
      image?: string;
      sales: number;
      revenue: number;
    }>;
    total: number;
  };
}

export interface TopCustomersResponse {
  status: string;
  data: {
    customers: Array<{
      _id: string;
      name: string;
      email: string;
      image?: string;
      totalOrders: number;
      totalSpent: number;
    }>;
    total: number;
  };
}

export interface VisitorsReportResponse {
  status: string;
  data: Array<{
    date: string;
    visitors: number;
    pageViews: number;
  }>;
}

/* ============ API FUNCTIONS ============ */

/**
 * Get dashboard statistics
 */
export async function getDashboardStatsApi(): Promise<DashboardStatsResponse> {
  const { data } = await http.get<DashboardStatsResponse>(
    API_RESOURCES.DASHBOARD_STATS
  );
  return data;
}

/**
 * Get revenue chart data
 * @param period - Time period: "30days" | "12months" | "custom"
 * @param startDate - Start date (required if period is "custom")
 * @param endDate - End date (required if period is "custom")
 */
export async function getRevenueChartApi(
  period: Period = "30days",
  startDate?: string,
  endDate?: string
): Promise<RevenueChartResponse> {
  const params: Record<string, string> = { period };
  
  if (period === "custom" && startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }

  const { data } = await http.get<RevenueChartResponse>(
    API_RESOURCES.DASHBOARD_REVENUE,
    { params }
  );
  return data;
}

/**
 * Get customer statistics
 */
export async function getCustomerStatisticsApi(): Promise<CustomerStatisticsResponse> {
  const { data } = await http.get<CustomerStatisticsResponse>(
    API_RESOURCES.DASHBOARD_CUSTOMERS
  );
  return data;
}

/**
 * Get recent transactions
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param status - Filter by status (optional)
 * @param paymentMethod - Filter by payment method (optional)
 */
export async function getRecentTransactionsApi(
  page: number = 1,
  limit: number = 10,
  status?: string,
  paymentMethod?: string
): Promise<TransactionsResponse> {
  const params: Record<string, string | number> = { page, limit };
  
  if (status) params.status = status;
  if (paymentMethod) params.paymentMethod = paymentMethod;

  const { data } = await http.get<TransactionsResponse>(
    API_RESOURCES.DASHBOARD_TRANSACTIONS,
    { params }
  );
  return data;
}

/**
 * Get recent orders
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param status - Filter by status (optional)
 * @param sortBy - Sort field (optional)
 */
export async function getRecentOrdersApi(
  page: number = 1,
  limit: number = 10,
  status?: string,
  sortBy?: string
): Promise<OrdersResponse> {
  const params: Record<string, string | number> = { page, limit };
  
  if (status) params.status = status;
  if (sortBy) params.sortBy = sortBy;

  const { data } = await http.get<OrdersResponse>(
    API_RESOURCES.DASHBOARD_ORDERS,
    { params }
  );
  return data;
}

/**
 * Get top products
 * @param limit - Number of products to return (default: 10)
 */
export async function getTopProductsApi(
  limit: number = 10
): Promise<TopProductsResponse> {
  const { data } = await http.get<TopProductsResponse>(
    API_RESOURCES.DASHBOARD_TOP_PRODUCTS,
    { params: { limit } }
  );
  return data;
}

/**
 * Get top customers
 * @param limit - Number of customers to return (default: 10)
 */
export async function getTopCustomersApi(
  limit: number = 10
): Promise<TopCustomersResponse> {
  const { data } = await http.get<TopCustomersResponse>(
    API_RESOURCES.DASHBOARD_TOP_CUSTOMERS,
    { params: { limit } }
  );
  return data;
}

/**
 * Get visitors report
 * @param period - Time period: "30days" | "12months" | "custom"
 * @param startDate - Start date (required if period is "custom")
 * @param endDate - End date (required if period is "custom")
 */
export async function getVisitorsReportApi(
  period: Period = "30days",
  startDate?: string,
  endDate?: string
): Promise<VisitorsReportResponse> {
  const params: Record<string, string> = { period };
  
  if (period === "custom" && startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }

  const { data } = await http.get<VisitorsReportResponse>(
    API_RESOURCES.DASHBOARD_VISITORS,
    { params }
  );
  return data;
}

