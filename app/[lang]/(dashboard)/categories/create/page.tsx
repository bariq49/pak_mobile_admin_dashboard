"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import {
  Upload,
  FolderTree,
  FileText,
  Globe,
  ImagePlus,
  Trash2,
  Link2,
  Type,
  AlignLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Form data interface
interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
}

const CategoryCreatePage = () => {
  const router = useRouter();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
      metaTitle: "",
      metaDescription: "",
    },
  });

  // Image state
  const [categoryImage, setCategoryImage] = useState<string>("");
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Watch the name field to auto-generate slug
  const nameValue = watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
    }
  }, [nameValue, setValue]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setCategoryImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCategoryImage(previewUrl);
    }
  };

  // Remove image
  const removeImage = () => {
    if (categoryImage?.startsWith("blob:")) {
      URL.revokeObjectURL(categoryImage);
    }
    setCategoryImage("");
    setCategoryImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Form submit handler (UI only - no API call)
  const onSubmit = (data: CategoryFormData) => {
    console.log("Form data:", data);
    console.log("Image file:", categoryImageFile);
    // API submission will be implemented later
  };

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

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-primary" />
                  Category Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {/* Category Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-default-600">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Category Name <span className="text-destructive">*</span>
                    </div>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mobile Phones"
                    size="lg"
                    {...register("name", { required: "Category name is required" })}
                    className={cn(errors.name && "border-destructive")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-default-600">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Slug
                    </div>
                  </Label>
                  <Input
                    id="slug"
                    placeholder="mobile-phones"
                    size="lg"
                    {...register("slug")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from name. You can edit it manually.
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-default-600">
                    <div className="flex items-center gap-2">
                      <AlignLeft className="h-4 w-4" />
                      Description
                    </div>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter category description..."
                    className="min-h-[120px]"
                    {...register("description")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category Image Card */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-primary" />
                  Category Image
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                {categoryImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-default-200 bg-default-50">
                    <img
                      src={categoryImage}
                      alt="Category"
                      className="w-full h-64 object-contain bg-white"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="bg-white hover:bg-white/90"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        color="destructive"
                        className="bg-destructive text-white hover:bg-destructive/90 border-destructive"
                        onClick={removeImage}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-default-300 rounded-xl p-8 text-center hover:border-primary transition-colors duration-200 cursor-pointer bg-default-50/50"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-default-700 font-medium">
                          Drop your image here, or{" "}
                          <span className="text-primary">browse</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PNG, JPG, WEBP (Recommended: 400x400px, Max 5MB)
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO / Meta Information Card */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  SEO / Meta Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {/* Meta Title */}
                <div className="space-y-2">
                  <Label htmlFor="metaTitle" className="text-default-600">
                    Meta Title
                  </Label>
                  <Input
                    id="metaTitle"
                    placeholder="Enter meta title for SEO"
                    size="lg"
                    {...register("metaTitle")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 50-60 characters
                  </p>
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <Label htmlFor="metaDescription" className="text-default-600">
                    Meta Description
                  </Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Enter meta description for search engines..."
                    className="min-h-[100px]"
                    {...register("metaDescription")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 150-160 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-4 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg border border-default-200">
                  <div>
                    <p className="font-medium text-default-700">
                      Category Status
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable this category
                    </p>
                  </div>
                  <Switch
                    checked={watch("isActive")}
                    onCheckedChange={(checked) => setValue("isActive", checked)}
                  />
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-default-600">Current Status:</span>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      watch("isActive")
                        ? "bg-success/10 text-success"
                        : "bg-default-200 text-default-600"
                    )}
                  >
                    {watch("isActive") ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-medium">Preview</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="aspect-square rounded-lg border border-default-200 bg-default-50 overflow-hidden flex items-center justify-center">
                    {categoryImage ? (
                      <img
                        src={categoryImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImagePlus className="h-12 w-12 text-default-300 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No image selected
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Name Preview */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Category Name
                    </p>
                    <p className="font-medium text-default-900 truncate">
                      {watch("name") || "Untitled Category"}
                    </p>
                  </div>

                  {/* Slug Preview */}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      URL Slug
                    </p>
                    <p className="text-sm text-primary truncate">
                      /{watch("slug") || "category-slug"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons Card */}
            <Card className="sticky top-6">
              <CardContent className="pt-6 space-y-3">
                <Button type="submit" className="w-full" size="lg">
                  Create Category
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  color="secondary"
                  className="w-full"
                  size="lg"
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  color="destructive"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    const confirmLeave = window.confirm(
                      "Are you sure you want to cancel? Any unsaved changes will be lost."
                    );
                    if (confirmLeave) {
                      router.push("/en/categories");
                    }
                  }}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CategoryCreatePage;

