"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategoriesApi, Category } from "@/api/categories/categories.api";
import { getProductByIdApi } from "@/api/product/products.api";
import { toast } from "sonner";
import { useProductFormStore } from "@/store";
import http from "@/utils/http";
import { API_RESOURCES } from "@/utils/api-endpoints";
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
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import {
  Upload,
  X,
  ImagePlus,
  DollarSign,
  Percent,
  Package,
  BarChart3,
  Plus,
  Trash2,
  Smartphone,
  Cpu,
  Monitor,
  Camera,
  Battery,
  Wifi,
  HardDrive,
  MemoryStick,
  Palette,
  Shield,
  Box,
  Video,
  FileText,
  Tag,
  Hash,
  Layers,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export interface Variant {
  id: string;
  storage: string;
  ram: string;
  color: string;
  bundle: string;
  warranty: string;
  price: string;
  stock: string;
  sku: string;
  image: string;
  imageFile?: File | null;
}

export interface ProductFormData {
  name: string;
  brand: string;
  model: string;
  sku: string;
  category: string;
  tags: string[];
  condition: string;
  price: number;
  salePrice: number;
  costPrice: number;
  tax: number;
  quantity: number;
  featuredImage: string;
  featuredImageFile: File | null;
  galleryImages: string[];
  galleryImageFiles: File[];
  videoUrl: string;
  variants: Variant[];
  displaySize: string;
  displayType: string;
  processor: string;
  rearCamera: string;
  frontCamera: string;
  battery: string;
  fastCharging: string;
  os: string;
  network: string;
  connectivity: string;
  simSupport: string;
  dimensions: string;
  weight: string;
  description: string;
  whatsInBox: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  visibility: string;
  publishDate: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string; // Required for edit mode - used to fetch product data
  onSubmit?: (data: ProductFormData) => void | Promise<void>; // Optional - if not provided, handles submission internally
  onSaveDraft?: (data: ProductFormData) => void | Promise<void>; // Optional - if not provided, handles submission internally
  onCancel?: () => void;
  isLoading?: boolean; // Optional - if not provided, manages loading state internally
}

// Brand options
const brandOptions = [
  "Samsung",
  "Apple",
  "Xiaomi",
  "Oppo",
  "Vivo",
  "Realme",
  "Infinix",
  "Redmi",
  "OnePlus",
  "Huawei",
  "Nokia",
  "Tecno",
  "Google",
  "Motorola",
  "Sony",
  "Other",
];


// Condition options
const conditionOptions = [
  { value: "new", label: "Brand New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
  { value: "open-box", label: "Open Box" },
];

// Storage options
const storageOptions = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];

// RAM options
const ramOptions = ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"];

// Color options
const colorOptions = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#a855f7" },
  { name: "Gold", value: "#d4af37" },
  { name: "Silver", value: "#c0c0c0" },
  { name: "Rose Gold", value: "#b76e79" },
  { name: "Gray", value: "#6b7280" },
];

// Bundle options
const bundleOptions = [
  { value: "complete", label: "Complete Box" },
  { value: "with-charger", label: "With Charger" },
  { value: "without-charger", label: "Without Charger" },
  { value: "phone-only", label: "Phone Only" },
];

// Warranty options
const warrantyOptions = [
  { value: "pta-approved", label: "PTA Approved" },
  { value: "non-pta", label: "Non-PTA" },
  { value: "local-warranty", label: "Local Warranty" },
  { value: "international", label: "International Warranty" },
  { value: "no-warranty", label: "No Warranty" },
];

// Display type options
const displayTypeOptions = [
  "AMOLED",
  "Super AMOLED",
  "Dynamic AMOLED",
  "OLED",
  "IPS LCD",
  "TFT LCD",
  "Retina",
  "Super Retina XDR",
  "LTPO AMOLED",
];

// OS options
const osOptions = [
  "Android 14",
  "Android 13",
  "Android 12",
  "iOS 17",
  "iOS 16",
  "HarmonyOS",
  "MIUI 14",
  "ColorOS 14",
  "OxygenOS 14",
  "One UI 6",
];

// Network options
const networkOptions = ["5G", "4G LTE", "4G", "3G"];

// SIM support options
const simSupportOptions = [
  "Dual SIM",
  "Single SIM",
  "Dual SIM + eSIM",
  "eSIM Only",
  "Dual Nano SIM",
];

const ProductForm: React.FC<ProductFormProps> = ({
  mode,
  productId,
  onSubmit,
  onSaveDraft,
  onCancel,
  isLoading: externalIsLoading,
}) => {
  const router = useRouter();
  
  // Internal loading state for API submission (if not provided externally)
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
  
  // Loading state for fetching product data in edit mode
  const [isFetchingProduct, setIsFetchingProduct] = useState(mode === "edit");
  
  // Ref to prevent duplicate submissions
  const isSubmittingRef = useRef(false);
  
  // Use product form store for all form state
  const {
    // Basic Info
    name, setName,
    brand, setBrand,
    model, setModel,
    sku, setSku,
    category, setCategory,
    tags, setTags,
    condition, setCondition,
    
    // Pricing
    price, setPrice,
    salePrice, setSalePrice,
    costPrice, setCostPrice,
    tax, setTax,
    quantity, setQuantity, // Main product quantity - separate from variant stock
    
    // Media
    featuredImage, setFeaturedImage,
    featuredImageFile, setFeaturedImageFile,
    galleryImages, setGalleryImages,
    galleryImageFiles, setGalleryImageFiles,
    videoUrl, setVideoUrl,
    
    // Variants
    variants, setVariants, addVariant, removeVariant, updateVariant,
    
    // Technical Specifications
    displaySize, setDisplaySize,
    displayType, setDisplayType,
    processor, setProcessor,
    rearCamera, setRearCamera,
    frontCamera, setFrontCamera,
    battery, setBattery,
    fastCharging, setFastCharging,
    os, setOs,
    network, setNetwork,
    connectivity, setConnectivity,
    simSupport, setSimSupport,
    dimensions, setDimensions,
    weight, setWeight,
    
    // Additional
    description, setDescription,
    whatsInBox, setWhatsInBox,
    status, setStatus,
    featured, setFeatured,
    visibility, setVisibility,
    publishDate, setPublishDate,
    
    // Store actions
    resetProductForm,
    initializeFromProduct,
  } = useProductFormStore();

  // Debug: Log store values on every render to see if they're updating
  // useEffect(() => {
  //   console.log("[ProductForm] Store values in component:", {
  //     name,
  //     brand,
  //     model,
  //     price,
  //     quantity,
  //     category,
  //     variantsCount: variants?.length,
  //   });
  // }, [name, brand, model, price, quantity, category, variants]);

  // Categories state (fetched from API)
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const response = await getCategoriesApi(1, 100);
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoriesError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch product data in edit mode and initialize store
  useEffect(() => {
    const fetchProduct = async () => {
      // console.log("[ProductForm] useEffect triggered - mode:", mode, "productId:", productId);
      
      if (mode === "edit" && productId) {
        try {
          setIsFetchingProduct(true);
          // console.log("[ProductForm] Fetching product with ID:", productId);
          
          const response = await getProductByIdApi(productId);
          
          // getProductByIdApi returns { status: string, data: Product }
          const productData = response.data;
          
          if (!productData) {
            throw new Error("Product data not found");
          }
          
          // Initialize store with product data
          initializeFromProduct(productData);
          
        } catch (error: any) {
          // console.error("[ProductForm] Failed to fetch product:", error);
          // console.error("[ProductForm] Error details:", {
          //   message: error?.message,
          //   response: error?.response?.data,
          //   status: error?.response?.status,
          // });
          toast.error("Failed to load product", {
            description: error?.response?.data?.message || error?.message || "Product not found",
          });
          // Reset to empty form on error to prevent showing stale data
          resetProductForm();
        } finally {
          setIsFetchingProduct(false);
        }
      } else if (mode === "create") {
        // console.log("[ProductForm] Create mode - resetting form");
        // Reset store to initial state for create mode
        resetProductForm();
        setIsFetchingProduct(false);
      }
    };

    fetchProduct();
    // Only depend on mode and productId - store functions (initializeFromProduct, resetProductForm) are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, productId]);

  // File input refs
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);
  const variantImageInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const variantImageFiles = useRef<{ [key: string]: File | null }>({});

  // Image upload handlers
  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      // Store the file for later upload
      setFeaturedImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFeaturedImage(previewUrl);
    }
  };

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const maxImages = 6 - galleryImages.length;
      const filesToProcess = Array.from(files).slice(0, maxImages);
      const validFiles: File[] = [];
      const previewUrls: string[] = [];

      filesToProcess.forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is larger than 5MB and will be skipped`);
          return;
        }
        validFiles.push(file);
        previewUrls.push(URL.createObjectURL(file));
      });

      setGalleryImageFiles([...galleryImageFiles, ...validFiles].slice(0, 6));
      setGalleryImages([...galleryImages, ...previewUrls].slice(0, 6));
    }
    // Reset input
    if (e.target) {
      e.target.value = "";
    }
  };

  const removeGalleryImage = (index: number) => {
    // Revoke the object URL to free memory
    if (galleryImages[index]?.startsWith("blob:")) {
      URL.revokeObjectURL(galleryImages[index]);
    }
    setGalleryImages(galleryImages.filter((_: string, i: number) => i !== index));
    setGalleryImageFiles(galleryImageFiles.filter((_: File, i: number) => i !== index));
  };

  const removeFeaturedImage = () => {
    // Revoke the object URL to free memory
    if (featuredImage?.startsWith("blob:")) {
      URL.revokeObjectURL(featuredImage);
    }
    setFeaturedImage("");
    setFeaturedImageFile(null);
    if (featuredImageInputRef.current) {
      featuredImageInputRef.current.value = "";
    }
  };

  const handleVariantImageChange = (variantId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      // Store the file for later upload
      variantImageFiles.current[variantId] = file;
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      updateVariant(variantId, { image: previewUrl });
    }
  };

  const removeVariantImage = (variantId: string) => {
    const currentImage = variants.find(v => v.id === variantId)?.image;
    if (currentImage?.startsWith("blob:")) {
      URL.revokeObjectURL(currentImage);
    }
    variantImageFiles.current[variantId] = null;
    updateVariant(variantId, { image: "" });
    const inputRef = variantImageInputRefs.current[variantId];
    if (inputRef) {
      inputRef.value = "";
    }
  };

  // Get variant image files for upload
  const getVariantImageFiles = (): { [variantId: string]: File | null } => {
    return variantImageFiles.current;
  };

  // Tag input state (local UI state, not stored in global store)
  const [tagInput, setTagInput] = useState("");

  // Collect form data from store - quantity and variant.stock are kept completely separate
  // Main quantity is independent from variant stock
  const collectFormData = (): ProductFormData => {
    return {
      name,
      brand,
      model,
      sku,
      category,
      tags,
      condition,
      price: parseFloat(price) || 0,
      salePrice: parseFloat(salePrice) || 0,
      costPrice: parseFloat(costPrice) || 0,
      tax: parseFloat(tax) || 0,
      quantity: parseInt(quantity) || 0, // Main product quantity, separate from variant stock
      featuredImage,
      featuredImageFile,
      galleryImages,
      galleryImageFiles,
      videoUrl,
      variants: variants.map(v => ({
        ...v,
        // Include the file reference for upload
        imageFile: variantImageFiles.current[v.id] || null,
      })) as Variant[],
      displaySize,
      displayType,
      processor,
      rearCamera,
      frontCamera,
      battery,
      fastCharging,
      os,
      network,
      connectivity,
      simSupport,
      dimensions,
      weight,
      description,
      whatsInBox,
      status,
      featured,
      visibility,
      publishDate,
    };
  };

  // Validation errors interface
  interface ValidationErrors {
    name?: string;
    brand?: string;
    model?: string;
    category?: string;
    price?: string;
    mainImage?: string;
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

    // Main image validation (required for create mode only)
    if (mode === "create" && !data.featuredImageFile && !data.featuredImage) {
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

    // Main Image - only append if it's a new file (for edit) or always (for create)
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

  // Handle submit - reads from store and calls API
  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current || isLoading) {
      return;
    }
    
    // Collect data from store
    const data = collectFormData();

    // If external onSubmit is provided, use it (backward compatibility)
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

    // Set submitting flag immediately to prevent duplicate clicks
    isSubmittingRef.current = true;
    setInternalIsLoading(true);
    const loadingToastId = toast.loading(
      mode === "create" ? "Creating product..." : "Updating product..."
    );

    try {
      // Build FormData
      const formData = buildFormData(data);

      // Call appropriate API based on mode
      if (mode === "create") {
        // POST for create
        await http.post(API_RESOURCES.PRODUCTS, formData, {
          timeout: 120000, // Increase timeout for file uploads
        });

        toast.success("Product created successfully!", {
          id: loadingToastId,
          description: `${data.name} has been added to your store.`,
        });

        // Reset store after successful creation
        resetProductForm();

        // Redirect to products list after short delay
        setTimeout(() => {
          router.push("/en/products");
        }, 1500);
      } else {
        // PUT for edit
        if (!productId) {
          throw new Error("Product ID is required for editing");
        }

        await http.patch(`${API_RESOURCES.PRODUCTS}/${productId}`, formData, {
          timeout: 120000, // Increase timeout for file uploads
        });

        toast.success("Product updated successfully!", {
          id: loadingToastId,
          description: `${data.name} has been updated.`,
        });

        // Redirect to products list after short delay
        setTimeout(() => {
          router.push("/en/products");
        }, 1500);
      }
    } catch (error: any) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} product:`, error);
      
      // Handle API error
      let errorMessage = `Failed to ${mode === "create" ? "create" : "update"} product. Please try again.`;
      
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
      setInternalIsLoading(false);
    }
  };

  // Handle save draft - reads from store and calls API
  const handleSaveDraft = async () => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current || isLoading) {
      return;
    }
    
    // Collect data from store
    const data = collectFormData();

    // If external onSaveDraft is provided, use it (backward compatibility)
    if (onSaveDraft) {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      try {
        await onSaveDraft({ ...data, status: "draft" });
      } finally {
        isSubmittingRef.current = false;
      }
      return;
    }

    // Otherwise, handle submission internally
    // For draft, only name is required
    if (!data.name?.trim()) {
      toast.error("Validation Error", {
        description: "Product name is required to save as draft",
      });
      return;
    }

    isSubmittingRef.current = true;
    setInternalIsLoading(true);
    const loadingToastId = toast.loading("Saving draft...");

    try {
      // Build FormData with draft status
      const draftData = { ...data, status: "draft" as const };
      const formData = buildFormData(draftData);

      // Call appropriate API based on mode
      if (mode === "create") {
        // POST for create
        await http.post(API_RESOURCES.PRODUCTS, formData, {
          timeout: 120000,
        });

        toast.success("Draft saved!", {
          id: loadingToastId,
          description: `${data.name} has been saved as draft.`,
        });

        // Reset store after successful creation
        resetProductForm();

        // Redirect to products list
        setTimeout(() => {
          router.push("/en/products");
        }, 1500);
      } else {
        // PATCH for edit
        if (!productId) {
          throw new Error("Product ID is required for editing");
        }

        await http.patch(`${API_RESOURCES.PRODUCTS}/${productId}`, formData, {
          timeout: 120000,
        });

        toast.success("Draft saved!", {
          id: loadingToastId,
          description: `${data.name} has been saved as draft.`,
        });

        // Redirect to products list
        setTimeout(() => {
          router.push("/en/products");
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
    // If external onCancel is provided, use it (backward compatibility)
    if (onCancel) {
      onCancel();
      return;
    }

    // Otherwise, handle cancel internally
    const confirmLeave = window.confirm(
      "Are you sure you want to cancel? Any unsaved changes will be lost."
    );
    
    if (confirmLeave) {
      // Reset store if in create mode
      if (mode === "create") {
        resetProductForm();
      }
      router.push("/en/products");
    }
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Variant functions (addVariant, removeVariant, updateVariant) are imported from store
  // They only modify variants state and do NOT affect main product quantity

  // Show loading state while fetching product data in edit mode
  if (isFetchingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-default-900">
            {mode === "create" ? "Add New Product" : "Edit Product"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "create"
              ? "Add a new mobile product to your store"
              : "Update product information"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Content - Left Side */}
        <div className="xl:col-span-8 space-y-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="productName" className="text-default-600">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="productName"
                  placeholder="e.g., Samsung Galaxy S24 Ultra 5G"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  size="lg"
                />
              </div>

              {/* Brand & Model Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-default-600">
                    Brand <span className="text-destructive">*</span>
                  </Label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandOptions.map((b) => (
                        <SelectItem key={b} value={b.toLowerCase()}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-default-600">
                    Model <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="model"
                    placeholder="e.g., Galaxy S24 Ultra"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    size="lg"
                  />
                </div>
              </div>

              {/* SKU & Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-default-600">
                    SKU / Product Code
                  </Label>
                  <InputGroup>
                    <InputGroupText>
                      <Hash className="h-4 w-4" />
                    </InputGroupText>
                    <Input
                      id="sku"
                      placeholder="e.g., SAM-S24U-256-BLK"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="rounded-l-none"
                      size="lg"
                    />
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-default-600">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={category} 
                    onValueChange={setCategory}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger>
                      {categoriesLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading categories...
                        </div>
                      ) : (
                        <SelectValue placeholder="Select Category" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesError ? (
                        <div className="px-2 py-4 text-center text-sm text-destructive">
                          {categoriesError}
                        </div>
                      ) : categories.length === 0 ? (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          No categories found
                        </div>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label htmlFor="condition" className="text-default-600">
                  Condition <span className="text-destructive">*</span>
                </Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((cond) => (
                      <SelectItem key={cond.value} value={cond.value}>
                        {cond.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-default-600">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </div>
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="soft"
                      color="default"
                      className="px-3 py-1 gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tags (e.g., flagship, 5G, gaming)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    size="lg"
                  />
                  <Button type="button" onClick={addTag} size="lg">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Regular Price */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-default-600">
                    Regular Price <span className="text-destructive">*</span>
                  </Label>
                  <InputGroup>
                    <InputGroupText>PKR</InputGroupText>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="rounded-l-none"
                      size="lg"
                    />
                  </InputGroup>
                </div>

                {/* Sale Price */}
                <div className="space-y-2">
                  <Label htmlFor="salePrice" className="text-default-600">
                    Sale Price / Discounted Price
                  </Label>
                  <InputGroup>
                    <InputGroupText>PKR</InputGroupText>
                    <Input
                      id="salePrice"
                      type="number"
                      placeholder="0"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="rounded-l-none"
                      size="lg"
                    />
                  </InputGroup>
                </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Cost Price */}
                <div className="space-y-2">
                  <Label htmlFor="costPrice" className="text-default-600">
                    Cost Price (Internal)
                  </Label>
                  <InputGroup>
                    <InputGroupText>PKR</InputGroupText>
                    <Input
                      id="costPrice"
                      type="number"
                      placeholder="0"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      className="rounded-l-none"
                      size="lg"
                    />
                  </InputGroup>
                  <p className="text-xs text-muted-foreground">
                    For profit calculation only - not visible to customers
                  </p>
              </div>

                {/* Tax */}
                <div className="space-y-2">
                  <Label htmlFor="tax" className="text-default-600">
                    Tax (%)
                  </Label>
                  <InputGroup>
                    <InputGroupText>
                      <Percent className="h-4 w-4" />
                    </InputGroupText>
                    <Input
                      id="tax"
                      type="number"
                      placeholder="0"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      className="rounded-l-none"
                      size="lg"
                    />
                  </InputGroup>
                </div>
              </div>

              {/* Stock Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-default-600">
                    Stock Quantity
                  </Label>
                  <InputGroup>
                    <InputGroupText>
                      <Package className="h-4 w-4" />
                    </InputGroupText>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="rounded-l-none"
                      size="lg"
                    />
                  </InputGroup>
                  <p className="text-xs text-muted-foreground">
                    Total available stock for this product
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Images Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Featured Image */}
              <div className="space-y-3">
                <Label className="text-default-600">
                  Featured Image <span className="text-destructive">*</span>
                </Label>
                <input
                  type="file"
                  ref={featuredImageInputRef}
                  onChange={handleFeaturedImageChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                {featuredImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-default-200 bg-default-50">
                    <img
                      src={featuredImage}
                      alt="Featured"
                      className="w-full h-64 object-contain bg-white"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="bg-white hover:bg-white/90"
                        onClick={() => featuredImageInputRef.current?.click()}
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
                        onClick={removeFeaturedImage}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => featuredImageInputRef.current?.click()}
                    className="border-2 border-dashed border-default-300 rounded-xl p-6 text-center hover:border-primary transition-colors duration-200 cursor-pointer bg-default-50/50"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <p className="text-default-700 font-medium">
                          Drop featured image here, or{" "}
                          <span className="text-primary">browse</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PNG, JPG, WEBP (Recommended: 800x800px, Max 5MB)
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-default-600">Gallery Images</Label>
                  <span className="text-xs text-muted-foreground">
                    {galleryImages.length}/6 images
                  </span>
                </div>
                <input
                  type="file"
                  ref={galleryImageInputRef}
                  onChange={handleGalleryImageChange}
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {/* Existing gallery images */}
                  {galleryImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg border border-default-200 bg-default-50 overflow-hidden group"
                    >
                      <img
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:text-white hover:bg-red-500/80"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {/* Add more images slots */}
                  {galleryImages.length < 6 && (
                    <div
                      onClick={() => galleryImageInputRef.current?.click()}
                      className="relative aspect-square rounded-lg border-2 border-dashed border-default-200 bg-default-50 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Plus className="h-6 w-6 text-default-400" />
                        <span className="text-xs text-default-400">Add More</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Add up to 6 gallery images. PNG, JPG, WEBP (Max 5MB each)
                </p>
              </div>

              {/* Video URL */}
                <div className="space-y-2">
                <Label htmlFor="videoUrl" className="text-default-600">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video URL (Optional)
                  </div>
                  </Label>
                    <Input
                  id="videoUrl"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                      size="lg"
                    />
                  <p className="text-xs text-muted-foreground">
                  YouTube or Vimeo link for product video
                  </p>
              </div>
            </CardContent>
          </Card>

          {/* Variants Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                  Product Variants
              </CardTitle>
                <Button type="button" onClick={addVariant} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="p-5 border border-default-200 rounded-xl bg-default-50/50 space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-default-700">
                      Variant #{index + 1}
                    </h4>
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeVariant(variant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Variant Options Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Storage */}
                <div className="space-y-2">
                      <Label className="text-default-600 text-sm">
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-3.5 w-3.5" />
                          Storage
                        </div>
                  </Label>
                      <Select
                        value={variant.storage}
                        onValueChange={(val) =>
                          updateVariant(variant.id, { storage: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {storageOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* RAM */}
                    <div className="space-y-2">
                      <Label className="text-default-600 text-sm">
                        <div className="flex items-center gap-1">
                          <MemoryStick className="h-3.5 w-3.5" />
                          RAM
                        </div>
                      </Label>
                      <Select
                        value={variant.ram}
                        onValueChange={(val) =>
                          updateVariant(variant.id, { ram: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {ramOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                      <Label className="text-default-600 text-sm">
                        <div className="flex items-center gap-1">
                          <Palette className="h-3.5 w-3.5" />
                          Color
                        </div>
                      </Label>
                      <Select
                        value={variant.color}
                        onValueChange={(val) =>
                          updateVariant(variant.id, { color: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((opt) => (
                            <SelectItem key={opt.name} value={opt.name}>
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-4 w-4 rounded-full border border-default-300"
                                  style={{ backgroundColor: opt.value }}
                                />
                                {opt.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                </div>

                  {/* Variant Options Row 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bundle */}
                <div className="space-y-2">
                      <Label className="text-default-600 text-sm">
                        <div className="flex items-center gap-1">
                          <Box className="h-3.5 w-3.5" />
                          Bundle
                        </div>
                      </Label>
                      <Select
                        value={variant.bundle}
                        onValueChange={(val) =>
                          updateVariant(variant.id, { bundle: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Bundle" />
                        </SelectTrigger>
                        <SelectContent>
                          {bundleOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Warranty */}
                    <div className="space-y-2">
                      <Label className="text-default-600 text-sm">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5" />
                          Warranty Status
                        </div>
                      </Label>
                      <Select
                        value={variant.warranty}
                        onValueChange={(val) =>
                          updateVariant(variant.id, { warranty: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Warranty" />
                        </SelectTrigger>
                        <SelectContent>
                          {warrantyOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Variant Price, Stock, SKU Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Price */}
                    <div className="space-y-2">
                      <Label className="text-default-600 text-sm">
                        Price (PKR)
                  </Label>
                  <Input
                        type="number"
                        placeholder="0"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(variant.id, { price: e.target.value })
                        }
                    size="lg"
                  />
                </div>

                    {/* Stock */}
                <div className="space-y-2">
                      <Label className="text-default-600 text-sm">
                        Stock Quantity
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(variant.id, { stock: e.target.value })
                        }
                    size="lg"
                  />
              </div>

                    {/* SKU */}
                    <div className="space-y-2">
                      <Label className="text-default-600 text-sm">
                        Variant SKU
                      </Label>
                      <Input
                        placeholder="e.g., SAM-S24U-256-BLK"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(variant.id, { sku: e.target.value })
                        }
                        size="lg"
                      />
                </div>
              </div>

                  {/* Variant Image */}
                  <div className="space-y-2">
                    <Label className="text-default-600 text-sm">
                      Variant Image
                    </Label>
                    <input
                      type="file"
                      ref={(el) => {
                        variantImageInputRefs.current[variant.id] = el;
                      }}
                      onChange={(e) => handleVariantImageChange(variant.id, e)}
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                    />
                    <div className="flex items-center gap-4">
                      {variant.image ? (
                        <div className="relative h-16 w-16 rounded-lg border border-default-200 overflow-hidden group">
                          <img
                            src={variant.image}
                            alt={`Variant ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button
                              type="button"
                              className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center"
                              onClick={() => variantImageInputRefs.current[variant.id]?.click()}
                            >
                              <Upload className="h-3 w-3 text-white" />
                            </button>
                            <button
                              type="button"
                              className="h-6 w-6 rounded bg-red-500/80 hover:bg-red-500 flex items-center justify-center"
                              onClick={() => removeVariantImage(variant.id)}
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => variantImageInputRefs.current[variant.id]?.click()}
                          className="h-16 w-16 rounded-lg border-2 border-dashed border-default-300 flex items-center justify-center bg-default-50 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                          <ImagePlus className="h-5 w-5 text-default-400" />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Upload image specific to this variant (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Technical Specifications Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Display Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-default-700 flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  Display
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label className="text-default-600 text-sm">
                      Display Size
                    </Label>
                    <Input
                      placeholder='e.g., 6.8"'
                      value={displaySize}
                      onChange={(e) => setDisplaySize(e.target.value)}
                      size="lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-default-600 text-sm">
                      Display Type
                    </Label>
                    <Select value={displayType} onValueChange={setDisplayType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Display Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {displayTypeOptions.map((opt) => (
                          <SelectItem key={opt} value={opt.toLowerCase()}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Processor */}
              <div className="space-y-4">
                <h4 className="font-medium text-default-700 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  Processor
                </h4>
                <div className="pl-6">
                  <Input
                    placeholder="e.g., Snapdragon 8 Gen 3 / Apple A17 Pro"
                    value={processor}
                    onChange={(e) => setProcessor(e.target.value)}
                    size="lg"
                  />
                </div>
              </div>

              {/* Camera Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-default-700 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  Camera
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                    <Label className="text-default-600 text-sm">
                      Rear Camera
                </Label>
                  <Input
                      placeholder="e.g., 200MP + 12MP + 50MP + 10MP"
                      value={rearCamera}
                      onChange={(e) => setRearCamera(e.target.value)}
                    size="lg"
                  />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-default-600 text-sm">
                      Front Camera
                    </Label>
                    <Input
                      placeholder="e.g., 12MP"
                      value={frontCamera}
                      onChange={(e) => setFrontCamera(e.target.value)}
                      size="lg"
                    />
                  </div>
                </div>
              </div>

              {/* Battery Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-default-700 flex items-center gap-2">
                  <Battery className="h-4 w-4 text-primary" />
                  Battery & Charging
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                    <Label className="text-default-600 text-sm">
                      Battery Capacity
                </Label>
                    <Input
                      placeholder="e.g., 5000 mAh"
                      value={battery}
                      onChange={(e) => setBattery(e.target.value)}
                      size="lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-default-600 text-sm">
                      Fast Charging
                    </Label>
                    <Input
                      placeholder="e.g., 45W Wired, 15W Wireless"
                      value={fastCharging}
                      onChange={(e) => setFastCharging(e.target.value)}
                      size="lg"
                    />
                  </div>
                </div>
              </div>

              {/* OS & Network */}
              <div className="space-y-4">
                <h4 className="font-medium text-default-700 flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-primary" />
                  Software & Network
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                    <Label className="text-default-600 text-sm">
                      Operating System
                    </Label>
                    <Select value={os} onValueChange={setOs}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select OS" />
                      </SelectTrigger>
                      <SelectContent>
                        {osOptions.map((opt) => (
                          <SelectItem key={opt} value={opt.toLowerCase()}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-default-600 text-sm">Network</Label>
                    <Select value={network} onValueChange={setNetwork}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Network" />
                      </SelectTrigger>
                      <SelectContent>
                        {networkOptions.map((opt) => (
                          <SelectItem key={opt} value={opt.toLowerCase()}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Connectivity & SIM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label className="text-default-600 text-sm">
                    Connectivity (Bluetooth / NFC)
                </Label>
                <Input
                    placeholder="e.g., Bluetooth 5.3, NFC"
                    value={connectivity}
                    onChange={(e) => setConnectivity(e.target.value)}
                  size="lg"
                />
                </div>
                <div className="space-y-2">
                  <Label className="text-default-600 text-sm">SIM Support</Label>
                  <Select value={simSupport} onValueChange={setSimSupport}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SIM Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {simSupportOptions.map((opt) => (
                        <SelectItem key={opt} value={opt.toLowerCase()}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dimensions & Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                  <Label className="text-default-600 text-sm">
                    Dimensions (L x W x H)
                </Label>
                  <Input
                    placeholder="e.g., 162.3 x 79 x 8.6 mm"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    size="lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-default-600 text-sm">Weight</Label>
                  <Input
                    placeholder="e.g., 233g"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    size="lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Full Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-default-600">
                  Full Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter detailed product description. Include key features, specifications, and selling points..."
                  className="min-h-[180px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Rich text editor will be available in full version
                </p>
              </div>

              {/* What's in the Box */}
              <div className="space-y-2">
                <Label htmlFor="whatsInBox" className="text-default-600">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    What's in the Box
                  </div>
                </Label>
                <Textarea
                  id="whatsInBox"
                  placeholder="List all items included in the box:&#10;• Phone&#10;• Charger (45W)&#10;• USB-C Cable&#10;• SIM Ejector Tool&#10;• User Manual"
                  className="min-h-[120px]"
                  value={whatsInBox}
                  onChange={(e) => setWhatsInBox(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Side */}
        <div className="xl:col-span-4 space-y-6">
          {/* Product Status Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Product Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-default-600">
                  Status
                </Label>
                <Select value={status} onValueChange={(val) => setStatus(val as "draft" | "published" | "archived")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-warning" />
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-success" />
                        Published
                      </div>
                    </SelectItem>
                    <SelectItem value="archived">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-default-400" />
                        Archived
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label htmlFor="visibility" className="text-default-600">
                  Visibility
                </Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">Visible</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Featured Product */}
              <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg border border-default-200">
                <div>
                  <p className="font-medium text-default-700 text-sm">
                    Featured Product
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Show on homepage
                  </p>
                </div>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>

              {/* Publish Schedule */}
              <div className="space-y-2">
                <Label className="text-default-600">Publish Date</Label>
                <Input 
                  type="datetime-local" 
                  size="lg" 
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-medium">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <span className="text-sm text-default-600">Total Variants</span>
                  <Badge variant="soft" color="info">
                    {variants.length}
                  </Badge>
              </div>
                <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                  <span className="text-sm text-default-600">Total Stock</span>
                  <Badge variant="soft" color="success">
                    {variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)}
                  </Badge>
              </div>
                <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                  <span className="text-sm text-default-600">Tags Added</span>
                  <Badge variant="soft" color="warning">
                    {tags.length}
                  </Badge>
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Card */}
          <Card className="sticky top-6">
            <CardContent className="pt-6 space-y-3">
              <Button 
                type="button"
                className="w-full" 
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading || isSubmittingRef.current}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  mode === "create" ? "Create Product" : "Update Product"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                className="w-full"
                size="lg"
                onClick={handleSaveDraft}
                disabled={isLoading || isSubmittingRef.current}
              >
                Save as Draft
              </Button>
              <Button
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
    </div>
  );
};

export default ProductForm;
