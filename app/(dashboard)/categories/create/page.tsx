"use client";

import React from "react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import CategoryForm from "@/components/category-form";

const CategoryCreatePage = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs>
          <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
          <BreadcrumbItem href="/categories">Categories</BreadcrumbItem>
          <BreadcrumbItem>Create</BreadcrumbItem>
        </Breadcrumbs>

        <div>
          <h1 className="text-2xl font-semibold text-default-900">
            Create Category
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new category to organize your products
          </p>
        </div>
      </div>

      {/* Category Form - handles its own data fetching and submission */}
      <CategoryForm mode="create" />
    </div>
  );
};

export default CategoryCreatePage;
