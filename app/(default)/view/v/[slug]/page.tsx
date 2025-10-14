"use client";
import React, { use, useEffect, useState } from "react";
import {
  ShoppingBagIcon,
  MapPinIcon,
  TagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { get } from "http";
import { getProduct } from "@/app/actions";
import { Product } from "@/hooks/useQuery";
import Image from "next/image";

const mockProducts = [
  {
    id: "learning-module-1a",
    name: "Learning Module 1A: Basic Literacy",
    imageUrl: "https://placehold.co/600x400/000000/ffffff?text=Module+1A+Image",
    price: 150.0,
    description:
      "The Comprehensive Learning Module 1A is designed for adult learners focusing on foundational reading, writing, and arithmetic skills. This module includes 15 essential lessons, practical exercises, and a self-assessment checklist. It is perfect for the first stage of the Alternative Learning System (ALS) program, ensuring students build a strong base for future learning. Durable, printed materials for long-term use.",
    category: "Educational Modules",
    branch: "Imus Branch",
    createdAt: "2025-09-01",
  },
  {
    id: "notebooks-als-branded",
    name: "Notebooks (ALS Branded, 5 Pcs)",
    imageUrl:
      "https://placehold.co/600x400/10b981/ffffff?text=ALS+Notebooks+Image",
    price: 450.0,
    description:
      "High-quality, durable notebooks branded with the Alternative Learning System logo. Pack of 5 for various subjects. Excellent for daily note-taking and exercises.",
    category: "School Supplies",
    branch: "Bacoor Branch",
    createdAt: "2025-09-10",
  },
];

export default function Browse({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const { slug } = use(params);

  useEffect(() => {
    async function fetchProduct() {
      const fetchedProduct = await getProduct(slug);
      console.log("Fetched product:", fetchedProduct);
      setProduct(fetchedProduct.data || null);
    }
    fetchProduct();
  }, [slug]);

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

            {/* Metadata */}
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
            {/* Header */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-4xl font-bold text-emerald-600 mb-6 border-b border-gray-200 pb-4">
              {typeof product.price === "number"
                ? `₱${product.price.toFixed(2)}`
                : "Price Unavailable"}
            </p>

            {/* Buy Button */}
            <div className="flex flex-row gap-4">
              <button className="flex items-center justify-center w-full py-3 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition duration-300 transform hover:scale-[1.01] mb-8 hover:cursor-pointer">
                <ShoppingBagIcon className="w-6 h-6 mr-3" />
                Reserve Unit
              </button>
              <button className="flex items-center justify-center w-full py-3 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-red-900 hover:bg-red-950 transition duration-300 transform hover:scale-[1.01] mb-8 hover:cursor-pointer">
                <ShoppingBagIcon className="w-6 h-6 mr-3" />
                Book a Test Drive
              </button>
            </div>

            {/* Description */}
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
  );
}
