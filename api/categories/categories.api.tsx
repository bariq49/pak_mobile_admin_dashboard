import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";

export interface Category {
    createdBy: any;
    children: Category[] | never[];
    type: "mega" | "normal";
    _id: string;
    name: string;
    slug: string;
    description?: string;
    parent?: string | { _id: string; name: string; slug: string } | null;
    ancestors?: string[];
    active?: boolean;
    isActive?: boolean;
    images?: Array<{
        url: string;
        altText?: string;
        type: "thumbnail" | "banner" | "mobile" | "gallery";
        width?: number;
        height?: number;
    }>;
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

/* ---------------- GET CATEGORY BY SLUG API ---------------- */
export async function getCategoryBySlugApi(slug: string): Promise<{ status: string; data: Category }> {
    const response = await http.get<any>(`${API_RESOURCES.CATEGORIES}/${slug}`);
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

/* ---------------- GET CATEGORY BY ID API (for internal use) ---------------- */
// Keep this for backward compatibility, but prefer getCategoryBySlugApi
export async function getCategoryByIdApi(id: string): Promise<{ status: string; data: Category }> {
    // For now, try to use as slug first, then fallback to ID if needed
    // This maintains backward compatibility during transition
    return getCategoryBySlugApi(id);
}

/* ---------------- GET ROOT CATEGORIES API ---------------- */
export async function getRootCategoriesApi(): Promise<Category[]> {
    // Fetch only root categories (parent: null) for parent dropdown
    const { data } = await http.get<GetCategoriesResponse>(
        `${API_RESOURCES.CATEGORIES}?page=1&limit=100`
    );
    // Filter to only root categories (no parent)
    return data.data.categories.filter((cat: Category) => !cat.parent);
}

/* ---------------- GET SUBCATEGORIES API ---------------- */
export interface GetSubcategoriesResponse {
    status: string;
    message?: string;
    data: {
        subCategories: Category[];
        pagination: {
            total: number;
            page: number;
            pages: number;
            limit: number;
        };
    };
}

export async function getSubcategoriesApi(parentId?: string, page = 1, limit = 10): Promise<GetSubcategoriesResponse> {
    const url = parentId 
        ? `${API_RESOURCES.SUBCATEGORIES}?parentId=${parentId}&page=${page}&limit=${limit}`
        : `${API_RESOURCES.SUBCATEGORIES}?page=${page}&limit=${limit}`;
    const { data } = await http.get<GetSubcategoriesResponse>(url);
    return data;
}

/* ---------------- CREATE CATEGORY API ---------------- */
export interface CreateCategoryPayload {
    name: string;
    slug?: string;
    description?: string;
    type?: "mega" | "normal";
    parent?: string | null;
    image?: File | string;
    active?: boolean;
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

/* ---------------- CREATE SUBCATEGORY API ---------------- */
export interface CreateSubcategoryPayload {
    name: string;
    description?: string;
    type?: "mega" | "normal";
    active?: boolean;
    metaTitle?: string;
    metaDescription?: string;
}

export async function createSubcategoryApi(
    parentId: string, 
    payload: CreateSubcategoryPayload | FormData
) {
    const { data } = await http.post(
        `${API_RESOURCES.CATEGORIES}/${parentId}/subcategories`, 
        payload,
        {
            headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
        }
    );
    return data;
}

/* ---------------- UPDATE CATEGORY API ---------------- */
export interface UpdateCategoryPayload {
    name?: string;
    slug?: string;
    description?: string;
    type?: "mega" | "normal";
    parent?: string | null;
    image?: File | string;
    active?: boolean;
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

/* ---------------- UPDATE SUBCATEGORY API ---------------- */
export async function updateSubcategoryApi(id: string, payload: UpdateCategoryPayload | FormData) {
    const { data } = await http.patch(
        `${API_RESOURCES.SUBCATEGORIES}/${id}`, 
        payload,
        {
            headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
        }
    );
    return data;
}

/* ---------------- DELETE CATEGORY API ---------------- */
export async function deleteCategoryApi(id: string) {
    const { data } = await http.delete(`${API_RESOURCES.CATEGORIES}/${id}`);
    return data;
}
