"use client";

import React from "react";
import { Product } from "@/api/product/products.api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  DollarSign,
  Tag,
  Star,
  Calendar,
  Box,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Video,
  Layers,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useCurrency } from "@/hooks/use-currency";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { rate, currency } = useCurrency();
  
  const productImage =
    product.gallery?.[0]?.url ||
    product.images?.[0] ||
    product.thumbnail ||
    product.mainImage ||
    null;

  const initials = product.name
    ?.split(" ")
    .map((w) => w[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "NA";

  const convertedPrice = (product.price || 0) * rate;
  const convertedSalePrice = product.salePrice ? product.salePrice * rate : null;

  return (
    <div className="space-y-6">
      {/* Product Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20 rounded-lg border shadow-sm">
          {productImage ? (
            <AvatarImage src={productImage} alt={product.name} className="object-cover" />
          ) : (
            <AvatarFallback className="bg-muted text-lg font-semibold">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-default-900">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {product.brand && product.model
              ? `${product.brand} ${product.model}`
              : product.brand || product.model || "—"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {product.is_active ? (
              <Badge variant="outline" className="bg-blue-100 text-blue-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-200 text-gray-600">
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </Badge>
            )}
            {product.in_stock ? (
              <Badge variant="outline" className="bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                In Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-100 text-red-700">
                <XCircle className="h-3 w-3 mr-1" />
                Out of Stock
              </Badge>
            )}
            {product.featured && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-default-900 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Basic Information
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">SKU:</span>
            <span className="ml-2 font-medium">{product.sku || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Category:</span>
            <span className="ml-2 font-medium">
              {product.categoryName || (typeof product.category === 'object' ? product.category?.name : product.category) || "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Condition:</span>
            <span className="ml-2 font-medium capitalize">{product.condition || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <span className="ml-2 font-medium capitalize">{product.status || "—"}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div className="space-y-4">
        <h4 className="font-semibold text-default-900 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Pricing
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Regular Price:</span>
            <span className="ml-2 font-semibold text-lg">
              {formatCurrency(convertedPrice, currency)}
            </span>
          </div>
          {convertedSalePrice && (
            <div>
              <span className="text-muted-foreground">Sale Price:</span>
              <span className="ml-2 font-semibold text-lg text-primary">
                {formatCurrency(convertedSalePrice, currency)}
              </span>
            </div>
          )}
          {product.tax && (
            <div>
              <span className="text-muted-foreground">Tax:</span>
              <span className="ml-2 font-medium">{product.tax}%</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Stock & Sales */}
      <div className="space-y-4">
        <h4 className="font-semibold text-default-900 flex items-center gap-2">
          <Box className="h-4 w-4" />
          Stock & Sales
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Quantity:</span>
            <span className="ml-2 font-medium">{product.quantity || 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Sales Count:</span>
            <span className="ml-2 font-medium">{product.salesCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      {product.ratingSummary && (product.ratingSummary.average > 0 || product.ratingSummary.total > 0) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-default-900 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Rating
            </h4>
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
          </div>
        </>
      )}

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-default-900 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <Badge key={index} variant="soft" color="default">
                  {typeof tag === 'string' ? tag : tag.name || tag}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-default-900 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Variants ({product.variants.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {product.variants.map((variant, index) => (
                <div
                  key={variant._id || variant.id || index}
                  className="p-3 border rounded-lg bg-default-50 text-sm"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {variant.storage && (
                      <div>
                        <span className="text-muted-foreground">Storage:</span>
                        <span className="ml-2 font-medium">{variant.storage}</span>
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
                        <span className="ml-2 font-medium">{variant.color}</span>
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
                        <span className="ml-2 font-medium">{variant.stock}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Description */}
      {product.description && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-default-900 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        </>
      )}

      {/* Media */}
      {(product.videoUrl || (product.gallery && product.gallery.length > 0)) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold text-default-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Media
            </h4>
            {product.videoUrl && (
              <div className="text-sm">
                <span className="text-muted-foreground">Video URL:</span>
                <a
                  href={product.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-primary hover:underline"
                >
                  {product.videoUrl}
                </a>
              </div>
            )}
            {product.gallery && product.gallery.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Gallery Images:</span>
                <span className="ml-2 font-medium">{product.gallery.length}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dates */}
      <Separator />
      <div className="grid grid-cols-2 gap-4 text-sm">
        {product.createdAt && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2 font-medium">
                {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
        {product.updatedAt && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <span className="ml-2 font-medium">
                {new Date(product.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

