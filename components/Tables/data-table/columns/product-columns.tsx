"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Boxes,
  CheckCircle2,
  XCircle,
  Star,
  Edit,
  Eye,
  Copy,
  Trash2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "../data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Product } from "@/api/product/products.api";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/currency";
import { DataTableRowActions } from "../data-table-row-actions";

interface ProductColumnProps {
  onDelete: (product: Product) => void;
  onEdit: (product: Product) => void;
}
export const productColumns = ({ onDelete, onEdit }: ProductColumnProps): ColumnDef<Product>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },

  // Product name + image
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      const name = product.name || "";
      const image =
        product.gallery?.[0]?.url || product.images || product.thumbnail || null;
      const initials = name
        .split(" ")
        .map((w) => w[0]?.toUpperCase())
        .join("")
        .slice(0, 2);

      return (
        <div className="flex items-center gap-4 py-3">
          <Avatar className="h-12 w-12 rounded-lg border shadow-sm">
            {image ? (
              <AvatarImage src={image} alt={name} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-muted text-sm font-semibold">
                {initials || "NA"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold truncate max-w-[200px]">{name}</span>
            {product.categoryName && (
              <span className="text-xs text-muted-foreground mt-1">
                {product.categoryName}
              </span>
            )}
          </div>
        </div>
      );
    },
  },

  // Category
  {
    accessorKey: "categoryName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      return value.length === 0 || value.includes(row.getValue(id));
    },
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.categoryName || "—"}
      </div>
    ),
  },

  // Stock Status
  {
    accessorKey: "in_stock",
    meta: { label: "Stock" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      if (value.length === 0) return true;
      const inStock = row.getValue(id);
      return value.includes(String(inStock));
    },
    cell: ({ row }) =>
      row.original.in_stock ? (
        <Badge variant="outline" className="bg-green-100 text-green-700">
          In Stock
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-100 text-red-700">
          Out of Stock
        </Badge>
      ),
  },

  // Active Status
  {
    accessorKey: "is_active",
    meta: { label: "Active" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      if (value.length === 0) return true;
      const isActive = row.getValue(id);
      return value.includes(String(isActive));
    },
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant="outline" className="bg-blue-100 text-blue-700">
          Active
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-gray-200 text-gray-600">
          Inactive
        </Badge>
      ),
  },

  // Price
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const { rate, currency } = useCurrency();
      const convertedPrice = row.original.price * rate;
      return (
        <div className="font-medium tabular-nums">
          {formatCurrency(convertedPrice, currency)}
        </div>
      );
    },
  },

  // Quantity - displays the main product quantity from API (NOT derived from variants or stock)
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Qty" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      // Use quantity directly from the product - do NOT use stock, inventory, or variant calculations
      const left = typeof product.quantity === 'number' ? product.quantity : 0;
      const sold = typeof product.salesCount === 'number' ? product.salesCount : 0;
      
      const totalEstimate = sold + left;
      const soldPercent =
        totalEstimate > 0 ? Math.min((sold / totalEstimate) * 100, 100) : 0;
      let barColor = "bg-primary";
      if (left <= 5) barColor = "bg-destructive";
      else if (left < 15) barColor = "bg-amber-500";
      else barColor = "bg-green-500";

      const textColor =
        left <= 5
          ? "text-destructive"
          : left < 15
            ? "text-amber-500"
            : "text-foreground";

      return (
        <div className="flex flex-col gap-1 w-full min-w-[140px]">
          <div className={`font-medium ${textColor}`}>
            {sold} sold{" "}
            <span className="text-muted-foreground">/ {left} left</span>
          </div>
          <div className="relative h-1.5 w-full rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
            <div
              className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-300`}
              style={{ width: `${soldPercent}%` }}
            />
          </div>
        </div>
      );
    },
    size: 160,
  },

  {
    accessorKey: "ratingSummary",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const avg = row.original.ratingSummary?.average ?? 0;
      const total = row.original.ratingSummary?.total ?? 0;

      const getStarColor = (rating: number) => {
        if (rating >= 4) return "text-yellow-400 fill-yellow-400";
        if (rating >= 2) return "text-amber-400 fill-amber-400";
        if (rating > 0) return "text-orange-400 fill-orange-400";
        return "text-gray-300";
      };

      const starColor = getStarColor(avg);

      return (
        <div className="flex items-center text-sm">
          <Star
            className={`h-4 w-4 mr-1 ${starColor}`}
            strokeWidth={avg > 0 ? 1.5 : 1}
          />
          <span className="font-medium">{avg > 0 ? avg.toFixed(1) : "—"}</span>
          {total > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({total} Reviews)
            </span>
          )}
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => (
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
            onClick: () => onEdit(row.original),
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4 text-destructive" />,
            onClick: () => onDelete(row.original),
          },
        ]}
      />
    ),
  },
];

export function getProductFilterColumns(products: Product[]) {
  const categories = Array.from(
    new Set(products.map((p) => p.categoryName).filter(Boolean))
  );

  return [
    {
      column: "categoryName",
      title: "Category",
      multiple: true,
      options: categories.map((category) => ({
        label: category,
        value: category,
        icon: Boxes,
      })),
    },
    {
      column: "in_stock",
      title: "Stock Status",
      multiple: false,
      options: [
        { label: "In Stock", value: "true", icon: CheckCircle2 },
        { label: "Out of Stock", value: "false", icon: XCircle },
      ],
    },
    {
      column: "is_active",
      title: "Active Status",
      multiple: false,
      options: [
        { label: "Active", value: "true", icon: CheckCircle2 },
        { label: "Inactive", value: "false", icon: XCircle },
      ],
    },
  ];
}