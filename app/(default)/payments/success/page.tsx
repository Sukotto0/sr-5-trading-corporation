"use client";
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  MapPin,
  Calendar,
  Receipt,
  ChevronRight,
  Download,
  HouseIcon,
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
      <Icon className="w-5 h-5 text-emerald-500" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <div className="flex items-center space-x-1">
      <span
        className={`text-sm capitalize ${isLink ? "text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer" : "text-gray-900 font-medium"}`}
      >
        {value}
      </span>
      {isLink && <ChevronRight className="w-4 h-4 text-emerald-600" />}
    </div>
  </div>
);

const SuccessfulPayments = (props: any) => {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [transactionData, setTransactionData] = useState<any>({});

  useEffect(() => {
    // Get the 'id' parameter from the URL query string
    const id = searchParams.get("id");

    if (id) {
      console.log("Transaction ID from URL:", id);

      // Example: Fetch transaction details based on the ID
      getTransaction(id, "PAYMENT_SUCCESS").then((data) => {
        if (data && data.success && data.data) {
          const fetchedData = data.data;
          setTransactionData(fetchedData);
        }
        setIsLoading(false);
      });
    }
  }, [searchParams]);

  // Add print styles and keyboard handler
  useEffect(() => {
    // Add print-specific CSS
    const printStyles = document.createElement("style");
    printStyles.textContent = `
            @media print {
                /* Hide everything by default */
                body * {
                    visibility: hidden;
                }
                
                /* Show only the receipt content */
                .receipt-printable,
                .receipt-printable * {
                    visibility: visible;
                }
                
                /* Position the receipt content at the top */
                .receipt-printable {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                
                /* Remove background colors for print */
                .receipt-printable {
                    background: white !important;
                    box-shadow: none !important;
                    border: none !important;
                    border-radius: 0 !important;
                    margin: 0 !important;
                    padding: 20px !important;
                }
                
                /* Hide action buttons in print */
                .no-print {
                    display: none !important;
                }
                
                /* Show print header */
                .print\\:block {
                    display: block !important;
                }
                
                /* Remove background for print */
                .print\\:bg-white {
                    background-color: white !important;
                }
                
                .print\\:p-4 {
                    padding: 16px !important;
                }
                
                /* Optimize text for print */
                .receipt-printable h1 {
                    font-size: 24px !important;
                    margin-bottom: 10px !important;
                }
                
                .receipt-printable h2 {
                    font-size: 18px !important;
                    margin-bottom: 8px !important;
                }
                
                .receipt-printable p {
                    font-size: 12px !important;
                }
                
                /* Ensure proper spacing for print */
                .receipt-printable .p-8 {
                    padding: 16px !important;
                }
                
                .receipt-printable .p-6 {
                    padding: 12px !important;
                }
            }
        `;
    document.head.appendChild(printStyles);

    // Handle Ctrl+P keyboard shortcut
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "p") {
        event.preventDefault();
        window.print();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.head.removeChild(printStyles);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
            <h2 className="text-xl font-semibold text-gray-800">Loading Transaction...</h2>
            <p className="text-sm text-gray-600">Please wait while we retrieve your payment details.</p>
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
                className="flex items-center justify-center bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-emerald-700 transition duration-150"
                onClick={() => (window.location.href = "/")}
              >
                <HouseIcon className="size-5 mr-2" />
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
        {/* Receipt Content - Printable Area */}
        <div className="receipt-printable">
          {/* Print Header - Only shows when printing */}
          <div className="hidden print:block text-center border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold">SR-5 Trading Corporation</h1>
            <p className="text-sm text-gray-600">Payment Receipt</p>
            <p className="text-xs text-gray-500">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* --- Success Header Section --- */}
          <div className="p-8 sm:p-10 bg-emerald-50 text-center print:bg-white print:p-4">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-scale-up" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your order. A confirmation email has been sent to
              your inbox.
            </p>
            <p className="text-xl font-bold text-emerald-600 mt-4">
              {formatCurrency(transactionData.toPay)}
            </p>
          </div>

          {/* --- Transaction Details Summary --- */}
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Receipt className="w-6 h-6 text-emerald-600" />
              <span>Order Details</span>
            </h2>

            <div className="bg-white rounded-xl divide-y divide-gray-100">
              <DetailItem
                icon={Receipt}
                label="Order ID"
                value={transactionData._id}
              />
              <DetailItem
                icon={Calendar}
                label="Purchase Date"
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
                icon={MapPin}
                label="Pickup On"
                value={
                  transactionData.appointment
                    ? new Date(transactionData.appointment).toLocaleDateString(
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
                icon={MapPin}
                label="Pickup Location"
                value={transactionData.branch || "Not specified"}
              />
              {/* Items List */}
              <div className="py-3 border-b border-gray-100">
                <div className="flex items-start space-x-3 mb-3">
                  <Download className="w-5 h-5 text-emerald-500" />
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
                    <p className="text-sm text-gray-500">No items</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Next Steps / Actions --- */}
        <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50 no-print">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            What's Next?
          </h3>
          <div className="space-y-3">
            {/* Print Receipt Button */}
            <button
              className="w-full flex items-center justify-center bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-green-700 transition duration-150"
              onClick={() => window.print()}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Receipt
            </button>

            {/* Go to Homepage Button */}
            <button
              className="w-full flex items-center justify-center bg-white text-gray-800 font-semibold py-3 px-6 rounded-xl border border-gray-300 shadow-md hover:bg-gray-100 transition duration-150"
              onClick={() => (window.location.href = "/")}
            >
              <HouseIcon className="size-5 mr-2" />
              Go to Homepage
            </button>
          </div>

          {/* <p className="mt-6 text-xs text-center text-gray-500">
            Charged to: {transactionData.paymentMethod}
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default SuccessfulPayments;
