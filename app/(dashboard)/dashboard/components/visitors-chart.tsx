"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import { getYAxisConfig, getLabel } from "@/lib/appex-chart-options";
import { useVisitorsReportQuery } from "@/hooks/api/use-dashboard-api";
import { Skeleton } from "@/components/ui/skeleton";
import type { Period } from "@/api/dashboard/dashboard.api";

interface VisitorsReportChartProps {
  height?: number;
  period?: Period;
  onPeriodChange?: (period: Period) => void;
}

const VisitorsReportChart = ({ height = 390, period = "30days" }: VisitorsReportChartProps) => {
  const { theme: config, setTheme: setConfig } = useThemeStore();
  const { theme: mode } = useTheme();
  const theme = themes.find((theme) => theme.name === config);
  const { data: visitorsData, isLoading, isError } = useVisitorsReportQuery(period);

  if (isLoading) {
    return <Skeleton className="w-full" style={{ height: `${height}px` }} />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className="text-default-600">Failed to load visitors data</p>
      </div>
    );
  }

  // Transform API data to chart format
  const chartData = visitorsData?.data || [];
  
  // Fallback to empty data if no data available
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className="text-default-600">No visitors data available</p>
      </div>
    );
  }

  const series = [
    {
      name: "Visitors (Per Day)",
      data: chartData.map((item: { date: string; visitors: number; pageViews: number }) => {
        try {
          if (!item || !item.date) return { x: Date.now(), y: 0 };
          // Parse date and set to start of day for consistent grouping
          const date = new Date(item.date);
          date.setHours(0, 0, 0, 0);
          const dateTime = date.getTime();
          if (isNaN(dateTime)) return { x: Date.now(), y: 0 };
          return {
            x: dateTime,
            y: item.visitors || 0,
          };
        } catch {
          return { x: Date.now(), y: 0 };
        }
      }),
    },
  ];
  const options:any = {
    chart: {
      zoom: {
        type: "x",
        enabled: true,
        autoScaleYaxis: true,
      },
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    zoom: {
      type: "x",
      enabled: true,
      autoScaleYaxis: true,
    },
    colors: [
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].success})`,
    ],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
      y: {
        formatter: (value: number) => {
          return `${value} visitors`;
        },
        title: {
          formatter: () => {
            return "Visitors (Per Day)";
          },
        },
      },
      x: {
        formatter: (value: number) => {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              return date.toLocaleDateString("en-US", { 
                month: "short", 
                day: "numeric",
                year: "numeric",
                weekday: "short"
              });
            }
          } catch {}
          return new Date(value).toLocaleDateString();
        },
      },
    },
    grid: {
      show: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [20, 100, 100],
      },
    },
    yaxis: {
      ...getYAxisConfig(
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
      ),
      title: {
        text: "Visitors (Per Day)",
        style: {
          color: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`,
          fontSize: "12px",
        },
      },
    },

    xaxis: {
      type: "datetime",
      title: {
        text: "Date (Per Day)",
        style: {
          color: `hsl(${theme?.cssVars[
            mode === "dark" || mode === "system" ? "dark" : "light"
          ].chartLabel})`,
          fontSize: "12px",
        },
      },
      labels: {
        ...getLabel(
          `hsl(${
            theme?.cssVars[
              mode === "dark" || mode === "system" ? "dark" : "light"
            ].chartLabel
          })`
        ),
        datetimeUTC: false,
        format: "MMM dd",
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  };
  return (
      <Chart
        options={options}
        series={series}
        type="area"
        height={height}
        width={"100%"}
      />
  );
};

export default VisitorsReportChart;
