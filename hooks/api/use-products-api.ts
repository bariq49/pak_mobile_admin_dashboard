import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  GetProductsResponse,
} from "@/api/product/products.api";

interface UseGetProductsParams {
  page?: number;
  limit?: number;
}

export const useGetProductsQuery = ({ page = 1, limit = 10 }: UseGetProductsParams) => {
  return useQuery<GetProductsResponse>({
    queryKey: ["products", page, limit],
    queryFn: () => getProductsApi(page, limit),
    retry: 1,
    // staleTime: 5000,
    placeholderData: (prev) => prev,
  });
};

// CREATE PRODUCT
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

// UPDATE PRODUCT
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<any> }) =>
      updateProductApi(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

// DELETE PRODUCT
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProductApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};
