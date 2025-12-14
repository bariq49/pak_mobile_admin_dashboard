"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DealForm, { DealFormData } from "@/components/deal-form";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { createDealApi } from "@/api/deals/deals.api";
import { API_RESOURCES } from "@/utils/api-endpoints";
import http from "@/utils/http";

// Validation errors interface
interface ValidationErrors {
  title?: string;
  discountType?: string;
  discountValue?: string;
  startDate?: string;
  endDate?: string;
}

const CreateDealPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  // Validate required fields
  const validateForm = (data: DealFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Basic Info validation
    if (!data.title?.trim()) {
      errors.title = "Deal title is required";
    }

    if (!data.discountType) {
      errors.discountType = "Discount type is required";
    }

    if (!data.discountValue || parseFloat(data.discountValue) <= 0) {
      errors.discountValue = "Discount value must be greater than 0";
    }

    if (!data.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!data.endDate) {
      errors.endDate = "End date is required";
    }

    if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
      errors.endDate = "End date must be after start date";
    }

    return errors;
  };

  // Build FormData for multipart submission
  const buildFormData = (data: DealFormData): FormData => {
    const formData = new FormData();

    // Basic Info
    formData.append("title", data.title || "");
    if (data.description) formData.append("description", data.description);
    if (data.btnText) formData.append("btnText", data.btnText);

    // Target Selection
    formData.append("isGlobal", data.isGlobal ? "true" : "false");
    
    // Ensure arrays are always arrays (defensive)
    const productsArray = Array.isArray(data.products) ? data.products : [];
    const categoriesArray = Array.isArray(data.categories) ? data.categories : [];
    const subCategoriesArray = Array.isArray(data.subCategories) ? data.subCategories : [];
    
    // Send arrays properly - append each item individually
    // Backend will receive them as arrays automatically
    productsArray.forEach((productId) => {
      formData.append("products[]", productId);
    });
    
    categoriesArray.forEach((categoryId) => {
      formData.append("categories[]", categoryId);
    });
    
    subCategoriesArray.forEach((subCategoryId) => {
      formData.append("subCategories[]", subCategoryId);
    });

    // Discount Details
    formData.append("discountType", data.discountType || "percentage");
    formData.append("discountValue", data.discountValue || "0");

    // Time Window
    formData.append("startDate", data.startDate || "");
    formData.append("endDate", data.endDate || "");

    // Priority
    formData.append("priority", data.priority || "1");

    // Images - desktop and mobile (only append if files exist)
    if (data.desktopImageFile && data.desktopImageFile instanceof File) {
      formData.append("desktop", data.desktopImageFile);
    }
    if (data.mobileImageFile && data.mobileImageFile instanceof File) {
      formData.append("mobile", data.mobileImageFile);
    }

    return formData;
  };

  // Handle form submission
  const handleSubmit = async (data: DealFormData) => {
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
    const loadingToastId = toast.loading("Creating deal...");

    try {
      // Build FormData
      const formData = buildFormData(data);

      // Debug: Log FormData contents (for troubleshooting)
      console.log("=== Deal FormData Debug ===");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }
      console.log("===========================");

      // Send as multipart/form-data
      // NOTE: Do NOT set Content-Type header manually - browser sets it automatically with boundary
      await http.post(API_RESOURCES.DEALS, formData, {
        timeout: 120000,
      });

      // Success
      toast.success("Deal created successfully!", {
        id: loadingToastId,
        description: `${data.title} has been created.`,
      });

      // Redirect to deals list after short delay
      setTimeout(() => {
        router.push("/deals");
      }, 1500);

    } catch (error: any) {
      console.error("Error creating deal:", error);
      
      // Handle API error
      let errorMessage = "Failed to create deal. Please try again.";
      
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
  const handleSaveDraft = async (data: DealFormData) => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    // For draft, only title is required
    if (!data.title?.trim()) {
      toast.error("Validation Error", {
        description: "Deal title is required to save as draft",
      });
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    const loadingToastId = toast.loading("Saving draft...");

    try {
      // Build FormData
      const formData = buildFormData(data);

      // Send as multipart/form-data
      // NOTE: Do NOT set Content-Type header manually - browser sets it automatically with boundary
      await http.post(API_RESOURCES.DEALS, formData, {
        timeout: 120000,
      });

      // Success
      toast.success("Draft saved!", {
        id: loadingToastId,
        description: `${data.title} has been saved as draft.`,
      });

      // Redirect to deals list
      setTimeout(() => {
        router.push("/deals");
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
      router.push("/deals");
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/deals">Deals</BreadcrumbItem>
        <BreadcrumbItem>Create Deal</BreadcrumbItem>
      </Breadcrumbs>

      {/* Deal Form */}
      <DealForm 
        mode="create"
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CreateDealPage;

