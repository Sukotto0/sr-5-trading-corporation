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

const navigation = [
    { name: 'Dashboard', icon: HomeIcon, current: true, section: 'GENERAL', href: '/admin/dashboard' },
    { name: 'Manage Inventory', icon: ShoppingBasket, current: false, section: 'GENERAL', href: '/admin/inventory' },
    { name: 'Scheduled Visit', icon: CalendarIcon, current: false, section: 'GENERAL', href: '/admin/scheduled-visit' },
    { name: 'Sales Management', icon: ChartAreaIcon, current: false, section: 'GENERAL', href: '/admin/sales' },
    { name: 'Settings', icon: Cog8ToothIcon, current: false, section: 'GENERAL', href: '/admin/settings' },
    { name: 'Admin Management', icon: UsersIcon, current: false, section: 'ADMIN', href: '/admin/admin-management' },
];


function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Sidebar() {

    return (
        (
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
                        href={item.href}
                        className={classNames(
                            item.current
                                ? 'bg-yellow-600 text-white shadow-lg'
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
    )
    )
} 