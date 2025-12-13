"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/Tables/data-table/data-table";
import {
  getDealFilterColumns,
  getDealColumns,
} from "@/components/Tables/data-table/columns/deal-columns";
import { useDeleteDealMutation, useGetDealsQuery } from "@/hooks/api/use-deals-api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Deal } from "@/api/deals/deals.api";

export default function DealsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, error } = useGetDealsQuery({
    page,
    limit: pageSize,
  });
  const { mutateAsync: deleteDeal } = useDeleteDealMutation();

  const handleDelete = async (deal: Deal) => {
    try {
      toast.loading("Deleting deal...", { id: "delete" });
      await deleteDeal(deal._id);
      toast.success("Deal deleted successfully!", { id: "delete" });
    } catch (err) {
      toast.error("Failed to delete deal", { id: "delete" });
    }
  };

  const handleEdit = (deal: Deal) => {
    // Navigate to edit page using deal ID
    router.push(`/deals/${deal._id}/edit`);
  };

  const columns = useMemo(
    () => getDealColumns({ onDelete: handleDelete, onEdit: handleEdit }),
    []
  );

  const deals = useMemo(
    () => {
      const mappedDeals = data?.data?.deals?.map((d: Deal) => {
        return {
          ...d,
          // Ensure id is mapped correctly (backend may use _id)
          id: d._id,
          _id: d._id,
        };
      }) ?? [];
      
      return mappedDeals;
    },
    [data]
  );

  const filters = getDealFilterColumns(deals);
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
          <CardTitle className="text-xl font-semibold">All Deals</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            View, manage, and organize all promotional deals and campaigns.
            Use filters or search to find deals quickly, and add new ones easily.
          </CardDescription>
        </div>
        <Button className="mt-4 sm:mt-0" size="sm" asChild>
          <Link href="/deals/create">
            <Plus className="h-4 w-4 mr-2" /> Add Deal
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        <DataTable
          columns={columns}
          data={deals}
          searchKey="title"
          filterColumns={filters}
          loading={isLoading}
          fetching={isFetching}
          error={error ? "Failed to fetch deals" : null}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </CardContent>
    </Card>
  );
}

