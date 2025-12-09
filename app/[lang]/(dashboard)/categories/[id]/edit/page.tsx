"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import CategoryForm, { CategoryFormData } from "@/components/category-form";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";

// Validation errors interface
interface ValidationErrors {
  name?: string;
}

const EditCategoryPage = () => {
  const router = useRouter();
  const params = useParams();
  // Get category ID from URL params (this is the _id, not slug)
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  // Validate category ID
  if (!id) {
    toast.error("Category ID is required");
    router.push("/en/categories");
    return null;
  }

  // Validate required fields
  const validateForm = (data: CategoryFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Basic Info validation
    if (!data.name?.trim()) {
      errors.name = "Category name is required";
    }

    return errors;
  };

  // Build FormData for multipart submission
  const buildFormData = (data: CategoryFormData): FormData => {
    const formData = new FormData();

    // Basic Info
    formData.append("name", data.name);
    if (data.slug) formData.append("slug", data.slug);
    if (data.description) formData.append("description", data.description);
    
    // Parent and Type
    if (data.parent) {
      formData.append("parent", data.parent);
    }
    formData.append("type", data.type);

    // Image - only append if it's a new file (API expects "thumbnail")
    if (data.imageFile) {
      formData.append("thumbnail", data.imageFile);
    }

    // Status (API uses "active" not "isActive")
    formData.append("active", data.isActive.toString());

    // SEO
    if (data.metaTitle) formData.append("metaTitle", data.metaTitle);
    if (data.metaDescription) formData.append("metaDescription", data.metaDescription);

    return formData;
  };

  // Handle form submission
  const handleSubmit = async (data: CategoryFormData) => {
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
    const loadingToastId = toast.loading("Updating category...");

    try {
      // Build FormData
      const formData = buildFormData(data);

      // Send as multipart/form-data using PATCH method
      await http.patch(`${API_RESOURCES.CATEGORIES}/${id}`, formData, {
        timeout: 120000,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Success
      toast.success("Category updated successfully!", {
        id: loadingToastId,
        description: `${data.name} has been updated.`,
      });

      // Redirect to categories list after short delay
      setTimeout(() => {
        router.push("/en/categories");
      }, 1500);
    } catch (error: any) {
      console.error("Error updating category:", error);

      // Handle API error
      let errorMessage = "Failed to update category. Please try again.";

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
  const handleSaveDraft = async (data: CategoryFormData) => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    // For draft, only name is required
    if (!data.name?.trim()) {
      toast.error("Validation Error", {
        description: "Category name is required to save as draft",
      });
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    const loadingToastId = toast.loading("Saving draft...");

    try {
      // Build FormData with inactive status
      const draftData = { ...data, isActive: false };
      const formData = buildFormData(draftData);

      // Use appropriate endpoint based on whether it's a subcategory
      if (data.parent) {
        // Update subcategory draft
        await http.patch(`${API_RESOURCES.SUBCATEGORIES}/${id}`, formData, {
          timeout: 120000,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Update root category draft
        await http.patch(`${API_RESOURCES.CATEGORIES}/${id}`, formData, {
          timeout: 120000,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Success
      toast.success("Draft saved!", {
        id: loadingToastId,
        description: `${data.name} has been saved as draft.`,
      });

      // Redirect to categories list
      setTimeout(() => {
        router.push("/en/categories");
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
      router.push("/en/categories");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs>
          <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
          <BreadcrumbItem href="/categories">Categories</BreadcrumbItem>
          <BreadcrumbItem>Edit Category</BreadcrumbItem>
        </Breadcrumbs>

        <div>
          <h1 className="text-2xl font-semibold text-default-900">
            Edit Category
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update category information and settings
          </p>
        </div>
      </div>

      {/* Category Form - handles its own data fetching */}
      <CategoryForm
        mode="edit"
        categoryId={id}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditCategoryPage;

