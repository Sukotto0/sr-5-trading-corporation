'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle, MapPin, Calendar, Receipt, ChevronRight, Download, HouseIcon } from 'lucide-react';

// Mock Transaction Data
const transactionData = {
    orderId: "INV-20250917-001234",
    item: "Pro Max 3000 (Midnight Black)",
    total: 1299.99,
    date: new Date(2025, 8, 17, 10, 30, 0), // Sept 17, 2025, 10:30 AM
    paymentMethod: "Visa **** 4242",
    deliveryAddress: "123 Technology Drive, San Jose, CA 95110",
    estimatedDelivery: "Monday, October 21, 2025",
};

// Utility function to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
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
            <span className={`text-sm ${isLink ? 'text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer' : 'text-gray-900 font-medium'}`}>
                {value}
            </span>
            {isLink && <ChevronRight className="w-4 h-4 text-emerald-600" />}
        </div>
    </div>
);

const SuccessfulPayments = () => {

    // Add print styles and keyboard handler
    useEffect(() => {
        // Add print-specific CSS
        const printStyles = document.createElement('style');
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
            if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
                event.preventDefault();
                window.print();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            document.head.removeChild(printStyles);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Format date for display
    const formattedDate = transactionData.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

                {/* Receipt Content - Printable Area */}
                <div className="receipt-printable">
                    {/* Print Header - Only shows when printing */}
                    <div className="hidden print:block text-center border-b pb-4 mb-4">
                        <h1 className="text-2xl font-bold">SR-5 Trading Corporation</h1>
                        <p className="text-sm text-gray-600">Payment Receipt</p>
                        <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* --- Success Header Section --- */}
                    <div className="p-8 sm:p-10 bg-emerald-50 text-center print:bg-white print:p-4">
                    <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-scale-up" />
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                        Payment Successful!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Thank you for your order. A confirmation email has been sent to your inbox.
                    </p>
                    <p className="text-xl font-bold text-emerald-600 mt-4">
                        {formatCurrency(transactionData.total)}
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
                            value={transactionData.orderId}
                        />
                        <DetailItem 
                            icon={Calendar} 
                            label="Purchase Date" 
                            value={formattedDate}
                        />
                        <DetailItem 
                            icon={MapPin} 
                            label="Delivery Status" 
                            value={transactionData.estimatedDelivery}
                        />
                        <DetailItem 
                            icon={Download} 
                            label="Item" 
                            value={transactionData.item}
                        />
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
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Receipt
                        </button>

                        {/* Go to Homepage Button */}
                        <button
                            className="w-full flex items-center justify-center bg-white text-gray-800 font-semibold py-3 px-6 rounded-xl border border-gray-300 shadow-md hover:bg-gray-100 transition duration-150"
                            onClick={() => window.location.href = '/'}
                        >
                            <HouseIcon className='size-5 mr-2'/>
                            Go to Homepage
                        </button>
                    </div>

                    <p className="mt-6 text-xs text-center text-gray-500">
                        Charged to: {transactionData.paymentMethod}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuccessfulPayments;
