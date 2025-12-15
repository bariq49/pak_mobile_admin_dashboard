"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FolderTree,
  Info,
  Tag,
  ChevronLeft,
  Image as ImageIcon,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Category, getCategoryBySlugApi } from "@/api/categories/categories.api";

const CategoryDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string | undefined;

  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) {
      toast.error("Category slug is required");
      router.push("/categories");
      return;
    }

    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const response = await getCategoryBySlugApi(slug);
        setCategory(response.data);
      } catch (error: any) {
        console.error("Failed to fetch category details:", error);
        toast.error("Failed to load category details", {
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Category not found",
        });
        router.push("/categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [slug, router]);

  const isActive =
    (category?.isActive ?? category?.active) === undefined
      ? undefined
      : Boolean(category?.isActive ?? category?.active);

  const categoryImage = category?.images?.find(img => img.type === "thumbnail" || img.type === "banner")?.url ||
    category?.images?.[0]?.url ||
    null;

  const initials = category?.name
    ?.split(" ")
    .map((w) => w[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "NA";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs>
          <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
          <BreadcrumbItem href="/categories">Categories</BreadcrumbItem>
          <BreadcrumbItem>Details</BreadcrumbItem>
        </Breadcrumbs>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-default-900">
              {category?.name || "Category Details"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View complete information about this category.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/categories")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Categories
            </Button>
            {category?.slug && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/categories/${category.slug}/edit`)}
              >
                Edit Category
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Avatar className="h-20 w-20 rounded-lg border shadow-sm">
              {categoryImage ? (
                <AvatarImage
                  src={categoryImage}
                  alt={category?.name || "Category"}
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
                <span>{category?.name || "—"}</span>
                {category?.type && (
                  <Badge variant="outline" className="capitalize">
                    {category.type}
                  </Badge>
                )}
                {isActive !== undefined && (
                  <Badge
                    variant="outline"
                    className={isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                )}
              </CardTitle>
              {category?.slug && (
                <CardDescription className="mt-1">
                  Slug: <span className="font-mono text-xs">{category.slug}</span>
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading category details...</p>
          )}

          {!isLoading && !category && (
            <p className="text-sm text-muted-foreground">
              Category details are not available.
            </p>
          )}

          {!isLoading && category && (
            <>
              {/* Basic Information */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <Info className="h-4 w-4" />
                  <span>Basic Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{category.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Slug</p>
                    <p className="font-medium break-all">
                      {category.slug || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">
                      {category.type || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parent Category</p>
                    <p className="font-medium">
                      {typeof category.parent === "string"
                        ? category.parent
                        : category.parent?.name || "Root category"}
                    </p>
                  </div>
                </div>
              </section>

              {category.description && (
                <>
                  <Separator />
                  {/* Description */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                      <Tag className="h-4 w-4" />
                      <span>Description</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {category.description}
                    </p>
                  </section>
                </>
              )}

              <Separator />

              {/* Hierarchy & Children */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <FolderTree className="h-4 w-4" />
                  <span>Hierarchy</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ancestors</p>
                    <p className="font-medium">
                      {category.ancestors && category.ancestors.length > 0
                        ? category.ancestors.join(" / ")
                        : "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Subcategories</p>
                    <p className="font-medium">
                      {Array.isArray(category.children)
                        ? `${category.children.length} subcategory${
                            category.children.length === 1 ? "" : "ies"
                          }`
                        : "—"}
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Images */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <ImageIcon className="h-4 w-4" />
                  <span>Images</span>
                </div>
                {category.images && category.images.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {category.images.map((image, index) => (
                        <div key={index} className="space-y-2">
                          <div className="border rounded-lg overflow-hidden">
                            {image.url ? (
                              <img
                                src={image.url}
                                alt={image.altText || `${category?.name || "Category"} - ${image.type || "Image"}`}
                                className="w-full h-48 object-cover"
                              />
                            ) : (
                              <div className="w-full h-48 bg-muted flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <p className="capitalize">{image.type || "Image"}</p>
                            {image.altText && <p className="truncate">{image.altText}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 bg-muted/50">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No images available</p>
                    </div>
                  </div>
                )}
              </section>

              <Separator />

              {/* Metadata */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <Calendar className="h-4 w-4" />
                  <span>Metadata</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Created At</p>
                      <p className="font-medium">
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Updated At</p>
                      <p className="font-medium">
                        {category.updatedAt
                          ? new Date(category.updatedAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryDetailsPage;


