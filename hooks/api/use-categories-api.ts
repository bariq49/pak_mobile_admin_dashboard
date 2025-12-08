"use client";

import { createCategoryApi, deleteCategoryApi, getCategoriesApi, updateCategoryApi } from "@/api/categories/categories.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useGetCategoriesQuery(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ["categories", params.page, params.limit],
    queryFn: () => getCategoriesApi(params.page, params.limit),
  });
}

/* ---------------- CREATE CATEGORY ---------------- */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => createCategoryApi(payload),

    onMutate: () => {
      toast.loading("Creating category...", { id: "create-category" });
    },

    onSuccess: () => {
      toast.success("Category created successfully!", { id: "create-category" });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },

    onError: () => {
      toast.error("Failed to create category", { id: "create-category" });
    },
  });
}

/* ---------------- UPDATE CATEGORY ---------------- */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateCategoryApi(id, payload),

    onMutate: () => {
      toast.loading("Updating category...", { id: "update-category" });
    },

    onSuccess: () => {
      toast.success("Category updated successfully!", { id: "update-category" });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },

    onError: () => {
      toast.error("Failed to update category", { id: "update-category" });
    },
  });
}

/* ---------------- DELETE CATEGORY ---------------- */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategoryApi(id),

    onMutate: () => {
      toast.loading("Deleting category...", { id: "delete-category" });
    },

    onSuccess: () => {
      toast.success("Category deleted successfully!", { id: "delete-category" });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },

    onError: () => {
      toast.error("Failed to delete category", { id: "delete-category" });
    },
  });
}
