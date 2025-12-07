"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarDaysIcon,
  CreditCardIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { getCartItems, createCheckoutOnsite } from "@/app/actions";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

const formatCurrency = (amount: number) =>
  `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

type CartItem = {
  _id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export default function CheckoutPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState("onsite");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [branch, setBranch] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      
      // Get selected item IDs from query params
      const selectedItemIds = searchParams.get('items')?.split(',') || [];
      
      getCartItems(user.id).then((response) => {
        if (response) {
          // Filter by user ID and selected item IDs
          let filteredItems = response.filter(
            (item: any) => item.userId === user.id
          );
          
          // If specific items were selected, filter to only those
          if (selectedItemIds.length > 0) {
            filteredItems = filteredItems.filter(
              (item: any) => selectedItemIds.includes(item._id)
            );
          }
          
          setCartItems(filteredItems || []);
        }
        setLoading(false);
      });
      
      // Auto-populate user info
      if (user.fullName) {
        setFullName(user.fullName);
      }
      if (user.primaryEmailAddress?.emailAddress) {
        setEmail(user.primaryEmailAddress.emailAddress);
      }
    }
  }, [user, searchParams]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal;

  // Get tomorrow's date for minimum date validation
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleConfirm = async () => {
    // Validate full name
    if (!fullName || fullName.trim().length < 3) {
      alert("Please enter a valid full name (at least 3 characters).");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Validate phone number (Philippine format)
    const phoneRegex = /^(09|\+639)\d{9}$/;
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    if (!phone || !phoneRegex.test(cleanedPhone)) {
      alert("Please enter a valid Philippine mobile number (e.g., 09XX-XXX-XXXX).");
      return;
    }

    // Validate branch selection
    if (!branch) {
      alert("Please select a pickup location.");
      return;
    }

    // Validate pickup date
    if (!pickupDate) {
      alert("Please select a pickup date.");
      return;
    }

    // Validate that date is tomorrow or later
    const selectedDate = new Date(pickupDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < tomorrow) {
      alert("Pickup date must be at least tomorrow or later.");
      return;
    }

    // Validate pickup time
    if (!pickupTime) {
      alert("Please select a pickup time.");
      return;
    }

    // Validate cart has items
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Validate user is logged in
    if (!user?.id) {
      alert("You must be logged in to checkout.");
      return;
    }

    setSubmitting(true);

    try {
      // Split full name into firstName and lastName
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Generate reference number
      const referenceNumber = `SR5-${firstName.slice(0, 1)}${lastName.slice(0, 1) || "X"}-${Date.now()}`;

      // Format appointment date/time
      const appointment = `${pickupDate} ${pickupTime}`;

      // Format items for Maya API
      const formattedItems = cartItems.map((item) => ({
        name: item.productName,
        code: item.productId,
        quantity: item.quantity,
        amount: { value: item.price },
        totalAmount: { value: item.price * item.quantity },
      }));

      const transactionData = {
        firstName,
        lastName,
        email,
        phone,
        items: formattedItems,
        toPay: total,
        referenceNumber,
        productPrice: total,
        appointment,
        userId: user.id,
        branch,
        paymentMethod,
      };

      const response = await createCheckoutOnsite(transactionData);
      
      if (paymentMethod === "online") {
        if (response?.redirectUrl) {
          // Redirect to Maya payment gateway
          // console.log("Redirecting to Maya:", response.redirectUrl);
          window.location.href = response.redirectUrl;
        } else {
          console.error("No redirect URL in response:", response);
          alert("Failed to initialize payment gateway. Please try again.");
        }
      } else {
        // For onsite payment, redirect to success page
        alert("✅ Order confirmed! You will receive a confirmation email shortly.");
        router.push(`/transactions`);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert("Failed to process checkout. Please try again.");
    } finally {
      setSubmitting(false);
    }
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

          {/* Form Fields - Always Visible */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
            {/* Section Header */}
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <CalendarDaysIcon className="h-5 w-5 text-emerald-600" />
              Contact Information
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
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="09XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Schedule Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 bg-white"
                    required
                  >
                    <option value="">Choose a branch...</option>
                    <option value="Imus">Imus Branch</option>
                    <option value="Bacoor">Bacoor Branch</option>
                    <option value="Albay">Albay Branch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Pickup Date
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={getTomorrowDate()}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Pickup Time
                  </label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 bg-white"
                    required
                  >
                    <option value="">Choose a time...</option>
                    {Array.from({ length: 37 }, (_, i) => {
                      const hours = 8 + Math.floor(i / 4);
                      const minutes = (i % 4) * 15;
                      // Stop at 5:00 PM (17:00)
                      if (hours > 17 || (hours === 17 && minutes > 0)) return null;
                      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                      const displayTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
                      return <option key={timeString} value={timeString}>{displayTime}</option>;
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Maya Payment Info - Only shown when online is selected */}
          {/* {paymentMethod === "online" && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <CreditCardIcon className="h-5 w-5 text-emerald-600" />
                Maya Payment
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg border-2 border-emerald-200">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xl">
                      MAYA
                    </div>
                  </div>
                  <p className="text-center text-gray-600 text-sm mb-2">
                    You will be redirected to Maya's secure payment gateway to complete your purchase.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure payment powered by Maya</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 text-sm mb-2">Payment Information</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Accepts credit/debit cards, e-wallets, and online banking</li>
                    <li>• Instant payment confirmation</li>
                    <li>• Secure encryption for all transactions</li>
                  </ul>
                </div>
              </div>
            </div>
          )} */}
        </section>

        {/* Order Summary */}
        <section className="border-t pt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Order Summary
          </h2>

          {/* Cart Items List */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading cart items...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

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
              disabled={submitting || loading || cartItems.length === 0}
              className="w-full bg-emerald-600 text-white text-lg font-bold py-4 rounded-xl shadow-xl hover:bg-emerald-700 transition duration-300 transform hover:scale-[1.005] focus:outline-none focus:ring-4 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting
                ? "Processing..."
                : paymentMethod === "onsite"
                ? "Confirm Order"
                : "Proceed to Payment"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
