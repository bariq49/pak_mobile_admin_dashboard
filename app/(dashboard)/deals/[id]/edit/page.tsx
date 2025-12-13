"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DealForm, { DealFormData } from "@/components/deal-form";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { getDealByIdApi, updateDealApi } from "@/api/deals/deals.api";
import { useDealFormStore } from "@/store";

// Validation errors interface
interface ValidationErrors {
  title?: string;
  discountType?: string;
  discountValue?: string;
  startDate?: string;
  endDate?: string;
}

const EditDealPage = () => {
  const router = useRouter();
  const params = useParams();
  // Get deal ID from URL params (used for fetching and updating)
  const dealId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDeal, setIsFetchingDeal] = useState(true);
  const isSubmittingRef = useRef(false);
  const { initializeFromDeal } = useDealFormStore();

  // Validate deal ID
  if (!dealId) {
    toast.error("Deal ID is required");
    router.push("/en/deals");
    return null;
  }

  // Fetch deal by ID and initialize store
  useEffect(() => {
    const fetchDeal = async () => {
      setIsFetchingDeal(true);
      try {
        const response = await getDealByIdApi(dealId);
        if (response?.data) {
          // Initialize store with deal data
          initializeFromDeal(response.data);
        } else {
          throw new Error("Deal data not found in response");
        }
      } catch (error: any) {
        console.error("Failed to fetch deal:", error);
        toast.error("Failed to load deal", {
          description: error?.response?.data?.message || error?.message || "Deal not found",
        });
        router.push("/en/deals");
      } finally {
        setIsFetchingDeal(false);
      }
    };

    fetchDeal();
  }, [dealId, router, initializeFromDeal]);

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
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.btnText) formData.append("btnText", data.btnText);

    // Target Selection
    formData.append("isGlobal", data.isGlobal.toString());
    
    // Only append specific targets if not global
    if (!data.isGlobal) {
      if (data.products && data.products.length > 0) {
        formData.append("products", JSON.stringify(data.products));
      }
      if (data.categories && data.categories.length > 0) {
        formData.append("categories", JSON.stringify(data.categories));
      }
      if (data.subCategories && data.subCategories.length > 0) {
        formData.append("subCategories", JSON.stringify(data.subCategories));
      }
    }

    // Discount Details
    formData.append("discountType", data.discountType);
    formData.append("discountValue", data.discountValue);

    // Time Window
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);

    // Priority
    if (data.priority) {
      formData.append("priority", data.priority);
    }

    // Images - desktop and mobile (only append if new files are selected)
    if (data.desktopImageFile) {
      formData.append("desktop", data.desktopImageFile);
    }
    if (data.mobileImageFile) {
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
    const loadingToastId = toast.loading("Updating deal...");

    try {
      // Build FormData
      const formData = buildFormData(data);

      // Use dealId for updates
      if (!dealId) {
        throw new Error("Deal ID not found. Please refresh the page.");
      }

      // Send as multipart/form-data using updateDealApi
      await updateDealApi(dealId, formData);

      // Success
      toast.success("Deal updated successfully!", {
        id: loadingToastId,
        description: `${data.title} has been updated.`,
      });

      // Redirect to deals list after short delay
      setTimeout(() => {
        router.push("/en/deals");
      }, 1500);

    } catch (error: any) {
      console.error("Error updating deal:", error);
      
      // Handle API error
      let errorMessage = "Failed to update deal. Please try again.";
      
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

      // Use dealId for updates
      if (!dealId) {
        throw new Error("Deal ID not found. Please refresh the page.");
      }

      // Send as multipart/form-data using updateDealApi
      await updateDealApi(dealId, formData);

      // Success
      toast.success("Draft saved!", {
        id: loadingToastId,
        description: `${data.title} has been saved as draft.`,
      });

      // Redirect to deals list
      setTimeout(() => {
        router.push("/en/deals");
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
      router.push("/en/deals");
    }
  };

  // Show loading state while fetching deal data
  if (isFetchingDeal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading deal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs>
        <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/deals">Deals</BreadcrumbItem>
        <BreadcrumbItem>Edit Deal</BreadcrumbItem>
      </Breadcrumbs>

      {/* Deal Form - uses store initialized from fetched deal data */}
      <DealForm 
        mode="edit"
        dealId={dealId}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditDealPage;

