"use client";

import DashboardDropdown from "@/components/dashboard-dropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ListItem from "./list-item";
import CustomerCard from "./customer-card";
import { useTopCustomersQuery } from "@/hooks/api/use-dashboard-api";
import { Skeleton } from "@/components/ui/skeleton";
import { getDefaultAvatar } from "@/api/dashboard/dashboard.transformers";
import type { TopCustomer } from "@/api/dashboard/dashboard.transformers";

interface CustomerDataItem {
  id: string;
  name: string;
  email: string;
  score: number;
  image: string;
  color: string;
  amount: string;
}

const TopCustomers = () => {
  // Fetch all customers - no limit, show everything
  const { data, isLoading, isError } = useTopCustomersQuery(1000);

  const formatAmount = (amount: number | undefined | null): string => {
    if (!amount && amount !== 0) return "0";
    return Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const calculateScore = (totalSpent: number, maxSpent: number): number => {
    if (maxSpent === 0) return 0;
    return Math.round((totalSpent / maxSpent) * 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex-row justify-between items-center gap-4 mb-0 border-none p-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="pt-16">
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const customers = data?.customers || [];
  const maxSpent = customers.length > 0 
    ? Math.max(...customers.map(c => c.totalSpent || 0).filter(spent => !isNaN(spent))) 
    : 0;

  const customerData: CustomerDataItem[] = customers.map((customer: TopCustomer, index: number) => ({
    id: customer._id || customer.id || index.toString(),
    name: customer.name || "Unknown Customer",
    email: customer.email || "No email",
    score: calculateScore(customer.totalSpent || 0, maxSpent),
    image: customer.image || getDefaultAvatar(customer.name || "Customer"),
    color: index === 0 ? "success" : index === 1 ? "primary" : index === 2 ? "primary" : index % 2 === 0 ? "info" : "warning",
    amount: formatAmount(customer.totalSpent),
  }));

  if (isError || customerData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex-row justify-between items-center gap-4 mb-0 border-none p-6">
          <CardTitle>Top Customers</CardTitle>
          <DashboardDropdown />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="pt-16 flex items-center justify-center">
            <p className="text-default-600">No customers found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center gap-4 mb-0 border-none p-6">
        <CardTitle>Top Customers</CardTitle>
        <DashboardDropdown />
      </CardHeader>
      <CardContent className="pt-0 ">

        <div className="pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-6">
            {
              customerData.slice(0, 3).map((item: CustomerDataItem, index: number) => <CustomerCard key={item.id} item={item} index={index + 1} />)
            }

          </div>
          <div className="mt-8 ">
            {customerData.slice(3).map((item: CustomerDataItem, index: number) =>
              <ListItem key={`customer-${item.id}`} item={item} index={index + 3} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopCustomers;