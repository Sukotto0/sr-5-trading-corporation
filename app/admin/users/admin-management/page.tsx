"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@clerk/nextjs";
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/app/actions";
import Image from "next/image";

// --- Types ---
type ClerkAdmin = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  createdAt: number;
  lastSignInAt: number | null;
  adminRole: string;
  assignedBranch: string;
};

type AdminStats = {
  totalAdmins: number;
  superAdmins: number;
  imusBranch: number;
  bacoorBranch: number;
  camaligBranch: number;
};

// --- Configuration Data ---

// Branches that should have their admin count tracked in KPIs
const BRANCHES_FOR_KPI = ["Imus Branch", "Bacoor Branch", "Camalig Branch"];

// Full list of available branches for the dropdown
const availableBranches = ["Imus", "Bacoor", "Camalig"];

const availableRoles = ["admin", "superadmin"];

// --- Helper Functions ---

const classNames = (...classes: any[]) => classes.filter(Boolean).join(" ");

/**
 * Generates KPI data from admin stats
 */
const generateAdminKpiData = (stats: AdminStats) => {
  return [
    {
      name: "Total System Admins",
      icon: ShieldCheckIcon,
      value: stats.totalAdmins.toString(),
      trend: 0.8,
      isPositive: true,
      color: "indigo",
    },
    {
      name: "Super Admin Count",
      icon: KeyIcon,
      value: stats.superAdmins.toString(),
      trend: 10.0,
      isPositive: true,
      color: "green",
    },
    {
      name: "Imus Branch Admins",
      icon: BuildingStorefrontIcon,
      value: stats.imusBranch.toString(),
      trend: 2.5,
      isPositive: stats.imusBranch > 0,
      color: "blue",
    },
    {
      name: "Bacoor Branch Admins",
      icon: BuildingStorefrontIcon,
      value: stats.bacoorBranch.toString(),
      trend: 1.5,
      isPositive: stats.bacoorBranch > 0,
      color: "blue",
    },
    {
      name: "Camalig Branch Admins",
      icon: BuildingStorefrontIcon,
      value: stats.camaligBranch.toString(),
      trend: 3.0,
      isPositive: stats.camaligBranch > 0,
      color: "blue",
    },
  ];
};

// --- Shared Components ---

// KPI Card Component (unchanged)
const KPICard = ({
  name,
  icon: Icon,
  value,
  trend,
  isPositive,
  color,
}: {
  name: string;
  icon: React.ElementType;
  value: string;
  trend: number;
  isPositive: boolean;
  color: string;
}) => {
  const trendClass = isPositive
    ? "text-green-600 bg-green-100"
    : "text-red-600 bg-red-100";

  let iconBgClass;
  if (color === "indigo") {
    iconBgClass = "bg-indigo-500";
  } else if (color === "green") {
    iconBgClass = "bg-emerald-500";
  } else if (color === "blue") {
    iconBgClass = "bg-blue-500";
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

// Modal Base (unchanged)
const ModalBase = ({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/30 bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all"
        onClick={(e) => e.stopPropagation()}
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

// Admin Form Modal (Uses updated availableBranches array)
const AdminFormModal = ({
  isOpen,
  onClose,
  admin,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  admin: any;
  onSave: (admin: any) => void;
}) => {
  const isEdit = !!admin;
  const title = isEdit ? "Edit Admin Role & Branch" : "Grant New Admin Access";

  // Initial form state based on admin prop or empty if adding
  const [formData, setFormData] = React.useState({
    firstName: admin?.firstName || "",
    lastName: admin?.lastName || "",
    email: admin?.email || "",
    username: admin?.username || "",
    password: "",
    adminRole: admin?.adminRole || "admin",
    assignedBranch: admin?.assignedBranch || "Imus",
  });

  React.useEffect(() => {
    setFormData({
      firstName: admin?.firstName || "",
      lastName: admin?.lastName || "",
      email: admin?.email || "",
      username: admin?.username || "",
      password: "",
      adminRole: admin?.adminRole || "admin",
      assignedBranch: admin?.assignedBranch || "Imus",
    });
  }, [admin]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isSuperAdmin = formData.adminRole === "superadmin";

  return (
    <ModalBase title={title} isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && (
          <>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
            </div>
          </>
        )}
        {isEdit && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Editing Admin</p>
            <p className="text-lg font-semibold text-gray-900">
              {formData.firstName} {formData.lastName}
            </p>
            <p className="text-sm text-gray-600">{formData.email}</p>
          </div>
        )}
        <div>
          <label
            htmlFor="adminRole"
            className="block text-sm font-medium text-gray-700"
          >
            Admin Role
          </label>
          <select
            id="adminRole"
            name="adminRole"
            value={formData.adminRole}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="admin">Branch Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
        {!isSuperAdmin && (
          <div>
            <label
              htmlFor="assignedBranch"
              className="block text-sm font-medium text-gray-700"
            >
              Assigned Branch
            </label>
            <select
              id="assignedBranch"
              name="assignedBranch"
              value={formData.assignedBranch}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Imus">Imus Branch</option>
              <option value="Bacoor">Bacoor Branch</option>
              <option value="Camalig">Camalig Branch</option>
            </select>
          </div>
        )}
        {isSuperAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Super Admins</strong> have access to all branches and system-wide permissions.
            </p>
          </div>
        )}
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
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            {isEdit ? "Update Details" : "Grant Access"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

// Delete Confirmation Modal (unchanged)
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  admin,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  admin: any;
  onDelete: (id: number) => void;
}) => {
  if (!admin) return null;

  const handleDelete = () => {
    onDelete(admin.id);
    onClose();
  };

  return (
    <ModalBase title="Revoke Admin Access" isOpen={isOpen} onClose={onClose}>
      <div className="text-gray-700">
        <p>
          Are you sure you want to permanently revoke admin access for{" "}
          <strong className="font-semibold text-gray-900">
            {admin.firstName} {admin.lastName}
          </strong>{" "}
          ({admin.adminRole === "superadmin" ? "Super Admin" : "Branch Admin"}
          {admin.adminRole !== "superadmin" && admin.assignedBranch 
            ? ` at ${admin.assignedBranch} Branch` 
            : ""
          })?
        </p>
        <p className="mt-3 text-sm text-red-600 font-medium">
          This action will demote the user to a standard user. Ensure you
          understand the security implications before proceeding.
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
          Revoke Access
        </button>
      </div>
    </ModalBase>
  );
};

const AdminManagement = () => {
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " PHT"
  );

  // State for admin list
  const [admins, setAdmins] = useState<ClerkAdmin[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalAdmins: 0,
    superAdmins: 0,
    imusBranch: 0,
    bacoorBranch: 0,
    camaligBranch: 0
  });
  const [loading, setLoading] = useState(true);

  // States for Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<ClerkAdmin | null>(null);

  // Check if current user is superadmin
  const isSuperAdmin = (user?.publicMetadata as any)?.adminRole === "superadmin";

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

  // Fetch admins from Clerk
  useEffect(() => {
    fetchAdmins();
  }, [user]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await getAllAdmins(user?.id || "");
      if (response.success) {
        setAdmins(response.admins || []);
        setStats(response.stats || {
          totalAdmins: 0,
          superAdmins: 0,
          imusBranch: 0,
          bacoorBranch: 0,
          camaligBranch: 0
        });
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically calculate all KPI data whenever stats change
  const allKpiData = React.useMemo(
    () => generateAdminKpiData(stats),
    [stats]
  );

  // --- Modal Handlers ---

  const openAddModal = () => {
    setCurrentAdmin(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (admin: ClerkAdmin) => {
    setCurrentAdmin(admin);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (admin: ClerkAdmin) => {
    setCurrentAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  // --- CRUD Handlers ---

  const handleSaveAdmin = async (adminData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    password?: string;
    adminRole: string;
    assignedBranch?: string;
  }) => {
    if (currentAdmin) {
      // Edit existing admin
      const success = await updateAdmin(
        currentAdmin.id,
        adminData.adminRole,
        adminData.assignedBranch
      );
      if (success) {
        await fetchAdmins();
        console.log("Admin updated:", adminData);
      }
    } else {
      // Add new admin
      if (!adminData.email || !adminData.firstName || !adminData.lastName || !adminData.username || !adminData.password) {
        console.error("Missing required fields");
        return;
      }
      const result = await createAdmin({
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        username: adminData.username,
        password: adminData.password,
        adminRole: adminData.adminRole,
        assignedBranch: adminData.assignedBranch,
        userId: user?.id || ""
      });
      if (result.success) {
        await fetchAdmins();
        console.log("Admin created successfully");
      } else {
        console.error("Failed to create admin:", result.error);
        alert(result.error || "Failed to create admin");
      }
    }
  };

  const handleDeleteAdmin = async () => {
    if (currentAdmin) {
      const success = await deleteAdmin(currentAdmin.id);
      if (success) {
        await fetchAdmins();
        console.log("Admin deleted:", currentAdmin.id);
      }
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 md:p-8 min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Branch & Super Admin Management
            </h1>
            <p className="text-sm text-gray-500 mt-2 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" /> Access Control Last Checked:{" "}
              {currentTime}
            </p>
          </div>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition duration-150 text-sm font-semibold w-full sm:w-auto shrink-0"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              Grant New Admin
            </button>
          )}
        </div>
      </header>

      {/* KPI Cards Grid - Now displays all branch counts */}
      {/* Adjusted grid to accommodate the 5 KPIs (2 general + 3 branches) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
        {allKpiData.map((kpi) => (
          <KPICard key={kpi.name} {...kpi} />
        ))}
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            High-Privilege Accounts
          </h2>
          <input
            type="text"
            placeholder="Search admins..."
            className="py-2 px-4 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                  Admin
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                >
                  Branch
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
                    Loading admins...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No admin users found
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10">
                          <Image
                            src={admin.imageUrl}
                            alt={`${admin.firstName} ${admin.lastName}`}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.firstName} {admin.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <span
                        className={classNames(
                          admin.adminRole === "superadmin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800",
                          "px-3 inline-flex text-xs leading-5 font-semibold rounded-full capitalize"
                        )}
                      >
                        {admin.adminRole === "superadmin" ? "Super Admin" : "Branch Admin"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {admin.adminRole === "superadmin" ? (
                        <span className="px-3 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                          All Branches
                        </span>
                      ) : (
                        <span className="px-3 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {admin.assignedBranch || "Not Assigned"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={classNames(
                          admin.lastSignInAt
                            ? (Date.now() - admin.lastSignInAt) / (1000 * 60 * 60 * 24) <= 7
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800",
                          "px-3 inline-flex text-xs leading-5 font-semibold rounded-full"
                        )}
                      >
                        {admin.lastSignInAt
                          ? (Date.now() - admin.lastSignInAt) / (1000 * 60 * 60 * 24) <= 7
                            ? "Active"
                            : "Inactive"
                          : "Never Logged In"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {isSuperAdmin && (
                          <>
                            <button
                              title="Edit Role/Branch"
                              onClick={() => openEditModal(admin)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              title="Revoke Admin Access"
                              onClick={() => openDeleteModal(admin)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
      <AdminFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        admin={currentAdmin}
        onSave={handleSaveAdmin}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        admin={currentAdmin}
        onDelete={handleDeleteAdmin}
      />
    </div>
  );
};

export default AdminManagement;
