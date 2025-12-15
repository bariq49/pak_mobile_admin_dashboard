"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/Tables/data-table/data-table";
import {
  getProductFilterColumns,
  productColumns,
} from "@/components/Tables/data-table/columns/product-columns";
import { useDeleteProductMutation, useGetProductsQuery } from "@/hooks/api/use-products-api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function ProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, error } = useGetProductsQuery({
    page,
    limit: pageSize,
  });
  const { mutateAsync: deleteProduct } = useDeleteProductMutation();

  const handleDelete = async (product: any) => {
    try {
      toast.loading("Deleting product...", { id: "delete" });
      await deleteProduct(product.id);
      toast.success("Product deleted successfully!", { id: "delete" });
    } catch (err) {
      toast.error("Failed to delete product", { id: "delete" });
    }
  };

  const handleEdit = (product: any) => {
    // Get the product slug for navigation (backend uses slug for GET operations)
    const productSlug = product.slug;
    
    if (!productSlug) {
      toast.error("Product slug not found");
      return;
    }
    
    // Navigate to the edit page using the slug
    router.push(`/products/${productSlug}/edit`);
  };

  const handleViewDetails = (product: any) => {
    // Get the product slug for navigation
    const productSlug = product.slug;
    
    if (!productSlug) {
      toast.error("Product slug not found");
      return;
    }
    
    // Navigate to the details page using the slug
    router.push(`/products/${productSlug}`);
  };

  const columns = useMemo(
    () => productColumns({ onDelete: handleDelete, onEdit: handleEdit, onView: handleViewDetails }),
    []
  );

  const products = useMemo(
    () => {
      const mappedProducts = data?.data?.products?.map((p: any) => {
        // Debug: Log each product's quantity to identify the issue
        console.log(`[Products List] Product: ${p.name}, quantity: ${p.quantity}, stock: ${p.stock}`);
        
        return {
          ...p,
          // Ensure id is mapped correctly (backend may use _id)
          // Preserve both id and _id for compatibility
          id: p.id || p._id,
          _id: p._id || p.id,
          categoryName: p.category?.name ?? "",
          // Explicitly map quantity - use the exact field from API, NOT derived from stock/variants
          quantity: p.quantity,
        };
      }) ?? [];
      
      console.log("[Products List] Total products loaded:", mappedProducts.length);
      return mappedProducts;
    },
    [data]
  );
  const filters = getProductFilterColumns(products);
  const pagination = data?.data?.pagination;

  const handlePageChange = useCallback((p: number) => setPage(p), []);
  const handlePageSizeChange = useCallback((s: number) => {
    setPageSize(s);
    setPage(1);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-10">
        <div>
          <CardTitle className="text-xl font-semibold">All Product List</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            View, manage, and organize all products in your store.
            Use filters or search to find products quickly, and add new ones easily.
          </CardDescription>
        </div>
        <Button className="mt-4 sm:mt-0" size="sm" asChild>
          <Link href="/products/create">
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          filterColumns={filters}
          loading={isLoading}
          fetching={isFetching}
          error={error ? "Failed to fetch products" : null}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </CardContent>
    </Card>
  );
}
