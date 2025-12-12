"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategoryBySlugApi, getRootCategoriesApi, createSubcategoryApi, updateSubcategoryApi, Category } from "@/api/categories/categories.api";
import { toast } from "sonner";
import { useCategoryFormStore } from "@/store";
import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FolderTree,
  FileText,
  Globe,
  ImagePlus,
  Trash2,
  Link2,
  Type,
  AlignLeft,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Form data interface
export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parent: string | null;
  type: "mega" | "normal";
  image: string;
  imageFile: File | null;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
}

interface CategoryFormProps {
  mode: "create" | "edit";
  categorySlug?: string; // Required for edit mode - used to fetch category data by slug
  categoryId?: string; // Optional - ID extracted from fetched category, used for updates
  onSubmit?: (data: CategoryFormData) => void | Promise<void>; // Optional - if not provided, handles submission internally
  onSaveDraft?: (data: CategoryFormData) => void | Promise<void>; // Optional - if not provided, handles submission internally
  onCancel?: () => void;
  isLoading?: boolean; // Optional - if not provided, manages loading state internally
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  mode,
  categorySlug,
  categoryId: externalCategoryId, // ID passed from parent (extracted from fetched category)
  onSubmit,
  onSaveDraft,
  onCancel,
  isLoading: externalIsLoading,
}) => {
  // Store the ID extracted from fetched category
  const [internalCategoryId, setInternalCategoryId] = useState<string | undefined>(externalCategoryId);
  const categoryId = externalCategoryId || internalCategoryId;
  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const [isFetchingCategory, setIsFetchingCategory] = useState(mode === "edit");
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  // Get store state and actions
  const {
    name,
    slug,
    description,
    parent,
    type,
    image,
    imageFile,
    isActive,
    metaTitle,
    metaDescription,
    setName,
    setSlug,
    setDescription,
    setParent,
    setType,
    setImage,
    setImageFile,
    setIsActive,
    setMetaTitle,
    setMetaDescription,
    resetCategoryForm,
    initializeFromCategory,
  } = useCategoryFormStore();

  // Image input ref
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Use external loading state if provided, otherwise use internal
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;

  // Fetch parent categories for dropdown
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        setIsLoadingParents(true);
        const rootCategories = await getRootCategoriesApi();
        // Filter out current category if editing (to prevent self-parenting)
        const filtered = mode === "edit" && categoryId
          ? rootCategories.filter((cat: Category) => cat._id !== categoryId)
          : rootCategories;
        setParentCategories(filtered);
      } catch (error: any) {
        console.error("[CategoryForm] Failed to fetch parent categories:", error);
        // Don't show error toast, just log it - form can still work without parent options
      } finally {
        setIsLoadingParents(false);
      }
    };

    fetchParentCategories();
  }, [mode, categoryId]);

  // Fetch category data for edit mode
  useEffect(() => {
    const fetchCategory = async () => {
      if (mode === "edit" && categorySlug) {
        try {
          setIsFetchingCategory(true);
          // Fetch category by slug (not ID)
          const response = await getCategoryBySlugApi(categorySlug);
          const categoryData = response?.data;

          if (!categoryData) {
            throw new Error("Category data not found");
          }

          // Extract and store the ID from fetched category (needed for updates)
          if (categoryData._id) {
            setInternalCategoryId(categoryData._id);
          }

          initializeFromCategory(categoryData);
        } catch (error: any) {
          console.error(`[CategoryForm] Failed to fetch category with slug ${categorySlug}:`, error);
          const errorMessage = error?.response?.data?.message || error?.message || "Failed to load category";
          toast.error("Failed to load category", { description: errorMessage });
          resetCategoryForm();
        } finally {
          setIsFetchingCategory(false);
        }
      } else if (mode === "create") {
        resetCategoryForm();
        setIsFetchingCategory(false);
      }
    };

    fetchCategory();
  }, [mode, categorySlug, initializeFromCategory, resetCategoryForm]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImage(previewUrl);
    }
  };

  // Remove image
  const removeImage = () => {
    if (image?.startsWith("blob:")) {
      URL.revokeObjectURL(image);
    }
    setImage("");
    setImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Collect form data from store
  const collectFormData = (): CategoryFormData => {
    return {
      name,
      slug,
      description,
      parent,
      type,
      image,
      imageFile,
      isActive,
      metaTitle,
      metaDescription,
    };
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

    // Image - only append if it's a new file (API expects "thumbnail" for single image)
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

  // Validate form
  const validateForm = (data: CategoryFormData): { isValid: boolean; error?: string } => {
    if (!data.name?.trim()) {
      return { isValid: false, error: "Category name is required" };
    }
    return { isValid: true };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    // Collect data from store
    const data = collectFormData();

    // If external onSubmit is provided, use it
    if (onSubmit) {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      try {
        await onSubmit(data);
      } finally {
        isSubmittingRef.current = false;
      }
      return;
    }

    // Otherwise, handle submission internally
    // Validate form
    const validation = validateForm(data);
    if (!validation.isValid) {
      toast.error("Validation Error", {
        description: validation.error,
      });
      return;
    }

    isSubmittingRef.current = true;
    setInternalIsLoading(true);
    const loadingToastId = toast.loading(
      mode === "create" ? "Creating category..." : "Updating category..."
    );

    try {
      // Build FormData
      const formData = buildFormData(data);

      // Call appropriate API based on mode and parent selection
      if (mode === "create") {
        if (data.parent) {
          // Create subcategory
          await createSubcategoryApi(data.parent, formData);
          toast.success("Subcategory created successfully!", {
            id: loadingToastId,
            description: `${data.name} has been added as a subcategory.`,
          });
        } else {
          // Create root category
          await http.post(API_RESOURCES.CATEGORIES, formData, {
            timeout: 120000,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          toast.success("Category created successfully!", {
            id: loadingToastId,
            description: `${data.name} has been added.`,
          });
        }

        // Reset store after successful creation
        resetCategoryForm();

        // Redirect to categories list after short delay
        setTimeout(() => {
          router.push("/en/categories");
        }, 1500);
      } else {
        // Edit mode
        if (!categoryId) {
          throw new Error("Category ID is required for editing");
        }

        // Determine if it's a subcategory (has parent) or root category
        // Use appropriate endpoint based on whether parent exists
        if (data.parent) {
          // Update subcategory (or category with parent)
          await updateSubcategoryApi(categoryId, formData);
        } else {
          // Update root category (or remove parent from subcategory)
          await http.patch(`${API_RESOURCES.CATEGORIES}/${categoryId}`, formData, {
            timeout: 120000,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }

        toast.success("Category updated successfully!", {
          id: loadingToastId,
          description: `${data.name} has been updated.`,
        });

        // Redirect to categories list after short delay
        setTimeout(() => {
          router.push("/en/categories");
        }, 1500);
      }
    } catch (error: any) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} category:`, error);

      let errorMessage = `Failed to ${mode === "create" ? "create" : "update"} category. Please try again.`;

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
      setInternalIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    // Collect data from store
    const data = collectFormData();

    // If external onSaveDraft is provided, use it
    if (onSaveDraft) {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      try {
        await onSaveDraft(data);
      } finally {
        isSubmittingRef.current = false;
      }
      return;
    }

    // Otherwise, handle draft save internally
    // For draft, only name is required
    if (!data.name?.trim()) {
      toast.error("Validation Error", {
        description: "Category name is required to save as draft",
      });
      return;
    }

    isSubmittingRef.current = true;
    setInternalIsLoading(true);
    const loadingToastId = toast.loading("Saving draft...");

    try {
      // Build FormData with inactive status
      const draftData = { ...data, isActive: false };
      const formData = buildFormData(draftData);

      if (mode === "create") {
        // Create draft - check if subcategory or root
        if (data.parent) {
          await createSubcategoryApi(data.parent, formData);
        } else {
          await http.post(API_RESOURCES.CATEGORIES, formData, {
            timeout: 120000,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }

        toast.success("Draft saved!", {
          id: loadingToastId,
          description: `${data.name} has been saved as draft.`,
        });

        // Reset form
        resetCategoryForm();

        // Redirect to categories list
        setTimeout(() => {
          router.push("/en/categories");
        }, 1500);
      } else {
        // Update draft
        if (!categoryId) {
          throw new Error("Category ID is required for editing");
        }

        // Use appropriate endpoint based on parent
        if (data.parent) {
          await updateSubcategoryApi(categoryId, formData);
        } else {
          await http.patch(`${API_RESOURCES.CATEGORIES}/${categoryId}`, formData, {
            timeout: 120000,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }

        toast.success("Draft saved!", {
          id: loadingToastId,
          description: `${data.name} has been saved as draft.`,
        });

        // Redirect to categories list
        setTimeout(() => {
          router.push("/en/categories");
        }, 1500);
      }
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
      setInternalIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    const confirmLeave = window.confirm(
      "Are you sure you want to cancel? Any unsaved changes will be lost."
    );

    if (confirmLeave) {
      resetCategoryForm();
      router.push("/en/categories");
    }
  };

  // Show loading state while fetching category data
  if (isFetchingCategory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading category data...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-primary" />
                Category Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-default-600">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Category Name <span className="text-destructive">*</span>
                  </div>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Mobile Phones"
                  size="lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-default-600">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Slug
                  </div>
                </Label>
                <Input
                  id="slug"
                  placeholder="mobile-phones"
                  size="lg"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Auto-generated from name. You can edit it manually.
                </p>
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="parent" className="text-default-600">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Parent Category
                  </div>
                </Label>
                <Select
                  value={parent || ""}
                  onValueChange={(value) => setParent(value === "none" ? null : value)}
                  disabled={isLoadingParents}
                >
                  <SelectTrigger size="lg">
                    <SelectValue placeholder={isLoadingParents ? "Loading categories..." : "Select parent category (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {parentCategories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {parent 
                    ? "This will be created as a subcategory" 
                    : "Leave empty to create a root category"}
                </p>
              </div>

              {/* Category Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-default-600">
                  <div className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4" />
                    Category Type
                  </div>
                </Label>
                <Select
                  value={type}
                  onValueChange={(value: "mega" | "normal") => setType(value)}
                >
                  <SelectTrigger size="lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="mega">Mega Menu</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Mega menu categories are ideal for large dropdown menus with multiple subcategories
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-default-600">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4" />
                    Description
                  </div>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter category description..."
                  className="min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Image Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" />
                Category Image
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />

              {image ? (
                <div className="relative rounded-xl overflow-hidden border border-default-200 bg-default-50">
                  <img
                    src={image}
                    alt="Category"
                    className="w-full h-64 object-contain bg-white"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="bg-white hover:bg-white/90"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      color="destructive"
                      className="bg-destructive text-white hover:bg-destructive/90 border-destructive"
                      onClick={removeImage}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="border-2 border-dashed border-default-300 rounded-xl p-8 text-center hover:border-primary transition-colors duration-200 cursor-pointer bg-default-50/50"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-default-700 font-medium">
                        Drop your image here, or{" "}
                        <span className="text-primary">browse</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG, WEBP (Recommended: 400x400px, Max 5MB)
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO / Meta Information Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                SEO / Meta Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Meta Title */}
              <div className="space-y-2">
                <Label htmlFor="metaTitle" className="text-default-600">
                  Meta Title
                </Label>
                <Input
                  id="metaTitle"
                  placeholder="Enter meta title for SEO"
                  size="lg"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 50-60 characters
                </p>
              </div>

              {/* Meta Description */}
              <div className="space-y-2">
                <Label htmlFor="metaDescription" className="text-default-600">
                  Meta Description
                </Label>
                <Textarea
                  id="metaDescription"
                  placeholder="Enter meta description for search engines..."
                  className="min-h-[100px]"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 150-160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Side */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg border border-default-200">
                <div>
                  <p className="font-medium text-default-700">
                    Category Status
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this category
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-default-600">Current Status:</span>
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium",
                    isActive
                      ? "bg-success/10 text-success"
                      : "bg-default-200 text-default-600"
                  )}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium">Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="aspect-square rounded-lg border border-default-200 bg-default-50 overflow-hidden flex items-center justify-center">
                  {image ? (
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImagePlus className="h-12 w-12 text-default-300 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No image selected
                      </p>
                    </div>
                  )}
                </div>

                {/* Name Preview */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Category Name
                  </p>
                  <p className="font-medium text-default-900 truncate">
                    {name || "Untitled Category"}
                  </p>
                </div>

                {/* Slug Preview */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    URL Slug
                  </p>
                  <p className="text-sm text-primary truncate">
                    /{slug || "category-slug"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Card */}
          <Card className="sticky top-6">
            <CardContent className="pt-6 space-y-3">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading
                  ? mode === "create"
                    ? "Creating..."
                    : "Updating..."
                  : mode === "create"
                  ? "Create Category"
                  : "Update Category"}
              </Button>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                className="w-full"
                size="lg"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save as Draft"}
              </Button>
              <Button
                type="button"
                variant="outline"
                color="destructive"
                className="w-full"
                size="lg"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default CategoryForm;

