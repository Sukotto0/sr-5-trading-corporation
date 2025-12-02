"use client";

import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  UserGroupIcon,
  UserPlusIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { getAllUsers, updateUserMetadata, deleteUser } from "@/app/actions";
import Image from "next/image";

// --- Types ---
type ClerkUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  createdAt: number;
  lastSignInAt: number | null;
  publicMetadata: any;
  privateMetadata: any;
  unsafeMetadata: any;
};

type UserStats = {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  totalTrend: number;
  activeTrend: number;
  signupTrend: number;
};

// --- Helper Functions ---

const classNames = (...classes: any[]) => classes.filter(Boolean).join(" ");

// --- Component Definitions ---

// KPI Card Component (reused logic from the example)
const KPICard = ({ name, icon: Icon, value, trend, isPositive, color }: any) => {
  const trendClass = isPositive
    ? "text-green-600 bg-green-100"
    : "text-red-600 bg-red-100";

  // Adjusted icon background color based on the provided colors (indigo, green, red)
  let iconBgClass;
  if (color === "indigo") {
    iconBgClass = "bg-indigo-500";
  } else if (color === "green") {
    iconBgClass = "bg-emerald-500"; // Using emerald for better consistency with previous file
  } else {
    iconBgClass = "bg-red-500";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transition-shadow hover:shadow-xl border border-gray-100">
      <div className="flex items-center justify-between">
        <div
          className={classNames(
            iconBgClass,
            "text-white p-3 rounded-full shadow-md"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div
          className={classNames(
            trendClass,
            "flex items-center text-xs font-semibold px-3 py-1 rounded-full"
          )}
        >
          {isPositive ? (
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
          )}
          {trend}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{name}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

// --- Modal Components ---

const ModalBase = ({ title, isOpen, onClose, children }: any) => {
  if (!isOpen) return null;

  return (
    // Modal Overlay
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/30 bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose} // Close modal when clicking outside
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// View User Details Modal
const ViewUserModal = ({ isOpen, onClose, user }: any) => {
  if (!user) return null;

  return (
    <ModalBase title="User Details" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center space-x-4 pb-4 border-b">
          <div className="shrink-0">
            <Image
              src={user.imageUrl}
              alt={`${user.firstName} ${user.lastName}`}
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">User ID</label>
          <p className="mt-1 text-sm text-gray-900 font-mono break-all">{user.id}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sign Up Date</label>
          <p className="mt-1 text-sm text-gray-900">
            {new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Sign In</label>
          <p className="mt-1 text-sm text-gray-900">
            {user.lastSignInAt 
              ? new Date(user.lastSignInAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Never signed in'
            }
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Account Status</label>
          <span
            className={classNames(
              getStatusClasses(user.lastSignInAt),
              "mt-1 inline-flex px-3 py-1 text-xs font-semibold rounded-full"
            )}
          >
            {getStatusText(user.lastSignInAt)}
          </span>
        </div>
      </div>

      <div className="flex justify-end pt-6 space-x-3 border-t mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>
    </ModalBase>
  );
};

const getStatusClasses = (lastSignIn: number | null) => {
  if (!lastSignIn) return "bg-gray-100 text-gray-800";
  
  const daysSinceSignIn = (Date.now() - lastSignIn) / (1000 * 60 * 60 * 24);
  if (daysSinceSignIn <= 7) return "bg-green-100 text-green-800";
  if (daysSinceSignIn <= 30) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

const getStatusText = (lastSignIn: number | null) => {
  if (!lastSignIn) return "Never signed in";
  
  const daysSinceSignIn = (Date.now() - lastSignIn) / (1000 * 60 * 60 * 24);
  if (daysSinceSignIn <= 7) return "Active";
  if (daysSinceSignIn <= 30) return "Inactive";
  return "Dormant";
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, user, onDelete }: any) => {
  if (!user) return null;

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <ModalBase title="Confirm Deletion" isOpen={isOpen} onClose={onClose}>
      <div className="text-gray-700">
        <p>
          Are you sure you want to permanently delete the user{" "}
          <strong className="font-semibold text-gray-900">
            {user.firstName} {user.lastName}
          </strong>?
        </p>
        <p className="mt-3 text-sm text-red-600 font-medium">
          This action cannot be undone. All data associated with this user will
          be lost.
        </p>
      </div>
      <div className="flex justify-end pt-6 space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition"
        >
          Delete User
        </button>
      </div>
    </ModalBase>
  );
};

const UserManagement = () => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " PHT"
  );

  // State for user list
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newSignups: 0,
    totalTrend: 0,
    activeTrend: 0,
    signupTrend: 0
  });
  const [loading, setLoading] = useState(true);

  // States for Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<ClerkUser | null>(null);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }) + " PHT"
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch users from Clerk
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      console.log(response.users)
      if (response.success) {
        setUsers(response.users || []);
        setStats(response.stats || {
          totalUsers: 0,
          activeUsers: 0,
          newSignups: 0,
          totalTrend: 0,
          activeTrend: 0,
          signupTrend: 0
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClasses = (lastSignIn: number | null) => {
    if (!lastSignIn) return "bg-gray-100 text-gray-800";
    
    const daysSinceSignIn = (Date.now() - lastSignIn) / (1000 * 60 * 60 * 24);
    if (daysSinceSignIn <= 7) return "bg-green-100 text-green-800";
    if (daysSinceSignIn <= 30) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusText = (lastSignIn: number | null) => {
    if (!lastSignIn) return "Never signed in";
    
    const daysSinceSignIn = (Date.now() - lastSignIn) / (1000 * 60 * 60 * 24);
    if (daysSinceSignIn <= 7) return "Active";
    if (daysSinceSignIn <= 30) return "Inactive";
    return "Dormant";
  };

  // Create dynamic KPI data
  const userKpiData = [
    {
      name: "Total Users",
      icon: UsersIcon,
      value: stats.totalUsers.toString(),
      trend: stats.totalTrend,
      isPositive: stats.totalTrend >= 0,
      color: "indigo",
    },
    {
      name: "Active Users (Last 7 Days)",
      icon: UserGroupIcon,
      value: stats.activeUsers.toString(),
      trend: stats.activeTrend,
      isPositive: stats.activeTrend >= 0,
      color: "green",
    },
    {
      name: "New Signups (This Month)",
      icon: UserPlusIcon,
      value: stats.newSignups.toString(),
      trend: stats.signupTrend,
      isPositive: stats.signupTrend >= 0,
      color: "red",
    },
  ];

  // --- Modal Handlers ---

  const openViewModal = (user: ClerkUser) => {
    setCurrentUser(user);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (user: ClerkUser) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  // --- CRUD Handlers ---

  const handleDeleteUser = async () => {
    if (currentUser) {
      const success = await deleteUser(currentUser.id);
      if (success) {
        await fetchUsers(); // Refresh the list
        console.log("User deleted:", currentUser.id);
      }
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          User Management Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-2 flex items-center">
          <ClockIcon className="w-4 h-4 mr-1" /> Last Updated: {currentTime}
        </p>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {userKpiData.map((kpi) => (
          <KPICard key={kpi.name} {...kpi} />
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">System Users</h2>
          <input
            type="text"
            placeholder="Search users..."
            className="py-2 px-4 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Table Structure */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                >
                  Signup Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10">
                          <Image
                            src={user.imageUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={classNames(
                          getStatusClasses(user.lastSignInAt),
                          "px-3 inline-flex text-xs leading-5 font-semibold rounded-full"
                        )}
                      >
                        {getStatusText(user.lastSignInAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          title="View Details"
                          onClick={() => openViewModal(user)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete User"
                          onClick={() => openDeleteModal(user)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={currentUser}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        user={currentUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default UserManagement;
