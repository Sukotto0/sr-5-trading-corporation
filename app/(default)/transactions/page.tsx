"use client";
import React, { useEffect, useState } from "react";
import {
  ListOrdered,
  CheckCircle,
  XCircle,
  DollarSign,
  RotateCcw,
  Calendar,
  Tag,
  Info,
  ArrowUpRight,
  ArrowDownLeft,
  GrabIcon,
  CalendarArrowUp,
} from "lucide-react";
import { get } from "http";
import { getTransactionsByUser } from "@/app/actions";
import { useUser } from "@clerk/nextjs";

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

// Utility function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

// Utility function to get status theme
const getStatusTheme = (status: string) => {
  switch (status) {
    case "success":
      return {
        color: "text-emerald-600",
        icon: CheckCircle,
        bgColor: "bg-emerald-100",
        dotColor: "bg-emerald-500",
      };
    case "failed":
      return {
        color: "text-red-600",
        icon: XCircle,
        bgColor: "bg-red-100",
        dotColor: "bg-red-500",
      };
    case "pending":
      return {
        color: "text-blue-600",
        icon: RotateCcw,
        bgColor: "bg-blue-100",
        dotColor: "bg-blue-500",
      };
    case "cancelled":
      return {
        color: "text-gray-600",
        icon: XCircle,
        bgColor: "bg-gray-100",
        dotColor: "bg-gray-500",
      };
    default:
      return {
        color: "text-gray-500",
        icon: DollarSign,
        bgColor: "bg-gray-100",
        dotColor: "bg-gray-500",
      };
  }
};

// --- Transaction Detail Modal Component ---
const TransactionDetailModal = ({ transaction, onClose }: any) => {
  if (!transaction) return null;

  const { color, icon: Icon, bgColor } = getStatusTheme(transaction.status);
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = new Date(transaction.lastUpdated).toLocaleString(
    "en-US",
    dateOptions
  );

  const formattedAppointment = new Date(transaction.appointment).toLocaleString(
    "en-US",
    dateOptions
  );

  const isRefund = transaction.status === "Refund";
  const amountSign = isRefund ? (
    <ArrowDownLeft className="w-4 h-4 mr-1" />
  ) : (
    <ArrowUpRight className="w-4 h-4 mr-1" />
  );
  const amountColor = isRefund ? "text-blue-600" : "text-gray-900";

  return (
    <div
      className="fixed inset-0 bg-black/40 bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Themed) */}
        <div className={`p-6 sm:p-8 text-center ${bgColor}`}>
          <Icon className={`w-12 h-12 ${color} mx-auto mb-3`} />
          <h2 className="text-2xl font-bold text-gray-900 capitalize">
            {transaction.status}
          </h2>
          <p
            className={`text-3xl font-extrabold mt-2 flex items-center justify-center ${amountColor}`}
          >
            {/* {amountSign} */}
            {formatCurrency(transaction.toPay as unknown as number)}
          </p>
        </div>

        {/* Details Body */}
        <div className="p-6 sm:p-8 divide-y divide-gray-100">
          <DetailRow icon={Tag} label="Item" value={transaction.productName} />
          <DetailRow icon={Info} label="Order ID" value={transaction._id} />
          <DetailRow
            icon={Calendar}
            label="Date & Time"
            value={formattedDate}
          />
          {/* <DetailRow
            icon={DollarSign}
            label="Payment Method"
            value={transaction.paymentMethod}
          /> */}
          <DetailRow
            icon={Info}
            label="Status Detail"
            value={transaction.status}
          />
          {transaction.status === "success" && (
            <DetailRow
              icon={CalendarArrowUp}
              label="Pickup / Appointment"
              value={formattedAppointment}
            />
          )}
        </div>

        {/* Footer / Action */}
        <div className="flex flex-row flex-nowrap gap-4 p-4 border-t border-gray-100 bg-gray-50">
          <button
            className="w-full bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-emerald-700 transition duration-150"
            onClick={onClose}
          >
            Close Details
          </button>
          {transaction.status === "success" && (
            <button
              className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition duration-150"
              onClick={onClose}
            >
              View Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper for Modal Details
const DetailRow = ({ icon: Icon, label, value }: any) => (
  <div className="flex justify-between items-center py-3">
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5 text-gray-400" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <span className="text-sm text-gray-900 font-semibold">{value}</span>
  </div>
);

// --- Main Transaction History Component ---
const TransactionHistoryTable = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useUser();
  useEffect(() => {
    // Fetch transactions from API
    getTransactionsByUser(user?.id || "").then((data) => {
      console.log("Fetched transactions:", data);
      if (data && Array.isArray(data)) {
        setTransactions(data);
      }
    });
  }, [user]);

  const openModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(false);
  };

  // Sort transactions by date descending (most recent first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    // Ensure we parse string dates to timestamps; fallback to 0 if missing/invalid
    const aTime = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
    const bTime = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <div className="bg-white min-h-screen flex items-start justify-center">
      <div className="w-full bg-white rounded-3xl overflow-hidden ">
        {/* --- Header Section --- */}
        <div className="p-6 sm:p-8 bg-white border-b border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <ListOrdered className="w-8 h-8 text-emerald-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Transactions
            </h1>
          </div>
          <p className="text-md text-gray-600">
            View and manage details for all recent transactions on your account.
          </p>
        </div>

        {/* --- Transaction Table --- */}
        <div className="overflow-x-auto p-4 sm:p-6 lg:p-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Item / Order ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                {/* <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                >
                  Payment Method
                </th> */}
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => {
                const { color, dotColor } = getStatusTheme(tx.status);
                const amountClass =
                  tx.status === "Failed"
                    ? "text-gray-500 line-through"
                    : tx.status === "Refund"
                      ? "text-blue-600"
                      : "text-gray-900";

                return (
                  <tr
                    key={tx._id}
                    className="hover:bg-emerald-50/50 transition duration-150 cursor-pointer"
                    onClick={() => openModal(tx)}
                  >
                    {/* Item / Order ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {tx.productName}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {tx._id}
                      </div>
                    </td>

                    {/* Date (Hidden on XS Screens) */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {tx.lastUpdated
                        ? new Date(tx.lastUpdated).toLocaleString()
                        : 0}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                      <span className={amountClass}>
                        {formatCurrency(tx.toPay as unknown as number)}
                      </span>
                    </td>

                    {/* Payment Method (Hidden on small screens) */}
                    {/* <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 hidden md:table-cell">
                      {tx.paymentMethod}
                    </td> */}

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${color.replace("text", "bg").replace("600", "100")}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full mr-2 ${dotColor}`}
                        ></span>
                        {tx.status}
                      </span>
                    </td>

                    {/* View Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-emerald-600 hover:text-emerald-900 font-semibold transition duration-100">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* --- Footer / Pagination Area --- */}
        <div className="p-4 sm:p-6 bg-gray-50 flex justify-between items-center text-sm text-gray-600 border-t border-gray-200">
          <span>
            Showing 1 to {sortedTransactions.length} of{" "}
            {sortedTransactions.length} results
          </span>
          <button className="text-emerald-600 font-semibold hover:text-emerald-700 transition duration-150">
            Load More
          </button>
        </div>
      </div>

      {/* Conditional Modal Render */}
      {isModalOpen && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default TransactionHistoryTable;
