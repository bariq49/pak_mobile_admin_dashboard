"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDealFormStore } from "@/store";
import { getCategoriesApi, Category } from "@/api/categories/categories.api";
import { getProductsApi, Product } from "@/api/product/products.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  ImagePlus,
  Trash2,
  Percent,
  Calendar,
  Tag,
  Globe,
  Package,
  Layers,
  Target,
  X,
  Plus,
  Monitor,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Form data interface
export interface DealFormData {
  title: string;
  description: string;
  btnText: string;
  dealVariant: "MAIN" | "FLASH" | "SUPER" | "MEGA";
  desktopImage: string;
  desktopImageFile: File | null;
  mobileImage: string;
  mobileImageFile: File | null;
  products: string[];
  categories: string[];
  subCategories: string[];
  isGlobal: boolean;
  discountType: "percentage" | "fixed" | "flat";
  discountValue: string;
  startDate: string;
  endDate: string;
  priority: string;
  isActive: boolean;
}

interface DealFormProps {
  mode: "create" | "edit";
  dealId?: string; // Optional - for edit mode
  onSubmit?: (data: DealFormData) => void | Promise<void>;
  onSaveDraft?: (data: DealFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const DealForm: React.FC<DealFormProps> = ({
  mode,
  dealId,
  onSubmit,
  onSaveDraft,
  onCancel,
  isLoading: externalIsLoading,
}) => {
  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  
  // Desktop and mobile image input refs
  const desktopImageInputRef = useRef<HTMLInputElement>(null);
  const mobileImageInputRef = useRef<HTMLInputElement>(null);

  // Get store state and actions
  const {
    title,
    description,
    btnText,
    dealVariant,
    desktopImage,
    desktopImageFile,
    mobileImage,
    mobileImageFile,
    products,
    categories,
    subCategories,
    isGlobal,
    discountType,
    discountValue,
    startDate,
    endDate,
    priority,
    setTitle,
    setDescription,
    setBtnText,
    setDealVariant,
    setDesktopImage,
    setDesktopImageFile,
    setMobileImage,
    setMobileImageFile,
    setProducts,
    addProduct,
    removeProduct,
    setCategories,
    addCategory,
    removeCategory,
    setSubCategories,
    addSubCategory,
    removeSubCategory,
    setIsGlobal,
    setDiscountType,
    setDiscountValue,
    setStartDate,
    setEndDate,
    setPriority,
    isActive,
    setIsActive,
    resetDealForm,
  } = useDealFormStore();

  // Use external loading state if provided, otherwise use internal
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;

  // State for fetching products, categories, and subcategories
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Reset form on mount for create mode
  useEffect(() => {
    if (mode === "create") {
      resetDealForm();
    }
  }, [mode, resetDealForm]);

  // Fetch products and categories for selection
  useEffect(() => {
    const fetchData = async () => {
      // Fetch products
      setProductsLoading(true);
      try {
        const productsResponse = await getProductsApi(1, 1000); // Large limit to get all
        setAllProducts(productsResponse.data?.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }

      // Fetch categories
      setCategoriesLoading(true);
      try {
        const categoriesResponse = await getCategoriesApi(1, 1000); // Large limit to get all
        setAllCategories(categoriesResponse.data?.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle desktop image change
  const handleDesktopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setDesktopImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setDesktopImage(previewUrl);
    }
  };

  // Handle mobile image change
  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setMobileImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setMobileImage(previewUrl);
    }
  };

  // Remove desktop image
  const removeDesktopImage = () => {
    if (desktopImage?.startsWith("blob:")) {
      URL.revokeObjectURL(desktopImage);
    }
    setDesktopImage("");
    setDesktopImageFile(null);
    if (desktopImageInputRef.current) {
      desktopImageInputRef.current.value = "";
    }
  };

  // Remove mobile image
  const removeMobileImage = () => {
    if (mobileImage?.startsWith("blob:")) {
      URL.revokeObjectURL(mobileImage);
    }
    setMobileImage("");
    setMobileImageFile(null);
    if (mobileImageInputRef.current) {
      mobileImageInputRef.current.value = "";
    }
  };

  // Collect form data from store
  const collectFormData = (): DealFormData => {
    return {
      title,
      description,
      btnText,
      dealVariant,
      desktopImage,
      desktopImageFile,
      mobileImage,
      mobileImageFile,
      // Ensure arrays are always arrays (defensive programming)
      products: Array.isArray(products) ? products : [],
      categories: Array.isArray(categories) ? categories : [],
      subCategories: Array.isArray(subCategories) ? subCategories : [],
      isGlobal,
      discountType,
      discountValue,
      startDate,
      endDate,
      priority,
      isActive,
    };
  };

  // Validation errors interface
  interface ValidationErrors {
    title?: string;
    discountType?: string;
    discountValue?: string;
    startDate?: string;
    endDate?: string;
  }

  // Validate form
  const validateForm = (data: DealFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current || isLoading) {
      return;
    }

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

    // Otherwise, handle submission internally (will be implemented later)
    const validation = validateForm(data);
    const errorKeys = Object.keys(validation) as (keyof ValidationErrors)[];

    if (errorKeys.length > 0) {
      const firstError = validation[errorKeys[0]];
      toast.error("Validation Error", {
        description: firstError,
      });
      return;
    }

    toast.info("Form submission will be implemented soon");
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    if (isSubmittingRef.current || isLoading) {
      return;
    }

    const data = collectFormData();

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

    toast.info("Draft save will be implemented soon");
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
      if (mode === "create") {
        resetDealForm();
      }
      router.push("/deals");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-default-900">
            {mode === "create" ? "Create New Deal" : "Edit Deal"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "create"
              ? "Create a new promotional deal or campaign"
              : "Update deal information"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Content - Left Side */}
          <div className="xl:col-span-8 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {/* Deal Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-default-600">
                    Deal Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Weekend Sale, Black Friday Deal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    size="lg"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-default-600">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the deal or campaign..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Button Text */}
                <div className="space-y-2">
                  <Label htmlFor="btnText" className="text-default-600">
                    Button Text
                  </Label>
                  <Input
                    id="btnText"
                    placeholder="e.g., Shop Now, Get Deal"
                    value={btnText}
                    onChange={(e) => setBtnText(e.target.value)}
                    size="lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Text displayed on the deal banner button
                  </p>
                </div>

                {/* Deal Variant */}
                <div className="space-y-2">
                  <Label htmlFor="dealVariant" className="text-default-600">
                    Deal Variant <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={dealVariant}
                    onValueChange={(value) =>
                      setDealVariant(
                        value as "MAIN" | "FLASH" | "SUPER" | "MEGA"
                      )
                    }
                  >
                    <SelectTrigger id="dealVariant">
                      <SelectValue placeholder="Select deal variant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAIN">MAIN</SelectItem>
                      <SelectItem value="FLASH">FLASH</SelectItem>
                      <SelectItem value="SUPER">SUPER</SelectItem>
                      <SelectItem value="MEGA">MEGA</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select the type of deal variant.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Deal Images Card */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-primary" />
                  Deal Images
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Desktop Image */}
                <div className="space-y-3">
                  <Label className="text-default-600 flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop Image
                  </Label>
                  <input
                    type="file"
                    ref={desktopImageInputRef}
                    onChange={handleDesktopImageChange}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                  {desktopImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-default-200 bg-default-50">
                      <img
                        src={desktopImage}
                        alt="Desktop"
                        className="w-full h-48 object-contain bg-white"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeDesktopImage}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => desktopImageInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => desktopImageInputRef.current?.click()}
                      className="border-2 border-dashed border-default-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    >
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload desktop image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Mobile Image */}
                <div className="space-y-3">
                  <Label className="text-default-600 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Image
                  </Label>
                  <input
                    type="file"
                    ref={mobileImageInputRef}
                    onChange={handleMobileImageChange}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                  {mobileImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-default-200 bg-default-50">
                      <img
                        src={mobileImage}
                        alt="Mobile"
                        className="w-full h-48 object-contain bg-white"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeMobileImage}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => mobileImageInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => mobileImageInputRef.current?.click()}
                      className="border-2 border-dashed border-default-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    >
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload mobile image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Target Selection Card */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Target Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {/* Global Deal Toggle */}
                <div className="flex items-center justify-between p-4 border border-default-200 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="isGlobal" className="text-default-600 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Apply to All Products
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      When enabled, this deal applies to all products in your store
                    </p>
                  </div>
                  <Switch
                    id="isGlobal"
                    checked={isGlobal}
                    onCheckedChange={setIsGlobal}
                  />
                </div>

                {!isGlobal && (
                  <div className="space-y-5 pt-4 border-t border-default-200">
                    <p className="text-sm text-muted-foreground">
                      Select specific products, categories, or subcategories to target:
                    </p>

                    {/* Products Selection */}
                    <div className="space-y-2">
                      <Label className="text-default-600 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Products
                      </Label>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value && Array.isArray(products) && !products.includes(value)) {
                            addProduct(value);
                          }
                        }}
                        disabled={productsLoading}
                      >
                        <SelectTrigger>
                          {productsLoading ? (
                            <span className="text-muted-foreground">Loading products...</span>
                          ) : (
                            <SelectValue placeholder="Select a product" />
                          )}
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {allProducts
                            .filter((p) => Array.isArray(products) && !products.includes(p._id || p.id))
                            .map((product) => (
                              <SelectItem key={product._id || product.id} value={product._id || product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {Array.isArray(products) && products.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {products.map((productId) => {
                            const product = allProducts.find((p) => (p._id || p.id) === productId);
                            return (
                              <Badge
                                key={productId}
                                variant="outline"
                                className="flex items-center gap-1 pr-1"
                              >
                                <span>{product?.name || productId}</span>
                                <button
                                  type="button"
                                  onClick={() => removeProduct(productId)}
                                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Categories Selection */}
                    <div className="space-y-2">
                      <Label className="text-default-600 flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Categories
                      </Label>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value && Array.isArray(categories) && !categories.includes(value)) {
                            addCategory(value);
                          }
                        }}
                        disabled={categoriesLoading}
                      >
                        <SelectTrigger>
                          {categoriesLoading ? (
                            <span className="text-muted-foreground">Loading categories...</span>
                          ) : (
                            <SelectValue placeholder="Select a category" />
                          )}
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {allCategories
                            .filter((c) => !c.parent && Array.isArray(categories) && !categories.includes(c._id))
                            .map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {Array.isArray(categories) && categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {categories.map((categoryId) => {
                            const category = allCategories.find((c) => c._id === categoryId);
                            return (
                              <Badge
                                key={categoryId}
                                variant="outline"
                                className="flex items-center gap-1 pr-1"
                              >
                                <span>{category?.name || categoryId}</span>
                                <button
                                  type="button"
                                  onClick={() => removeCategory(categoryId)}
                                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Subcategories Selection */}
                    <div className="space-y-2">
                      <Label className="text-default-600 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Subcategories
                      </Label>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value && Array.isArray(subCategories) && !subCategories.includes(value)) {
                            addSubCategory(value);
                          }
                        }}
                        disabled={categoriesLoading}
                      >
                        <SelectTrigger>
                          {categoriesLoading ? (
                            <span className="text-muted-foreground">Loading subcategories...</span>
                          ) : (
                            <SelectValue placeholder="Select a subcategory" />
                          )}
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {allCategories
                            .flatMap((cat) =>
                              (cat.children || []).map((subCat: Category) => ({
                                ...subCat,
                                parentName: cat.name,
                              }))
                            )
                            .filter((subCat) => Array.isArray(subCategories) && !subCategories.includes(subCat._id))
                            .map((subCat) => (
                              <SelectItem key={subCat._id} value={subCat._id}>
                                {subCat.parentName} → {subCat.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {Array.isArray(subCategories) && subCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {subCategories.map((subCategoryId) => {
                            const subCategory = allCategories
                              .flatMap((cat) => cat.children || [])
                              .find((sub) => sub._id === subCategoryId);
                            const parentCategory = allCategories.find((cat) =>
                              cat.children?.some((sub) => sub._id === subCategoryId)
                            );
                            return (
                              <Badge
                                key={subCategoryId}
                                variant="outline"
                                className="flex items-center gap-1 pr-1"
                              >
                                <span>
                                  {parentCategory?.name} → {subCategory?.name || subCategoryId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeSubCategory(subCategoryId)}
                                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Window & Status Card */}
            {/* Note: existing time window card is elsewhere; we add Active toggle near dates there */}
            {/* Discount Details Card */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Percent className="h-5 w-5 text-primary" />
                  Discount Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Discount Type */}
                  <div className="space-y-2">
                    <Label htmlFor="discountType" className="text-default-600">
                      Discount Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={discountType}
                      onValueChange={(value: "percentage" | "fixed" | "flat") =>
                        setDiscountType(value)
                      }
                    >
                      <SelectTrigger size="lg">
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="flat">Flat Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Discount Value */}
                  <div className="space-y-2">
                    <Label htmlFor="discountValue" className="text-default-600">
                      Discount Value <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      placeholder={
                        discountType === "percentage" ? "e.g., 20" : "e.g., 5000"
                      }
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      size="lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      {discountType === "percentage"
                        ? "Enter percentage (e.g., 20 for 20% off)"
                        : "Enter fixed amount (e.g., 5000 for Rs. 5000 off)"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Window Card */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Time Window & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-default-600">
                      Start Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      size="lg"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-default-600">
                      End Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      size="lg"
                      min={startDate || undefined}
                    />
                  </div>
                </div>

                {/* Active / Inactive Toggle */}
                <div className="flex items-center justify-between p-4 border border-default-200 rounded-lg">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="isActive"
                      className="text-default-600 flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Active / Inactive
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Turn this off to pause the deal without changing the dates.
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="xl:col-span-4 space-y-6">
            {/* Priority Card */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium">Priority</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-2">
                <Label htmlFor="priority" className="text-default-600">
                  Priority Level
                </Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="1"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  size="lg"
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Higher priority deals are applied first when multiple deals apply to the same product
                </p>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {mode === "create" ? "Create Deal" : "Update Deal"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="ghost"
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
    </div>
  );
};

export default DealForm;

