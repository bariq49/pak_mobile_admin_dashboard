"use client";

import { useState } from "react";
import { useAuth } from "@/provider/auth.provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DatePickerWithRange from "@/components/date-picker-with-range";
import DashboardSelect from "@/components/dasboard-select";
import type { Period } from "@/api/dashboard/dashboard.api";

// Dashboard Components
import EcommerceStats from "./components/ecommerce-stats";
import RevinueChart from "./components/revinue-chart";
import CustomerStatistics from "./components/customer-statistics";
import Transaction from "./components/transaction";
import Orders from "./components/orders";
import TopSell from "./components/top-sell";
import TopCustomers from "./components/top-customers";
import VisitorsReportChart from "./components/visitors-chart";
import Products from "./components/products";

const EcommercePageView = () => {
  const { user } = useAuth();
  const [revenuePeriod, setRevenuePeriod] = useState<Period>("30days");
  const [visitorsPeriod, setVisitorsPeriod] = useState<Period>("30days");

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-2xl font-medium text-default-800">
          Welcome back, {user?.name || "..."}!
        </h1>
        <DatePickerWithRange />
      </div>

      {/* --- Stats Overview --- */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <EcommerceStats />
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
                  Average Revenue
                </CardTitle>
                <div className="flex-none">
                  <DashboardSelect value={revenuePeriod} onValueChange={setRevenuePeriod} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <RevinueChart period={revenuePeriod} onPeriodChange={setRevenuePeriod} />
            </CardContent>
          </Card>
        </div>

        {/* Customer Statistics */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="py-2.5">
            <CardContent>
              <CustomerStatistics />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- Transactions + Orders --- */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent Transactions */}
        <div className="col-span-12 lg:col-span-4">
          <Transaction />
        </div>

        {/* Recent Orders */}
        <div className="col-span-12 lg:col-span-8">
          <Orders />
        </div>
      </div>

      {/* --- Top Selling + Top Customers --- */}
      <div className="grid grid-cols-12 gap-6">
        {/* Top Selling Products */}
        <div className="col-span-12 lg:col-span-4 2xl:col-span-5">
          <TopSell />
        </div>

        {/* Top Customers */}
        <div className="col-span-12 lg:col-span-8 2xl:col-span-7">
          <TopCustomers />
        </div>
      </div>

      {/* --- Visitors Report + Popular Products --- */}
      <div className="grid grid-cols-12 gap-6">
        {/* Visitors Chart */}
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
              <VisitorsReportChart period={visitorsPeriod} onPeriodChange={setVisitorsPeriod} />
            </CardContent>
          </Card>
        </div>

        {/* Popular Products */}
        <div className="col-span-12 lg:col-span-4">
          <Products />
        </div>
      </div>
    </div>
  );
};

export default EcommercePageView;
