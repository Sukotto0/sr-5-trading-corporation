"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  XCircle,
  MapPin,
  Calendar,
  Receipt,
  ChevronRight,
  House,
  Phone,
} from "lucide-react";
import { getTransaction } from "@/app/actions";

// Utility function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

// Component for a single detail item in the summary
const DetailItem = ({ icon: Icon, label, value, isLink = false }: any) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5 text-rose-500" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <div className="flex items-center space-x-1">
      <span
        className={`text-sm ${isLink ? "text-rose-600 hover:text-rose-700 font-semibold cursor-pointer" : "text-gray-900 font-medium"}`}
      >
        {value}
      </span>
      {isLink && <ChevronRight className="w-4 h-4 text-rose-600" />}
    </div>
  </div>
);

const CancelledPayments = () => {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [transactionData, setTransactionData] = useState<any>({});

  useEffect(() => {
    // Get the 'id' parameter from the URL query string
    const id = searchParams.get("id");

    if (id) {
      console.log("Transaction ID from URL:", id);

      // Example: Fetch transaction details based on the ID
      getTransaction(id).then((data) => {
        if (data && data.success && data.data) {
          const fetchedData = data.data;
          setTransactionData(fetchedData);
        }
        setIsLoading(false);
      });
    }
  }, [searchParams]);

  const handleGoHome = () => {
    console.log("Navigating to the home page...");
    window.location.href = "/";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-rose-600"></div>
            <h2 className="text-xl font-semibold text-gray-800">Loading Transaction...</h2>
            <p className="text-sm text-gray-600">Please wait while we retrieve your cancellation details.</p>
          </div>
        </div>
      </div>
    );
  }

  // No transaction found
  if (!isLoading && !transactionData._id) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-red-100 p-6">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Transaction Not Found</h2>
            <p className="text-gray-600 max-w-md">
              We couldn't find the transaction you're looking for. Please check your email for the receipt or contact support if you need assistance.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                className="flex items-center justify-center bg-rose-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-rose-700 transition duration-150"
                onClick={handleGoHome}
              >
                <House className="size-5 mr-2" />
                Go to Homepage
              </button>
              <button
                className="flex items-center justify-center bg-white text-gray-800 font-semibold py-3 px-6 rounded-xl border border-gray-300 shadow-md hover:bg-gray-100 transition duration-150"
                onClick={() => (window.location.href = "/transactions")}
              >
                View Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* --- Cancelled Header Section --- */}
        <div className="p-8 sm:p-10 bg-rose-50 text-center">
          {/* Icon changed to XCircle and themed rose-600 */}
          <XCircle className="w-16 h-16 text-rose-600 mx-auto mb-4 animate-scale-up" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Order Cancellation Confirmed
          </h1>
          <p className="text-lg text-gray-600">
            Your transaction for this order has been cancelled.
          </p>
          <p className="text-xl font-bold text-gray-400 mt-4 line-through">
            {formatCurrency(transactionData.toPay)}
          </p>
          <p className="text-sm text-rose-600 font-medium mt-1">
            Amount not charged.
          </p>
        </div>

        {/* --- Cancellation Details Summary --- */}
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-rose-600" />
            <span>Cancellation Summary</span>
          </h2>

          <div className="bg-white rounded-xl divide-y divide-gray-100">
            <DetailItem
              icon={Receipt}
              label="Order ID"
              value={transactionData._id}
            />
            <DetailItem
              icon={Calendar}
              label="Attempt Date"
              value={
                transactionData.lastUpdated
                  ? new Date(transactionData.lastUpdated).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : ""
              }
            />
            <DetailItem icon={XCircle} label="Reason" value={"Cancelled"} />
            {/* Items List */}
            <div className="py-3 border-b border-gray-100">
              <div className="flex items-start space-x-3 mb-3">
                <House className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-medium text-gray-700">Items</span>
              </div>
              <div className="ml-8 space-y-2">
                {transactionData.items && transactionData.items.length > 0 ? (
                  transactionData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-start text-sm py-2 border-b border-gray-50 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Quantity: {item.quantity} × {formatCurrency(item.amount.value)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 ml-4">
                        {formatCurrency(item.totalAmount.value)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">{transactionData.productName || "No items"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Next Steps / Actions --- */}
        <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Need Assistance?
          </h3>
          <div className="space-y-3">
            {/* Go to Homepage Button (Primary action) */}
            <button
              className="w-full flex items-center justify-center bg-rose-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-rose-700 transition duration-150 hover:cursor-pointer"
              onClick={handleGoHome}
            >
              <House className="size-5 mr-2" />
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelledPayments;
