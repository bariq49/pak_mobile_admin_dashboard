import type {
  DashboardStatsResponse,
  RevenueChartResponse as RevenueChartResponseApi,
  CustomerStatisticsResponse,
  TransactionsResponse,
  OrdersResponse,
  TopProductsResponse as TopProductsResponseApi,
  TopCustomersResponse as TopCustomersResponseApi,
  VisitorsReportResponse,
} from "./dashboard.api";

// Re-export API response types that are used directly
export type { VisitorsReportResponse } from "./dashboard.api";

// Transformed visitors report type
export interface TransformedVisitorsReport {
  data: Array<{
    date: string;
    visitors: number;
    pageViews: number;
  }>;
}

// Revenue chart response after transformation
export interface RevenueChartResponse {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

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
  totalAmount?: number; // Backend sends this field
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
  try {
    // Handle case where data might be directly the stats object
    if (!data) {
      console.warn("Dashboard stats data is null or undefined");
      return {
        totalSales: 0,
        todayOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
      };
    }

    // Check if data.data exists and has stats
    let stats = null;
    if (data.data?.stats) {
      stats = data.data.stats;
    } else if (data.data && typeof data.data === 'object' && 'revenue' in data.data) {
      // Handle case where stats might be directly in data.data
      stats = data.data as any;
    } else if ((data as any).stats) {
      // Handle case where stats might be directly in data (fallback)
      stats = (data as any).stats;
    }

    if (!stats) {
      console.warn("Dashboard stats structure not found. Received:", data);
      return {
        totalSales: 0,
        todayOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
      };
    }

    return {
      totalSales: stats.revenue?.total || 0,
      todayOrders: stats.orders?.today || 0,
      completedOrders: stats.orders?.paid || 0, // Backend uses 'paid' for completed orders
      pendingOrders: stats.orders?.pending || 0,
    };
  } catch (error) {
    console.error("Error transforming dashboard stats:", error, data);
    return {
      totalSales: 0,
      todayOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
    };
  }
}

/**
 * Transform revenue chart data to UI-friendly format
 */
export function transformRevenueChartData(
  data: RevenueChartResponseApi
): RevenueChartResponse {
  if (!data || !data.data) {
    return {
      data: [],
    };
  }

  return {
    data: data.data.revenueData || [],
  };
}

/**
 * Transform customer statistics response to UI-friendly format
 */
export function transformCustomerStatistics(
  data: CustomerStatisticsResponse
): CustomerStatistics {
  if (!data || !data.data || !data.data.stats) {
    return {
      totalCustomers: 0,
      newCustomers: 0,
      activeCustomers: 0,
      inactiveCustomers: 0,
    };
  }

  const stats = data.data.stats;
  return {
    totalCustomers: stats.total || 0,
    newCustomers: stats.new?.thisMonth || 0, // Use thisMonth for new customers
    activeCustomers: stats.active || 0,
    inactiveCustomers: stats.segments?.noOrders || 0, // Customers with no orders
  };
}

/**
 * Transform transactions response to UI-friendly format
 */
export function transformTransactions(
  data: TransactionsResponse
): { transactions: Transaction[]; total: number; page: number; pages: number } {
  if (!data || !data.data) {
    return {
      transactions: [],
      total: 0,
      page: 1,
      pages: 1,
    };
  }

  const transactions = (data.data.transactions || []).map((tx) => ({
    _id: tx?.id || "",
    id: tx?.id || "",
    orderNumber: tx?.orderNumber || "",
    customerId: tx?.customer?.email || "",
    customerName: tx?.customer?.name || "N/A",
    customerImage: undefined,
    amount: tx?.amount || 0,
    paymentMethod: tx?.paymentMethod || "",
    status: tx?.status || "",
    createdAt: tx?.date || "",
  }));

  const pagination = data.data.pagination;
  return {
    transactions,
    total: pagination?.total || transactions.length, // Use actual transactions length if total is 0
    page: pagination?.page || 1,
    pages: pagination?.pages || 1,
  };
}

/**
 * Transform orders response to UI-friendly format
 */
export function transformOrders(
  data: OrdersResponse
): { orders: Order[]; total: number; page: number; pages: number } {
  if (!data || !data.data) {
    return {
      orders: [],
      total: 0,
      page: 1,
      pages: 1,
    };
  }

  const orders = (data.data.orders || []).map((order) => {
    const createdAt = order?.createdAt || new Date().toISOString();
    let dateStr = "N/A";
    try {
      const dateObj = new Date(createdAt);
      if (!isNaN(dateObj.getTime())) {
        dateStr = dateObj.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch {
      // Keep "N/A" if date parsing fails
    }

    return {
      _id: order?.id || "",
      id: order?.id || "",
      orderNumber: order?.orderNumber || "",
      invoice: order?.orderNumber || "",
      customerId: order?.customer?.email || "",
      customerName: order?.customer?.name || "N/A",
      username: order?.customer?.name || "N/A",
      amount: order?.totalAmount || 0,
      totalAmount: order?.totalAmount,
      status: order?.orderStatus || "",
      isComplete: order?.orderStatus === "completed" || order?.orderStatus === "delivered",
      createdAt,
      date: dateStr,
    };
  });

  const pagination = data.data.pagination;
  return {
    orders,
    total: pagination?.total || 0,
    page: pagination?.page || 1,
    pages: pagination?.pages || 1,
  };
}

/**
 * Transform top products response to UI-friendly format
 */
export function transformTopProducts(
  data: TopProductsResponseApi
): { products: TopProduct[]; total: number } {
  if (!data || !data.data) {
    return {
      products: [],
      total: 0,
    };
  }

  const products = (data.data.topProducts || [])
    .filter((item: any) => item && item.product !== null && item.product !== undefined)
    .map((item: any) => ({
      _id: item.product?._id || "",
      id: item.product?._id || "",
      name: item.product?.name || "Unknown Product",
      image: item.product?.mainImage || undefined,
      sales: item.salesCount || item.totalSold || 0, // Use salesCount from backend (matches API response)
      revenue: item.revenue || 0,
    }));

  return {
    products,
    total: products.length,
  };
}

/**
 * Transform top customers response to UI-friendly format
 */
export function transformTopCustomers(
  data: TopCustomersResponseApi
): { customers: TopCustomer[]; total: number } {
  if (!data || !data.data) {
    return {
      customers: [],
      total: 0,
    };
  }

  const customers = (data.data.topCustomers || [])
    .filter((item: any) => item && item.user !== null && item.user !== undefined)
    .map((item: any) => ({
      _id: item.user?._id || "",
      id: item.user?._id || "",
      name: item.user?.name || "Unknown Customer",
      email: item.user?.email || "",
      image: undefined,
      totalOrders: item.orderCount || 0,
      totalSpent: item.totalSpent || 0,
    }));

  return {
    customers,
    total: customers.length,
  };
}

/**
 * Transform visitors report data to UI-friendly format
 */
export function transformVisitorsReport(
  data: VisitorsReportResponse
): { data: Array<{ date: string; visitors: number; pageViews: number }> } {
  if (!data || !data.data) {
    return {
      data: [],
    };
  }

  return {
    data: data.data.visitorData || [],
  };
}

/**
 * Get default avatar URL for a name
 */
export function getDefaultAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
}

