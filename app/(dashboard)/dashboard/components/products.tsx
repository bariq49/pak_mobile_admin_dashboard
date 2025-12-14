"use client";
import DashboardDropdown from "@/components/dashboard-dropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import TableList from "@/components/Tables/table-list";
import { useTopProductsQuery } from "@/hooks/api/use-dashboard-api";
import { Skeleton } from "@/components/ui/skeleton";
import { getDefaultAvatar } from "@/api/dashboard/dashboard.transformers";

const Products = () => {
  // Fetch best selling products from API
  const { data, isLoading, isError } = useTopProductsQuery(1000);

  const formatAmount = (amount: number | undefined | null): string => {
    if (!amount && amount !== 0) return "$0.00";
    return `$${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
          <div className="h-[380px]">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalSales = products.reduce((sum, p) => sum + (p.sales || 0), 0);

  if (isError || products.length === 0) {
    return (
      <Card>
        <CardHeader className="border-none flex-row mb-0">
          <div className="flex-1 pt-2">
            <CardTitle>Popular Products</CardTitle>
            <span className="block text-sm text-default-600 mt-2">
              No products available
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          <div className="h-[380px] flex items-center justify-center">
            <p className="text-default-600">No products found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-none flex-row mb-0">
        <div className="flex-1 pt-2">
          <CardTitle>Popular Products</CardTitle>
          <span className="block text-sm text-default-600 mt-2">
            Total {totalSales.toLocaleString()} sales
          </span>
        </div>
        <DashboardDropdown />
      </CardHeader>

      <CardContent className="p-0 pb-4">
        <div className="h-[380px]">
          <ScrollArea className="h-full">
            <TableList
              data={products.map((product, index) => ({
                id: product._id || product.id || index.toString(),
                image: product.image || getDefaultAvatar(product.name || "Product"),
                title: product.name || "Unknown Product",
                subtitle: formatAmount(product.revenue),
                value: `${product.sales || 0} sales`,
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

export default Products;
