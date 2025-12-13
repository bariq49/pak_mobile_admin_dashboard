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

/**
 * Get all subcategories (optionally filtered by parent)
 * @param parentId - Optional parent category ID to filter subcategories
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 */
export async function getSubcategoriesApi(parentId?: string, page = 1, limit = 10): Promise<GetSubcategoriesResponse> {
    const url = parentId 
        ? `${API_RESOURCES.SUBCATEGORIES}?parentId=${parentId}&page=${page}&limit=${limit}`
        : `${API_RESOURCES.SUBCATEGORIES}?page=${page}&limit=${limit}`;
    const { data } = await http.get<GetSubcategoriesResponse>(url);
    return data;
}

/**
 * Get a single subcategory by ID using the new endpoint format
 * ✅ New (correct): GET /api/v1/categories/subcategories/{id}
 * ❌ Old (deprecated): GET /api/v1/categories/{id}
 * 
 * @param id - Subcategory ID
 * @returns Subcategory data
 */
export async function getSubcategoryByIdApi(id: string): Promise<{ status: string; data: Category }> {
    const response = await http.get<any>(`${API_RESOURCES.SUBCATEGORIES}/${id}`);
    const responseData = response.data;
    let subcategoryData: Category | null = null;

    // Handle different response structures
    if (responseData?.data?.subcategory) {
        subcategoryData = responseData.data.subcategory;
    } else if (responseData?.data?.category) {
        subcategoryData = responseData.data.category;
    } else if (responseData?.data) {
        subcategoryData = responseData.data;
    } else {
        throw new Error("Subcategory data not found in expected structure.");
    }
    
    if (!subcategoryData) {
        throw new Error("Subcategory not found in API response");
    }
    return { status: 'success', data: subcategoryData };
}

/**
 * Get a subcategory by slug (searches in subcategories endpoint)
 * @param slug - Subcategory slug
 * @param parentId - Optional parent category ID to narrow search
 */
export async function getSubcategoryBySlugApi(slug: string, parentId?: string): Promise<{ status: string; data: Category }> {
    const params = parentId ? `?slug=${slug}&parentId=${parentId}` : `?slug=${slug}`;
    const response = await http.get<any>(`${API_RESOURCES.SUBCATEGORIES}${params}`);
    const responseData = response.data;
    
    // Handle array response (search results)
    if (responseData?.data?.subCategories && Array.isArray(responseData.data.subCategories)) {
        const subcategory = responseData.data.subCategories.find((cat: Category) => cat.slug === slug);
        if (subcategory) {
            return { status: 'success', data: subcategory };
        }
    }
    
    // Handle single object response
    if (responseData?.data?.subcategory) {
        return { status: 'success', data: responseData.data.subcategory };
    } else if (responseData?.data) {
        return { status: 'success', data: responseData.data };
    }
    
    throw new Error("Subcategory not found");
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
