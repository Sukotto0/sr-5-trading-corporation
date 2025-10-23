"use client";

import React, { useState } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  StarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { TrendingUpIcon } from "lucide-react";

// --- Static Feedback Summary Data ---
const feedbackStats = [
  {
    name: "Total Feedbacks",
    icon: ChatBubbleBottomCenterTextIcon,
    value: "248",
    trend: 12.4,
    isPositive: true,
    color: "indigo",
  },
  {
    name: "Avg. Rating",
    icon: StarIcon,
    value: "4.6 / 5",
    trend: 3.2,
    isPositive: true,
    color: "yellow",
  },
  {
    name: "New Reviews (This Week)",
    icon: UserGroupIcon,
    value: "35",
    trend: 1.8,
    isPositive: false,
    color: "green",
  },
];

// --- Recent Feedback Records ---
const recentFeedback = [
  {
    id: "FB-001",
    date: "2025-10-18",
    customer: "Rico Hernandez",
    rating: 5,
    message: "Excellent service! The staff was very accommodating.",
    status: "Published",
  },
  {
    id: "FB-002",
    date: "2025-10-17",
    customer: "Liza Morales",
    rating: 4,
    message: "Great experience overall, just a bit of waiting time.",
    status: "Published",
  },
  {
    id: "FB-003",
    date: "2025-10-15",
    customer: "John Perez",
    rating: 3,
    message: "It was okay. Could improve customer follow-up.",
    status: "Pending",
  },
  {
    id: "FB-004",
    date: "2025-10-14",
    customer: "Sara Torres",
    rating: 5,
    message: "Superb support and smooth process!",
    status: "Published",
  },
  {
    id: "FB-005",
    date: "2025-10-12",
    customer: "Mike Villanueva",
    rating: 2,
    message: "Not satisfied with the response time.",
    status: "Flagged",
  },
];

// --- Helper ---
function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

// --- KPI Card Component ---
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

// --- Main Page Component ---
const Feedback = () => {
  const [currentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " PHT"
  );

  return (
    <div className="bg-white p-8 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Feedback Records
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Current time: {currentTime}
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {feedbackStats.map((kpi) => (
          <KPICard key={kpi.name} {...kpi} />
        ))}
      </div>

      {/* Feedback Records Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Feedback
          </h2>
        </div>
        <div className="overflow-x-auto max-h-[480px]">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 border-b">Customer</th>
                <th className="px-6 py-3 border-b">Date</th>
                <th className="px-6 py-3 border-b">Rating</th>
                <th className="px-6 py-3 border-b">Message</th>
                <th className="px-6 py-3 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentFeedback.map((fb) => (
                <tr
                  key={fb.id}
                  className="hover:bg-gray-50 transition-colors border-b"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {fb.customer}
                  </td>
                  <td className="px-6 py-4">{fb.date}</td>
                  <td className="px-6 py-4 text-yellow-500 font-semibold">
                    {"★".repeat(fb.rating)}{" "}
                    <span className="text-gray-400">
                      {"☆".repeat(5 - fb.rating)}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">{fb.message}</td>
                  <td
                    className={classNames(
                      fb.status === "Published"
                        ? "text-green-500"
                        : fb.status === "Pending"
                          ? "text-yellow-500"
                          : "text-red-500",
                      "px-6 py-4 font-semibold"
                    )}
                  >
                    {fb.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
