"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  mainImage?: string;
}

const CreateProductPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

    // Main image validation (required)
    if (!data.featuredImageFile && !data.featuredImage) {
      errors.mainImage = "Featured image is required";
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
    if (data.salePrice) formData.append("salePrice", data.salePrice.toString());
    if (data.tax) formData.append("tax", data.tax.toString());
    
    // Sale fields
    if (data.onSale) {
      formData.append("on_sale", "true");
      if (data.saleStart) formData.append("sale_start", data.saleStart);
      if (data.saleEnd) formData.append("sale_end", data.saleEnd);
    } else {
      formData.append("on_sale", "false");
    }
    
    // Stock Quantity
    formData.append("quantity", String(data.quantity || 0));

    // Main Image (required) - send as 'mainImage' field
    if (data.featuredImageFile) {
      formData.append("mainImage", data.featuredImageFile);
    }

    // Gallery Images (optional) - send as 'galleryImages' field (multiple files)
    if (data.galleryImageFiles && data.galleryImageFiles.length > 0) {
      data.galleryImageFiles.forEach((file) => {
        formData.append("galleryImages", file);
      });
    }

    // Video URL
    if (data.videoUrl) formData.append("videoUrl", data.videoUrl);

    // Variants - filter out empty ones and send as JSON
    const validVariants = data.variants?.filter(v => 
      v.storage || v.ram || v.color || v.bundle || v.warranty || v.price || v.stock
    ).map(v => ({
      storage: v.storage || undefined,
      ram: v.ram || undefined,
      color: v.color || undefined,
      bundle: v.bundle || undefined,
      warranty: v.warranty || undefined,
      price: parseFloat(v.price) || undefined,
      stock: parseInt(v.stock) || 0,
      sku: v.sku || undefined,
    }));

    if (validVariants && validVariants.length > 0) {
      formData.append("variants", JSON.stringify(validVariants));
    }

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

    // Stock is now handled by quantity field above
    // If no quantity entered, calculate from variants as fallback
    if (!data.quantity) {
      const totalStock = data.variants?.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0) || 0;
      formData.append("stock", totalStock.toString());
    }

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
    const loadingToastId = toast.loading("Creating product...");

    try {
      // Build FormData
      const formData = buildFormData(data);


      // Debug: Log the form data being submitted
      console.log("=== Product Form Submission ===");
      console.log("Form Data Object:", {
        name: data.name,
        brand: data.brand,
        model: data.model,
        category: data.category,
        price: data.price,
        quantity: data.quantity,
        // Log all form data entries
      });
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      console.log("================================");

      // Send as multipart/form-data (axios handles Content-Type automatically for FormData)
      await http.post(API_RESOURCES.PRODUCTS, formData, {
        // Increase timeout for file uploads
        timeout: 120000,
      });

      // Success
      toast.success("Product created successfully!", {
        id: loadingToastId,
        description: `${data.name} has been added to your store.`,
      });

      // Redirect to products list after short delay
      setTimeout(() => {
        router.push("/products");
      }, 1500);

    } catch (error: any) {
      console.error("Error creating product:", error);
      
      // Handle API error
      let errorMessage = "Failed to create product. Please try again.";
      
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

      // Send as multipart/form-data (axios handles Content-Type automatically for FormData)
      await http.post(API_RESOURCES.PRODUCTS, formData, {
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
      router.push("/products");
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem>Create Product</BreadcrumbItem>
      </Breadcrumbs>

      {/* Product Form */}
      <ProductForm 
        mode="create"
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CreateProductPage;
