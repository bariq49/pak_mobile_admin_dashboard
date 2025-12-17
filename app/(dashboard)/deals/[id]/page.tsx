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
  Tag,
  DollarSign,
  Percent,
  Globe,
  Package,
  Layers,
  Target,
  Info,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Clock,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Deal, getDealByIdApi } from "@/api/deals/deals.api";

const DealDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const dealId = params.id as string | undefined;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!dealId) {
      toast.error("Deal ID is required");
      router.push("/deals");
      return;
    }

    const fetchDeal = async () => {
      try {
        setIsLoading(true);
        const response = await getDealByIdApi(dealId);
        setDeal(response.data);
      } catch (error: any) {
        console.error("Failed to fetch deal details:", error);
        toast.error("Failed to load deal details", {
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Deal not found",
        });
        router.push("/deals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeal();
  }, [dealId, router]);

  const desktopImage = deal?.image?.desktop?.url;
  const mobileImage = deal?.image?.mobile?.url;
  const dealImage = desktopImage || mobileImage;

  const initials = deal?.title
    ?.split(" ")
    .map((w) => w[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "NA";

  const startDate = deal?.startDate ? new Date(deal.startDate) : null;
  const endDate = deal?.endDate ? new Date(deal.endDate) : null;
  const now = new Date();
  const isUpcoming = startDate && startDate > now;
  const isExpired = endDate && endDate < now;
  const isRunning = !isUpcoming && !isExpired && deal?.isActive;

  const discountType = deal?.discountType || "percentage";
  const discountValue = deal?.discountValue || 0;
  const isPercentage = discountType === "percentage";
  const isFixed = discountType === "fixed" || discountType === "flat";

  const productCount = deal?.products?.length || 0;
  const categoryCount = deal?.categories?.length || 0;
  const subCategoryCount = deal?.subCategories?.length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs>
          <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
          <BreadcrumbItem href="/deals">Deals</BreadcrumbItem>
          <BreadcrumbItem>Details</BreadcrumbItem>
        </Breadcrumbs>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-default-900">
              {deal?.title || "Deal Details"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View complete information about this promotional deal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/deals")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Deals
            </Button>
            {deal?._id && (
              <Button
                size="sm"
                onClick={() => router.push(`/deals/${deal._id}/edit`)}
              >
                Edit Deal
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Avatar className="h-20 w-20 rounded-lg border shadow-sm">
              {dealImage ? (
                <AvatarImage
                  src={dealImage}
                  alt={deal?.title || "Deal"}
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
                <span>{deal?.title || "—"}</span>
                {deal?.isActive && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                {!deal?.isActive && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </Badge>
                )}
                {isRunning && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Running
                  </Badge>
                )}
                {isUpcoming && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Upcoming
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    <XCircle className="h-3 w-3 mr-1" />
                    Expired
                  </Badge>
                )}
                {/* Deal Variant */}
                <Badge
                  variant="outline"
                  className={`${
                    (deal as any)?.dealVariant === "FLASH"
                      ? "bg-amber-50 text-amber-700"
                      : (deal as any)?.dealVariant === "SUPER"
                      ? "bg-blue-50 text-blue-700"
                      : (deal as any)?.dealVariant === "MEGA"
                      ? "bg-purple-50 text-purple-700"
                      : "bg-default-50 text-default-700"
                  }`}
                >
                  {(deal as any)?.dealVariant || "MAIN"}
                </Badge>
              </CardTitle>
              {deal?.description && (
                <CardDescription className="mt-2">
                  {deal.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading deal details...</p>
          )}

          {!isLoading && !deal && (
            <p className="text-sm text-muted-foreground">
              Deal details are not available.
            </p>
          )}

          {!isLoading && deal && (
            <>
              {/* Basic Information */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <Info className="h-4 w-4" />
                  <span>Basic Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Title</p>
                    <p className="font-medium">{deal.title || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Button Text</p>
                    <p className="font-medium">{deal.btnText || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Variant</p>
                    <p className="font-medium">
                      {(deal as any)?.dealVariant || "MAIN"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Priority</p>
                    <p className="font-medium">{deal.priority || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">
                      {deal.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Discount Information */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <DollarSign className="h-4 w-4" />
                  <span>Discount Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Discount Type</p>
                    <div className="flex items-center gap-2 mt-1">
                      {isPercentage ? (
                        <Percent className="h-4 w-4 text-primary" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-primary" />
                      )}
                      <p className="font-medium capitalize">
                        {isFixed ? "Fixed" : "Percentage"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Discount Value</p>
                    <p className="font-semibold text-lg">
                      {isPercentage
                        ? `${discountValue}%`
                        : `€${discountValue.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Time Window */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <Clock className="h-4 w-4" />
                  <span>Time Window</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {startDate && (
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {startDate.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {endDate && (
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {endDate.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <Separator />

              {/* Target Information */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <Target className="h-4 w-4" />
                  <span>Target Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Scope</p>
                    {deal.isGlobal ? (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 mt-1"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        Global
                      </Badge>
                    ) : (
                      <p className="font-medium mt-1">Specific Targets</p>
                    )}
                  </div>
                  {!deal.isGlobal && (
                    <div>
                      <p className="text-muted-foreground">Total Targets</p>
                      <p className="font-medium">
                        {productCount + categoryCount + subCategoryCount} item(s)
                      </p>
                    </div>
                  )}
                </div>

                {!deal.isGlobal && (
                  <div className="mt-4 space-y-3">
                    {productCount > 0 && (
                      <div className="p-3 border rounded-lg bg-default-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium text-sm">
                            Products ({productCount})
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(deal.products) &&
                            deal.products.map((product, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {typeof product === "object"
                                  ? product.name
                                  : product}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

                    {categoryCount > 0 && (
                      <div className="p-3 border rounded-lg bg-default-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium text-sm">
                            Categories ({categoryCount})
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(deal.categories) &&
                            deal.categories.map((category, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {typeof category === "object"
                                  ? category.name
                                  : category}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

                    {subCategoryCount > 0 && (
                      <div className="p-3 border rounded-lg bg-default-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium text-sm">
                            Subcategories ({subCategoryCount})
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(deal.subCategories) &&
                            deal.subCategories.map((subCategory, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {typeof subCategory === "object"
                                  ? subCategory.name
                                  : subCategory}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Description */}
              {deal.description && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                      <FileText className="h-4 w-4" />
                      <span>Description</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {deal.description}
                    </p>
                  </section>
                </>
              )}

              {/* Media */}
              <Separator />
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <ImageIcon className="h-4 w-4" />
                  <span>Images</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Desktop Image */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Desktop Image</p>
                    <div className="border rounded-lg overflow-hidden">
                      {desktopImage ? (
                        <img
                          src={desktopImage}
                          alt="Desktop"
                          className="w-full h-auto object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 bg-muted flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No desktop image available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Mobile Image */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Mobile Image</p>
                    <div className="border rounded-lg overflow-hidden">
                      {mobileImage ? (
                        <img
                          src={mobileImage}
                          alt="Mobile"
                          className="w-full h-auto object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 bg-muted flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No mobile image available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Metadata */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-default-900">
                  <Calendar className="h-4 w-4" />
                  <span>Metadata</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {deal.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Created At</p>
                        <p className="font-medium">
                          {new Date(deal.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {deal.updatedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Updated At</p>
                        <p className="font-medium">
                          {new Date(deal.updatedAt).toLocaleString()}
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

export default DealDetailsPage;

