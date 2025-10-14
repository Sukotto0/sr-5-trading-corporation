"use client";

import React, { useState } from "react";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";

// Helper for formatting currency (using the Philippine Peso symbol for consistency)
const formatCurrency = (amount: any) => {
  // Basic currency formatting with commas for thousands
  return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

export default function ShoppingCart() {
  // Note: Removed TypeScript annotation from the original prompt for compatibility with .jsx
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      price: 59.99,
      quantity: 1,
      // Using placeholder image with fallback for consistency
      image: "https://placehold.co/64x64/525252/ffffff?text=Headphones",
    },
    {
      id: 2,
      name: "Smartwatch with Fitness Tracker",
      price: 129.99, // Adjusted price from 12900.99 for a more realistic example
      quantity: 2,
      image: "https://placehold.co/64x64/525252/ffffff?text=Smartwatch",
    },
    {
      id: 3,
      name: "Portable Power Bank 10000mAh",
      price: 24.5,
      quantity: 1,
      image: "https://placehold.co/64x64/525252/ffffff?text=Power+Bank",
    },
  ]);

  const incrementQuantity = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const total = subtotal; // Keeping total the same as subtotal for simplicity (no taxes/shipping)

  return (
    <div className="flex justify-center items-start w-full min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 sm:p-10 border border-gray-100">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
          Your Shopping Cart ({cartItems.length} items)
        </h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-600 text-center text-xl py-12">
            Your cart is empty. Start shopping now!
          </p>
        ) : (
          <div className="space-y-6">
            {/* Cart Items List */}
            <div className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  // Flex layout for item row, stacks on mobile (sm:flex-row)
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6"
                >
                  {/* Item Details (Image, Name, Price) */}
                  <div className="flex items-center space-x-4 w-full sm:w-1/2">
                    <img
                      className="size-16 rounded-lg object-cover border border-gray-100"
                      src={item.image}
                      alt={item.name}
                    />
                    <div className="flex-grow">
                      <div className="text-base font-semibold text-gray-900 line-clamp-2">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500 font-medium mt-1">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>

                  {/* Quantity, Total Price, and Remove Button controls */}
                  {/* This div uses flex-wrap and justify-between for better mobile spacing */}
                  <div className="flex items-center justify-between sm:justify-end mt-4 sm:mt-0 sm:w-auto w-full">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm mr-6">
                      <button
                        className="p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition duration-150"
                        onClick={() => decrementQuantity(item.id)}
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="text-base font-medium text-gray-900 w-8 text-center bg-gray-50 py-1">
                        {item.quantity}
                      </span>
                      <button
                        className="p-2 text-gray-700 hover:bg-gray-100 transition duration-150"
                        onClick={() => incrementQuantity(item.id)}
                      >
                        <PlusIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Item Total Price */}
                    <div className="text-lg font-bold text-gray-900 w-24 text-right sm:mr-6">
                      {formatCurrency(item.price * item.quantity)}
                    </div>

                    {/* Remove Button */}
                    <button
                      className="text-red-500 hover:text-red-700 p-2 ml-2 rounded-full hover:bg-red-50 transition duration-150"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary and Checkout */}
            <div className="flex justify-end pt-8 border-t border-gray-100">
              <div className="w-full max-w-sm space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-700">
                  <span className="text-lg">Subtotal</span>
                  <span className="text-lg font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {/* Shipping placeholder */}
                <div className="flex justify-between text-gray-700 border-b border-gray-200 pb-4">
                  <span className="text-lg">Shipping</span>
                  <span className="text-lg font-medium">Free</span>
                </div>

                {/* Order Total */}
                <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-3">
                  <span>Order Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                {/* Checkout Button (Emerald Theme) */}
                <div className="pt-6">
                  <button
                    type="button"
                    className="w-full bg-emerald-600 text-white text-lg font-bold py-4 rounded-xl shadow-xl hover:bg-emerald-700 transition duration-300 transform hover:scale-[1.005] focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
