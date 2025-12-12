"use client";

import { createDealApi, deleteDealApi, getDealsApi, updateDealApi, GetDealsResponse } from "@/api/deals/deals.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useGetDealsQuery(params: { page: number; limit: number }) {
  return useQuery<GetDealsResponse>({
    queryKey: ["deals", params.page, params.limit],
    queryFn: () => getDealsApi(params.page, params.limit),
    retry: 1,
    placeholderData: (prev) => prev,
  });
}

/* ---------------- CREATE DEAL ---------------- */
export function useCreateDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => createDealApi(payload),

    onMutate: () => {
      toast.loading("Creating deal...", { id: "create-deal" });
    },

    onSuccess: () => {
      toast.success("Deal created successfully!", { id: "create-deal" });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },

    onError: () => {
      toast.error("Failed to create deal", { id: "create-deal" });
    },
  });
}

/* ---------------- UPDATE DEAL ---------------- */
export function useUpdateDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateDealApi(id, payload),

    onMutate: () => {
      toast.loading("Updating deal...", { id: "update-deal" });
    },

    onSuccess: () => {
      toast.success("Deal updated successfully!", { id: "update-deal" });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },

    onError: () => {
      toast.error("Failed to update deal", { id: "update-deal" });
    },
  });
}

/* ---------------- DELETE DEAL ---------------- */
export function useDeleteDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDealApi(id),

    onMutate: () => {
      toast.loading("Deleting deal...", { id: "delete-deal" });
    },

    onSuccess: () => {
      toast.success("Deal deleted successfully!", { id: "delete-deal" });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },

    onError: () => {
      toast.error("Failed to delete deal", { id: "delete-deal" });
    },
  });
}

