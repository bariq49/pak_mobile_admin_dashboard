"use client"

import { Trophy, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { useDashboardStatsQuery } from "@/hooks/api/use-dashboard-api";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/api/dashboard/dashboard.transformers";

const EcommerceStats = () => {
  const { data: stats, isLoading, isError } = useDashboardStatsQuery();

  const formatNumber = (num: number | undefined | null): string => {
    if (!num && num !== 0) return "0";
    const number = Number(num);
    if (isNaN(number)) return "0";
    if (number >= 1000000) {
      return (number / 1000000).toFixed(2) + "M";
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(2) + "K";
    }
    return number.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatCurrency = (num: number | undefined | null): string => {
    if (!num && num !== 0) return "€0.00";
    const number = Number(num);
    if (isNaN(number)) return "€0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(number);
  };

  const statsData: DashboardStats = stats || {
    totalSales: 0,
    todayOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
  };

  const data = [
    {
      text: "Total Sales",
      total: formatCurrency(statsData.totalSales), // All-time total sales in EUR
      color: "primary",
      icon: <Trophy className="w-3.5 h-3.5" />
    },
    {
      text: "Today Orders",
      total: formatNumber(statsData.todayOrders),
      color: "warning",
      icon: <FileText className="w-3.5 h-3.5" />
    },
    {
      text: "Completed Orders",
      total: formatNumber(statsData.completedOrders),
      color: "success",
      icon: <CheckCircle className="w-3.5 h-3.5" />
    },
    {
      text: "Pending Orders",
      total: formatNumber(statsData.pendingOrders),
      color: "destructive",
      icon: <AlertTriangle className="w-3.5 h-3.5" />
    },
  ];

  if (isLoading) {
    return (
      <>
        {[1, 2, 3, 4].map((index) => (
          <Skeleton key={`stats-skeleton-${index}`} className="h-[140px] w-full rounded-sm" />
        ))}
      </>
    );
  }

  if (isError) {
    return (
      <div className="col-span-4 text-center py-8 text-default-600">
        Failed to load statistics. Please refresh the page.
      </div>
    );
  }
  return (
    <>
      {data.map((item, index) => (
        <div
          key={`reports-state-${index}`}
          className={cn(
            "flex flex-col gap-1.5 p-4 rounded-sm overflow-hidden bg-primary/10  items-start relative before:absolute before:left-1/2 before:-translate-x-1/2 before:bottom-1 before:h-[2px] before:w-9 before:bg-primary/50 dark:before:bg-primary-foreground before:hidden ",
            {
              "bg-primary/40  dark:bg-primary/70": item.color === "primary",
              "bg-orange-50 dark:bg-orange-500": item.color === "warning",
              "bg-green-50 dark:bg-green-500": item.color === "success",
              "bg-red-50 dark:bg-red-500 ": item.color === "destructive",
            }
          )}
        >
          <span
            className={cn(
              "h-[95px] w-[95px] rounded-full bg-primary/40 absolute -top-8 -right-8 ring-[20px] ring-primary/30",
              {
                "bg-primary/50  ring-primary/20 dark:bg-primary dark:ring-primary/40": item.color === "primary",
                "bg-orange-200 ring-orange-100 dark:bg-orange-300 dark:ring-orange-400": item.color === "warning",
                "bg-green-200 ring-green-100 dark:bg-green-300 dark:ring-green-400": item.color === "success",
                "bg-red-200 ring-red-100 dark:bg-red-300 dark:ring-red-400": item.color === "destructive",
              }
            )}
          ></span>
          <div className={`w-8 h-8 grid place-content-center rounded-full border border-dashed border-${item.color} dark:border-primary-foreground/60`}>
            <span className={cn(`h-6 w-6 rounded-full grid place-content-center  bg-${item.color}`, {
              "dark:bg-[#EFF3FF]/30": item.color === "primary",
              "dark:bg-[#FFF7ED]/30": item.color === "warning",
              "dark:bg-[#ECFDF4]/30": item.color === "success",
              "dark:bg-[#FEF2F2]/30": item.color === "destructive"
            })}>
              {item.icon}
            </span>
          </div>
          <span className="mt-3 text-sm text-default-800 dark:text-primary-foreground font-medium capitalize relative z-10">
            {item.text}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-default-900  dark:text-primary-foreground">{item.total}</span>
            <TrendingUp className={`w-5 h-5 text-${item.color} dark:text-primary-foreground`} />
          </div>
        </div>
      ))}
    </>
  );
};

export default EcommerceStats;