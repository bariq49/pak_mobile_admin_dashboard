"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm, { ProductFormData } from "@/components/product-form";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";
import { getProductBySlugApi } from "@/api/product/products.api";

// Validation errors interface
interface ValidationErrors {
  name?: string;
  brand?: string;
  model?: string;
  category?: string;
  price?: string;
    salePrice?: string;
    saleDates?: string;
}

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  // Get product slug from URL params (used for fetching)
  const slug = params.slug as string;
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | undefined>(undefined);
  const isSubmittingRef = useRef(false);

  // Validate product slug
  if (!slug) {
    toast.error("Product slug is required");
    router.push("/products");
    return null;
  }

  // Fetch product by slug to extract ID (needed for updates)
  useEffect(() => {
    const fetchProductId = async () => {
      try {
        const response = await getProductBySlugApi(slug);
        if (response?.data?._id || response?.data?.id) {
          setProductId(response.data._id || response.data.id);
        }
      } catch (error: any) {
        console.error("Failed to fetch product:", error);
        toast.error("Failed to load product", {
          description: error?.response?.data?.message || error?.message || "Product not found",
        });
        router.push("/products");
      }
    };

    fetchProductId();
  }, [slug, router]);

  // Validate required fields
  const validateForm = (data: ProductFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Basic Info validation
    if (!data.name?.trim()) {
      errors.name = "Product name is required";
    }

    if (!data.brand?.trim()) {
      errors.brand = "Brand is required";
    }

    if (!data.model?.trim()) {
      errors.model = "Model is required";
    }

    if (!data.category?.trim()) {
      errors.category = "Category is required";
    }

    // Pricing validation
    if (!data.price || data.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (data.onSale) {
      if (!data.salePrice || data.salePrice <= 0) {
        errors.salePrice = "Sale price is required when On Sale is enabled";
      } else if (data.salePrice >= data.price) {
        errors.salePrice = "Sale price must be less than regular price";
      }

      if (!data.saleStart || !data.saleEnd) {
        errors.saleDates = "Sale start and end dates are required when On Sale is enabled";
      } else if (new Date(data.saleStart) >= new Date(data.saleEnd)) {
        errors.saleDates = "Sale end date must be after sale start date";
      }
    }

    return errors;
  };

  // Build FormData for multipart submission
  const buildFormData = (data: ProductFormData): FormData => {
    const formData = new FormData();

    // Basic Info
    formData.append("name", data.name);
    formData.append("brand", data.brand);
    formData.append("model", data.model);
    if (data.sku) formData.append("sku", data.sku);
    formData.append("category", data.category);
    if (data.subCategory) formData.append("subCategory", data.subCategory);
    formData.append("condition", data.condition || "new");

    // Tags (as JSON array)
    if (data.tags && data.tags.length > 0) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    // Pricing
    formData.append("price", data.price.toString());
    if (data.salePrice) {
      formData.append("salePrice", data.salePrice.toString());
      formData.append("sale_price", data.salePrice.toString());
    }
    formData.append("on_sale", data.onSale.toString());
    if (data.onSale) {
      if (data.saleStart) formData.append("sale_start", data.saleStart);
      if (data.saleEnd) formData.append("sale_end", data.saleEnd);
    }
    if (data.tax) formData.append("tax", data.tax.toString());
    
    // Stock Quantity - main product quantity (NOT derived from variants)
    formData.append("quantity", String(data.quantity || 0));

    // Main Image - only append if it's a new file
    if (data.featuredImageFile) {
      formData.append("mainImage", data.featuredImageFile);
    }

    // Gallery Images - only append new files
    if (data.galleryImageFiles && data.galleryImageFiles.length > 0) {
      data.galleryImageFiles.forEach((file) => {
        formData.append("galleryImages", file);
      });
    }

    // Video URL
    if (data.videoUrl) formData.append("videoUrl", data.videoUrl);

    // Variants - filter out empty ones and send as JSON
    // Each variant has its own stock field, separate from main quantity
    // Remove File objects and blob URLs from variants JSON
    const allVariants = data.variants || [];
    const validVariants = allVariants.filter(v => 
      v.storage || v.ram || v.color || v.bundle || v.warranty || v.price || v.stock
    );
    
    // Build clean variants array for JSON (remove File objects and blob URLs)
    const variantsForJSON = validVariants.map((v) => {
      const cleanVariant: any = {
        storage: v.storage || undefined,
        ram: v.ram || undefined,
        color: v.color || undefined,
        bundle: v.bundle || undefined,
        warranty: v.warranty || undefined,
        price: parseFloat(v.price) || undefined,
        stock: parseInt(v.stock) || 0,
        sku: v.sku || undefined,
      };
      
      // Only include image if it's a real Cloudinary URL (for updates), NOT a blob URL
      if (v.image && !v.image.startsWith('blob:') && !v.imageFile) {
        cleanVariant.image = v.image;
      }
      // Don't include imageFile (it's a File object, not JSON)
      // Don't include blob URLs (temporary preview URLs)
      
      return cleanVariant;
    });

    if (variantsForJSON && variantsForJSON.length > 0) {
      formData.append("variants", JSON.stringify(variantsForJSON));
    }

    // ✅ CRITICAL: Append variant image files with EXACT field names
    // Backend expects: variant_0_image, variant_1_image, etc. where index matches JSON array position
    // IMPORTANT: Use the filtered validVariants array index (matches JSON array position)
    validVariants.forEach((variant, index) => {
      if (variant.imageFile && variant.imageFile instanceof File) {
        // Field name pattern: variant_${index}_image where index starts at 0
        // This index MUST match the variant's position in the JSON array sent to backend
        const fieldName = `variant_${index}_image`;
        formData.append(fieldName, variant.imageFile);
      }
    });

    // Additional Information - Convert array to object {key: value}
    if (data.additionalInfo && data.additionalInfo.length > 0) {
      const additionalInfoObject: Record<string, string> = {};
      data.additionalInfo.forEach((item) => {
        if (item.key && item.key.trim()) {
          additionalInfoObject[item.key.trim()] = item.value || "";
        }
      });

      if (Object.keys(additionalInfoObject).length > 0) {
        formData.append("additional_info", JSON.stringify(additionalInfoObject));
      }
    }

    // Description and What's in the Box
    if (data.description) formData.append("description", data.description);
    if (data.whatsInBox) formData.append("whatsInBox", data.whatsInBox);

    // Status and visibility
    formData.append("status", data.status || "draft");
    formData.append("is_active", (data.status === "published").toString());
    formData.append("featured", data.featured.toString());
    if (data.visibility) formData.append("visibility", data.visibility);
    if (data.publishDate) formData.append("publishDate", data.publishDate);

    return formData;
  };

  // Handle form submission
  const handleSubmit = async (data: ProductFormData) => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    // Validate form
    const errors = validateForm(data);
    const errorKeys = Object.keys(errors) as (keyof ValidationErrors)[];

    if (errorKeys.length > 0) {
      // Show first validation error
      const firstError = errors[errorKeys[0]];
      toast.error("Validation Error", {
        description: firstError,
      });
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    const loadingToastId = toast.loading("Updating product...");

    try {
      // Build FormData
      const formData = buildFormData(data);

      // Use productId (extracted from fetched product) for updates
      if (!productId) {
        throw new Error("Product ID not found. Please refresh the page.");
      }

      // Send as multipart/form-data using PATCH method
      await http.patch(`${API_RESOURCES.PRODUCTS}/${productId}`, formData, {
        timeout: 120000,
      });

      // Success
      toast.success("Product updated successfully!", {
        id: loadingToastId,
        description: `${data.name} has been updated.`,
      });

      // Redirect to products list after short delay
      setTimeout(() => {
        router.push("/products");
      }, 1500);

    } catch (error: any) {
      console.error("Error updating product:", error);
      
      // Handle API error
      let errorMessage = "Failed to update product. Please try again.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 413) {
        errorMessage = "File size too large. Please use smaller images.";
      } else if (error?.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error("Error", {
        id: loadingToastId,
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Handle save as draft
  const handleSaveDraft = async (data: ProductFormData) => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    // For draft, only name is required
    if (!data.name?.trim()) {
      toast.error("Validation Error", {
        description: "Product name is required to save as draft",
      });
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    const loadingToastId = toast.loading("Saving draft...");

    try {
      // Build FormData with draft status
      const draftData = { ...data, status: "draft" as const };
      const formData = buildFormData(draftData);

      // Use productId (extracted from fetched product) for updates
      if (!productId) {
        throw new Error("Product ID not found. Please refresh the page.");
      }

      // Send as multipart/form-data using PATCH method
      await http.patch(`${API_RESOURCES.PRODUCTS}/${productId}`, formData, {
        timeout: 120000,
      });

      // Success
      toast.success("Draft saved!", {
        id: loadingToastId,
        description: `${data.name} has been saved as draft.`,
      });

      // Redirect to products list
      setTimeout(() => {
        router.push("/products");
      }, 1500);

    } catch (error: any) {
      console.error("Error saving draft:", error);
      
      let errorMessage = "Failed to save draft. Please try again.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 413) {
        errorMessage = "File size too large. Please use smaller images.";
      } else if (error?.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error("Error", {
        id: loadingToastId,
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Confirm before leaving if there's unsaved data
    const confirmLeave = window.confirm(
      "Are you sure you want to cancel? Any unsaved changes will be lost."
    );
    
    if (confirmLeave) {
      router.push("/products");
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem>Edit Product</BreadcrumbItem>
      </Breadcrumbs>

      {/* Product Form - handles its own data fetching by slug, uses ID for updates */}
      <ProductForm 
        mode="edit"
        productSlug={slug}
        productId={productId}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditProductPage;

