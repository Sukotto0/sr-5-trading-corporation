"use client"
import React, { useState } from 'react';
import {
    ArrowRightIcon,
    ArrowLeftIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';

const calendarDays = [
    // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    // Example: [31(Prev Month), 1, 2, 3, 4, 5, 6]
    [31, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, 1, 2, 3, 4], // 29 and 30 are Sept, 1-4 are Oct
    [5, 6, 7, 8, 9, 10, 11], // October
];

// --- Helper Functions ---

function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}

// --- Component Definition ---

const AdminDashboard = () => {
    // State for the calendar (static data for now)
    const [currentMonth] = useState('SEPTEMBER 2025');
    const [currentTime] = useState('7:18:42 PM PHT');

    // Calendar Header Component
    const CalendarHeader = ({ month }: any) => (
        <div className="flex justify-between items-center text-white font-bold text-xl h-16 px-4">
            <button className="p-1 rounded-full hover:bg-green-700/50 transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-xl font-semibold">
                <span className='text-sm font-light mr-1'>2025</span>
                {month}
            </span>
            <button className="p-1 rounded-full hover:bg-green-700/50 transition-colors">
                <ArrowRightIcon className="w-5 h-5" />
            </button>
        </div>
    );

    // Calendar Body Component
    const CalendarBody = ({ days }: any) => (
        <div className="grid grid-cols-7 text-white text-center text-sm font-medium pt-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className="py-2 text-white/80 font-normal">{day}</div>
            ))}
            {days.flat().map((date: any, index: number) => {
                // Logic derived from the visual cue in the screenshot
                const isCurrentMonth = index >= 5 && index < 35;
                const isSelected = isCurrentMonth && date === 30; // 30th is selected (highlighted blue)
                const hasEvent = isCurrentMonth && date === 13; // Highlighted yellow dot

                return (
                    <div
                        key={index}
                        className={classNames(
                            'py-3 text-sm font-medium border-r border-b border-white/20 transition-all duration-100 relative',
                            !isCurrentMonth ? 'text-white/40' : 'hover:bg-green-700 cursor-pointer',
                            (index % 7 === 6) && 'border-r-0',
                            (index >= 35) && 'border-b-0',
                            isSelected ? 'bg-yellow-600 shadow-inner' : ''
                        )}
                    >
                        {date}
                        {hasEvent && <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 block w-1.5 h-1.5 bg-yellow-300 rounded-full"></span>}
                    </div>
                )
            })}
        </div>
    );

    // Main Content Area
    return (
        <>
            {/* Top Header/Breadcrumb */}
            <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                <h1 className="text-xl font-medium text-gray-900">Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600 flex items-center cursor-pointer hover:text-indigo-600">
                        <ChevronDownIcon className="w-4 h-4 mr-1 text-gray-400" />
                        Hello! Admin
                    </div>
                </div>
            </header>

            {/* Welcome Banner */}
            <div className="mt-6 mb-8 p-6 bg-white rounded-xl shadow-md border-l-4 border-red-950">
                <h2 className="text-2xl font-bold text-gray-900">
                    Welcome to SR-5 Admin Page!
                </h2>
                <p className="mt-1 text-gray-600 text-sm">
                    Hello, Admin! Manage your branch and track its progress.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    7:18:42 PM PHT
                </p>
            </div>

            {/* Dashboard Grid */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. School Calendar Card */}
                <div className="col-span-1 bg-red-950 rounded-xl shadow-lg overflow-hidden">
                    <CalendarHeader month={currentMonth} />
                    <div className="p-4 bg-red-900/40">
                        <CalendarBody days={calendarDays} />
                    </div>
                </div>

                {/* 2. Upcoming Events Card (White with Green Header) */}
                <div className="col-span-1 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
                    <div className="p-4 bg-red-950 rounded-t-xl text-white">
                        <h3 className="text-xl font-bold">UPCOMING EVENTS</h3>
                        <p className="text-sm font-light">TODAY: 9/30/2025</p>
                    </div>
                    <div className="flex-grow flex items-center justify-center text-center py-16 px-4">
                        <p className="text-gray-400 font-medium text-lg">No upcoming events</p>
                    </div>
                </div>

                {/* 3. Vision & Mission Cards (Blue) */}

            </div>
        </>

    )
}

export default AdminDashboard
