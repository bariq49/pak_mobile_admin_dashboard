// Use environment variable or fallback to default API URL
// Extract base URL from NEXT_PUBLIC_API_BASE_URL (removes /api/v1 if present)
const getBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiUrl) {
    return "https://pak-mobile-store-backend.vercel.app";
  }
  // Remove trailing /api/v1 if present
  return apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
};

const BASE_URL = getBaseUrl();

export const API_RESOURCES = {
  // User & Auth
  USER: `${BASE_URL}/api/v1/users/me`,
  ADMIN_ME: `${BASE_URL}/api/v1/admin/me`,
  ADDRESSES: `${BASE_URL}/api/v1/users/me/addresses`,
  CHANGE_PASSWORD: `${BASE_URL}/auth/update-password`,
  LOGIN: `${BASE_URL}/auth/admin/login`,
  LOGOUT: `${BASE_URL}/auth/admin/logout`,
  FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  UPDATE_PROFILE: `${BASE_URL}/auth/update-profile`,

  // Products & Categories
  CATEGORIES: `${BASE_URL}/api/v1/categories`,
  CATEGORIES_BY_ID:  `${BASE_URL}/api/v1/categories/:id`,
  SUBCATEGORIES: `${BASE_URL}/api/v1/categories/subcategories`,
  PRODUCTS: `${BASE_URL}/api/v1/products`,
  PRODUCT_BY_ID: `${BASE_URL}/api/v1/products/:id`,
  PRODUCTS_BY_CATEGORIES: `${BASE_URL}/api/v1/products/category`,
  PRODUCTS_BY_SUB_CATEGORIES: `${BASE_URL}/api/v1/products/categories`,
  NEW_SELLER_PRODUCTS: `${BASE_URL}/api/v1/products/new-arrival`,
  BEST_SELLER_PRODUCTS: `${BASE_URL}/api/v1/products/best-seller`,
  POPULAR_PRODUCTS: `${BASE_URL}/api/v1/products/deals`,
  SALE_PRODUCTS: `${BASE_URL}/api/v1/products/on-sale`,
  TOP_SALES_PRODUCTS: `${BASE_URL}/api/v1/products/top-sales`,
  RELATED_PRODUCTS: `${BASE_URL}/api/v1/products`,

  // Deals
  DEALS: `${BASE_URL}/api/v1/deals`,
  DEAL_BY_ID: `${BASE_URL}/api/v1/deals/:id`,

  // Dashboard
  DASHBOARD_STATS: `${BASE_URL}/api/v1/admin/dashboard/stats`,
  DASHBOARD_REVENUE: `${BASE_URL}/api/v1/admin/dashboard/revenue`,
  DASHBOARD_CUSTOMERS: `${BASE_URL}/api/v1/admin/dashboard/customers`,
  DASHBOARD_TRANSACTIONS: `${BASE_URL}/api/v1/admin/dashboard/transactions`,
  DASHBOARD_ORDERS: `${BASE_URL}/api/v1/admin/dashboard/orders`,
  DASHBOARD_TOP_PRODUCTS: `${BASE_URL}/api/v1/admin/dashboard/top-products`,
  DASHBOARD_TOP_CUSTOMERS: `${BASE_URL}/api/v1/admin/dashboard/top-customers`,
  DASHBOARD_VISITORS: `${BASE_URL}/api/v1/admin/dashboard/visitors`,

  // File Upload
  UPLOAD: `${BASE_URL}/api/v1/upload`,
  UPLOAD_MULTIPLE: `${BASE_URL}/api/v1/upload/multiple`,
};
