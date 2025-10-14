"use client";

import React, { useState } from "react";
import {
  ChartBarIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { TrendingUpIcon } from "lucide-react";

// --- Static Data ---

const kpiData = [
  {
    name: "Total Revenue",
    icon: CurrencyDollarIcon,
    value: "₱125,500",
    trend: 15.2,
    isPositive: true,
    color: "indigo",
  },
  {
    name: "Total Sales",
    icon: ShoppingBagIcon,
    value: "2,100 Units",
    trend: 2.1,
    isPositive: true,
    color: "green",
  },
  {
    name: "Avg. Order Value",
    icon: ChartBarIcon,
    value: "₱59.76",
    trend: 4.5,
    isPositive: false,
    color: "red",
  },
];

const recentTransactions = [
  {
    id: "S-2025-452",
    date: "2025-10-14",
    customer: "Rico H.",
    items: 3,
    total: 120.0,
    status: "Completed",
  },
  {
    id: "S-2025-451",
    date: "2025-10-14",
    customer: "Liza M.",
    items: 1,
    total: 55.5,
    status: "Completed",
  },
  {
    id: "S-2025-450",
    date: "2025-10-13",
    customer: "John P.",
    items: 5,
    total: 210.25,
    status: "Pending",
  },
  {
    id: "S-2025-449",
    date: "2025-10-13",
    customer: "Sara T.",
    items: 2,
    total: 95.0,
    status: "Completed",
  },
  {
    id: "S-2025-448",
    date: "2025-10-12",
    customer: "Mike V.",
    items: 4,
    total: 180.75,
    status: "Cancelled",
  },
];

// --- Helper Functions ---

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

// --- Component Definition ---

// KPI Card Component
const KPICard = ({
  name,
  icon: Icon,
  value,
  trend,
  isPositive,
  color,
}: {
  name: string;
  icon: React.ElementType;
  value: string;
  trend: number;
  isPositive: boolean;
  color: string;
}) => {
  const trendIcon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const trendClass = isPositive
    ? "text-green-500 bg-green-100"
    : "text-red-500 bg-red-100";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between transition-shadow hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div
          className={classNames(
            `bg-${color}-500`,
            "text-white p-3 rounded-full shadow-lg"
          )}
        >
          <Icon className="w-12 h-12 text-black/50" />
        </div>
        <div
          className={classNames(
            trendClass,
            "flex items-center text-xs font-semibold px-2 py-1 rounded-full"
          )}
        >
          <TrendingUpIcon className="w-4 h-4 mr-1" />
          {trend}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{name}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

const Sales = () => {
  const [currentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " PHT"
  );

  return (
    <div className="bg-white p-8 min-h-screen">
      {/* Time Display for Context */}
      <p className="text-sm text-gray-500 mt-2 mb-6">
        Current time: {currentTime}
      </p>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.name} {...kpi} />
        ))}
      </div>

      {/* Dashboard Main Grid (Chart and Transactions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Sales Chart Area (Placeholder) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
            Sales Performance Over Time
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 text-sm">
            [Placeholder for Line/Bar Chart Visualization]
          </div>
        </div>

        {/* 2. Recent Transactions Table */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {tx.customer}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tx.id} - {tx.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">
                    ₱{tx.total.toFixed(2)}
                  </p>
                  <p
                    className={classNames(
                      tx.status === "Completed"
                        ? "text-green-500"
                        : tx.status === "Pending"
                          ? "text-yellow-500"
                          : "text-red-500",
                      "text-xs font-semibold"
                    )}
                  >
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
