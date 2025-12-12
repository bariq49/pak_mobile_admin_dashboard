// src/api/product/products.api.ts
import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";

/* ============ TYPES ============ */
export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface RatingSummary {
  average: number;
  total: number;
  distribution: Record<string, number>;
}

export interface Product {
  categoryName: any;
  gallery: any;
  quantity: number;
  id: string;
  _id?: string; // MongoDB ID
  name: string;
  brand?: string;
  model?: string;
  sku?: string;
  description?: string;
  price: number;
  salePrice?: number;
  sale_price?: number;
  on_sale?: boolean;
  sale_start?: string;
  sale_end?: string;
  costPrice?: number;
  tax?: number;
  stock?: number;
  salesCount: number;
  in_stock?: boolean;
  is_active?: boolean;
  category?: Category | string;
  images?: string[];
  thumbnail?: string;
  videoUrl?: string;
  tags?: string[];
  condition?: string;
  variants?: Array<{
    _id?: string;
    id?: string;
    storage?: string;
    ram?: string;
    color?: string;
    bundle?: string;
    warranty?: string;
    price?: number;
    stock?: number;
    sku?: string;
    image?: string;
  }>;
  specifications?: {
    displaySize?: string;
    displayType?: string;
    processor?: string;
    rearCamera?: string;
    frontCamera?: string;
    battery?: string;
    fastCharging?: string;
    os?: string;
    network?: string;
    connectivity?: string;
    simSupport?: string;
    dimensions?: string;
    weight?: string;
  };
  whatsInBox?: string;
  status?: "draft" | "published" | "archived";
  featured?: boolean;
  visibility?: string;
  publishDate?: string;
  ratingSummary?: RatingSummary;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetProductsResponse {
  status: string;
  message?: string;
  data: {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  };
}

/* ============ API ============ */

// GET ALL PRODUCTS (Paginated)
export async function getProductsApi(page = 1, limit = 10): Promise<GetProductsResponse> {
  const { data } = await http.get<GetProductsResponse>(
    `${API_RESOURCES.PRODUCTS}?page=${page}&limit=${limit}`
  );
  // console.log("Fetched Products:", data);
  return data;
}

// GET SINGLE PRODUCT BY SLUG
export async function getProductBySlugApi(slug: string): Promise<{ status: string; data: Product }> {
  const response = await http.get<any>(`${API_RESOURCES.PRODUCTS}/${slug}`);
  const responseData = response.data;
  
  // Extract product from response structure: responseData.data.product
  const productData = responseData?.data?.product;
  
  if (!productData) {
    throw new Error("Product not found in API response");
  }
  
  return { status: 'success', data: productData };
}

// GET SINGLE PRODUCT BY ID (for backward compatibility)
// Keep this for internal use, but prefer getProductBySlugApi
export async function getProductByIdApi(id: string): Promise<{ status: string; data: Product }> {
  // For now, try to use as slug first, then fallback to ID if needed
  // This maintains backward compatibility during transition
  return getProductBySlugApi(id);
}

// CREATE NEW PRODUCT
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProductApi(payload: Record<string, any>) {
  const { data } = await http.post(`${API_RESOURCES.PRODUCTS}`, payload);
  return data;
}

// UPDATE PRODUCT (using PATCH method)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProductApi(id: string, payload: Record<string, any>) {
  const { data } = await http.patch(`${API_RESOURCES.PRODUCTS}/${id}`, payload);
  return data;
}

// DELETE PRODUCT
export async function deleteProductApi(id: string) {
  const { data } = await http.delete(`${API_RESOURCES.PRODUCTS}/${id}`);
  return data;
}

// GET PRODUCTS ON SALE
export async function getProductsOnSaleApi(query = ""): Promise<GetProductsResponse> {
  const { data } = await http.get<GetProductsResponse>(
    `${API_RESOURCES.SALE_PRODUCTS}${query ? `?${query}` : ""}`
  );
  return data;
}

// GET TOP SALES PRODUCTS
export async function getTopSalesProductsApi(params?: { categoryId?: string; sellerId?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.append("categoryId", params.categoryId);
  if (params?.sellerId) searchParams.append("sellerId", params.sellerId);

  const queryString = searchParams.toString();
  const { data } = await http.get(`${API_RESOURCES.TOP_SALES_PRODUCTS}${queryString ? `?${queryString}` : ""}`);
  return data;
}
