import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";

/* ============ TYPES ============ */

export type Period = "30days" | "12months" | "custom";

export interface DashboardStatsResponse {
  status: string;
  data: {
    stats: {
      revenue: {
        total: number;
        today: number;
        monthly: number;
      };
      orders: {
        total: number;
        today: number;
        monthly: number;
        pending: number;
        paid?: number;
        completed?: number;
      };
      customers: {
        total: number;
        newToday: number;
        newThisMonth: number;
      };
      products: {
        total: number;
        outOfStock: number;
        inStock: number;
      };
    };
  };
}

export interface RevenueChartResponse {
  status: string;
  data: {
    revenueData: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
    period: string;
    startDate: string;
    endDate: string;
  };
}

export interface CustomerStatisticsResponse {
  status: string;
  data: {
    stats: {
      total: number;
      new: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        thisYear: number;
      };
      active: number;
      segments: {
        oneOrder: number;
        multipleOrders: number;
        noOrders: number;
      };
      growth: Array<{
        month: string;
        count: number;
      }>;
    };
  };
}

export interface TransactionsResponse {
  status: string;
  data: {
    transactions: Array<{
      id: string;
      orderNumber: string;
      customer: {
        name: string;
        email: string;
      };
      amount: number;
      status: string;
      paymentMethod: string;
      orderStatus: string;
      date: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface OrdersResponse {
  status: string;
  data: {
    orders: Array<{
      id: string;
      orderNumber: string;
      trackingNumber?: string;
      customer: {
        name: string;
        email: string;
      };
      items: Array<{
        name: string;
        quantity: number;
        price: number;
        product: {
          name: string;
          slug: string;
          image: string | null;
        } | null;
      }>;
      totalAmount: number;
      orderStatus: string;
      paymentStatus: string;
      paymentMethod: string;
      shippingAddress?: any;
      createdAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface TopProductsResponse {
  status: string;
  data: {
    topProducts: Array<{
      product: {
        _id: string;
        name: string;
        slug: string;
        price: number;
        salePrice?: number;
        mainImage?: string;
        salesCount: number;
        category?: {
          name: string;
          slug: string;
        };
      } | null;
      revenue: number;
      totalSold: number;
      orderCount: number;
      salesCount?: number;
    }>;
  };
}

export interface TopCustomersResponse {
  status: string;
  data: {
    topCustomers: Array<{
      user: {
        _id: string;
        name: string;
        email: string;
        phoneNumber?: string;
        createdAt: string;
      } | null;
      totalSpent: number;
      orderCount: number;
      lastOrderDate: string | null;
    }>;
  };
}

export interface VisitorsReportResponse {
  status: string;
  data: {
    visitorData: Array<{
      date: string;
      visitors: number;
      pageViews: number;
    }>;
    period: string;
    startDate: string;
    endDate: string;
    note?: string;
  };
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
 * @param status - Filter by orderStatus (optional)
 * @param paymentStatus - Filter by paymentStatus (optional)
 */
export async function getRecentOrdersApi(
  page: number = 1,
  limit: number = 10,
  status?: string,
  paymentStatus?: string
): Promise<OrdersResponse> {
  const params: Record<string, string | number> = { page, limit };
  
  if (status) params.status = status;
  if (paymentStatus) params.paymentStatus = paymentStatus;

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

/**
 * Get all orders (Admin)
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @param sort_by - Sort option (optional, e.g., "new_arrival")
 */
export async function getAllOrdersApi(
  page: number = 1,
  limit: number = 20,
  sort_by?: string
): Promise<OrdersResponse> {
  const params: Record<string, string | number> = { page, limit };
  
  if (sort_by) params.sort_by = sort_by;

  // Extract path from full URL (axios will use full URL and ignore baseURL)
  const url = API_RESOURCES.ORDERS_ADMIN_ALL;
  const { data } = await http.get<OrdersResponse>(
    url,
    { params }
  );
  
  // Debug: Log first order to see what the API actually returns
  if (process.env.NODE_ENV === 'development' && data?.data?.orders?.[0]) {
    const firstOrder = data.data.orders[0];
    console.log('API Response - First order structure:', {
      hasId: !!firstOrder.id,
      has_id: !!(firstOrder as any)._id,
      id: firstOrder.id,
      _id: (firstOrder as any)._id,
      orderNumber: firstOrder.orderNumber,
      allKeys: Object.keys(firstOrder),
    });
  }
  
  return data;
}

/**
 * Get single order by ID
 * @param orderId - Order ID
 */
export async function getOrderByIdApi(
  orderId: string
): Promise<{ status: string; data: { order: OrdersResponse["data"]["orders"][0] } }> {
  // Validate orderId is not empty
  if (!orderId || orderId.trim() === '') {
    throw new Error('Order ID is required');
  }

  const url = API_RESOURCES.ORDER_BY_ID.replace(":id", orderId);
  
  // Validate URL doesn't have double slashes (indicates missing ID)
  if (url.includes('//') && url.includes('/orders//')) {
    throw new Error(`Invalid order ID: "${orderId}". URL generated: ${url}`);
  }

  const { data } = await http.get<{ status: string; data: { order: OrdersResponse["data"]["orders"][0] } }>(url);
  return data;
}

/**
 * Update order status (Admin)
 * @param orderId - Order ID (MongoDB ObjectId, NOT orderNumber)
 * @param status - New order status
 */
export async function updateOrderStatusApi(
  orderId: string,
  status: string
): Promise<{ status: string; message: string; data: { order: OrdersResponse["data"]["orders"][0] } }> {
  // Validate orderId is not empty
  if (!orderId || orderId.trim() === '') {
    throw new Error('Order ID is required');
  }

  // Validate that orderId is a MongoDB ObjectId format (24 hex characters), not an order number
  // MongoDB ObjectId is 24 hex characters, order numbers typically start with "ORD-" or similar
  if (orderId.startsWith('ORD-') || orderId.includes('-') && !/^[0-9a-fA-F]{24}$/.test(orderId)) {
    throw new Error(`Invalid order ID format: "${orderId}". Expected MongoDB ObjectId (24 hex characters), but received what appears to be an order number. Use order._id instead of order.orderNumber.`);
  }

  // Validate MongoDB ObjectId format (24 hex characters)
  if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
    console.warn(`Order ID "${orderId}" does not match MongoDB ObjectId format (24 hex characters). This may cause a 400 error.`);
  }

  const url = API_RESOURCES.UPDATE_ORDER_STATUS.replace(":id", orderId);
  
  // Validate URL doesn't have double slashes (indicates missing ID)
  if (url.includes('//status') || url.includes('/admin//')) {
    throw new Error(`Invalid order ID: "${orderId}". URL generated: ${url}`);
  }

  const { data } = await http.patch<{ status: string; message: string; data: { order: OrdersResponse["data"]["orders"][0] } }>(
    url,
    { status }
  );
  return data;
}

/**
 * Update order (payment status and/or order status)
 * @param orderId - Order ID (MongoDB ObjectId, NOT orderNumber)
 * @param updates - Update payload with paymentStatus and/or orderStatus
 */
export async function updateOrderApi(
  orderId: string,
  updates: { paymentStatus?: string; orderStatus?: string }
): Promise<{ status: string; message: string; data: { order: OrdersResponse["data"]["orders"][0] } }> {
  // Validate orderId is not empty
  if (!orderId || orderId.trim() === '') {
    throw new Error('Order ID is required');
  }

  // Validate that orderId is a MongoDB ObjectId format (24 hex characters), not an order number
  if (orderId.startsWith('ORD-') || orderId.includes('-') && !/^[0-9a-fA-F]{24}$/.test(orderId)) {
    throw new Error(`Invalid order ID format: "${orderId}". Expected MongoDB ObjectId (24 hex characters), but received what appears to be an order number. Use order._id instead of order.orderNumber.`);
  }

  // Validate MongoDB ObjectId format (24 hex characters)
  if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
    console.warn(`Order ID "${orderId}" does not match MongoDB ObjectId format (24 hex characters). This may cause a 400 error.`);
  }

  const url = API_RESOURCES.UPDATE_ORDER.replace(":id", orderId);
  
  // Validate URL doesn't have double slashes (indicates missing ID)
  if (url.includes('//status') || url.includes('/orders//')) {
    throw new Error(`Invalid order ID: "${orderId}". URL generated: ${url}`);
  }

  const { data } = await http.put<{ status: string; message: string; data: { order: OrdersResponse["data"]["orders"][0] } }>(
    url,
    updates
  );
  return data;
}

