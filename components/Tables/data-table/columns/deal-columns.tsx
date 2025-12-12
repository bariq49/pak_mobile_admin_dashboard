"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Tag,
  Calendar,
  DollarSign,
  Globe,
  Package,
  Layers,
  Target,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Percent,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "../data-table-column-header";
import { DataTableRowActions } from "../data-table-row-actions";
import { Deal } from "@/api/deals/deals.api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface DealColumnProps {
  onDelete: (deal: Deal) => void;
  onEdit?: (deal: Deal) => void;
}

export function getDealColumns({
  onDelete,
  onEdit,
}: DealColumnProps): ColumnDef<Deal>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Deal" />
      ),
      cell: ({ row }) => {
        const deal = row.original;
        const title = deal.title || "";
        const desktopImage = deal.image?.desktop?.url;
        const mobileImage = deal.image?.mobile?.url;
        const image = desktopImage || mobileImage;
        const initials = title
          .split(" ")
          .map((w) => w[0]?.toUpperCase())
          .join("")
          .slice(0, 2);

        return (
          <div className="flex items-center gap-4 py-3">
            <Avatar className="h-12 w-12 rounded-lg border shadow-sm">
              {image ? (
                <AvatarImage src={image} alt={title} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-muted text-sm font-semibold">
                  {initials || "NA"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold truncate max-w-[200px]">{title}</span>
              {deal.description && (
                <span className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                  {deal.description}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "discountType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Discount" />
      ),
      cell: ({ row }) => {
        const deal = row.original;
        const type = deal.discountType || "percentage";
        const value = deal.discountValue || 0;
        const isPercentage = type === "percentage";
        const isFixed = type === "fixed" || type === "flat";

        return (
          <div className="flex items-center gap-2">
            {isPercentage ? (
              <Percent className="h-4 w-4 text-primary" />
            ) : (
              <DollarSign className="h-4 w-4 text-primary" />
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                {isPercentage ? `${value}%` : `PKR ${value.toLocaleString()}`}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {isFixed ? "Fixed" : "Percentage"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "target",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Target" />
      ),
      cell: ({ row }) => {
        const deal = row.original;
        const isGlobal = deal.isGlobal;

        if (isGlobal) {
          return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Globe className="h-3 w-3 mr-1" />
              Global
            </Badge>
          );
        }

        const productCount = deal.products?.length || 0;
        const categoryCount = deal.categories?.length || 0;
        const subCategoryCount = deal.subCategories?.length || 0;
        const total = productCount + categoryCount + subCategoryCount;

        return (
          <div className="flex flex-col gap-1">
            {productCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Package className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{productCount} Products</span>
              </div>
            )}
            {categoryCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Layers className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{categoryCount} Categories</span>
              </div>
            )}
            {subCategoryCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{subCategoryCount} Subcategories</span>
              </div>
            )}
            {total === 0 && (
              <span className="text-xs text-muted-foreground">No targets</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "timeWindow",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Time Window" />
      ),
      cell: ({ row }) => {
        const deal = row.original;
        const startDate = deal.startDate ? new Date(deal.startDate) : null;
        const endDate = deal.endDate ? new Date(deal.endDate) : null;
        const now = new Date();
        const isActive = deal.isActive;
        const isUpcoming = startDate && startDate > now;
        const isExpired = endDate && endDate < now;
        const isRunning = !isUpcoming && !isExpired && isActive;

        return (
          <div className="flex flex-col gap-1 text-sm">
            {startDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {startDate.toLocaleDateString()}
                </span>
              </div>
            )}
            {endDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {endDate.toLocaleDateString()}
                </span>
              </div>
            )}
            {isRunning && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit mt-1">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
            {isUpcoming && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-fit mt-1">
                Upcoming
              </Badge>
            )}
            {isExpired && (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 w-fit mt-1">
                <XCircle className="h-3 w-3 mr-1" />
                Expired
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = row.original.priority || 0;
        return (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{priority}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge
            variant="outline"
            className={isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"}
          >
            {isActive ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Actions"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const deal = row.original;
        return (
          <div className="flex justify-end">
            <DataTableRowActions
              row={row}
              actions={[
                {
                  label: "View Details",
                  icon: <Eye className="h-4 w-4" />,
                  openModal: true,
                },
                {
                  label: "Edit",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => onEdit?.(deal),
                },
                {
                  label: "Duplicate",
                  icon: <Copy className="h-4 w-4" />,
                  onClick: () =>
                    console.log("Duplicate (you can implement this later)"),
                },
                {
                  label: "Delete",
                  icon: <Trash2 className="h-4 w-4 text-destructive" />,
                  destructive: true,
                  confirm: true,
                  successMessage: "Deal deleted successfully.",
                  onClick: () => onDelete(deal),
                },
              ]}
            />
          </div>
        );
      },
    },
  ];
}

export function getDealFilterColumns(deals: Deal[]) {
  const discountTypes = Array.from(
    new Set(deals.map((d) => d.discountType).filter(Boolean))
  );
  const statuses = Array.from(
    new Set(deals.map((d) => (d.isActive ? "Active" : "Inactive")))
  );

  return [
    {
      column: "discountType",
      title: "Discount Type",
      multiple: true,
      options: discountTypes.map((type) => ({
        label: type === "percentage" ? "Percentage" : type === "fixed" || type === "flat" ? "Fixed" : String(type),
        value: String(type || ""),
        icon: DollarSign,
      })),
    },
    {
      column: "isActive",
      title: "Status",
      multiple: true,
      options: statuses.map((status) => ({
        label: status,
        value: status === "Active" ? "true" : "false",
        icon: status === "Active" ? CheckCircle2 : XCircle,
      })),
    },
  ];
}

