'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, MapPin, Calendar, Receipt, ChevronRight, House, Phone } from 'lucide-react';
import { getTransaction } from '@/app/actions';

// Utility function to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
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
            <span className={`text-sm ${isLink ? 'text-rose-600 hover:text-rose-700 font-semibold cursor-pointer' : 'text-gray-900 font-medium'}`}>
                {value}
            </span>
            {isLink && <ChevronRight className="w-4 h-4 text-rose-600" />}
        </div>
    </div>
);

const CancelledPayments = () => {
    const searchParams = useSearchParams();
    const [transactionData, setTransactionData] = useState<any>({});

    useEffect(() => {
        // Get the 'id' parameter from the URL query string
        const id = searchParams.get('id');
        
        if (id) {
            console.log('Transaction ID from URL:', id);
            
            // Example: Fetch transaction details based on the ID
            getTransaction(id).then(data => {
                if (data && data.success && data.data) {
                    const fetchedData = data.data;
                    console.log('Fetched transaction data:', fetchedData);
                    setTransactionData(fetchedData)
                }
            });
        }
        
        
    }, [searchParams])
    
    // Format date for display
    // const formattedDate = transactionData.updatedAt.toLocaleDateString('en-US', {
    //     year: 'numeric',
    //     month: 'long',
    //     day: 'numeric',
    //     hour: '2-digit',
    //     minute: '2-digit',
    // });

    const handleGoHome = () => {
        console.log("Navigating to the home page...");
        window.location.href = "/"; // In a real app
    };

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
                        Your transaction was unsuccessful or your order has been cancelled.
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
                            value={transactionData.lastUpdated ? new Date(transactionData.lastUpdated).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            }) : ''}
                        />
                        <DetailItem 
                            icon={XCircle} 
                            label="Reason" 
                            value={"Cancelled"}
                        />
                        <DetailItem 
                            icon={House} 
                            label="Item" 
                            value={transactionData.productName}
                        />
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
                            className="w-full flex items-center justify-center bg-rose-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-rose-700 transition duration-150"
                            onClick={handleGoHome}
                        >
                            <House className='size-5 mr-2'/>
                            Go to Homepage
                        </button>
                    </div>
                </div>
                
                
            </div>
        </div>
    );
};

export default CancelledPayments;
