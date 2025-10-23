"use client";
import { useState } from "react";
import { Radio, RadioGroup } from "@headlessui/react";
import { createFeedback } from "@/app/actions";

// Helper function to handle Tailwind class grouping
function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Feedback() {
  const [rating, setRating] = useState<number | null>(3);
  const [feedbackType, setFeedbackType] = useState<string | null>("store");
  const [comment, setComment] = useState<string>("");

  const feedbackOptions = [
    { label: "Store experience", value: "store" },
    { label: "Website Experience", value: "website" },
    { label: "Product Quality", value: "product" },
    { label: "Other", value: "other" },
  ];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    createFeedback({
      rating,
      feedbackType,
      comment,
    }).then((response) => {
      if (response.success) {
        // Reset form fields
        setRating(3);
        setFeedbackType("store");
        setComment("");
        alert("Thank you for your feedback!");
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <form
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl max-w-2xl w-full border border-gray-100"
        onSubmit={handleSubmit}
      >
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Customer Feedback
        </h1>
        <p className="text-gray-600 mb-6 border-b pb-4">
          Your feedback is important to us! Let us know how we're doing by
          filling out the form below.
        </p>

        {/* Anonymity Note */}
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-8 rounded-lg">
          <p className="text-sm text-emerald-800">
            <span className="font-bold">Note:</span> This feedback is anonymous.
          </p>
        </div>

        {/* 1. Rating Section */}
        <div className="mb-10">
          <p className="text-lg font-semibold text-gray-800 mb-4">
            Rate your overall experience (1=Poor, 5=Excellent).
          </p>
          <RadioGroup
            value={rating}
            onChange={setRating}
            aria-label="Overall experience rating"
            className="grid grid-cols-5 gap-2 w-full"
          >
            {[1, 2, 3, 4, 5].map((rate) => (
              <Radio
                key={rate}
                value={rate}
                className={classNames(
                  rating === rate
                    ? "bg-emerald-600 ring-2 ring-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-800 hover:bg-emerald-50 hover:text-emerald-800",
                  "group relative flex cursor-pointer rounded-lg px-2 py-3 sm:px-3 sm:py-4 text-center text-sm font-medium transition duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/75"
                )}
              >
                <div className="flex flex-col w-full items-center justify-center">
                  <span className="font-bold text-lg sm:text-xl w-full">
                    {rate}
                  </span>
                </div>
              </Radio>
            ))}
          </RadioGroup>
        </div>

        {/* 2. Feedback Type Section */}
        <div className="mb-8">
          <p className="text-lg font-semibold text-gray-800 mb-4">
            What specifically are you here to leave feedback about?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {feedbackOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFeedbackType(option.value)}
                className={classNames(
                  feedbackType === option.value
                    ? "bg-emerald-600 text-white shadow-md border-emerald-700"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:text-emerald-800",
                  "flex-1 px-4 py-2 border rounded-xl transition duration-150 text-sm font-medium"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <textarea
            className="w-full h-32 mt-4 p-4 text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150"
            placeholder="Please detail your feedback here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="mt-10">
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white text-lg font-bold py-4 rounded-xl shadow-xl hover:bg-emerald-700 transition duration-300 transform hover:scale-[1.005] focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
          >
            Submit Anonymous Feedback
          </button>
        </div>
      </form>
    </div>
  );
}
