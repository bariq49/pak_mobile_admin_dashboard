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

/* ---------------- CREATE CATEGORY API ---------------- */
export interface CreateCategoryPayload {
    name: string;
    description?: string;
    type?: string;
}

export async function createCategoryApi(payload: CreateCategoryPayload) {
    const { data } = await http.post(`${API_RESOURCES.CATEGORIES}`, payload);
    return data;
}

/* ---------------- UPDATE CATEGORY API ---------------- */
export interface UpdateCategoryPayload {
    name?: string;
    description?: string;
    type?: string;
}

export async function updateCategoryApi(id: string, payload: UpdateCategoryPayload) {
    const { data } = await http.put(`${API_RESOURCES.CATEGORIES}/${id}`, payload);
    return data;
}

/* ---------------- DELETE CATEGORY API ---------------- */
export async function deleteCategoryApi(id: string) {
    const { data } = await http.delete(`${API_RESOURCES.CATEGORIES}/${id}`);
    return data;
}
