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

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    slug?: string;
    image?: string | null;
    _id?: string;
  } | null;
  image?: {
    _id?: string;
    original?: string;
    thumbnail?: string;
  };
}

export interface ShippingAddress {
  fullName?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  area?: string;
  streetAddress?: string;
  apartment?: string;
  postalCode?: string;
  label?: string;
}

export interface Order {
  _id: string;
  id?: string;
  orderNumber: string;
  invoice?: string;
  trackingNumber?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  username?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  items?: OrderItem[];
  shippingAddress?: ShippingAddress;
  amount: number;
  totalAmount?: number;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  coupon?: string;
  status: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentIntentId?: string;
  isComplete?: boolean;
  createdAt: string;
  updatedAt?: string;
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
      totalSales: stats.revenue?.total || 0, // All-time total sales
      todayOrders: stats.orders?.today || 0,
      completedOrders: stats.orders?.completed || stats.orders?.paid || 0, // Use 'completed' if available, fallback to 'paid'
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

    // Calculate subtotal from items if not provided
    const items = order?.items || [];
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Extract customer info - handle different possible structures
    // API might return: customer.name, customer.user.name, or user.name
    let customerName = "Unknown Customer";
    let customerEmail = "";

    if (order?.customer) {
      if (typeof order.customer === "object") {
        // Try customer.name first (most common)
        if (order.customer.name) {
          customerName = order.customer.name;
        }
        // Try customer.user.name (nested structure)
        else if ((order.customer as any)?.user?.name) {
          customerName = (order.customer as any).user.name;
        }
        // Try customer.fullName (alternative field)
        else if ((order.customer as any)?.fullName) {
          customerName = (order.customer as any).fullName;
        }

        // Extract email
        if (order.customer.email) {
          customerEmail = order.customer.email;
        } else if ((order.customer as any)?.user?.email) {
          customerEmail = (order.customer as any).user.email;
        }
      }
    }

    // Fallback: check if there's a user field at order level
    if (customerName === "Unknown Customer" && (order as any)?.user?.name) {
      customerName = (order as any).user.name;
    }
    if (!customerEmail && (order as any)?.user?.email) {
      customerEmail = (order as any).user.email;
    }

    // Extract order ID - backend might return 'id' or '_id' (MongoDB typically uses _id)
    // Check both possibilities and log if neither exists for debugging
    const orderId = (order as any)?._id || order?.id || (order as any)?.id || "";
    
    // Debug log if orderId is missing (only in development)
    if (!orderId && process.env.NODE_ENV === 'development') {
      console.warn('Order ID missing in transformer. Order object keys:', Object.keys(order || {}));
      console.warn('Order object:', order);
    }
    
    return {
      _id: orderId,
      id: orderId,
      orderNumber: order?.orderNumber || "",
      invoice: order?.orderNumber || "",
      trackingNumber: order?.trackingNumber,
      customerId: customerEmail,
      customerName: customerName,
      customerEmail: customerEmail,
      username: customerName,
      user: order?.customer ? {
        _id: customerEmail || "",
        name: customerName,
        email: customerEmail || "",
      } : undefined,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        product: item.product ? {
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.image,
        } : null,
      })),
      shippingAddress: order?.shippingAddress,
      amount: order?.totalAmount || 0,
      totalAmount: order?.totalAmount,
      subtotal: calculatedSubtotal,
      shippingFee: (order?.totalAmount || 0) - calculatedSubtotal, // Approximate if not provided
      discount: 0,
      status: order?.orderStatus || "",
      orderStatus: order?.orderStatus || "",
      paymentStatus: order?.paymentStatus || "",
      paymentMethod: order?.paymentMethod || "",
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

