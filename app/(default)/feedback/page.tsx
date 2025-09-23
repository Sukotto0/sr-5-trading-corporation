"use client";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { Field, Label, Radio, RadioGroup } from "@headlessui/react";

export default function Example() {
  const [rating, setRating] = useState();

  return (
    <div className="flex flex-col items-center justify-center w-full py-10">
      <form className="bg-gray-400/40 p-10 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-black mb-2">
          Customer Feedback
        </h1>
        <p className="text-Black mb-6">
          Your feedback is important to us! Let us know how we're doing by
          filling out the form below.
        </p>

        <p className="font-bold text-black mb-2">
          Your feedback is anonymous, so we won't be able to respond to comments
          left here.
        </p>
        <p className="text-black mb-8">
          If you would like to speak with a customer service representative,
          please see our contact information below, or fill out{" "}
          <a href="#" className="text-blue-600 underline">
            a customer comment form
          </a>
          .
        </p>

        {/* Rating Section */}
        <div className="mb-8">
          <p className="text-lg font-semibold text-black mb-4">
            Rate your overall experience.
          </p>
          <RadioGroup
            value={rating}
            onChange={setRating}
            aria-label="Server size"
            className="flex flex-row gap-2 w-full justify-between"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((rate, i) => (
              <Radio
                key={i}
                value={rate}
                className="group grow-1 basis-0 shrink-0 relative flex cursor-pointer rounded-lg bg-white/90 px-5 py-4 text-white shadow-md transition focus:not-data-focus:outline-none data-checked:bg-black/20 data-focus:outline data-focus:outline-white"
              >
                <div className="flex flex-col w-full items-center text-center justify-center text-sm/6">
                  <span className="text-sm text-black/95">
                    {rate === 1 ? "Poor" : rate === 7 ? "Excellent" : ""}
                  </span>
                  <span className="font-medium text-black/95 text-center w-full">{rate}</span>
                </div>
              </Radio>
            ))}
          </RadioGroup>
        </div>

        {/* Feedback Type Section */}
        <div className="mb-8">
          <p className="text-lg font-semibold text-black mb-4">
            What specifically are you here to leave feedback about?
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-gray-100 flex-1 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-400 text-black">
              Store experience
            </button>
            <button className="bg-gray-100 flex-1 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-400 text-black">
              Website Experience
            </button>
            <button className="bg-gray-100 flex-1 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-400 text-black">
              Other
            </button>
            <textarea
              className="bg-gray-100 w-full h-24 mt-4 p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
              placeholder="Your feedback..."
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button className="w-full bg-lime-600 text-white font-bold py-3 rounded-md shadow-lg hover:bg-lime-400 transition duration-300">
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
}
