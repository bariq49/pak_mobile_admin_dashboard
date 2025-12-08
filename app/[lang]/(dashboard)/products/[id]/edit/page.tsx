"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm, { ProductFormData } from "@/components/product-form";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";

// Validation errors interface
interface ValidationErrors {
  name?: string;
  brand?: string;
  model?: string;
  category?: string;
  price?: string;
}

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(false);

  // Validate product ID
  if (!id) {
    toast.error("Product ID is required");
    router.push("/en/products");
    return null;
  }

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
    formData.append("condition", data.condition || "new");

    // Tags (as JSON array)
    if (data.tags && data.tags.length > 0) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    // Pricing
    formData.append("price", data.price.toString());
    if (data.salePrice) formData.append("salePrice", data.salePrice.toString());
    if (data.costPrice) formData.append("costPrice", data.costPrice.toString());
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
    const validVariants = data.variants?.filter(v => 
      v.storage || v.ram || v.color || v.bundle || v.warranty || v.price || v.stock
    ).map(v => ({
      storage: v.storage || undefined,
      ram: v.ram || undefined,
      color: v.color || undefined,
      bundle: v.bundle || undefined,
      warranty: v.warranty || undefined,
      price: parseFloat(v.price) || undefined,
      stock: parseInt(v.stock) || 0, // Variant stock - separate from main quantity
      sku: v.sku || undefined,
    }));

    if (validVariants && validVariants.length > 0) {
      formData.append("variants", JSON.stringify(validVariants));
    }

    // Technical Specifications - send as JSON object
    const specifications = {
      displaySize: data.displaySize || undefined,
      displayType: data.displayType || undefined,
      processor: data.processor || undefined,
      rearCamera: data.rearCamera || undefined,
      frontCamera: data.frontCamera || undefined,
      battery: data.battery || undefined,
      fastCharging: data.fastCharging || undefined,
      os: data.os || undefined,
      network: data.network || undefined,
      connectivity: data.connectivity || undefined,
      simSupport: data.simSupport || undefined,
      dimensions: data.dimensions || undefined,
      weight: data.weight || undefined,
    };

    // Only add specs if at least one field has value
    const hasSpecs = Object.values(specifications).some(v => v);
    if (hasSpecs) {
      formData.append("specifications", JSON.stringify(specifications));
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

    setIsLoading(true);
    const loadingToastId = toast.loading("Updating product...");

    try {
      // Build FormData
      const formData = buildFormData(data);

      // Send as multipart/form-data using PUT method
      await http.put(`${API_RESOURCES.PRODUCTS}/${id}`, formData, {
        // Increase timeout for file uploads
        timeout: 120000,
      });

      // Success
      toast.success("Product updated successfully!", {
        id: loadingToastId,
        description: `${data.name} has been updated.`,
      });

      // Redirect to products list after short delay
      setTimeout(() => {
        router.push("/en/products");
      }, 1500);

    } catch (error: any) {
      console.error("Error updating product:", error);
      
      // Handle API error
      let errorMessage = "Failed to update product. Please try again.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 413) {
        errorMessage = "File size too large. Please use smaller images.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error("Error", {
        id: loadingToastId,
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save as draft
  const handleSaveDraft = async (data: ProductFormData) => {
    // For draft, only name is required
    if (!data.name?.trim()) {
      toast.error("Validation Error", {
        description: "Product name is required to save as draft",
      });
      return;
    }

    setIsLoading(true);
    const loadingToastId = toast.loading("Saving draft...");

    try {
      // Build FormData with draft status
      const draftData = { ...data, status: "draft" as const };
      const formData = buildFormData(draftData);

      // Send as multipart/form-data using PUT method
      await http.put(`${API_RESOURCES.PRODUCTS}/${id}`, formData, {
        timeout: 120000,
      });

      // Success
      toast.success("Draft saved!", {
        id: loadingToastId,
        description: `${data.name} has been saved as draft.`,
      });

      // Redirect to products list
      setTimeout(() => {
        router.push("/en/products");
      }, 1500);

    } catch (error: any) {
      console.error("Error saving draft:", error);
      
      let errorMessage = "Failed to save draft. Please try again.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 413) {
        errorMessage = "File size too large. Please use smaller images.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error("Error", {
        id: loadingToastId,
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Confirm before leaving if there's unsaved data
    const confirmLeave = window.confirm(
      "Are you sure you want to cancel? Any unsaved changes will be lost."
    );
    
    if (confirmLeave) {
      router.push("/en/products");
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

      {/* Product Form - handles its own data fetching */}
      <ProductForm 
        mode="edit"
        productId={id}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditProductPage;

