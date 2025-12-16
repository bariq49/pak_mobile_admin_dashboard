"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/Tables/data-table/data-table";
import {
  getCategoryFilterColumns,
  flattenCategories,
  getCategoryColumns,
} from "@/components/Tables/data-table/columns/category-columns";
import { useGetCategoriesQuery, useDeleteCategoryMutation } from "@/hooks/api/use-categories-api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function CategoriesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, error } = useGetCategoriesQuery({
    page,
    limit: pageSize,
  });

  const { mutateAsync: deleteCategory } = useDeleteCategoryMutation();
  const handleDelete = (category: any) => deleteCategory(category._id);

  const handleEdit = (category: any) => {
    // Get the category slug for navigation (backend uses slug for GET operations)
    const categorySlug = category.slug;

    if (!categorySlug) {
      toast.error("Category slug not found");
      return;
    }

    // Navigate to the edit page using the slug
    router.push(`/categories/${categorySlug}/edit`);
  };

  const handleViewDetails = (category: any) => {
    const categorySlug = category.slug;

    if (!categorySlug) {
      toast.error("Category slug not found");
      return;
    }

    router.push(`/categories/${categorySlug}`);
  };

  const columns = useMemo(
    () =>
      getCategoryColumns({
        onDelete: handleDelete,
        onEdit: handleEdit,
        onView: handleViewDetails,
      }),
    [handleDelete, handleEdit]
  );

  const flattenedCategories = useMemo(
    () => flattenCategories(data?.data?.categories ?? []),
    [data]
  );

  const filters = getCategoryFilterColumns(flattenedCategories);
  const pagination = data?.data?.pagination;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-10">
        <div>
          <CardTitle className="text-xl font-semibold">All Categories</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Manage, edit, and organize product categories easily.
          </CardDescription>
        </div>

        <Button className="mt-4 sm:mt-0" size="sm" asChild>
          <Link href="/categories/create">
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        <DataTable
          columns={columns}
          data={flattenedCategories}
          searchKey="name"
          filterColumns={filters}
          loading={isLoading}
          fetching={isFetching}
          error={error ? "Failed to fetch categories" : null}
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </CardContent>
    </Card>
  );
}
