"use client";

import React, { useState } from "react";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/20/solid";

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      price: 59.99,
      quantity: 1,
      image: "https://picsum.photos/300/200?random=2",
    },
    {
      id: 2,
      name: "Smartwatch with Fitness Tracker",
      price: 12900.99,
      quantity: 2,
      image: "https://picsum.photos/300/200?random=1",
    },
    {
      id: 3,
      name: "Portable Power Bank 10000mAh",
      price: 24.5,
      quantity: 1,
      image: "https://picsum.photos/300/200?random=3",
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

  const total = subtotal;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-8">
      <ul className="bg-gray-400/40 list rounded-box shadow-md max-w-4xl w-full">
        <li className="p-4 pb-2 text-2xl font-bold text-black tracking-wide ">
          Your Shopping Cart
        </li>
        {cartItems.length === 0 ? (
          <p className="text-black text-center text-lg mb-4">Your cart is empty.</p>
        ) : (
          <>
            <div className="pb-6">
              {cartItems.map((item) => (
                <li key={item.id} className="list-row flex flex-col md:flex-row items-center w-full">
                  <div className="flex flex-row items-center space-x-4">
                    <div>
                    <img
                      className="size-13 rounded-box"
                      src={item.image}
                      alt={item.name}
                    />
                  </div>
                  <div className="list-col-grow">
                    <div>{item.name}</div>
                    <div className="text-xs uppercase font-semibold opacity-60 text-nowrap">
                      {item.price.toFixed(2)} x {item.quantity}
                    </div>
                  </div>
                  </div>
                  <div className="flex flex-row items-center md:ml-auto">
                    <div className="flex items-center space-x-2 mr-6">
                      <button
                        className="p-1 rounded-md text-black hover:bg-gray-100"
                        onClick={() => decrementQuantity(item.id)}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="text-lg font-medium text-black w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="p-1 rounded-md text-black hover:bg-gray-100"
                        onClick={() => incrementQuantity(item.id)}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-lg font-semibold text-black w-20 text-right text-nowrap">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </div>
              <hr className="border-b border-black mx-4"/>
            <div className="space-y-6 px-4 mb-4">
              {/* Order Summary */}
              <div className="flex justify-end pt-6">
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex justify-between text-black">
                    <span>Subtotal</span>
                    <span className="font-medium">₱{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-black border-t border-black pt-3">
                    <span>Order Total</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="mt-8">
                <button
                  type="button"
                  className="w-full bg-lime-600 text-white py-3 px-4 rounded-md shadow-md text-lg font-semibold hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition duration-300"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </ul>
    </div>
  );
}
