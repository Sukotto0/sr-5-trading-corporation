"use client";

import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { TrendingUpIcon } from "lucide-react";
import { getAllTransactions } from "@/app/actions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Types
type Transaction = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  productName: string;
  productId: string;
  toPay: string;
  productPrice: string;
  appointment: string;
  createdAt: string;
  lastUpdated: string;
  status: string;
  paymentId: string;
  userId: string;
};

// --- Helper Functions ---

const calculateKPIs = (transactions: Transaction[]) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalRevenue: 0,
      totalTransactions: 0,
      avgOrderValue: 0,
      successfulTransactions: 0,
      revenueTrend: 0,
      transactionTrend: 0,
      successTrend: 0
    };
  }

  // Only count successful transactions for revenue (case-insensitive)
  const successfulTransactions = transactions.filter(tx => 
    tx.status && tx.status.toLowerCase() === 'success'
  );
  
  const totalRevenue = successfulTransactions.reduce((sum, tx) => {
    return sum + (parseFloat(tx.toPay) || 0);
  }, 0);
  
  const totalTransactions = transactions.length; // Total of all transactions
  const successfulCount = successfulTransactions.length;
  
  const avgOrderValue = successfulCount > 0 ? totalRevenue / successfulCount : 0;

  // Calculate trends based on recent vs older data
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Recent period (last 30 days)
  const recentTransactions = transactions.filter(tx => 
    new Date(tx.createdAt) >= thirtyDaysAgo
  );
  const recentSuccessful = recentTransactions.filter(tx => 
    tx.status && tx.status.toLowerCase() === 'success'
  );
  const recentRevenue = recentSuccessful.reduce((sum, tx) => 
    sum + (parseFloat(tx.toPay) || 0), 0
  );

  // Previous period (30-60 days ago)
  const previousTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.createdAt);
    return txDate >= sixtyDaysAgo && txDate < thirtyDaysAgo;
  });
  const previousSuccessful = previousTransactions.filter(tx => 
    tx.status && tx.status.toLowerCase() === 'success'
  );
  const previousRevenue = previousSuccessful.reduce((sum, tx) => 
    sum + (parseFloat(tx.toPay) || 0), 0
  );

  // Calculate trend percentages
  const revenueTrend = previousRevenue > 0 
    ? Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100 * 100) / 100
    : recentRevenue > 0 ? 100 : 0;

  const transactionTrend = previousTransactions.length > 0 
    ? Math.round(((recentTransactions.length - previousTransactions.length) / previousTransactions.length) * 100 * 100) / 100
    : recentTransactions.length > 0 ? 100 : 0;

  const successTrend = previousSuccessful.length > 0 
    ? Math.round(((recentSuccessful.length - previousSuccessful.length) / previousSuccessful.length) * 100 * 100) / 100
    : recentSuccessful.length > 0 ? 100 : 0;
  
  return {
    totalRevenue,
    totalTransactions,
    avgOrderValue,
    successfulTransactions: successfulCount,
    revenueTrend,
    transactionTrend,
    successTrend
  };
};

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
  const TrendIcon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const trendClass = isPositive
    ? "text-green-500 bg-green-100"
    : "text-red-500 bg-red-100";

  const colorClasses = {
    indigo: "bg-indigo-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between transition-shadow hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className={`${colorClasses[color as keyof typeof colorClasses] || 'bg-gray-500'} text-white p-3 rounded-full shadow-lg`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className={`${trendClass} flex items-center text-xs font-semibold px-2 py-1 rounded-full`}>
          <TrendIcon className="w-4 h-4 mr-1" />
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

// Transaction Details Modal Component
const TransactionModal = ({ 
  transaction, 
  isOpen, 
  onClose 
}: { 
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !transaction) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-100 bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Transaction Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Transaction ID</label>
              <p className="text-lg font-semibold text-gray-900">{transaction._id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                transaction.status?.toLowerCase() === 'success' ? 'bg-green-100 text-green-800' :
                transaction.status?.toLowerCase() === 'failed' ? 'bg-red-100 text-red-800' :
                transaction.status?.toLowerCase() === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                transaction.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Date Created</label>
              <p className="text-gray-900">{formatDate(transaction.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Amount to Pay</label>
              <p className="text-lg font-bold text-gray-900">₱{parseFloat(transaction.toPay || '0').toFixed(2)}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{transaction.firstName} {transaction.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{transaction.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{transaction.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">User ID</label>
                <p className="text-gray-900 text-sm">{transaction.userId}</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Product Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Product Name</label>
                  <p className="text-gray-900 font-medium">{transaction.productName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Product ID</label>
                  <p className="text-gray-900 text-sm">{transaction.productId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Product Price</label>
                  <p className="text-gray-900">₱{parseFloat(transaction.productPrice || '0').toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Amount to Pay</label>
                  <p className="text-lg font-bold text-green-600">₱{parseFloat(transaction.toPay || '0').toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment & Payment Info */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Appointment</label>
                  <p className="text-gray-900">{new Date(transaction.appointment).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Payment ID</label>
                  <p className="text-gray-900 text-sm">{transaction.paymentId}</p>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{formatDate(transaction.lastUpdated)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Sales = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('all');
  const [chartTimeFilter, setChartTimeFilter] = useState<string>('7days');
  const [currentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " PHT"
  );

  // Fetch transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getAllTransactions();
        console.log('Fetched transactions:', data); // Debug log
        if (data && data.length > 0) {
          console.log('First transaction status:', data[0].status); // Debug log
          console.log('All unique statuses:', Array.from(new Set(data.map((tx: any) => tx.status)))); // Debug log
        }
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Calculate KPIs from real data
  const kpiData = React.useMemo(() => {
    const { 
      totalRevenue, 
      totalTransactions, 
      avgOrderValue, 
      successfulTransactions, 
      revenueTrend, 
      transactionTrend, 
      successTrend 
    } = calculateKPIs(transactions);
    
    return [
      {
        name: "Total Revenue",
        icon: CurrencyDollarIcon,
        value: `₱${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        trend: Math.abs(revenueTrend),
        isPositive: revenueTrend >= 0,
        color: "indigo",
      },
      {
        name: "Total Transactions",
        icon: ShoppingBagIcon,
        value: `${totalTransactions} Orders`,
        trend: Math.abs(transactionTrend),
        isPositive: transactionTrend >= 0,
        color: "green",
      },
      {
        name: "Successful Orders",
        icon: ChartBarIcon,
        value: `${successfulTransactions} Paid`,
        trend: Math.abs(successTrend),
        isPositive: successTrend >= 0,
        color: "purple",
      },
    ];
  }, [transactions]);

  // Prepare chart data - group transactions by date with timeline filter
  const chartData = React.useMemo(() => {
    if (!transactions.length) return [];

    // Filter transactions based on chart timeline
    let filteredTransactions = transactions;
    const now = new Date();
    
    switch (chartTimeFilter) {
      case '7days':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter(tx => new Date(tx.createdAt) >= sevenDaysAgo);
        break;
      case '30days':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter(tx => new Date(tx.createdAt) >= thirtyDaysAgo);
        break;
      case '3months':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter(tx => new Date(tx.createdAt) >= threeMonthsAgo);
        break;
      case '6months':
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter(tx => new Date(tx.createdAt) >= sixMonthsAgo);
        break;
      case '1year':
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter(tx => new Date(tx.createdAt) >= oneYearAgo);
        break;
      case 'all':
      default:
        filteredTransactions = transactions;
        break;
    }

    // Group transactions by date
    const dateGroups: { [key: string]: { revenue: number; count: number; successful: number } } = {};
    
    // Determine date format based on timeline
    const getDateFormat = (date: Date) => {
      if (chartTimeFilter === '7days') {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      } else if (chartTimeFilter === '30days') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (chartTimeFilter === '3months' || chartTimeFilter === '6months') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
    };
    
    filteredTransactions.forEach(tx => {
      const date = getDateFormat(new Date(tx.createdAt));
      
      if (!dateGroups[date]) {
        dateGroups[date] = { revenue: 0, count: 0, successful: 0 };
      }
      
      dateGroups[date].count += 1;
      
      if (tx.status?.toLowerCase() === 'success') {
        dateGroups[date].revenue += parseFloat(tx.toPay) || 0;
        dateGroups[date].successful += 1;
      }
    });

    // Convert to array and sort by date
    const sortedData = Object.entries(dateGroups)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        transactions: data.count,
        successful: data.successful
      }))
      .sort((a, b) => {
        // Better date sorting
        const dateA = new Date(a.date + (chartTimeFilter === '1year' || chartTimeFilter === 'all' ? '' : ', 2024'));
        const dateB = new Date(b.date + (chartTimeFilter === '1year' || chartTimeFilter === 'all' ? '' : ', 2024'));
        return dateA.getTime() - dateB.getTime();
      });

    // Limit data points based on timeline for better chart readability
    const maxDataPoints = chartTimeFilter === '7days' ? 7 : 
                         chartTimeFilter === '30days' ? 15 : 
                         chartTimeFilter === '3months' ? 12 : 
                         chartTimeFilter === '6months' ? 24 : 50;
    
    return sortedData.slice(-maxDataPoints);
  }, [transactions, chartTimeFilter]);

  // Filter transactions based on status, time filters, and search
  const filteredTransactions = React.useMemo(() => {
    let filtered = transactions;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'recent':
          filterDate.setDate(now.getDate() - 30); // Last 30 days for "recent"
          break;
      }
      
      filtered = filtered.filter(tx => new Date(tx.createdAt) >= filterDate);
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      
      filtered = filtered.filter(tx => {
        switch (searchType) {
          case 'customer': {
            const customerName = `${tx.firstName || ''} ${tx.lastName || ''}`.toLowerCase();
            return customerName.includes(query) || 
                   (tx.firstName?.toLowerCase().includes(query) || false) || 
                   (tx.lastName?.toLowerCase().includes(query) || false) ||
                   (tx.email?.toLowerCase().includes(query) || false);
          }
          
          case 'transaction':
            return (tx._id?.toLowerCase().includes(query) || false) ||
                   (tx.paymentId?.toLowerCase().includes(query) || false);
          
          case 'date': {
            // Check if the query matches date in various formats
            const searchDate = new Date(tx.createdAt);
            const dateStr1 = searchDate.toLocaleDateString('en-US');
            const dateStr2 = searchDate.toISOString().split('T')[0]; // YYYY-MM-DD
            const dateStr3 = searchDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            return (dateStr1?.includes(query) || false) ||
                   (dateStr2?.includes(query) || false) ||
                   (dateStr3?.toLowerCase().includes(query) || false);
          }
          
          case 'all':
          default: {
            // Search across all fields
            const allFieldsName = `${tx.firstName || ''} ${tx.lastName || ''}`.toLowerCase();
            const allFieldsDate = new Date(tx.createdAt);
            const allDateStr1 = allFieldsDate.toLocaleDateString('en-US');
            const allDateStr2 = allFieldsDate.toISOString().split('T')[0];
            
            return allFieldsName.includes(query) ||
                   (tx.firstName?.toLowerCase().includes(query) || false) ||
                   (tx.lastName?.toLowerCase().includes(query) || false) ||
                   (tx.email?.toLowerCase().includes(query) || false) ||
                   (tx._id?.toLowerCase().includes(query) || false) ||
                   (tx.paymentId?.toLowerCase().includes(query) || false) ||
                   (tx.productName?.toLowerCase().includes(query) || false) ||
                   (allDateStr1?.includes(query) || false) ||
                   (allDateStr2?.includes(query) || false);
          }
        }
      });
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, statusFilter, timeFilter, searchQuery, searchType]);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-950 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading sales data...</p>
        </div>
      </div>
    );
  }

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
        {/* 1. Sales Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Sales Performance Over Time
            </h2>
            {/* Chart Timeline Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-500">Period:</label>
              <select 
                value={chartTimeFilter} 
                onChange={(e) => setChartTimeFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    label={{ value: 'Revenue (₱)', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    label={{ value: 'Transactions', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'revenue') {
                        return [`₱${Number(value).toLocaleString()}`, 'Revenue'];
                      }
                      return [value, name === 'transactions' ? 'Total Transactions' : 'Successful Orders'];
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                    name="Revenue"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Total Transactions"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="successful" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    name="Successful Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <ChartBarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-sm">No transaction data available for chart</p>
                  <p className="text-gray-400 text-xs mt-1">Data will appear as transactions are created</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Recent Transactions Table */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex flex-col space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Transactions ({filteredTransactions.length})
              </h2>
              
              {/* Filter Controls */}
              <div className="space-y-3">
                {/* Search Section */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-500">Search</label>
                  <div className="flex space-x-2">
                    <select 
                      value={searchType} 
                      onChange={(e) => setSearchType(e.target.value)}
                      className="shrink-0 text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">All Fields</option>
                      <option value="customer">Customer</option>
                      <option value="transaction">Transaction ID</option>
                      <option value="date">Date</option>
                    </select>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        searchType === 'customer' ? 'Search name or email...' :
                        searchType === 'transaction' ? 'Search transaction ID...' :
                        searchType === 'date' ? 'Search date (MM/DD/YYYY)...' :
                        'Search anything...'
                      }
                      className="flex-1 text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Clear search
                    </button>
                  )}
                </div>
                
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status Filter</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                {/* Time Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Time Filter</label>
                  <select 
                    value={timeFilter} 
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Time</option>
                    <option value="recent">Recent (30 days)</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <div
                  key={tx._id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-2">
                    {/* Customer Name */}
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-semibold text-gray-900 flex-1">
                        {tx.firstName} {tx.lastName}
                      </p>
                      <button
                        onClick={() => handleViewTransaction(tx)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="View Full Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Price and Status */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <p className="text-lg font-bold text-gray-900">
                          ₱{parseFloat(tx.toPay || '0').toFixed(2)}
                        </p>
                        <span
                          className={classNames(
                            tx.status?.toLowerCase() === "success"
                              ? "bg-green-100 text-green-700"
                              : tx.status?.toLowerCase() === "failed"
                                ? "bg-red-100 text-red-700"
                                : tx.status?.toLowerCase() === "cancelled"
                                ? "bg-gray-100 text-gray-700"
                                : tx.status?.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700",
                            "px-2 py-1 text-xs font-medium rounded-full"
                          )}
                        >
                          {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    
                    {/* Transaction ID */}
                    <p className="text-xs text-gray-400">
                      ID: {tx._id}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <ShoppingBagIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionModal 
        transaction={selectedTransaction}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
};

export default Sales;
