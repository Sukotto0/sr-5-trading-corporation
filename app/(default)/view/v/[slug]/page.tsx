"use client";
import React, { use, useEffect, useState } from "react";
import {
  ShoppingBagIcon,
  MapPinIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { createReservation, getProduct } from "@/app/actions";
import { Product } from "@/hooks/useQuery";
import Image from "next/image";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Boxes, Lock } from "lucide-react";
import { ClipLoader, PuffLoader } from "react-spinners";

export default function Browse({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [initialLoad, setInitialLoad] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [reservationFee, setReservationFee] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"reserve" | "book" | null>(null);
  const { slug } = use(params);

  const { isSignedIn, user } = useUser();

  useEffect(() => {
    async function fetchProduct() {
      const fetchedProduct = await getProduct(slug);
      setProduct(fetchedProduct.data || null);
      setReservationFee((fetchedProduct.data?.price || 0) * 0.05);
      setInitialLoad(false);
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append("productName", product?.name || "");
    formData.append("productId", slug);
    formData.append("userId", user?.id || "");
    formData.append("reservationFee", reservationFee.toString());
    formData.append("productPrice", product?.price.toString() || "0");

    if (modalType === "reserve") {
      const data = await createReservation(formData);

      window.open(data.redirectUrl, "_blank")?.focus();
      setIsSubmitting(false);
      handleCloseModal();
    }
  };

  if (!product) {
    if (initialLoad) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="text-center p-8 flex flex-col gap-4">
            <PuffLoader />
            <p className="text-gray-600">Loading</p>
          </div>
        </div>
      );
    } else {
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
                  <Boxes className="w-5 h-5 mr-2 text-emerald-600" />
                  <span className="font-medium text-gray-700 capitalize">
                    In Stock: {product.quantity}
                  </span>
                </div>
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

              <div className="grid xl:grid-cols-2 gap-4 mb-4">
                {isSignedIn ? (
                  <>
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
                  </>
                ) : (
                  <SignInButton mode="modal">
                    <button className="flex items-center xl:col-span-2 justify-center w-full py-3 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-red-900 hover:bg-red-950 transition duration-300 transform hover:scale-[1.01]">
                      <Lock className="w-6 h-6 mr-3" />
                      Sign In to Continue
                    </button>
                  </SignInButton>
                )}
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
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    defaultValue={user?.firstName ?? ""}
                    placeholder="First Name"
                    className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    defaultValue={user?.lastName ?? ""}
                    placeholder="Last Name"
                    className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="mt-3">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Contact Number"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="mt-3">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""}
                  placeholder="Email Address"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="mt-3">
                <label
                  htmlFor="appointment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Preferred Date & Time of{" "}
                  {modalType === "reserve" ? "Claiming" : "Test Drive"}
                </label>
                <input
                  id="appointment"
                  name="appointment"
                  type="datetime-local"
                  className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              {modalType === "reserve" && (
                <>
                  <hr className="mt-4" />
                  <div className="w-fit">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <h2 className="text-normal text-gray-900 mb-2">
                      Reservation Fee: ₱{reservationFee.toFixed(2)}
                    </h2>
                    <h2 className="text-normal text-gray-900 mb-2">
                      Pay upon claiming: ₱
                      {(product.price - reservationFee).toFixed(2)}
                    </h2>
                    <hr />
                    <p className="text-sm text-gray-600 mt-2">
                      * A 5% reservation fee is required to secure your unit.
                      The remaining balance will be due upon claiming the
                      product.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      * The reservation fee is non-refundable.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      * Failure to claim your unit within 1 week of the
                      specified time will result in the forfeiture of your
                      reservation.
                    </p>
                  </div>
                </>
              )}
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
                  className={`px-5 py-2 rounded-lg text-white font-semibold transition flex flex-row items-center gap-2 ${
                    modalType === "reserve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-900 hover:bg-red-950"
                  }`}
                >
                  {isSubmitting && <ClipLoader size={18} color="#ffffff" />}
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
