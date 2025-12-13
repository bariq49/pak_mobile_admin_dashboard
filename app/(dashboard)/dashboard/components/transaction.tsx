"use client";

import DashboardDropdown from "@/components/dashboard-dropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import TableList from "@/components/Tables/table-list";
import { useRecentTransactionsQuery } from "@/hooks/api/use-dashboard-api";
import { Skeleton } from "@/components/ui/skeleton";
import { getDefaultAvatar } from "@/api/dashboard/dashboard.transformers";
import type { Transaction } from "@/api/dashboard/dashboard.transformers";

const Transactions = () => {
  const { data, isLoading, isError } = useRecentTransactionsQuery(1, 10);

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
          <div className="h-[545px]">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const responseData = data as { transactions: Transaction[]; total: number } | undefined;
  const transactions: Transaction[] = responseData?.transactions || [];
  const total: number = responseData?.total || 0;

  if (isError || transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="border-none flex-row mb-0">
          <div className="flex-1 pt-2">
            <CardTitle>Recent Transactions</CardTitle>
            <span className="block text-sm text-default-600 mt-2">
              No transactions available
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          <div className="h-[545px] flex items-center justify-center">
            <p className="text-default-600">No transactions found</p>
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
          <CardTitle>Recent Transactions</CardTitle>
          <span className="block text-sm text-default-600 mt-2">
            Total {total} transactions
          </span>
        </div>
        <DashboardDropdown />
      </CardHeader>

      {/* --- TableList --- */}
      <CardContent className="p-0 pb-4">
        <div className="h-[545px]">
          <ScrollArea className="h-full">
            <TableList
              data={transactions.map((item: Transaction, index: number) => ({
                id: item._id || item.id || index.toString(),
                image: item.customerImage || getDefaultAvatar(item.customerName),
                title: item.customerName,
                subtitle: item.orderNumber || item.customerId || `#${item._id?.slice(-6) || index}`,
                value: formatAmount(item.amount),
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

export default Transactions;
