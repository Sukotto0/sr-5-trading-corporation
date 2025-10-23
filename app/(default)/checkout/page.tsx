"use client";

import React, { useState } from "react";
import {
  CalendarDaysIcon,
  CreditCardIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const formatCurrency = (amount: number) =>
  `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("onsite");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  const subtotal = 214.48; // Example subtotal
  const total = subtotal;

  const handleConfirm = () => {
    if (paymentMethod === "onsite" && (!pickupDate || !pickupTime)) {
      alert("Please select a pickup date and time.");
      return;
    }
    alert(
      `✅ Order confirmed with ${paymentMethod === "onsite" ? "Onsite Pickup" : "Online Payment"}!`
    );
  };

  return (
    <div className="flex justify-center items-start w-full min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 sm:p-10 border border-gray-100 space-y-10">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">
          Checkout
        </h1>

        {/* Payment Method */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Payment Method</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Onsite Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod("onsite")}
              className={`flex-1 flex items-center justify-center gap-3 border-2 rounded-xl py-4 text-lg font-medium transition ${
                paymentMethod === "onsite"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 hover:border-emerald-400"
              }`}
            >
              <BanknotesIcon className="h-6 w-6" />
              Onsite Payment
            </button>

            {/* Online Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod("online")}
              className={`flex-1 flex items-center justify-center gap-3 border-2 rounded-xl py-4 text-lg font-medium transition ${
                paymentMethod === "online"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 hover:border-emerald-400"
              }`}
            >
              <CreditCardIcon className="h-6 w-6" />
              Online Payment
            </button>
          </div>

          {/* Conditional Fields */}
          {paymentMethod === "onsite" && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
              {/* Section Header */}
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <CalendarDaysIcon className="h-5 w-5 text-emerald-600" />
                Schedule Your Pickup
              </h3>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Contact Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Juan Dela Cruz"
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="juan@email.com"
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      placeholder="09XX-XXX-XXXX"
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Schedule Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Time
                    </label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "online" && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <CreditCardIcon className="h-5 w-5 text-emerald-600" />
                Enter Card Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, name: e.target.value })
                    }
                    placeholder="John Doe"
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, number: e.target.value })
                    }
                    placeholder="1234 5678 9012 3456"
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, expiry: e.target.value })
                    }
                    placeholder="MM/YY"
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                    placeholder="123"
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Order Summary */}
        <section className="border-t pt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Order Summary
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-700 border-b border-gray-200 pb-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-3">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full bg-emerald-600 text-white text-lg font-bold py-4 rounded-xl shadow-xl hover:bg-emerald-700 transition duration-300 transform hover:scale-[1.005] focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
            >
              Confirm Order
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
