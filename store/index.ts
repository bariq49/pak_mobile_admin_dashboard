import { create } from 'zustand'
import { siteConfig } from "@/config/site";
import { persist, createJSONStorage } from "zustand/middleware";

interface ThemeStoreState {
  theme: string;
  setTheme: (theme: string) => void;
  radius: number;
  setRadius: (value: number) => void;
  layout: string;
  setLayout: (value: string) => void;
  navbarType: string;
  setNavbarType: (value: string) => void;
  footerType: string;
  setFooterType: (value: string) => void;
  isRtl: boolean;
  setRtl: (value: boolean) => void;
  
}

export const useThemeStore = create<ThemeStoreState>()(
 persist(
      (set) => ({
           theme: siteConfig.theme,
      setTheme: (theme) => set({ theme }),
      radius: siteConfig.radius,
      setRadius: (value) => set({ radius: value }),
      layout: siteConfig.layout,
      setLayout: (value) => {
        set({ layout: value });

        // If the new layout is "semibox," also set the sidebarType to "popover"
        if (value === "semibox") {
          useSidebar.setState({ sidebarType: "popover" });
        }
        if (value === "horizontal") {
          useSidebar.setState({ sidebarType: "classic" });
        }
        //
        if (value === "horizontal") {
          // update  setNavbarType
          useThemeStore.setState({ navbarType: "sticky" });
        }
      },
      navbarType: siteConfig.navbarType,
      setNavbarType: (value) => set({ navbarType: value }),
      footerType: siteConfig.footerType,
      setFooterType: (value) => set({ footerType: value }),
      isRtl: false,
      setRtl: (value) => set({ isRtl: value }),
        
      }),
      { name: "theme-store",
      storage: createJSONStorage(() => localStorage), },
    ),
)



interface SidebarState {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  sidebarType: string;
  setSidebarType: (value: string) => void;
  subMenu: boolean;
  setSubmenu: (value: boolean) => void;
  // background image
  sidebarBg: string;
  setSidebarBg: (value: string) => void;
  mobileMenu: boolean;
  setMobileMenu: (value: boolean) => void;
  
}


export const useSidebar = create<SidebarState>()(
   persist(
      (set) => ({
          collapsed: false,
      setCollapsed: (value) => set({ collapsed: value }),
      sidebarType:
        siteConfig.layout === "semibox" ? "popover" : siteConfig.sidebarType,
      setSidebarType: (value) => {
        set({ sidebarType: value });
      },
      subMenu: false,
      setSubmenu: (value) => set({ subMenu: value }),
      // background image
      sidebarBg: siteConfig.sidebarBg,
      setSidebarBg: (value) => set({ sidebarBg: value }),
      mobileMenu: false,
      setMobileMenu: (value) => set({ mobileMenu: value }),
      
      }),
      {  name: "sidebar-store",
      storage: createJSONStorage(() => localStorage), },
    ),
)

// Product Form Store
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

interface ProductFormStoreState {
  // Basic Info
  name: string;
  brand: string;
  model: string;
  sku: string;
  category: string; // Parent category ID
  subCategory: string; // Subcategory ID
  tags: string[];
  condition: string;
  
  // Pricing
  price: string;
  salePrice: string;
  tax: string;
  quantity: string; // Main product quantity - separate from variant stock
  
  // Media
  featuredImage: string;
  featuredImageFile: File | null;
  galleryImages: string[];
  galleryImageFiles: File[];
  videoUrl: string;
  
  // Variants
  variants: Variant[];
  
  // Additional Information (Dynamic Key-Value Pairs)
  additionalInfo: Array<{ key: string; value: string }>;
  
  // Additional
  description: string;
  whatsInBox: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  visibility: string;
  publishDate: string;
  
  // Actions - Basic Info
  setName: (value: string) => void;
  setBrand: (value: string) => void;
  setModel: (value: string) => void;
  setSku: (value: string) => void;
  setCategory: (value: string) => void;
  setSubCategory: (value: string) => void;
  setTags: (value: string[]) => void;
  setCondition: (value: string) => void;
  
  // Actions - Pricing
  setPrice: (value: string) => void;
  setSalePrice: (value: string) => void;
  setTax: (value: string) => void;
  setQuantity: (value: string) => void;
  
  // Actions - Media
  setFeaturedImage: (value: string) => void;
  setFeaturedImageFile: (value: File | null) => void;
  setGalleryImages: (value: string[]) => void;
  setGalleryImageFiles: (value: File[]) => void;
  setVideoUrl: (value: string) => void;
  
  // Actions - Variants
  setVariants: (value: Variant[]) => void;
  addVariant: () => void;
  removeVariant: (id: string) => void;
  updateVariant: (id: string, updates: Partial<Variant>) => void;
  
  // Actions - Additional Information
  setAdditionalInfo: (value: Array<{ key: string; value: string }>) => void;
  addAdditionalInfoField: () => void;
  updateAdditionalInfoField: (index: number, field: { key?: string; value?: string }) => void;
  removeAdditionalInfoField: (index: number) => void;
  
  // Actions - Additional
  setDescription: (value: string) => void;
  setWhatsInBox: (value: string) => void;
  setStatus: (value: "draft" | "published" | "archived") => void;
  setFeatured: (value: boolean) => void;
  setVisibility: (value: string) => void;
  setPublishDate: (value: string) => void;
  
  // Reset store to initial state
  resetProductForm: () => void;
  
  // Initialize from product data (for edit mode)
  initializeFromProduct: (product: any) => void;
}

const initialProductFormState = {
  // Basic Info
  name: "",
  brand: "",
  model: "",
  sku: "",
  category: "",
  subCategory: "",
  tags: [] as string[],
  condition: "new",
  
  // Pricing
  price: "",
  salePrice: "",
  tax: "",
  quantity: "0",
  
  // Media
  featuredImage: "",
  featuredImageFile: null as File | null,
  galleryImages: [] as string[],
  galleryImageFiles: [] as File[],
  videoUrl: "",
  
  // Variants
  variants: [] as Variant[],
  
  // Additional Information (Dynamic Key-Value Pairs)
  additionalInfo: [] as Array<{ key: string; value: string }>,
  
  // Additional
  description: "",
  whatsInBox: "",
  status: "draft" as const,
  featured: false,
  visibility: "visible",
  publishDate: "",
};

export const useProductFormStore = create<ProductFormStoreState>()((set, get) => ({
  ...initialProductFormState,
  
  // Basic Info Actions
  setName: (value: string) => {
    // console.log("[ProductStore] setName:", value);
    set({ name: value });
  },
  setBrand: (value: string) => {
    // console.log("[ProductStore] setBrand:", value);
    set({ brand: value });
  },
  setModel: (value: string) => {
    // console.log("[ProductStore] setModel:", value);
    set({ model: value });
  },
  setSku: (value: string) => {
    // console.log("[ProductStore] setSku:", value);
    set({ sku: value });
  },
  setCategory: (value: string) => {
    // console.log("[ProductStore] setCategory:", value);
    // When category changes, clear subCategory
    set({ category: value, subCategory: "" });
  },
  setSubCategory: (value: string) => {
    // console.log("[ProductStore] setSubCategory:", value);
    set({ subCategory: value });
  },
  setTags: (value: string[]) => {
    // console.log("[ProductStore] setTags:", value);
    set({ tags: value });
  },
  setCondition: (value: string) => {
    // console.log("[ProductStore] setCondition:", value);
    set({ condition: value });
  },
  
  // Pricing Actions
  setPrice: (value: string) => {
    // console.log("[ProductStore] setPrice:", value);
    set({ price: value });
  },
  setSalePrice: (value: string) => {
    // console.log("[ProductStore] setSalePrice:", value);
    set({ salePrice: value });
  },
  setTax: (value: string) => {
    // console.log("[ProductStore] setTax:", value);
    set({ tax: value });
  },
  setQuantity: (value: string) => {
    // console.log("[ProductStore] setQuantity:", value, "(main product quantity, separate from variant stock)");
    set({ quantity: value });
  },
  
  // Media Actions
  setFeaturedImage: (value: string) => {
    // console.log("[ProductStore] setFeaturedImage:", value);
    set({ featuredImage: value });
  },
  setFeaturedImageFile: (value: File | null) => {
    // console.log("[ProductStore] setFeaturedImageFile:", value?.name || "null");
    set({ featuredImageFile: value });
  },
  setGalleryImages: (value: string[]) => {
    // console.log("[ProductStore] setGalleryImages:", value.length, "images");
    set({ galleryImages: value });
  },
  setGalleryImageFiles: (value: File[]) => {
    // console.log("[ProductStore] setGalleryImageFiles:", value.length, "files");
    set({ galleryImageFiles: value });
  },
  setVideoUrl: (value: string) => {
    // console.log("[ProductStore] setVideoUrl:", value);
    set({ videoUrl: value });
  },
  
  // Variants Actions
  setVariants: (value: Variant[]) => {
    // console.log("[ProductStore] setVariants:", value.length, "variants");
    set({ variants: value });
  },
  addVariant: () => {
    const currentVariants = get().variants;
    const newVariant: Variant = {
      id: Date.now().toString(),
      storage: "",
      ram: "",
      color: "",
      bundle: "",
      warranty: "",
      price: "",
      stock: "",
      sku: "",
      image: "",
    };
    // console.log("[ProductStore] addVariant: Adding new variant", newVariant.id);
    set({ variants: [...currentVariants, newVariant] });
  },
  removeVariant: (id: string) => {
    const currentVariants = get().variants;
    console.log("[ProductStore] removeVariant: Removing variant", id);
    set({ variants: currentVariants.filter((v) => v.id !== id) });
  },
  updateVariant: (id: string, updates: Partial<Variant>) => {
    const currentVariants = get().variants;
    console.log("[ProductStore] updateVariant: Updating variant", id, updates);
    set({
      variants: currentVariants.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    });
  },
  
  // Actions - Additional Information
  setAdditionalInfo: (value: Array<{ key: string; value: string }>) => {
    set({ additionalInfo: value });
  },
  addAdditionalInfoField: () => {
    const current = get().additionalInfo;
    set({ additionalInfo: [...current, { key: "", value: "" }] });
  },
  updateAdditionalInfoField: (index: number, field: { key?: string; value?: string }) => {
    const current = get().additionalInfo;
    const updated = [...current];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        ...(field.key !== undefined && { key: field.key }),
        ...(field.value !== undefined && { value: field.value }),
      };
      set({ additionalInfo: updated });
    }
  },
  removeAdditionalInfoField: (index: number) => {
    const current = get().additionalInfo;
    const updated = current.filter((_, i) => i !== index);
    set({ additionalInfo: updated });
  },
  
  // Additional Actions
  setDescription: (value: string) => {
    console.log("[ProductStore] setDescription:", value?.substring(0, 50) + "...");
    set({ description: value });
  },
  setWhatsInBox: (value: string) => {
    console.log("[ProductStore] setWhatsInBox:", value?.substring(0, 50) + "...");
    set({ whatsInBox: value });
  },
  setStatus: (value: "draft" | "published" | "archived") => {
    console.log("[ProductStore] setStatus:", value);
    set({ status: value });
  },
  setFeatured: (value: boolean) => {
    console.log("[ProductStore] setFeatured:", value);
    set({ featured: value });
  },
  setVisibility: (value: string) => {
    console.log("[ProductStore] setVisibility:", value);
    set({ visibility: value });
  },
  setPublishDate: (value: string) => {
    console.log("[ProductStore] setPublishDate:", value);
    set({ publishDate: value });
  },
  
  // Reset to initial state
  resetProductForm: () => {
    console.log("[ProductStore] resetProductForm: Resetting all fields to initial state");
    set(initialProductFormState);
  },
  
  // Initialize from product data (for edit mode) - Single atomic update
  initializeFromProduct: (product: any) => {
    // Extract featured image - API has mainImage or image.thumbnail or image.original
    let featuredImageUrl = "";
    if (product.mainImage) {
      featuredImageUrl = product.mainImage;
    } else if (product.image?.thumbnail) {
      featuredImageUrl = product.image.thumbnail;
    } else if (product.image?.original) {
      featuredImageUrl = product.image.original;
    }
    
    // Extract gallery images - API has galleryImages array or gallery array
    let galleryImageUrls: string[] = [];
    if (Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
      galleryImageUrls = product.galleryImages
        .map((img: any) => typeof img === 'string' ? img : img?.url || img?.original || img?.thumbnail)
        .filter((url: any) => url && typeof url === 'string');
    } else if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      galleryImageUrls = product.gallery
        .map((img: any) => typeof img === 'string' ? img : img?.url || img?.original || img?.thumbnail)
        .filter((url: any) => url && typeof url === 'string');
    }
    
    // Single atomic set() call to update all fields at once
    const newState = {
      // Basic Info
      name: product.name || product.productName || "",
      brand: product.brand || "",
      model: product.model || "",
      sku: product.sku || "",
      category: typeof product.category === "string" 
        ? product.category 
        : product.category?._id || product.category?.id || "",
      subCategory: typeof product.subCategory === "string"
        ? product.subCategory
        : product.subCategory?._id || product.subCategory?.id || "",
      condition: product.condition || "new",
      tags: Array.isArray(product.tags) ? product.tags.map((t: any) => typeof t === 'string' ? t : t.name || t) : [],
      
      // Pricing - handle both salePrice and sale_price
      price: product.price !== undefined ? product.price.toString() : "0",
      salePrice: (product.salePrice !== undefined ? product.salePrice : product.sale_price !== undefined ? product.sale_price : 0).toString(),
      tax: product.tax !== undefined ? product.tax.toString() : "0",
      quantity: product.quantity !== undefined ? product.quantity.toString() : "0",
      
      // Media
      featuredImage: featuredImageUrl,
      featuredImageFile: null,
      galleryImages: galleryImageUrls,
      galleryImageFiles: [],
      videoUrl: product.videoUrl || "",
      
      // Variants - API has variants array (might be empty)
      variants: (product.variants && Array.isArray(product.variants) && product.variants.length > 0)
        ? product.variants.map((v: any, index: number) => ({
            id: v._id || v.id || `variant-${Date.now()}-${index}`,
            storage: v.storage || "",
            ram: v.ram || "",
            color: v.color || "",
            bundle: v.bundle || "",
            warranty: v.warranty || "",
            price: v.price !== undefined ? v.price.toString() : "",
            stock: v.stock !== undefined ? v.stock.toString() : "",
            sku: v.sku || "",
            image: typeof v.image === 'string' ? v.image : v.image?.thumbnail || v.image?.original || "",
          }))
        : [{ id: `variant-${Date.now()}`, storage: "", ram: "", color: "", bundle: "", warranty: "", price: "", stock: "", sku: "", image: "" }],
      
      // Additional Information - Convert from API format (object or array)
      additionalInfo: (() => {
        // API might send additional_info as object {key: value} or array [{key, value}]
        if (product.additional_info) {
          if (Array.isArray(product.additional_info)) {
            // Already in array format
            return product.additional_info.map((item: any) => ({
              key: typeof item === 'object' ? (item.key || Object.keys(item)[0] || "") : "",
              value: typeof item === 'object' ? (item.value || Object.values(item)[0] || "") : String(item),
            }));
          } else if (typeof product.additional_info === 'object') {
            // Convert object to array of {key, value}
            return Object.entries(product.additional_info).map(([key, value]) => ({
              key,
              value: String(value || ""),
            }));
          }
        }
        // Also check for additionalInfo (camelCase) or specifications (legacy)
        if (product.additionalInfo) {
          if (Array.isArray(product.additionalInfo)) {
            return product.additionalInfo.map((item: any) => ({
              key: typeof item === 'object' ? (item.key || Object.keys(item)[0] || "") : "",
              value: typeof item === 'object' ? (item.value || Object.values(item)[0] || "") : String(item),
            }));
          } else if (typeof product.additionalInfo === 'object') {
            return Object.entries(product.additionalInfo).map(([key, value]) => ({
              key,
              value: String(value || ""),
            }));
          }
        }
        // Legacy: Convert technicalSpecifications to additionalInfo if present
        if (product.technicalSpecifications && typeof product.technicalSpecifications === 'object') {
          return Object.entries(product.technicalSpecifications)
            .filter(([_, value]) => value !== undefined && value !== null && value !== "")
            .map(([key, value]) => ({
              key,
              value: String(value),
            }));
        }
        return [];
      })(),
      
      // Additional - API uses whatsInTheBox (capital T), not whatsInBox
      description: product.description || "",
      whatsInBox: product.whatsInTheBox || product.whatsInBox || "",
      status: product.status || (product.is_active ? "published" : "draft"),
      featured: product.featured || false,
      visibility: product.visibility || "visible",
      publishDate: product.publishDate || "",
    };
    
    // Apply the state update atomically
    set(newState);
  },
}));

// Category Form Store
interface CategoryFormStoreState {
  // Basic Info
  name: string;
  slug: string;
  description: string;
  parent: string | null; // Parent category _id (null for root categories)
  type: "mega" | "normal"; // Category type
  
  // Media
  image: string;
  imageFile: File | null;
  
  // Status
  isActive: boolean;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  
  // Actions - Basic Info
  setName: (value: string) => void;
  setSlug: (value: string) => void;
  setDescription: (value: string) => void;
  setParent: (value: string | null) => void;
  setType: (value: "mega" | "normal") => void;
  
  // Actions - Media
  setImage: (value: string) => void;
  setImageFile: (value: File | null) => void;
  
  // Actions - Status
  setIsActive: (value: boolean) => void;
  
  // Actions - SEO
  setMetaTitle: (value: string) => void;
  setMetaDescription: (value: string) => void;
  
  // Reset store to initial state
  resetCategoryForm: () => void;
  
  // Initialize from category data (for edit mode)
  initializeFromCategory: (category: any) => void;
}

const initialCategoryFormState = {
  // Basic Info
  name: "",
  slug: "",
  description: "",
  parent: null as string | null,
  type: "normal" as "mega" | "normal",
  
  // Media
  image: "",
  imageFile: null as File | null,
  
  // Status
  isActive: true,
  
  // SEO
  metaTitle: "",
  metaDescription: "",
};

export const useCategoryFormStore = create<CategoryFormStoreState>()((set, get) => ({
  ...initialCategoryFormState,
  
  // Basic Info Actions
  setName: (value: string) => {
    set({ name: value });
    // Auto-generate slug from name
    if (value) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      set({ slug: generatedSlug });
    }
  },
  setSlug: (value: string) => {
    set({ slug: value });
  },
  setDescription: (value: string) => {
    set({ description: value });
  },
  setParent: (value: string | null) => {
    set({ parent: value });
  },
  setType: (value: "mega" | "normal") => {
    set({ type: value });
  },
  
  // Media Actions
  setImage: (value: string) => {
    set({ image: value });
  },
  setImageFile: (value: File | null) => {
    set({ imageFile: value });
  },
  
  // Status Actions
  setIsActive: (value: boolean) => {
    set({ isActive: value });
  },
  
  // SEO Actions
  setMetaTitle: (value: string) => {
    set({ metaTitle: value });
  },
  setMetaDescription: (value: string) => {
    set({ metaDescription: value });
  },
  
  // Reset store to initial state
  resetCategoryForm: () => {
    set(initialCategoryFormState);
  },
  
  // Initialize from category data (for edit mode)
  initializeFromCategory: (category: any) => {
    if (!category || typeof category !== 'object') {
      return;
    }

    let imageUrl = "";
    // Handle images array from API (look for thumbnail type)
    if (category.images && Array.isArray(category.images)) {
      const thumbnailImage = category.images.find((img: any) => img.type === 'thumbnail');
      if (thumbnailImage) {
        imageUrl = thumbnailImage.url || "";
      }
    } else if (category.image) {
      imageUrl = typeof category.image === 'string' ? category.image : category.image.url || category.image.original || "";
    }

    // Handle parent - can be ObjectId string or object with _id
    let parentId: string | null = null;
    if (category.parent) {
      parentId = typeof category.parent === 'string' ? category.parent : category.parent._id || null;
    }

    const newState: Partial<CategoryFormStoreState> = {
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      parent: parentId,
      type: (category.type === "mega" ? "mega" : "normal") as "mega" | "normal",
      image: imageUrl,
      imageFile: null,
      isActive: category.active !== undefined ? category.active : (category.isActive !== undefined ? category.isActive : (category.is_active !== undefined ? category.is_active : true)),
      metaTitle: category.metaTitle || category.meta_title || "",
      metaDescription: category.metaDescription || category.meta_description || "",
    };
    
    set(newState);
  },
}));