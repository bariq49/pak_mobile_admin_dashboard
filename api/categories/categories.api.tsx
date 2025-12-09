import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";

export interface Category {
    createdBy: any;
    children: never[];
    type: string;
    _id: string;
    name: string;
    slug: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface GetCategoriesResponse {
    status: string;
    message?: string;
    data: {
        categories: Category[];
        pagination: {
            total: number;
            page: number;
            pages: number;
            limit: number;
        };
    };
}

/* ---------------- GET CATEGORY API ---------------- */
export async function getCategoriesApi(page = 1, limit = 10): Promise<GetCategoriesResponse> {
    const { data } = await http.get<GetCategoriesResponse>(
        `${API_RESOURCES.CATEGORIES}?page=${page}&limit=${limit}`
    );
    return data;
}

/* ---------------- GET CATEGORY BY ID API ---------------- */
export async function getCategoryByIdApi(id: string): Promise<{ status: string; data: Category }> {
    const response = await http.get<any>(`${API_RESOURCES.CATEGORIES}/${id}`);
    const responseData = response.data;
    let categoryData: Category | null = null;

    // Assuming the category data is consistently nested under data.category
    if (responseData?.data?.category) {
        categoryData = responseData.data.category;
    } else if (responseData?.data) {
        categoryData = responseData.data;
    } else {
        throw new Error("Category data not found in expected structure.");
    }
    
    if (!categoryData) {
        throw new Error("Category not found in API response");
    }
    return { status: 'success', data: categoryData };
}

/* ---------------- CREATE CATEGORY API ---------------- */
export interface CreateCategoryPayload {
    name: string;
    slug?: string;
    description?: string;
    type?: string;
    image?: File | string;
    isActive?: boolean;
    metaTitle?: string;
    metaDescription?: string;
}

export async function createCategoryApi(payload: CreateCategoryPayload | FormData) {
    const { data } = await http.post(`${API_RESOURCES.CATEGORIES}`, payload, {
        headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return data;
}

/* ---------------- UPDATE CATEGORY API ---------------- */
export interface UpdateCategoryPayload {
    name?: string;
    slug?: string;
    description?: string;
    type?: string;
    image?: File | string;
    isActive?: boolean;
    metaTitle?: string;
    metaDescription?: string;
}

export async function updateCategoryApi(id: string, payload: UpdateCategoryPayload | FormData) {
    const { data } = await http.patch(`${API_RESOURCES.CATEGORIES}/${id}`, payload, {
        headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return data;
}

/* ---------------- DELETE CATEGORY API ---------------- */
export async function deleteCategoryApi(id: string) {
    const { data } = await http.delete(`${API_RESOURCES.CATEGORIES}/${id}`);
    return data;
}
