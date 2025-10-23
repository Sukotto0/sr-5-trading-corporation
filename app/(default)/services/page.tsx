"use client";
import React, { useEffect, useState } from "react";
import {
  TruckIcon,
  WrenchIcon,
  BoltIcon,
  SparklesIcon,
  CogIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  AirVent,
  Lock,
  PaintbrushIcon,
  ScissorsLineDashed,
} from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { getServices } from "@/app/actions";

// Data structure for the services offered
type serviceOffering = {
  name: string,
  icon: string,
  description: string,
  offers: string[],
  color: string,
};

export default function App() {
  const { isSignedIn } = useUser();
  const [serviceOfferings, setServiceOfferings] = useState<serviceOffering[]>([]);

  useEffect(() => {
    getServices().then((data) => {
      setServiceOfferings(data.data);
    });
  }, []);
        

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16 lg:mb-24">
          <p className="text-lg/6 font-semibold text-red-900 tracking-wide uppercase">
            Our Commitment to Excellence
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-black/90">
            Reliable Fleet Services, Maximize Uptime
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-black/60 mx-auto">
            We provide comprehensive maintenance and repair solutions to keep
            your commercial vehicles and heavy equipment operating at peak
            performance.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceOfferings.map((service) => (
            <div
              key={service.name}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 sm:p-8 border-t-4 border-red-950"
            >
              <div
                className={`p-3 inline-flex items-center justify-center h-12 w-12 rounded-full bg-black/8 mb-4`}
              >
                {/* <service.icon
                  className={`h-6 w-6 ${service.color}`}
                  aria-hidden="true"
                /> */}
                <span className="text-2xl">{service.icon}</span>
              </div>
              <h2 className="text-xl font-bold text-black/95 mb-3">
                {service.name}
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                {service.description}
              </p>

              <ul className="space-y-2 text-sm text-gray-700">
                {service.offers.map((offer, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="h-4 w-4 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {offer}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Call-to-Action Section */}
        <div className="mt-20 bg-red-950 rounded-xl shadow-2xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to Schedule Your Service?
          </h2>
          <p className="mt-4 text-xl text-white/95">
            Contact us today for a detailed quote or to book a maintenance slot
            for your equipment.
          </p>
          <div className="mt-8 flex justify-center">
            {isSignedIn ? (
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-red-900 bg-white hover:bg-indigo-50 duration-200 transform hover:scale-105 transition-all"
              >
                Request an Appointment
                <ArrowRightIcon
                  className="ml-3 -mr-1 h-5 w-5"
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <SignInButton mode="modal" forceRedirectUrl={"/schedule"}>
                <p className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-red-900 bg-white hover:bg-indigo-50 duration-200 transform hover:scale-105 transition-all">
                  <Lock className="mr-2 h-5 w-5" aria-hidden="true" />
                  Sign In to Request an Appointment
                </p>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
