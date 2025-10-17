"use client";
import React, { useEffect, useState } from "react";
import {
  XCircle,
  CreditCard,
  Calendar,
  Receipt,
  ChevronRight,
  Phone,
  Repeat,
  House,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
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
      {/* Icon color changed to red-500 */}
      <Icon className="w-5 h-5 text-red-500" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <div className="flex items-center space-x-1">
      <span
        className={`text-sm ${isLink ? "text-red-600 hover:text-red-700 font-semibold cursor-pointer" : "text-gray-900 font-medium"}`}
      >
        {value}
      </span>
      {isLink && <ChevronRight className="w-4 h-4 text-red-600" />}
    </div>
  </div>
);

const PaymentFailed = () => {
  const searchParams = useSearchParams();
  const [transactionData, setTransactionData] = useState<any>({});

  useEffect(() => {
    // Get the 'id' parameter from the URL query string
    const id = searchParams.get("id");

    if (id) {
      console.log("Transaction ID from URL:", id);

      // Example: Fetch transaction details based on the ID
      getTransaction(id, "failed").then((data) => {
        if (data && data.success && data.data) {
          const fetchedData = data.data;
          setTransactionData(fetchedData);
        }
      });
    }
  }, [searchParams]);

  const handleRetryPayment = () => {
    console.log("Navigating to the home page...");
    window.location.href = "/";
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* --- Failure Header Section --- */}
        {/* Background color changed to red-50 */}
        <div className="p-8 sm:p-10 bg-red-50 text-center">
          <XCircle className="w-16 h-16 text-rose-600 mx-auto mb-4 animate-scale-up" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-600">
            Unfortunately, your payment could not be processed.
          </p>
          <p className="text-xl font-bold text-gray-400 mt-4 line-through">
            {formatCurrency(transactionData.toPay)}
          </p>
          <p className="text-sm text-rose-600 font-medium mt-1">
            Amount not charged.
          </p>
        </div>

        {/* --- Transaction Details Summary --- */}
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-red-600" />
            <span>Transaction Summary</span>
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
            <DetailItem
              icon={CreditCard}
              label="Method Used"
              value={transactionData.paymentMethod}
            />
            <DetailItem
              icon={Repeat}
              label="Item Reserved"
              value={transactionData.item}
            />
          </div>
        </div>

        {/* --- Next Steps / Actions --- */}
        <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            What should I do now?
          </h3>
          <div className="space-y-3">
            {/* Primary action: Retry Payment */}
            <button
              className="w-full flex items-center justify-center bg-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-red-700 transition duration-150"
              onClick={handleRetryPayment}
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

export default PaymentFailed;
