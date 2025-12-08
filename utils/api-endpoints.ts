const BASE_URL = "http://localhost:5000";

export const API_RESOURCES = {
  // User & Auth
  USER: `${BASE_URL}/api/v1/users/me`,
  ADDRESSES: `${BASE_URL}/api/v1/users/me/addresses`,
  CHANGE_PASSWORD: `${BASE_URL}/auth/update-password`,
  LOGIN: `${BASE_URL}/auth/admin/login`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
  UPDATE_PROFILE: `${BASE_URL}/auth/update-profile`,

  // Products & Categories
  CATEGORIES: `${BASE_URL}/api/v1/categories`,
  SUBCATEGORIES: `${BASE_URL}/api/v1/categories/subcategories`,
  PRODUCTS: `${BASE_URL}/api/v1/products`,
  PRODUCT_BY_ID: `${BASE_URL}/api/v1/products/:id`,
  PRODUCTS_BY_CATEGORIES: `${BASE_URL}/api/v1/products/category`,
  PRODUCTS_BY_SUB_CATEGORIES: `${BASE_URL}/api/v1/products/categories`,
  NEW_SELLER_PRODUCTS: `${BASE_URL}/api/v1/products/new-arrival`,
  BEST_SELLER_PRODUCTS: `${BASE_URL}/api/v1/products/best-seller`,
  POPULAR_PRODUCTS: `${BASE_URL}/api/v1/products/deals`,
  SALE_PRODUCTS: `${BASE_URL}/api/v1/products/on-sale`,
  RELATED_PRODUCTS: `${BASE_URL}/api/v1/products`,

  // File Upload
  UPLOAD: `${BASE_URL}/api/v1/upload`,
  UPLOAD_MULTIPLE: `${BASE_URL}/api/v1/upload/multiple`,
};
