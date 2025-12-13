"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import { getGridConfig, getYAxisConfig } from "@/lib/appex-chart-options";
import { useRevenueChartQuery } from "@/hooks/api/use-dashboard-api";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Period } from "@/api/dashboard/dashboard.api";
import type { RevenueDataPoint } from "@/api/dashboard/dashboard.transformers";

interface RevinueChartProps {
  height?: number;
  period?: Period;
  onPeriodChange?: (period: Period) => void;
}

const RevinueChart = ({ height = 350, period: externalPeriod, onPeriodChange }: RevinueChartProps) => {
  const { theme: config, setTheme: setConfig, isRtl } = useThemeStore();
  const { theme: mode } = useTheme();
  const [internalPeriod, setInternalPeriod] = useState<Period>("30days");
  const period = externalPeriod || internalPeriod;
  const { data: revenueData, isLoading } = useRevenueChartQuery(period);

  const theme = themes.find((theme) => theme.name === config);

  // Format data for chart
  const formatChartData = (): { revenue: number[]; orders: number[]; categories: string[] } => {
    if (!revenueData || !revenueData.data || revenueData.data.length === 0) {
      return {
        revenue: [],
        orders: [],
        categories: [],
      };
    }

    const categories = revenueData.data.map((item: RevenueDataPoint) => {
      const date = new Date(item.date);
      if (period === "30days") {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } else if (period === "12months") {
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      } else {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    });

    return {
      revenue: revenueData.data.map((item: RevenueDataPoint) => item.revenue),
      orders: revenueData.data.map((item: RevenueDataPoint) => item.orders),
      categories,
    };
  };

  const chartData = formatChartData();

  const series = [
    {
      name: "Revenue",
      data: chartData.revenue,
    },
    {
      name: "Orders",
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
    },
    grid: getGridConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartGird})`
    ),
    yaxis: getYAxisConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
    ),
    xaxis: {
      categories: chartData.categories.length > 0 ? chartData.categories : ["No Data"],
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

  if (!revenueData || !revenueData.data || revenueData.data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className="text-default-600">No revenue data available</p>
      </div>
    );
  }

  return (
      <Chart
        options={options}
        series={series}
        type="bar"
        height={height}
        width={"100%"}
      />
  );
};

export default RevinueChart;
