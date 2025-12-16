"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Package,
  DollarSign,
  Box,
  Star,
  Tag,
  FileText,
  Image as ImageIcon,
  Video,
  Layers,
  Info,
  CheckCircle2,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Product, getProductBySlugApi } from "@/api/product/products.api";
import { formatCurrency } from "@/utils/currency";
import { useCurrency } from "@/hooks/use-currency";

const ProductDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string | undefined;
  const { rate, currency } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) {
      toast.error("Product slug is required");
      router.push("/products");
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await getProductBySlugApi(slug);
        setProduct(response.data);
      } catch (error: any) {
        console.error("Failed to fetch product details:", error);
        toast.error("Failed to load product details", {
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Product not found",
        });
        router.push("/products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug, router]);

  // Extract main/featured image - check all possible fields
  const productImage =
    (product as any)?.mainImage ||
    (product as any)?.image?.thumbnail ||
    (product as any)?.image?.original ||
    (product as any)?.image?.url ||
    (Array.isArray(product?.gallery) && product.gallery.length > 0
      ? (typeof product.gallery[0] === 'string' 
          ? product.gallery[0] 
          : product.gallery[0]?.url || product.gallery[0]?.original || product.gallery[0]?.thumbnail)
      : null) ||
    (Array.isArray((product as any)?.galleryImages) && (product as any).galleryImages.length > 0
      ? (typeof (product as any).galleryImages[0] === 'string'
          ? (product as any).galleryImages[0]
          : (product as any).galleryImages[0]?.url || (product as any).galleryImages[0]?.original || (product as any).galleryImages[0]?.thumbnail)
      : null) ||
    (Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : null) ||
    product?.thumbnail ||
    null;

  const initials = product?.name
    ?.split(" ")
    .map((w) => w[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "NA";

  const convertedPrice = (product?.price || 0) * rate;
  const convertedSalePrice = product?.salePrice ? product.salePrice * rate : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs>
          <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
          <BreadcrumbItem href="/products">Products</BreadcrumbItem>
          <BreadcrumbItem>Details</BreadcrumbItem>
        </Breadcrumbs>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-default-900">
              {product?.name || "Product Details"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View complete information about this product.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/products")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Products
            </Button>
            {product?.slug && (
              <Button
                size="sm"
                onClick={() => router.push(`/products/${product.slug}/edit`)}
              >
                Edit Product
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Avatar className="h-20 w-20 rounded-lg border shadow-sm">
              {productImage ? (
                <AvatarImage
                  src={productImage}
                  alt={product?.name || "Product"}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-muted text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <span>{product?.name || "—"}</span>
                {product?.is_active && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                {!product?.is_active && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </Badge>
                )}
                {product?.in_stock && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    In Stock
                  </Badge>
                )}
                {!product?.in_stock && (
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    <XCircle className="h-3 w-3 mr-1" />
                    Out of Stock
                  </Badge>
                )}
                {product?.featured && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                {product?.brand && product?.model
                  ? `${product.brand} ${product.model}`
                  : product?.brand || product?.model || "—"}
              </CardDescription>
              {product?.slug && (
                <CardDescription className="mt-1">
                  Slug: <span className="font-mono text-xs">{product.slug}</span>
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading product details...</p>
          )}

          {!isLoading && !product && (
            <p className="text-sm text-muted-foreground">
              Product details are not available.
            </p>
          )}

          {!isLoading && product && (
            <>
              {/* Basic Information */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <Info className="h-4 w-4" />
                  <span>Basic Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">SKU</p>
                    <p className="font-medium">{product.sku || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">
                      {product.categoryName ||
                        (typeof product.category === "object"
                          ? product.category?.name
                          : product.category) ||
                        "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Condition</p>
                    <p className="font-medium capitalize">
                      {product.condition || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">
                      {product.status || "—"}
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Pricing */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <DollarSign className="h-4 w-4" />
                  <span>Pricing</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Regular Price</p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(convertedPrice, currency)}
                    </p>
                  </div>
                  {convertedSalePrice && (
                    <div>
                      <p className="text-muted-foreground">Sale Price</p>
                      <p className="font-semibold text-lg text-primary">
                        {formatCurrency(convertedSalePrice, currency)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">On Sale</p>
                    <p className="font-medium">
                      {product.on_sale ? "Yes" : "No"}
                    </p>
                  </div>
                  {product.on_sale && product.sale_start && (
                    <div>
                      <p className="text-muted-foreground">Sale Starts</p>
                      <p className="font-medium">
                        {new Date(product.sale_start).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {product.on_sale && product.sale_end && (
                    <div>
                      <p className="text-muted-foreground">Sale Ends</p>
                      <p className="font-medium">
                        {new Date(product.sale_end).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {product.tax && (
                    <div>
                      <p className="text-muted-foreground">Tax</p>
                      <p className="font-medium">{product.tax}%</p>
                    </div>
                  )}
                </div>
              </section>

              <Separator />

              {/* Stock & Sales */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <Box className="h-4 w-4" />
                  <span>Stock & Sales</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{product.quantity || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sales Count</p>
                    <p className="font-medium">{product.salesCount || 0}</p>
                  </div>
                </div>
              </section>

              {/* Rating */}
              {product.ratingSummary &&
                (product.ratingSummary.average > 0 ||
                  product.ratingSummary.total > 0) && (
                  <>
                    <Separator />
                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                        <Star className="h-4 w-4" />
                        <span>Rating</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold text-lg">
                            {product.ratingSummary.average.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          ({product.ratingSummary.total} reviews)
                        </span>
                      </div>
                    </section>
                  </>
                )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                      <Tag className="h-4 w-4" />
                      <span>Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {typeof tag === "string"
                            ? tag
                            : (tag as any)?.name || String(tag)}
                        </Badge>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                      <Layers className="h-4 w-4" />
                      <span>Variants ({product.variants.length})</span>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {product.variants.map((variant, index) => {
                        // Extract variant image - handle both string and object formats
                        const variantImage = 
                          (typeof variant.image === 'string' ? variant.image : null) ||
                          ((variant as any)?.image?.url || (variant as any)?.image?.original || (variant as any)?.image?.thumbnail) ||
                          null;
                        
                        return (
                          <div
                            key={variant._id || variant.id || index}
                            className="p-4 border rounded-lg bg-default-50 text-sm"
                          >
                            <div className="flex flex-col sm:flex-row gap-4">
                              {/* Variant Image - Always show image section */}
                              <div className="flex-shrink-0">
                                <p className="text-xs text-muted-foreground mb-2">Variant Image</p>
                                <div className="border rounded-lg overflow-hidden w-32 h-32">
                                  {variantImage ? (
                                    <img
                                      src={variantImage}
                                      alt={`${product?.name || "Product"} - Variant ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center">
                                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {variant.storage && (
                              <div>
                                <span className="text-muted-foreground">Storage:</span>
                                <span className="ml-2 font-medium">
                                  {variant.storage}
                                </span>
                              </div>
                            )}
                            {variant.ram && (
                              <div>
                                <span className="text-muted-foreground">RAM:</span>
                                <span className="ml-2 font-medium">{variant.ram}</span>
                              </div>
                            )}
                            {variant.color && (
                              <div>
                                <span className="text-muted-foreground">Color:</span>
                                <span className="ml-2 font-medium">
                                  {variant.color}
                                </span>
                              </div>
                            )}
                            {variant.price && (
                              <div>
                                <span className="text-muted-foreground">Price:</span>
                                <span className="ml-2 font-medium">
                                  {formatCurrency(variant.price * rate, currency)}
                                </span>
                              </div>
                            )}
                            {variant.stock !== undefined && (
                              <div>
                                <span className="text-muted-foreground">Stock:</span>
                                <span className="ml-2 font-medium">
                                  {variant.stock}
                                </span>
                              </div>
                            )}
                            {variant.bundle && (
                              <div>
                                <span className="text-muted-foreground">Bundle:</span>
                                <span className="ml-2 font-medium">
                                  {variant.bundle}
                                </span>
                              </div>
                            )}
                            {variant.warranty && (
                              <div>
                                <span className="text-muted-foreground">Warranty:</span>
                                <span className="ml-2 font-medium">
                                  {variant.warranty}
                                </span>
                              </div>
                            )}
                            {variant.sku && (
                              <div>
                                <span className="text-muted-foreground">SKU:</span>
                                <span className="ml-2 font-medium">{variant.sku}</span>
                              </div>
                            )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {/* Description */}
              {product.description && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                      <FileText className="h-4 w-4" />
                      <span>Description</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </section>
                </>
              )}

              {/* Media */}
              <Separator />
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <ImageIcon className="h-4 w-4" />
                  <span>Media</span>
                </div>
                
                {/* Featured Image */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Featured Image</p>
                  <div className="border rounded-lg overflow-hidden max-w-md">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product?.name || "Product"}
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No image available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Images */}
                {(() => {
                  // Extract all gallery images from various possible fields
                  let galleryImages: string[] = [];
                  
                  if (Array.isArray((product as any)?.galleryImages) && (product as any).galleryImages.length > 0) {
                    galleryImages = (product as any).galleryImages
                      .map((img: any) => typeof img === 'string' ? img : img?.url || img?.original || img?.thumbnail)
                      .filter((url: any) => url && typeof url === 'string');
                  } else if (Array.isArray(product?.gallery) && product.gallery.length > 0) {
                    galleryImages = product.gallery
                      .map((img: any) => typeof img === 'string' ? img : img?.url || img?.original || img?.thumbnail)
                      .filter((url: any) => url && typeof url === 'string');
                  } else if (Array.isArray(product?.images) && product.images.length > 0) {
                    galleryImages = product.images.filter((url: any) => url && typeof url === 'string');
                  }
                  
                  // Filter out the main image from gallery if it's already shown
                  const mainImageUrl = productImage;
                  const uniqueGalleryImages = galleryImages.filter(img => img !== mainImageUrl);
                  
                  return uniqueGalleryImages.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Gallery Images ({uniqueGalleryImages.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {uniqueGalleryImages.map((imageUrl, index) => (
                          <div key={index} className="border rounded-lg overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={`${product?.name || "Product"} - Image ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Gallery Images</p>
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <p className="text-sm text-muted-foreground">No gallery images available</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Video URL */}
                {product.videoUrl && (
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Video URL</p>
                    <a
                      href={product.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {product.videoUrl}
                    </a>
                  </div>
                )}
              </section>

              {/* Specifications */}
              {product.specifications && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                      <Package className="h-4 w-4" />
                      <span>Specifications</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {Object.entries(product.specifications).map(
                        ([key, value]) =>
                          value && (
                            <div key={key}>
                              <p className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                              <p className="font-medium">{String(value)}</p>
                            </div>
                          )
                      )}
                    </div>
                  </section>
                </>
              )}

              {/* What's in the Box */}
              {product.whatsInBox && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                      <Box className="h-4 w-4" />
                      <span>What's in the Box</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {product.whatsInBox}
                    </p>
                  </section>
                </>
              )}

              <Separator />

              {/* Metadata */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <Calendar className="h-4 w-4" />
                  <span>Metadata</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {product.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Created At</p>
                        <p className="font-medium">
                          {new Date(product.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {product.updatedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Updated At</p>
                        <p className="font-medium">
                          {new Date(product.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetailsPage;

