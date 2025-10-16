"use client";
import React, { use, useEffect, useState } from "react";
import {
  ShoppingBagIcon,
  MapPinIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { createTransaction, getProduct } from "@/app/actions";
import { Product } from "@/hooks/useQuery";
import Image from "next/image";

export default function Browse({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"reserve" | "book" | null>(null);
  const { slug } = use(params);

  useEffect(() => {
    async function fetchProduct() {
      const fetchedProduct = await getProduct(slug);
      setProduct(fetchedProduct.data || null);
    }
    fetchProduct();
  }, [slug]);

  const handleOpenModal = (type: "reserve" | "book") => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append("productName", product?.name || "");
    formData.append("productId", slug);
    formData.append("productPrice", product?.price.toString() || "0");
    const data = await createTransaction(formData);

    window.open(data.redirectUrl, "_blank")?.focus();
    handleCloseModal();
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-600">
            The item with id "{slug}" could not be located.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 p-8 sm:p-12">
            <div className="lg:col-span-1 mb-8 lg:mb-0">
              <div className="w-full aspect-w-4 aspect-h-3 rounded-xl overflow-hidden shadow-xl">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  width={600}
                  height={400}
                />
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <TagIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  <span className="font-medium text-gray-700 capitalize">
                    Category: {product.category}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  <span className="font-medium text-gray-700">
                    Available at:{" "}
                    <span className="capitalize">{product.location}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              <p className="text-4xl font-bold text-emerald-600 mb-6 border-b border-gray-200 pb-4">
                {typeof product.price === "number"
                  ? `₱${product.price.toFixed(2)}`
                  : "Price Unavailable"}
              </p>

              <div className="flex flex-row gap-4">
                <button
                  onClick={() => handleOpenModal("reserve")}
                  className="flex items-center justify-center w-full py-3 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition duration-300 transform hover:scale-[1.01]"
                >
                  <ShoppingBagIcon className="w-6 h-6 mr-3" />
                  Reserve Unit
                </button>
                <button
                  onClick={() => handleOpenModal("book")}
                  className="flex items-center justify-center w-full py-3 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-red-900 hover:bg-red-950 transition duration-300 transform hover:scale-[1.01]"
                >
                  <ShoppingBagIcon className="w-6 h-6 mr-3" />
                  Book a Test Drive
                </button>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                  Product Overview
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {modalType === "reserve"
                ? "Reserve Your Unit"
                : "Book a Test Drive"}
            </h2>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <input
                type="tel"
                placeholder="Contact Number"
                name="phone"
                className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                name="email"
                className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <input
                type="datetime-local"
                className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg text-white font-semibold transition ${
                    modalType === "reserve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-900 hover:bg-red-950"
                  }`}
                >
                  {modalType === "reserve" ? "Reserve Now" : "Book Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
