import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";

/* ============ TYPES ============ */
export interface Deal {
  _id: string;
  title: string;
  description?: string;
  image?: {
    desktop?: {
      url: string;
      public_id: string;
    };
    mobile?: {
      url: string;
      public_id: string;
    };
  };
  btnText?: string;
  products?: string[] | Array<{ _id: string; name: string }>;
  categories?: string[] | Array<{ _id: string; name: string }>;
  subCategories?: string[] | Array<{ _id: string; name: string }>;
  isGlobal: boolean;
  discountType: "percentage" | "fixed" | "flat";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetDealsResponse {
  status: string;
  message?: string;
  data: {
    deals: Deal[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  };
}

export interface CreateDealPayload {
  title: string;
  description?: string;
  btnText?: string;
  products?: string[];
  categories?: string[];
  subCategories?: string[];
  isGlobal: boolean;
  discountType: "percentage" | "fixed" | "flat";
  discountValue: number;
  startDate: string;
  endDate: string;
  priority?: number;
  desktop?: File;
  mobile?: File;
}

export interface UpdateDealPayload extends Partial<CreateDealPayload> {}

/* ============ API ============ */

// GET ALL DEALS (Paginated)
export async function getDealsApi(page = 1, limit = 10): Promise<GetDealsResponse> {
  const { data } = await http.get<GetDealsResponse>(
    `${API_RESOURCES.DEALS}?page=${page}&limit=${limit}`
  );
  return data;
}

// GET SINGLE DEAL BY ID
export async function getDealByIdApi(id: string): Promise<{ status: string; data: Deal }> {
  const response = await http.get<any>(`${API_RESOURCES.DEALS}/${id}`);
  const responseData = response.data;
  
  const dealData = responseData?.data?.deal || responseData?.data;
  
  if (!dealData) {
    throw new Error("Deal not found in API response");
  }
  
  return { status: 'success', data: dealData };
}

// CREATE DEAL
export async function createDealApi(payload: CreateDealPayload | FormData) {
  const { data } = await http.post(API_RESOURCES.DEALS, payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    timeout: 120000,
  });
  return data;
}

// UPDATE DEAL
export async function updateDealApi(id: string, payload: UpdateDealPayload | FormData) {
  const { data } = await http.patch(`${API_RESOURCES.DEALS}/${id}`, payload, {
    headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    timeout: 120000,
  });
  return data;
}

// DELETE DEAL
export async function deleteDealApi(id: string) {
  const { data } = await http.delete(`${API_RESOURCES.DEALS}/${id}`);
  return data;
}

