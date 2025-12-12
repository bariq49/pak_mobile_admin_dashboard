import type {
  DashboardStatsResponse,
  RevenueChartResponse,
  CustomerStatisticsResponse,
  TransactionsResponse,
  OrdersResponse,
  TopProductsResponse,
  TopCustomersResponse,
  VisitorsReportResponse,
} from "./dashboard.api";

/* ============ TRANSFORMED TYPES ============ */

export interface DashboardStats {
  totalSales: number;
  todayOrders: number;
  completedOrders: number;
  pendingOrders: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface CustomerStatistics {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
}

export interface Transaction {
  _id: string;
  id?: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerImage?: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  id?: string;
  orderNumber: string;
  invoice?: string;
  customerId: string;
  customerName: string;
  username?: string;
  amount: number;
  status: string;
  isComplete?: boolean;
  createdAt: string;
  date?: string;
}

export interface TopProduct {
  _id: string;
  id?: string;
  name: string;
  image?: string;
  sales: number;
  revenue: number;
}

export interface TopCustomer {
  _id: string;
  id?: string;
  name: string;
  email: string;
  image?: string;
  totalOrders: number;
  totalSpent: number;
}

export interface VisitorData {
  date: string;
  visitors: number;
  pageViews: number;
}

/* ============ TRANSFORMATION FUNCTIONS ============ */

/**
 * Transform dashboard stats response to UI-friendly format
 */
export function transformDashboardStats(
  data: DashboardStatsResponse
): DashboardStats {
  return {
    totalSales: data.data.totalSales || 0,
    todayOrders: data.data.todayOrders || 0,
    completedOrders: data.data.completedOrders || 0,
    pendingOrders: data.data.pendingOrders || 0,
  };
}

/**
 * Transform revenue chart data (already in good format, just return data array)
 */
export function transformRevenueChartData(
  data: RevenueChartResponse
): RevenueChartResponse {
  return data;
}

/**
 * Transform customer statistics response to UI-friendly format
 */
export function transformCustomerStatistics(
  data: CustomerStatisticsResponse
): CustomerStatistics {
  return {
    totalCustomers: data.data.totalCustomers || 0,
    newCustomers: data.data.newCustomers || 0,
    activeCustomers: data.data.activeCustomers || 0,
    inactiveCustomers: data.data.inactiveCustomers || 0,
  };
}

/**
 * Transform transactions response to UI-friendly format
 */
export function transformTransactions(
  data: TransactionsResponse
): { transactions: Transaction[]; total: number; page: number; pages: number } {
  return {
    transactions: data.data.transactions || [],
    total: data.data.total || 0,
    page: data.data.page || 1,
    pages: data.data.pages || 1,
  };
}

/**
 * Transform orders response to UI-friendly format
 */
export function transformOrders(
  data: OrdersResponse
): { orders: Order[]; total: number; page: number; pages: number } {
  const orders = (data.data.orders || []).map((order) => ({
    ...order,
    invoice: order.orderNumber,
    username: order.customerName,
    date: new Date(order.createdAt).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    isComplete: order.status === "completed" || order.status === "delivered",
  }));

  return {
    orders,
    total: data.data.total || 0,
    page: data.data.page || 1,
    pages: data.data.pages || 1,
  };
}

/**
 * Transform top products response to UI-friendly format
 */
export function transformTopProducts(
  data: TopProductsResponse
): { products: TopProduct[]; total: number } {
  return {
    products: data.data.products || [],
    total: data.data.total || 0,
  };
}

/**
 * Transform top customers response to UI-friendly format
 */
export function transformTopCustomers(
  data: TopCustomersResponse
): { customers: TopCustomer[]; total: number } {
  return {
    customers: data.data.customers || [],
    total: data.data.total || 0,
  };
}

/**
 * Transform visitors report data (already in good format, just return data array)
 */
export function transformVisitorsReport(
  data: VisitorsReportResponse
): VisitorsReportResponse {
  return data;
}

/**
 * Get default avatar URL for a name
 */
export function getDefaultAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}

