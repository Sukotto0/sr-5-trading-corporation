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
import { Boxes, Lock, MinusIcon, PlusIcon } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);
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

              <div className="flex flex-col flex-wrap w-fit py-2 rounded-xl gap-3 mb-6">
                <span className="text-black text-lg font-semibold">Quantity:</span>
                <div className="flex flex-row items-center w-fit rounded-lg">
                  <button onClick={() => quantity + 1 <= (product.quantity || 0) && setQuantity(quantity + 1)} className="hover:bg-black/30 bg-black/10 px-3 py-2 rounded-l-lg">
                    <PlusIcon />
                  </button>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), product.quantity || 1))}
                    className="w-16 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none text-center bg-white px-3 py-2 border"
                  />
                  <button onClick={() => quantity - 1 > 0 && setQuantity(quantity - 1)} className="hover:bg-black/30 bg-black/10 px-3 py-2 rounded-r-lg">
                    <MinusIcon />
                  </button>
                </div>
              </div>
              <div className="grid xl:grid-cols-2 gap-4 mb-4">
                {isSignedIn ? (
                  <>
                    <button className="flex items-center justify-center w-full py-3 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition duration-300 transform hover:scale-[1.01]">
                      <ShoppingBagIcon className="w-6 h-6 mr-3" />
                      Add to Cart
                    </button>
                    <button className="flex items-center justify-center w-full py-3 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-red-900 hover:bg-red-950 transition duration-300 transform hover:scale-[1.01]">
                      <ShoppingBagIcon className="w-6 h-6 mr-3" />
                      Buy Now
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
    </>
  );
}
