"use client";
import React, { Suspense, useEffect, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useUser } from "@clerk/nextjs";
import {
  createAppointment,
  createReservation,
  getServices,
} from "@/app/actions";
import { ClipLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";

type serviceOffering = {
  name: string;
  icon: string;
  description: string;
  offers: string[];
  color: string;
};

export default function ScheduleVisitForm() {
  return (
    <Suspense>
      <ScheduleVisitComponent />
    </Suspense>
  );
}

function ScheduleVisitComponent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    surname: user?.lastName || "",
    contactNumber: "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    preferredDate: "",
    preferredTime: "",
    location: "",
    purpose: "",
    details: "",
    userId: user?.id || "",
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      firstName: user?.firstName || "",
      surname: user?.lastName || "",
      email: user?.primaryEmailAddress?.emailAddress || "",
      purpose: searchParams.get("purpose") || "",
      userId: user?.id || "",
    }));
  }, [user, searchParams]);

  const [serviceOfferings, setServiceOfferings] = useState<serviceOffering[]>(
    []
  );

  // Generate time options with 15-minute intervals
  const getTimeOptions = () => {
    const times = [];
    for (let hour = 8; hour <= 17; hour++) {
      // 8 AM to 5 PM
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const displayTime = new Date(
          `2000-01-01T${timeString}`
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  // Get tomorrow's date (minimum selectable date)
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const branchLocations = [
    "Select a Branch",
    "Main Branch - Camalig",
    "Bacoor Branch",
    "Imus Branch",
  ];

  useEffect(() => {
    getServices().then((data) => {
      // Filter out TEST DRIVE A VEHICLE and sort by order
      const filteredData = data.data
        .filter((service: serviceOffering) => service.name !== "TEST DRIVE A VEHICLE")
        .sort((a: any, b: any) => (a.order || 999) - (b.order || 999));
      setServiceOfferings(filteredData);
    });
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    // Validate userId is present
    if (!formData.userId) {
      alert("Please sign in to schedule an appointment.");
      return;
    }
    
    setIsSubmitting(true);
    createAppointment(formData).then((data) => {
      setIsSubmitting(false);
      if (data.success) {
        alert("Appointment scheduled successfully!");
        // Reset the form
        setFormData({
          firstName: user?.firstName || "",
          surname: user?.lastName || "",
          contactNumber: "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          preferredDate: "",
          preferredTime: "",
          location: "",
          purpose: "",
          details: "",
          userId: user?.id || "",
        });
      } else {
        alert("Failed to schedule appointment: " + (data.error || "Unknown error"));
      }
    }).catch((error) => {
      setIsSubmitting(false);
      alert("Failed to schedule appointment. Please try again.");
      console.error("Appointment error:", error);
    });
  }

  return (
    <div className="flex justify-center items-start w-full min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 select-none">
      <form
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl max-w-3xl w-full border border-gray-100"
        onSubmit={handleSubmit}
      >
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Schedule a Visit
        </h1>
        <p className="text-gray-600 mb-8 border-b pb-4">
          Please provide your contact details, preferred branch, and reason for
          the visit.
        </p>

        <div className="space-y-8">
          {/* Name Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="e.g., Juan"
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  value={formData.surname}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      surname: e.target.value,
                    }))
                  }
                  autoComplete="family-name"
                  placeholder="e.g., Dela Cruz"
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="contact-number"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Number
                </label>
                <input
                  type="tel" // Use tel for phone number input
                  name="contact-number"
                  id="contact-number"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactNumber: e.target.value,
                    }))
                  }
                  autoComplete="tel"
                  placeholder="e.g., 09xxxxxxxxx"
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  E-mail Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="e.g., example@email.com"
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location and Date Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Visit Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Location Select */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Branch Location
                </label>
                <div className="relative">
                  <select
                    id="location"
                    name="location"
                    className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-4 pr-10 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm appearance-none transition duration-150"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    required
                  >
                    {branchLocations.map((location, index) => (
                      <option key={index} value={index === 0 ? "" : location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 right-0 h-full w-5 text-gray-400 mr-2"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Purpose of Visit */}
              <div>
                <label
                  htmlFor="purpose"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Purpose of Visit
                </label>
                <div className="relative">
                  <select
                    id="purpose"
                    name="purpose"
                    className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-4 pr-10 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm appearance-none transition duration-150"
                    value={formData.purpose}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        purpose: e.target.value,
                      }));
                      console.log(e.target.value);
                    }}
                    required
                  >
                    <option value="" disabled>
                      Select a Service
                    </option>
                    <option value="Visit onsite">Visit onsite</option>
                    {serviceOfferings.map((data, i) => (
                      <optgroup key={i} label={data.name}>
                        {data.offers.map((offer, j) => (
                          <option key={`${i}-${j}`} value={offer}>
                            {offer}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 right-0 h-full w-5 text-gray-400 mr-2"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Preferred Date - Only future dates allowed */}
              <div>
                <label
                  htmlFor="preferred-date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="preferred-date"
                  id="preferred-date"
                  value={formData.preferredDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredDate: e.target.value,
                    }))
                  }
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm appearance-none transition duration-150"
                  min={getTomorrowDate()} // Only allows future dates (tomorrow and beyond)
                  required
                />
              </div>

              {/* Preferred Time - 15 minute intervals */}
              <div>
                <label
                  htmlFor="preferred-time"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Preferred Time
                </label>
                <div className="relative">
                  <select
                    id="preferred-time"
                    name="preferred-time"
                    value={formData.preferredTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        preferredTime: e.target.value,
                      }))
                    }
                    className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-4 pr-10 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm appearance-none transition duration-150"
                    defaultValue=""
                    required
                  >
                    <option value="">Select a time</option>
                    {getTimeOptions().map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.display}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    className="pointer-events-none absolute inset-y-0 right-0 h-full w-5 text-gray-400 mr-2"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Business hours: 8:00 AM - 5:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* Purpose of Visit (New) */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Details of Visit (optional)
            </h2>
            <label htmlFor="details" className="sr-only">
              Purpose of Visit Details
            </label>
            <textarea
              id="details"
              name="details"
              rows={4}
              placeholder="Briefly describe the reason for your visit."
              className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150"
              value={formData.details}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, details: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-10">
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white text-lg font-bold py-4 rounded-xl shadow-xl hover:bg-emerald-700 transition duration-300 transform hover:scale-[1.005] focus:outline-none focus:ring-4 focus:ring-emerald-500/50 flex flex-row justify-center items-center space-x-2 gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ClipLoader size={20} color="#ffffff" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Schedule Visit</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
