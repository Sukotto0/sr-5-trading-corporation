"use client";
import React, { useState } from 'react';
import { XCircle, CreditCard, Calendar, Receipt, ChevronRight, Phone, Repeat } from 'lucide-react';

// Mock Transaction Data
const transactionData = {
    orderId: "INV-20250917-001234",
    item: "Pro Max 3000 (Midnight Black)",
    total: 1299.99,
    date: new Date(2025, 8, 17, 10, 30, 0), // Sept 17, 2025, 10:30 AM
    paymentMethod: "Visa **** 4242",
    failureReason: "Card declined by bank", // Specific failure reason
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
            {/* Icon color changed to red-500 */}
            <Icon className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center space-x-1">
            <span className={`text-sm ${isLink ? 'text-red-600 hover:text-red-700 font-semibold cursor-pointer' : 'text-gray-900 font-medium'}`}>
                {value}
            </span>
            {isLink && <ChevronRight className="w-4 h-4 text-red-600" />}
        </div>
    </div>
);

const PaymentFailed = () => {
    // Format date for display
    const formattedDate = transactionData.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    
    const handleRetryPayment = () => {
        console.log("Navigating to payment details to retry...");
        // In a real app, this would redirect to the checkout or payment form
    };

    const handleContactSupport = () => {
        console.log("Opening support chat or contact page...");
        // In a real app, this would redirect to a support page
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

                {/* --- Failure Header Section --- */}
                {/* Background color changed to red-50 */}
                <div className="p-8 sm:p-10 bg-red-50 text-center">
                    {/* Icon changed to XCircle and themed red-600 */}
                    <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4 animate-scale-up" />
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                        Payment Failed
                    </h1>
                    <p className="text-lg text-gray-600 font-medium mb-3">
                        Unfortunately, your payment could not be processed.
                    </p>
                    {/* Failure specific message */}
                    <div className="inline-block bg-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-lg shadow-inner">
                        Error: {transactionData.failureReason}
                    </div>

                    <p className="text-xl font-bold text-gray-900 mt-4">
                        Amount: {formatCurrency(transactionData.total)}
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
                            value={transactionData.orderId}
                        />
                        <DetailItem 
                            icon={Calendar} 
                            label="Attempt Date" 
                            value={formattedDate}
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
                            <Repeat className='size-5 mr-2'/>
                            Try Another Payment Method
                        </button>

                        {/* Secondary action: Contact Support */}
                        <button
                            className="w-full flex items-center justify-center bg-white text-gray-800 font-semibold py-3 px-6 rounded-xl border border-gray-300 shadow-md hover:bg-gray-100 transition duration-150"
                            onClick={handleContactSupport}
                        >
                            <Phone className='size-5 mr-2'/>
                            Contact Support
                        </button>
                    </div>
                </div>
                
                
            </div>
        </div>
    );
};

export default PaymentFailed;
