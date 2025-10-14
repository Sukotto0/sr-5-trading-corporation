"use client";

import React from "react";
import {
  UsersIcon,
  UserGroupIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EllipsisVerticalIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// --- Mock Data ---

// Key Performance Indicators for User Management
const userKpiData = [
  {
    name: "Total Users",
    icon: UsersIcon,
    value: "1,450",
    trend: 8.5,
    isPositive: true,
    color: "indigo",
  },
  {
    name: "Active Users (Last 7 Days)",
    icon: UserGroupIcon,
    value: "1,120",
    trend: 1.2,
    isPositive: true,
    color: "green",
  },
  {
    name: "New Signups (This Month)",
    icon: UserPlusIcon,
    value: "155",
    trend: 4.0,
    isPositive: false, // Example of a negative trend
    color: "red",
  },
];

// Mock list of users
const mockUsers = [
  {
    id: 1001,
    name: "Alice Johnson",
    email: "alice.j@example.com",
    role: "Admin",
    status: "Active",
    signupDate: "2023-01-15",
  },
  {
    id: 1002,
    name: "Bob Smith",
    email: "bob.s@example.com",
    role: "Editor",
    status: "Active",
    signupDate: "2023-03-22",
  },
  {
    id: 1003,
    name: "Charlie Brown",
    email: "charlie.b@example.com",
    role: "Viewer",
    status: "Inactive",
    signupDate: "2024-05-01",
  },
  {
    id: 1004,
    name: "Dana Scully",
    email: "dana.s@example.com",
    role: "Editor",
    status: "Active",
    signupDate: "2024-06-10",
  },
  {
    id: 1005,
    name: "Ethan Hunt",
    email: "ethan.h@example.com",
    role: "Viewer",
    status: "Active",
    signupDate: "2024-07-19",
  },
  {
    id: 1006,
    name: "Fiona Glenn",
    email: "fiona.g@example.com",
    role: "Admin",
    status: "Active",
    signupDate: "2024-02-14",
  },
  {
    id: 1007,
    name: "George King",
    email: "george.k@example.com",
    role: "Viewer",
    status: "Suspended",
    signupDate: "2024-01-01",
  },
];

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
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300"
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

const UserFormModal = ({ isOpen, onClose, user, onSave }: any) => {
  const isEdit = !!user;
  const title = isEdit ? "Edit User Account" : "Add New User";

  // Initial form state based on user prop or empty if adding
  const [formData, setFormData] = React.useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "Viewer", // Role is still needed for form functionality
    status: user?.status || "Active",
  });

  // Reset form data when user prop changes (e.g., when opening for a new user)
  React.useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "Viewer",
      status: user?.status || "Active",
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
    onClose();
  };

  return (
    <ModalBase title={title} isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
        <div className="flex justify-end pt-4 space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-700 transition"
          >
            {isEdit ? "Save Changes" : "Create User"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, user, onDelete }: any) => {
  // Only proceed if a user object is provided
  if (!user) return null;

  const handleDelete = () => {
    onDelete(user.id);
    onClose();
  };

  return (
    <ModalBase title="Confirm Deletion" isOpen={isOpen} onClose={onClose}>
      <div className="text-gray-700">
        <p>
          Are you sure you want to permanently delete the user{" "}
          <strong className="font-semibold text-gray-900">{user.name}</strong>?
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
  const [currentTime] = React.useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " PHT"
  );

  // State for user list
  const [users, setUsers] = React.useState(mockUsers);

  // States for Modals
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null); // User object for edit/delete

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-yellow-100 text-yellow-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --- Modal Handlers ---

  const openAddModal = () => {
    setCurrentUser(null); // Clear previous user data
    setIsFormModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setCurrentUser(user);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (user: any) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  // --- CRUD Handlers (Placeholders) ---

  const handleSaveUser = (userData: any) => {
    if (userData.id) {
      // Edit existing user
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userData.id ? userData : u))
      );
      console.log("User Edited:", userData);
    } else {
      // Add new user
      setUsers((prevUsers) => {
        const newId = Math.max(...prevUsers.map((u) => u.id), 0) + 1;
        const newUser = {
          ...userData,
          id: newId,
          signupDate: new Date().toISOString().slice(0, 10),
        };
        console.log("User Added:", newUser);
        return [...prevUsers, newUser];
      });
    }
  };

  const handleDeleteUser = (userId: number) => {
    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
    console.log("User Deleted:", userId);
  };

  return (
    <div className="bg-white p-6 sm:p-8 min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            User Management Dashboard
          </h1>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-emerald-700 transition duration-150 text-sm font-semibold"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Add New User
          </button>
        </div>
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
                  User ID
                </th>
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
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {user.signupDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={classNames(
                        getStatusClasses(user.status),
                        "px-3 inline-flex text-xs leading-5 font-semibold rounded-full"
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        title="Edit User"
                        onClick={() => openEditModal(user)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete User"
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <button
                        title="More Actions"
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors hidden lg:block"
                      >
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        user={currentUser}
        onSave={handleSaveUser}
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
