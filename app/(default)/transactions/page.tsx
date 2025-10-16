"use client";
import React from 'react';
import { ListOrdered, CheckCircle, XCircle, DollarSign, ChevronRight, RotateCcw, TrendingUp } from 'lucide-react';

// --- MOCK TRANSACTION DATA ---
const mockTransactions = [
    { id: "INV-005", item: "4K Monitor (32 inch)", amount: 499.99, date: new Date('2025-09-28'), status: 'Success', statusDetail: 'Delivered' },
    { id: "INV-004", item: "Premium Support Subscription", amount: 29.99, date: new Date('2025-09-20'), status: 'Failed', statusDetail: 'Card Declined' },
    { id: "INV-003", item: "Pro Max 3000", amount: 1299.99, date: new Date('2025-09-17'), status: 'Refund', statusDetail: 'Processed' },
    { id: "INV-002", item: "Wireless Keyboard", amount: 99.00, date: new Date('2025-08-10'), status: 'Success', statusDetail: 'Shipped' },
    { id: "INV-001", item: "Gift Card Top-up", amount: 50.00, date: new Date('2025-07-01'), status: 'Success', statusDetail: 'Completed' },
];

// Utility function to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

// Utility function to get status theme based on previous components
const getStatusTheme = (status: string) => {
    switch (status) {
        case 'Success':
            return { color: 'text-emerald-600', icon: CheckCircle, bgColor: 'bg-emerald-500' };
        case 'Failed':
            return { color: 'text-red-600', icon: XCircle, bgColor: 'bg-red-500' };
        case 'Refund':
            return { color: 'text-blue-600', icon: RotateCcw, bgColor: 'bg-blue-500' };
        default:
            return { color: 'text-gray-500', icon: DollarSign, bgColor: 'bg-gray-500' };
    }
};

// --- Transaction Row Component ---
const TransactionRow = ({ transaction }: { transaction: typeof mockTransactions[number] }) => {
    const { color, icon: Icon } = getStatusTheme(transaction.status);
    
    // Simulate navigation to detail page
    const handleViewDetails = () => {
        console.log(`Viewing details for transaction ID: ${transaction.id}`);
        // In a real app: router.push(`/transactions/${transaction.id}`);
    };

    const formattedDate = transaction.date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Determine if amount should be negative (for refunds)
    const displayAmount = transaction.status === 'Refund' ? formatCurrency(transaction.amount) : formatCurrency(transaction.amount);
    const amountClass = transaction.status === 'Failed' ? 'text-gray-500 line-through' : (transaction.status === 'Refund' ? 'text-blue-600' : 'text-gray-900');

    return (
        <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition duration-150 border-b border-gray-100 last:border-b-0"
            onClick={handleViewDetails}
        >
            {/* Left Section: Icon, Item, ID */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
                <div className={`p-3 rounded-full ${color.replace('text', 'bg-opacity-10 text-')}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col truncate">
                    <span className="text-base font-semibold text-gray-900 truncate">{transaction.item}</span>
                    <span className="text-xs text-gray-500 font-medium">{formattedDate} • {transaction.id}</span>
                </div>
            </div>

            {/* Right Section: Status, Amount, Arrow */}
            <div className="flex items-center space-x-3 sm:space-x-4 ml-4">
                <div className="hidden sm:block text-right">
                    <span className={`text-sm font-semibold ${amountClass}`}>{displayAmount}</span>
                    <span className={`block text-xs font-medium ${color}`}>{transaction.status}</span>
                </div>
                
                <ChevronRight className={`w-5 h-5 text-gray-400 hover:${color}`} />
            </div>
        </div>
    );
};

// --- Main Component ---
const TransactionHistory = () => {
    return (
        <div className="bg-gray-50 min-h-screen flex items-start justify-center p-4 sm:p-8">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

                {/* --- Header Section (Consistent Style) --- */}
                <div className="p-6 sm:p-8 bg-white border-b border-gray-100">
                    <div className="flex items-center space-x-3 mb-2">
                        <ListOrdered className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                            Transaction History
                        </h1>
                    </div>
                    <p className="text-md text-gray-600">
                        A detailed list of all your recent purchases and account movements.
                    </p>
                </div>

                {/* --- Transaction List --- */}
                <div className="divide-y divide-gray-100">
                    {mockTransactions.map((tx) => (
                        <TransactionRow key={tx.id} transaction={tx} />
                    ))}
                    
                    {/* Empty state example (can be uncommented for demonstration) */}
                    {/* {mockTransactions.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                            No transactions found for the selected period.
                        </div>
                    )} */}
                </div>

                {/* --- Footer / Pagination Area --- */}
                <div className="p-4 sm:p-6 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
                    <span>Showing 1 to {mockTransactions.length} of {mockTransactions.length} results</span>
                    <button className="text-indigo-600 font-semibold hover:text-indigo-700 transition duration-150">
                        Load More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;
