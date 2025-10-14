"use client";
import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

// Helper function to generate month options (for demonstration)
const getMonthOptions = () => {
    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    return months.map((month, index) => <option key={index + 1} value={index + 1}>{month}</option>);
};

// Helper function to generate day options (for demonstration)
const getDayOptions = () => {
    return Array.from({ length: 31 }, (_, i) => i + 1).map(day => 
        <option key={day} value={day}>{day}</option>
    );
};

// Helper function to generate year options (for demonstration)
const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
        years.push(currentYear + i);
    }
    return years.map(year => <option key={year} value={year}>{year}</option>);
};

export default function ScheduleVisitForm() {
    // State to hold form values (not fully implemented, for structure only)
    const [formData, setFormData] = useState({
        firstName: '',
        surname: '',
        contactNumber: '',
        email: '',
        preferredDate: '', // Updated to single date field
        location: '', // New field
        purpose: '', // New field
    });

    const branchLocations = [
        "Select a Branch",
        "Manila Central Branch",
        "Cebu City Branch",
        "Davao City Branch",
        "Quezon City Branch",
    ];

    return (
        <div className="flex justify-center items-start w-full min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl max-w-3xl w-full border border-gray-100">
                
                {/* Header */}
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                    Schedule a Visit
                </h1>
                <p className="text-gray-600 mb-8 border-b pb-4">
                    Please provide your contact details, preferred branch, and reason for the visit.
                </p>

                <div className="space-y-8">
                    {/* Name Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="first-name"
                                    id="first-name"
                                    autoComplete="given-name"
                                    placeholder="e.g., Juan"
                                    className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150"
                                />
                            </div>
                            <div>
                                <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                                    Surname
                                </label>
                                <input
                                    type="text"
                                    name="surname"
                                    id="surname"
                                    autoComplete="family-name"
                                    placeholder="e.g., Dela Cruz"
                                    className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Info Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="contact-number" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Number
                                </label>
                                <input
                                    type="tel" // Use tel for phone number input
                                    name="contact-number"
                                    id="contact-number"
                                    autoComplete="tel"
                                    placeholder="e.g., 0917-xxx-xxxx"
                                    className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    E-mail Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    autoComplete="email"
                                    placeholder="e.g., example@email.com"
                                    className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location and Date Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Visit Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            
                            {/* Location Select (New) */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    Branch Location
                                </label>
                                <div className="relative">
                                    <select
                                        id="location"
                                        name="location"
                                        className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 pl-4 pr-10 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm appearance-none transition duration-150"
                                        defaultValue=""
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
                            
                            {/* Preferred Date (Updated to type="date") */}
                            <div>
                                <label htmlFor="preferred-date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Preferred Date
                                </label>
                                <input
                                    type="date"
                                    name="preferred-date"
                                    id="preferred-date"
                                    className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm appearance-none transition duration-150"
                                    min={new Date().toISOString().split('T')[0]} // Prevents selecting past dates
                                />
                            </div>
                        </div>
                    </div>

                    {/* Purpose of Visit (New) */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Purpose of Visit</h2>
                        <label htmlFor="purpose" className="sr-only">
                            Purpose of Visit Details
                        </label>
                        <textarea
                            id="purpose"
                            name="purpose"
                            rows={4}
                            placeholder="Briefly describe the reason for your visit (e.g., inquiry about enrolment, picking up module, meeting with a coordinator)."
                            className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150"
                        />
                    </div>

                </div>

                {/* Submit Button */}
                <div className="mt-10">
                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white text-lg font-bold py-4 rounded-xl shadow-xl hover:bg-emerald-700 transition duration-300 transform hover:scale-[1.005] focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                    >
                        Schedule Visit
                    </button>
                </div>
            </div>
        </div>
    );
}
