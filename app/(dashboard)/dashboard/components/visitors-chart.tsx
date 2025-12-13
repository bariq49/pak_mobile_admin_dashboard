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
  const { data: visitorsData, isLoading } = useVisitorsReportQuery(period);

  if (isLoading) {
    return <Skeleton className="w-full" style={{ height: `${height}px` }} />;
  }

  // Transform API data to chart format
  const chartData = visitorsData?.data || [];
  const series = [
    {
      name: "Visitors",
      data: chartData.map((item: { date: string; visitors: number; pageViews: number }) => ({
        x: new Date(item.date).getTime(),
        y: item.visitors,
      })),
    },
  ];

  // Fallback to empty data if no data available
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className="text-default-600">No visitors data available</p>
      </div>
    );
  }
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
    yaxis: getYAxisConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
    ),

    xaxis: {
      type: "datetime",
      labels: getLabel(
        `hsl(${
          theme?.cssVars[
            mode === "dark" || mode === "system" ? "dark" : "light"
          ].chartLabel
        })`
      ),
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
