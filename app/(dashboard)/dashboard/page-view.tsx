"use client";

import { useState, Component, ReactNode } from "react";
import { useAuth } from "@/provider/auth.provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DatePickerWithRange from "@/components/date-picker-with-range";
import DashboardSelect from "@/components/dasboard-select";
import type { Period } from "@/api/dashboard/dashboard.api";

// Top-level Error Boundary for the entire dashboard page view
class DashboardErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard page view error:", error);
    console.error("Error stack:", error.stack);
    console.error("Component stack:", errorInfo.componentStack);
    console.error("Error details:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-6">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2 text-default-800">
                Something went wrong
              </h2>
              <p className="text-default-600 mb-4">
                The dashboard failed to load. Please refresh the page or contact support if the problem persists.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Refresh Page
              </button>
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-default-500">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs bg-default-100 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

// Dashboard Components
import EcommerceStats from "./components/ecommerce-stats";
import RevinueChart from "./components/revinue-chart";
import CustomerStatistics from "./components/customer-statistics";
import Transaction from "./components/transaction";
import Orders from "./components/orders";
import TopSell from "./components/top-sell";
// import TopCustomers from "./components/top-customers";
// import VisitorsReportChart from "./components/visitors-chart";
// import Products from "./components/products";

// Error Fallback Component
const ComponentErrorFallback = ({ componentName }: { componentName: string }) => (
  <Card>
    <CardContent className="p-6 text-center">
      <p className="text-default-600">Failed to load {componentName}. Please refresh the page.</p>
    </CardContent>
  </Card>
);

// Error Boundary Class Component
class ComponentErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard component error:", error);
    console.error("Error stack:", error.stack);
    console.error("Component stack:", errorInfo.componentStack);
    console.error("Error details:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const EcommercePageViewContent = () => {
  const { user } = useAuth();
  const [revenuePeriod, setRevenuePeriod] = useState<Period>("12months"); // Default to 12 months to show all data
  // const [visitorsPeriod, setVisitorsPeriod] = useState<Period>("30days");

  // Safely get user name
  const userName = user?.name || "...";

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-2xl font-medium text-default-800">
          Welcome back, {userName}!
        </h1>
        <DatePickerWithRange />
      </div>

      {/* --- Stats Overview --- */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <ComponentErrorBoundary fallback={<ComponentErrorFallback componentName="Statistics" />}>
              <EcommerceStats />
            </ComponentErrorBoundary>
          </div>
        </CardContent>
      </Card>

      {/* --- Revenue + Customer Statistics --- */}
      <div className="grid grid-cols-12 gap-6">
        {/* Average Revenue Chart */}
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader className="border-none pb-0 mb-0">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="flex-1 whitespace-nowrap">
                  Revenue Chart
                </CardTitle>
                <div className="flex-none">
                  <DashboardSelect value={revenuePeriod} onValueChange={setRevenuePeriod} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <ComponentErrorBoundary fallback={<ComponentErrorFallback componentName="Revenue Chart" />}>
                <RevinueChart period={revenuePeriod} onPeriodChange={setRevenuePeriod} />
              </ComponentErrorBoundary>
            </CardContent>
          </Card>
        </div>

        {/* Customer Statistics */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="py-2.5">
            <CardContent>
              <ComponentErrorBoundary fallback={<ComponentErrorFallback componentName="Customer Statistics" />}>
                <CustomerStatistics />
              </ComponentErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- Transactions + Orders --- */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent Transactions */}
        <div className="col-span-12 lg:col-span-4">
          <ComponentErrorBoundary fallback={<ComponentErrorFallback componentName="Transactions" />}>
            <Transaction />
          </ComponentErrorBoundary>
        </div>

        {/* Recent Orders */}
        <div className="col-span-12 lg:col-span-8">
          <ComponentErrorBoundary fallback={<ComponentErrorFallback componentName="Orders" />}>
            <Orders />
          </ComponentErrorBoundary>
        </div>
      </div>

      {/* --- Top Selling Products --- */}
      <div className="grid grid-cols-12 gap-6">
        {/* Top Selling Products */}
        <div className="col-span-12">
          <ComponentErrorBoundary fallback={<ComponentErrorFallback componentName="Top Products" />}>
            <TopSell />
          </ComponentErrorBoundary>
        </div>
      </div>

      {/* --- Visitors Report + Popular Products - COMMENTED OUT --- */}
      {/* <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Card>
            <CardHeader className="gap-4 border-none pb-0 mb-0">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="flex-1 whitespace-nowrap">
                  Visitors Report
                </CardTitle>
                <div className="flex-none">
                  <DashboardSelect value={visitorsPeriod} onValueChange={setVisitorsPeriod} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-0">
              <ComponentErrorBoundary fallback={<ComponentErrorFallback componentName="Visitors Report" />}>
                <VisitorsReportChart period={visitorsPeriod} onPeriodChange={setVisitorsPeriod} />
              </ComponentErrorBoundary>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <ComponentErrorBoundary fallback={<ComponentErrorFallback componentName="Popular Products" />}>
            <Products />
          </ComponentErrorBoundary>
        </div>
      </div> */}

      {/* --- Top Customers - COMMENTED OUT --- */}
      {/* <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 2xl:col-span-7">
          <ComponentErrorBoundary fallback={<ComponentErrorFallback componentName="Top Customers" />}>
            <TopCustomers />
          </ComponentErrorBoundary>
        </div>
      </div> */}
    </div>
  );
};

const EcommercePageView = () => {
  return (
    <DashboardErrorBoundary>
      <EcommercePageViewContent />
    </DashboardErrorBoundary>
  );
};

export default EcommercePageView;
