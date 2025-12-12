"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardDropdown from "@/components/dashboard-dropdown";
import TableList from "../../../../../components/Tables/table-list";
import { useTopProductsQuery } from "@/hooks/api/use-dashboard-api";
import { Skeleton } from "@/components/ui/skeleton";
import { getDefaultAvatar } from "@/api/dashboard/dashboard.transformers";

const TopSell = () => {
  const { data, isLoading, isError } = useTopProductsQuery(10);

  const formatAmount = (amount: number): string => {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-none flex-row mb-0">
          <div className="flex-1 pt-2">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          <div className="h-[495px]">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const products = data?.products || [];
  const total = data?.total || 0;

  if (isError || products.length === 0) {
    return (
      <Card>
        <CardHeader className="border-none flex-row mb-0">
          <div className="flex-1 pt-2">
            <CardTitle>Top Selling Products</CardTitle>
            <span className="block text-sm text-default-600 mt-2">
              No products available
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          <div className="h-[495px] flex items-center justify-center">
            <p className="text-default-600">No products found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {/* --- Header --- */}
      <CardHeader className="border-none flex-row mb-0">
        <div className="flex-1 pt-2">
          <CardTitle>Top Selling Products</CardTitle>
          <span className="block text-sm text-default-600 mt-2">
            Total {total} items
          </span>
        </div>
        <DashboardDropdown />
      </CardHeader>

      {/* --- TableList --- */}
      <CardContent className="p-0 pb-4">
        <div className="h-[495px]">
          <ScrollArea className="h-full">
            <TableList
              data={products.map((product, index) => ({
                id: product._id || product.id || index.toString(),
                image: product.image || getDefaultAvatar(product.name),
                title: product.name,
                subtitle: formatAmount(product.revenue),
                value: `${product.sales} sales`,
                link: "#",
              }))}
              hoverEffect
            />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSell;
