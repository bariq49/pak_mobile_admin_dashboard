"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import { getGridConfig, getYAxisConfig } from "@/lib/appex-chart-options";
import { useRevenueChartQuery } from "@/hooks/api/use-dashboard-api";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Period } from "@/api/dashboard/dashboard.api";
import type { RevenueDataPoint } from "@/api/dashboard/dashboard.transformers";

type GroupingType = "day" | "week" | "month";

interface RevinueChartProps {
  height?: number;
  period?: Period;
  onPeriodChange?: (period: Period) => void;
}

const RevinueChart = ({ height = 350, period: externalPeriod, onPeriodChange }: RevinueChartProps) => {
  const { theme: config, setTheme: setConfig, isRtl } = useThemeStore();
  const { theme: mode } = useTheme();
  // Show all days - use a large period to get all available data
  const [internalPeriod, setInternalPeriod] = useState<Period>("12months");
  const period = externalPeriod || internalPeriod;
  const { data: revenueData, isLoading, isError } = useRevenueChartQuery(period);
  
  // Grouping type: per day, per week, or per month (default: per day)
  const [groupingType, setGroupingType] = useState<GroupingType>("day");

  const theme = themes.find((theme) => theme.name === config);

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Group and format data based on grouping type
  const chartData = useMemo((): { revenue: number[]; orders: number[]; categories: string[] } => {
    // Ensure revenueData exists and data is an array
    if (!revenueData || !revenueData.data || !Array.isArray(revenueData.data)) {
      return {
        revenue: [],
        orders: [],
        categories: [],
      };
    }

    // revenueData.data is now guaranteed to be an array after transformation
    const dataArray: RevenueDataPoint[] = revenueData.data;

    if (!dataArray || dataArray.length === 0) {
      return {
        revenue: [],
        orders: [],
        categories: [],
      };
    }

    // Group data based on grouping type
    const groupedData: Record<string, { revenue: number; orders: number; date: Date }> = {};

    dataArray.forEach((item: RevenueDataPoint) => {
      if (!item || !item.date) return;
      
      try {
        const date = new Date(item.date);
        if (isNaN(date.getTime())) return;

        let groupKey: string;
        let groupDate: Date;

        if (groupingType === "day") {
          // Group by day
          groupDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          groupKey = groupDate.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (groupingType === "week") {
          // Group by week (Monday to Sunday)
          const dayOfWeek = date.getDay();
          const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
          groupDate = new Date(date);
          groupDate.setDate(diff);
          groupDate.setHours(0, 0, 0, 0);
          const year = groupDate.getFullYear();
          const week = getWeekNumber(groupDate);
          groupKey = `${year}-W${week.toString().padStart(2, '0')}`;
        } else {
          // Group by month
          groupDate = new Date(date.getFullYear(), date.getMonth(), 1);
          groupKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        }

        if (!groupedData[groupKey]) {
          groupedData[groupKey] = {
            revenue: 0,
            orders: 0,
            date: groupDate,
          };
        }

        groupedData[groupKey].revenue += item.revenue || 0;
        groupedData[groupKey].orders += item.orders || 0;
      } catch {
        // Skip invalid dates
      }
    });

    // Sort by date and format
    const sortedGroups = Object.entries(groupedData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, data]) => data);

    const categories = sortedGroups.map((group) => {
      try {
        if (groupingType === "day") {
          return group.date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } else if (groupingType === "week") {
          const weekEnd = new Date(group.date);
          weekEnd.setDate(weekEnd.getDate() + 6);
          return `${group.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        } else {
          return group.date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        }
      } catch {
        return "N/A";
      }
    });

    return {
      revenue: sortedGroups.map((group) => group.revenue),
      orders: sortedGroups.map((group) => group.orders),
      categories,
    };
  }, [revenueData, groupingType]);

  const groupingLabel = groupingType === "day" ? "Per Day" : groupingType === "week" ? "Per Week" : "Per Month";

  const series = [
    {
      name: `Revenue (${groupingLabel})`,
      data: chartData.revenue,
    },
    {
      name: `Orders (${groupingLabel})`,
      data: chartData.orders,
    },
  ];
  const options:any = {
    chart: {
      toolbar: {
        show: false,
      },
      stacked: true,
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: false,
        columnWidth: "20%",
        dataLabels: {
          total: {
            enabled: false,
            offsetX: 0,
            style: {
              colors: [
                `hsl(${theme?.cssVars[
                  mode === "dark" || mode === "system" ? "dark" : "light"
                ].chartLabel
                })`,
              ],
              fontSize: "13px",
              fontWeight: 800,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
      width: 1,
      colors: [
        `hsl(${theme?.cssVars[
          mode === "dark" || mode === "system" ? "dark" : "light"
        ].chartLabel
        })`,
      ],
    },
    colors: [
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`,
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].info})`,
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].warning})`,
    ],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
      y: {
        formatter: (value: number, { seriesIndex }: any) => {
          if (seriesIndex === 0) {
            return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          } else {
            return `${value} orders`;
          }
        },
        title: {
          formatter: (seriesName: string) => {
            return `${seriesName}`;
          },
        },
      },
      x: {
        formatter: (value: string) => {
          // Value is already a formatted date string from categories
          return `${value} (${groupingLabel})`;
        },
      },
    },
    grid: getGridConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartGird})`
    ),
    yaxis: {
      ...getYAxisConfig(
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
      ),
      title: {
        text: `Amount (${groupingLabel})`,
        style: {
          color: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`,
          fontSize: "12px",
        },
      },
    },
    xaxis: {
      categories: chartData.categories.length > 0 ? chartData.categories : ["No Data"],
      title: {
        text: `Date (${groupingLabel})`,
        style: {
          color: `hsl(${theme?.cssVars[
            mode === "dark" || mode === "system" ? "dark" : "light"
          ].chartLabel})`,
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: `hsl(${theme?.cssVars[
            mode === "dark" || mode === "system" ? "dark" : "light"
          ].chartLabel
            })`,
          fontSize: "12px",
        },
        rotate: -45,
        rotateAlways: false,
      },
    },

    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      fontWeight: 500,
      labels: {
        colors: `hsl(${theme?.cssVars[
          mode === "dark" || mode === "system" ? "dark" : "light"
        ].chartLabel
          })`,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 8,
      },
      markers: {
        width: 10,
        height: 10,
        radius: 10,
        offsetX: isRtl ? 5 : -5
      }
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full" style={{ height: `${height}px` }} />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className="text-default-600">Failed to load revenue data</p>
      </div>
    );
  }

  // Check if we have valid chart data
  if (!chartData || chartData.categories.length === 0 || chartData.revenue.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className="text-default-600">No revenue data available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Grouping Selector */}
      <div className="flex justify-end mb-4 px-4">
        <Select value={groupingType} onValueChange={(value: GroupingType) => setGroupingType(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Per Day</SelectItem>
            <SelectItem value="week">Per Week</SelectItem>
            <SelectItem value="month">Per Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Chart
        options={options}
        series={series}
        type="bar"
        height={height}
        width={"100%"}
      />
    </div>
  );
};

export default RevinueChart;
