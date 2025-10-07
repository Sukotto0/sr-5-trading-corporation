"use client"
import React, { useState } from 'react';
import {
    HomeIcon,
    CalendarIcon,
    UsersIcon,
    MapIcon,
    DocumentChartBarIcon,
    Cog8ToothIcon,
    ArrowLeftOnRectangleIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    ChevronDownIcon,
    UserCircleIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { ChartAreaIcon, ShoppingBasket } from 'lucide-react';

// --- Static Data for Navigation and Calendar ---

const navigation = [
    { name: 'Dashboard', icon: HomeIcon, current: true, section: 'GENERAL' },
    { name: 'Manage Inventory', icon: ShoppingBasket, current: false, section: 'GENERAL' },
    { name: 'Scheduled Visit', icon: CalendarIcon, current: false, section: 'GENERAL' },
    { name: 'Sales Management', icon: ChartAreaIcon, current: false, section: 'GENERAL' },
    { name: 'Settings', icon: Cog8ToothIcon, current: false, section: 'GENERAL' },
    { name: 'Admin Management', icon: UsersIcon, current: false, section: 'ADMIN' },
];

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

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

// --- Component Definition ---

const AdminDashboard = () => {
    // State for the calendar (static data for now)
    const [currentMonth] = useState('SEPTEMBER 2025');
    const [currentTime] = useState('7:18:42 PM PHT'); 

    // Calendar Header Component
    const CalendarHeader = ({ month }) => (
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
    const CalendarBody = ({ days }) => (
        <div className="grid grid-cols-7 text-white text-center text-sm font-medium pt-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className="py-2 text-white/80 font-normal">{day}</div>
            ))}
            {days.flat().map((date, index) => {
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
                            isSelected ? 'bg-indigo-600 shadow-inner' : ''
                        )}
                    >
                        {date}
                        {hasEvent && <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 block w-1.5 h-1.5 bg-yellow-300 rounded-full"></span>}
                    </div>
                )
            })}
        </div>
    );

    // Sidebar Component
    const Sidebar = () => (
        <div className="fixed top-0 left-0 h-full w-64 bg-emerald-600 flex flex-col z-20 shadow-2xl">
            {/* Logo/Header */}
            <div className="flex items-center justify-start h-20 bg-emerald-900 text-white font-bold text-xl px-4 border-b border-white/10">
                <Image src='/images/SR5MoreMinimal.png' alt='SR-5 Corporation Logo' width={30} height={30} className="mr-3 text-indigo-500"/>
                SR-5 Corporation
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-white/10 text-black">
                <div className="flex items-center space-x-3">
                    <UserCircleIcon className="w-10 h-10 text-black-400" />
                    <div>
                        <p className="text-sm font-semibold">Admin</p>
                        <a href="#" className="text-xs text-black-300 hover:text-indigo-100 transition-colors">View profile</a>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-grow overflow-y-auto p-4 space-y-1">
                <p className="px-3 pt-2 pb-2 text-xs font-semibold uppercase text-black/90">GENERAL</p>
                {navigation.filter(item => item.section === 'GENERAL').map((item) => (
                    <a
                        key={item.name}
                        href="#"
                        className={classNames(
                            item.current
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-black/90 hover:bg-white/60 hover:text-black',
                            'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150'
                        )}
                    >
                        <item.icon className={classNames(item.current ? 'text-white' : 'text-black/90', 'mr-3 h-5 w-5')} aria-hidden="true" />
                        {item.name}
                    </a>
                ))}
            </nav>

            {/* Log Out Button */}
            <div className="mt-auto p-4">
                <button className="flex items-center justify-center w-full px-4 py-3 bg-red-950 text-white font-semibold text-lg rounded-lg shadow-xl hover:bg-red-700 transition-colors duration-150">
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                    LOG OUT
                </button>
            </div>
        </div>
    );

    // Main Content Area
    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar />

            <div className="ml-64 p-8">
                {/* Top Header/Breadcrumb */}
                <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                    <h1 className="text-xl font-medium text-gray-900">DASHBOARD</h1>
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
                <div className="width-100 grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            </div>
        </div>
    )
}

export default AdminDashboard
