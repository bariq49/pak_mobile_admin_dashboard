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
  // Fetch all transactions - using a very large limit to effectively get all records
  // This ensures all transactions are displayed without pagination
  const { data, isLoading, isError } = useRecentTransactionsQuery(1, 999999);

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

  // Group transactions by day
  const groupTransactionsByDay = () => {
    const grouped: Record<string, { date: string; transactions: Transaction[]; totalAmount: number; count: number }> = {};
    
    transactions.forEach((tx) => {
      if (!tx.createdAt) return;
      
      try {
        const date = new Date(tx.createdAt);
        if (isNaN(date.getTime())) return;
        
        // Format date as YYYY-MM-DD for grouping
        const dateKey = date.toISOString().split('T')[0];
        const dateLabel = date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric"
        });
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            date: dateLabel,
            transactions: [],
            totalAmount: 0,
            count: 0
          };
        }
        
        grouped[dateKey].transactions.push(tx);
        grouped[dateKey].totalAmount += tx.amount || 0;
        grouped[dateKey].count += 1;
      } catch {
        // Skip invalid dates
      }
    });
    
    // Sort by date (newest first)
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([_, data]) => data);
  };

  const dailyTransactions = groupTransactionsByDay();

  if (isError || transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="border-none flex-row mb-0">
          <div className="flex-1 pt-2">
            <CardTitle>Transactions Per Day</CardTitle>
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
          <CardTitle>Transactions Per Day</CardTitle>
          <span className="block text-sm text-default-600 mt-2">
            {dailyTransactions.length} days • {transactions.length} total transactions
          </span>
        </div>
        <DashboardDropdown />
      </CardHeader>

      {/* --- TableList --- */}
      <CardContent className="p-0 pb-4">
        <div className="h-[545px]">
          <ScrollArea className="h-full">
            <TableList
              data={dailyTransactions.map((dayData, index) => ({
                id: `day-${index}`,
                image: getDefaultAvatar(dayData.date),
                title: dayData.date,
                subtitle: `${dayData.count} transaction${dayData.count !== 1 ? 's' : ''}`,
                value: formatAmount(dayData.totalAmount),
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
