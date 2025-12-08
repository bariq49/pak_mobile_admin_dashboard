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
  console.log("Fetched Products:", data);
  return data;
}

// GET SINGLE PRODUCT BY ID
export async function getProductByIdApi(id: string): Promise<{ status: string; data: Product }> {
  const { data } = await http.get<{ status: string; data: Product }>(
    `${API_RESOURCES.PRODUCTS}/${id}`
  );
  
  // Handle different response structures
  // Some APIs return { data: { data: Product } } or { data: Product }
  if (data && 'data' in data && data.data) {
    return data;
  } else if (data && !('data' in data)) {
    // If the response itself is the product
    return { status: 'success', data: data as any };
  } else {
    throw new Error("Product not found in API response");
  }
}

// CREATE NEW PRODUCT
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProductApi(payload: Record<string, any>) {
  const { data } = await http.post(`${API_RESOURCES.PRODUCTS}`, payload);
  return data;
}

// UPDATE PRODUCT (using PUT method)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProductApi(id: string, payload: Record<string, any>) {
  const { data } = await http.put(`${API_RESOURCES.PRODUCTS}/${id}`, payload);
  return data;
}

// DELETE PRODUCT
export async function deleteProductApi(id: string) {
  const { data } = await http.delete(`${API_RESOURCES.PRODUCTS}/${id}`);
  return data;
}
