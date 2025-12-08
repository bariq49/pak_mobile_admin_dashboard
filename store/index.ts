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
  category: string;
  tags: string[];
  condition: string;
  
  // Pricing
  price: string;
  salePrice: string;
  costPrice: string;
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
  
  // Technical Specifications
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
  setTags: (value: string[]) => void;
  setCondition: (value: string) => void;
  
  // Actions - Pricing
  setPrice: (value: string) => void;
  setSalePrice: (value: string) => void;
  setCostPrice: (value: string) => void;
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
  
  // Actions - Technical Specifications
  setDisplaySize: (value: string) => void;
  setDisplayType: (value: string) => void;
  setProcessor: (value: string) => void;
  setRearCamera: (value: string) => void;
  setFrontCamera: (value: string) => void;
  setBattery: (value: string) => void;
  setFastCharging: (value: string) => void;
  setOs: (value: string) => void;
  setNetwork: (value: string) => void;
  setConnectivity: (value: string) => void;
  setSimSupport: (value: string) => void;
  setDimensions: (value: string) => void;
  setWeight: (value: string) => void;
  
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
  tags: [] as string[],
  condition: "new",
  
  // Pricing
  price: "",
  salePrice: "",
  costPrice: "",
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
  
  // Technical Specifications
  displaySize: "",
  displayType: "",
  processor: "",
  rearCamera: "",
  frontCamera: "",
  battery: "",
  fastCharging: "",
  os: "",
  network: "",
  connectivity: "",
  simSupport: "",
  dimensions: "",
  weight: "",
  
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
    console.log("[ProductStore] setName:", value);
    set({ name: value });
  },
  setBrand: (value: string) => {
    console.log("[ProductStore] setBrand:", value);
    set({ brand: value });
  },
  setModel: (value: string) => {
    console.log("[ProductStore] setModel:", value);
    set({ model: value });
  },
  setSku: (value: string) => {
    console.log("[ProductStore] setSku:", value);
    set({ sku: value });
  },
  setCategory: (value: string) => {
    console.log("[ProductStore] setCategory:", value);
    set({ category: value });
  },
  setTags: (value: string[]) => {
    console.log("[ProductStore] setTags:", value);
    set({ tags: value });
  },
  setCondition: (value: string) => {
    console.log("[ProductStore] setCondition:", value);
    set({ condition: value });
  },
  
  // Pricing Actions
  setPrice: (value: string) => {
    console.log("[ProductStore] setPrice:", value);
    set({ price: value });
  },
  setSalePrice: (value: string) => {
    console.log("[ProductStore] setSalePrice:", value);
    set({ salePrice: value });
  },
  setCostPrice: (value: string) => {
    console.log("[ProductStore] setCostPrice:", value);
    set({ costPrice: value });
  },
  setTax: (value: string) => {
    console.log("[ProductStore] setTax:", value);
    set({ tax: value });
  },
  setQuantity: (value: string) => {
    console.log("[ProductStore] setQuantity:", value, "(main product quantity, separate from variant stock)");
    set({ quantity: value });
  },
  
  // Media Actions
  setFeaturedImage: (value: string) => {
    console.log("[ProductStore] setFeaturedImage:", value);
    set({ featuredImage: value });
  },
  setFeaturedImageFile: (value: File | null) => {
    console.log("[ProductStore] setFeaturedImageFile:", value?.name || "null");
    set({ featuredImageFile: value });
  },
  setGalleryImages: (value: string[]) => {
    console.log("[ProductStore] setGalleryImages:", value.length, "images");
    set({ galleryImages: value });
  },
  setGalleryImageFiles: (value: File[]) => {
    console.log("[ProductStore] setGalleryImageFiles:", value.length, "files");
    set({ galleryImageFiles: value });
  },
  setVideoUrl: (value: string) => {
    console.log("[ProductStore] setVideoUrl:", value);
    set({ videoUrl: value });
  },
  
  // Variants Actions
  setVariants: (value: Variant[]) => {
    console.log("[ProductStore] setVariants:", value.length, "variants");
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
    console.log("[ProductStore] addVariant: Adding new variant", newVariant.id);
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
  
  // Technical Specifications Actions
  setDisplaySize: (value: string) => {
    console.log("[ProductStore] setDisplaySize:", value);
    set({ displaySize: value });
  },
  setDisplayType: (value: string) => {
    console.log("[ProductStore] setDisplayType:", value);
    set({ displayType: value });
  },
  setProcessor: (value: string) => {
    console.log("[ProductStore] setProcessor:", value);
    set({ processor: value });
  },
  setRearCamera: (value: string) => {
    console.log("[ProductStore] setRearCamera:", value);
    set({ rearCamera: value });
  },
  setFrontCamera: (value: string) => {
    console.log("[ProductStore] setFrontCamera:", value);
    set({ frontCamera: value });
  },
  setBattery: (value: string) => {
    console.log("[ProductStore] setBattery:", value);
    set({ battery: value });
  },
  setFastCharging: (value: string) => {
    console.log("[ProductStore] setFastCharging:", value);
    set({ fastCharging: value });
  },
  setOs: (value: string) => {
    console.log("[ProductStore] setOs:", value);
    set({ os: value });
  },
  setNetwork: (value: string) => {
    console.log("[ProductStore] setNetwork:", value);
    set({ network: value });
  },
  setConnectivity: (value: string) => {
    console.log("[ProductStore] setConnectivity:", value);
    set({ connectivity: value });
  },
  setSimSupport: (value: string) => {
    console.log("[ProductStore] setSimSupport:", value);
    set({ simSupport: value });
  },
  setDimensions: (value: string) => {
    console.log("[ProductStore] setDimensions:", value);
    set({ dimensions: value });
  },
  setWeight: (value: string) => {
    console.log("[ProductStore] setWeight:", value);
    set({ weight: value });
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
    console.log("[ProductStore] initializeFromProduct: Called with product:", product);
    console.log("[ProductStore] Product keys:", Object.keys(product || {}));
    console.log("[ProductStore] Product values:", {
      name: product?.name,
      brand: product?.brand,
      model: product?.model,
      price: product?.price,
      quantity: product?.quantity,
      category: product?.category,
      variants: product?.variants,
      images: product?.images,
    });
    
    // Single atomic set() call to update all fields at once - prevents multiple re-renders
    const newState = {
      // Basic Info - with defaults
      name: product.name || "",
      brand: product.brand || "",
      model: product.model || "",
      sku: product.sku || "",
      category: typeof product.category === "string" 
        ? product.category 
        : product.category?._id || "",
      condition: product.condition || "new",
      tags: Array.isArray(product.tags) ? product.tags : [],
      
      // Pricing - convert to strings with defaults
      price: product.price !== undefined ? product.price.toString() : "0",
      salePrice: product.salePrice !== undefined ? product.salePrice.toString() : "0",
      costPrice: product.costPrice !== undefined ? product.costPrice.toString() : "0",
      tax: product.tax !== undefined ? product.tax.toString() : "0",
      quantity: product.quantity !== undefined ? product.quantity.toString() : "0",
      
      // Media - with defaults
      featuredImage: product.thumbnail || product.images?.[0] || "",
      featuredImageFile: null, // Always null for edit mode (existing images are URLs)
      galleryImages: Array.isArray(product.images) ? product.images : [],
      galleryImageFiles: [], // Always empty array for edit mode (no new files until user uploads)
      videoUrl: product.videoUrl || "",
      
      // Variants - ensure at least one variant exists
      variants: (product.variants && Array.isArray(product.variants) && product.variants.length > 0)
        ? product.variants.map((v: any) => ({
            id: v._id || v.id || Date.now().toString() + Math.random(),
            storage: v.storage || "",
            ram: v.ram || "",
            color: v.color || "",
            bundle: v.bundle || "",
            warranty: v.warranty || "",
            price: v.price !== undefined ? v.price.toString() : "",
            stock: v.stock !== undefined ? v.stock.toString() : "",
            sku: v.sku || "",
            image: v.image || "",
          }))
        : [{ id: "1", storage: "", ram: "", color: "", bundle: "", warranty: "", price: "", stock: "", sku: "", image: "" }],
      
      // Technical Specifications - with defaults
      displaySize: product.specifications?.displaySize || "",
      displayType: product.specifications?.displayType || "",
      processor: product.specifications?.processor || "",
      rearCamera: product.specifications?.rearCamera || "",
      frontCamera: product.specifications?.frontCamera || "",
      battery: product.specifications?.battery || "",
      fastCharging: product.specifications?.fastCharging || "",
      os: product.specifications?.os || "",
      network: product.specifications?.network || "",
      connectivity: product.specifications?.connectivity || "",
      simSupport: product.specifications?.simSupport || "",
      dimensions: product.specifications?.dimensions || "",
      weight: product.specifications?.weight || "",
      
      // Additional - with defaults
      description: product.description || "",
      whatsInBox: product.whatsInBox || "",
      status: product.status || "draft",
      featured: product.featured || false,
      visibility: product.visibility || "visible",
      publishDate: product.publishDate || "",
    };
    
    console.log("[ProductStore] initializeFromProduct: New state to set:", {
      name: newState.name,
      brand: newState.brand,
      price: newState.price,
      quantity: newState.quantity,
    });
    
    // Apply the state update
    set(newState);
    
    // Verify the state was set correctly
    setTimeout(() => {
      const currentState = get();
      console.log("[ProductStore] State after set() - verification:", {
        name: currentState.name,
        brand: currentState.brand,
        price: currentState.price,
        quantity: currentState.quantity,
      });
    }, 0);
    
    console.log("[ProductStore] initializeFromProduct: Product data initialized successfully (atomic update)");
  },
}));