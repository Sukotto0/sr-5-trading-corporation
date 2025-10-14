"use client";

import React from "react";
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
} from "@heroicons/react/24/outline";

// --- Configuration Data ---

// Branches that should have their admin count tracked in KPIs
const BRANCHES_FOR_KPI = ["Imus Branch", "Bacoor Branch", "Albay Branch"];

// Full list of available branches for the dropdown, including N/A for Super Admins
const availableBranches = [...BRANCHES_FOR_KPI, "N/A"];

const availableRoles = ["Branch Admin", "Super Admin"];

// Mock list of Admin users, updated to include an Imus Branch admin
const mockAdmins = [
  {
    id: 2001,
    name: "Alexander Pierce",
    email: "alex.p@admin.com",
    role: "Super Admin",
    branch: "N/A",
    status: "Active",
    lastLogin: "2024-10-15",
  },
  {
    id: 2002,
    name: "Brenna Velez",
    email: "brenna.v@admin.com",
    role: "Branch Admin",
    branch: "Bacoor Branch",
    status: "Active",
    lastLogin: "2024-10-14",
  },
  {
    id: 2003,
    name: "Curtis Holt",
    email: "curtis.h@admin.com",
    role: "Branch Admin",
    branch: "Albay Branch",
    status: "Inactive",
    lastLogin: "2024-09-01",
  },
  {
    id: 2004,
    name: "Diana Troy",
    email: "diana.t@admin.com",
    role: "Super Admin",
    branch: "N/A",
    status: "Active",
    lastLogin: "2024-10-15",
  },
  {
    id: 2005,
    name: "Edward Nigma",
    email: "edward.n@admin.com",
    role: "Branch Admin",
    branch: "Bacoor Branch",
    status: "Suspended",
    lastLogin: "2024-08-20",
  },
  // New admin for Imus Branch
  {
    id: 2006,
    name: "Flora Imus",
    email: "flora.i@admin.com",
    role: "Branch Admin",
    branch: "Imus Branch",
    status: "Active",
    lastLogin: "2024-10-15",
  },
];

// --- Helper Functions ---

const classNames = (...classes: any[]) => classes.filter(Boolean).join(" ");

/**
 * Calculates the number of Branch Admins and Super Admins for KPI display.
 * @param {Array} admins The list of admin objects.
 * @returns {Array} Formatted KPI data objects.
 */
const generateAdminKpiData = (admins: any[]) => {
  // 1. Calculate Branch-specific counts
  const branchCounts: { [key: string]: number } = {};
  BRANCHES_FOR_KPI.forEach((branch) => {
    // Only count 'Branch Admin' roles for branch KPIs
    branchCounts[branch] = admins.filter(
      (admin) => admin.branch === branch && admin.role === "Branch Admin"
    ).length;
  });

  // 2. Define static KPIs
  const baseKpis = [
    {
      name: "Total System Admins",
      icon: ShieldCheckIcon,
      value: admins.length.toString(),
      trend: 0.8,
      isPositive: false,
      color: "indigo",
    },
    {
      name: "Super Admin Count",
      icon: KeyIcon,
      value: admins.filter((a) => a.role === "Super Admin").length.toString(),
      trend: 10.0,
      isPositive: true,
      color: "green",
    },
  ];

  // 3. Generate dynamic Branch KPIs
  const branchKpis = BRANCHES_FOR_KPI.map((branch) => ({
    name: `${branch} Admins`,
    icon: BuildingStorefrontIcon,
    value: branchCounts[branch].toString(),
    // Mock trend data for consistency
    trend: Math.floor(Math.random() * 5) + 0.5,
    isPositive: branchCounts[branch] > 0,
    color: "blue",
  }));

  // Combine and return all KPIs
  return [...baseKpis, ...branchKpis];
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
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300"
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
    name: admin?.name || "",
    email: admin?.email || "",
    role: admin?.role || availableRoles[0],
    branch: admin?.branch || availableBranches[0],
    status: admin?.status || "Active",
  });

  React.useEffect(() => {
    setFormData({
      name: admin?.name || "",
      email: admin?.email || "",
      role: admin?.role || availableRoles[0],
      branch: admin?.branch || availableBranches[0],
      status: admin?.status || "Active",
    });
  }, [admin]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave({ ...admin, ...formData });
    onClose();
  };

  const isSuperAdmin = formData.role === "Super Admin";

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
            disabled={isEdit}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
            disabled={isEdit}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Admin Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="branch"
            className="block text-sm font-medium text-gray-700"
          >
            Assigned Branch
            {isSuperAdmin && (
              <span className="text-xs text-red-500 ml-2">
                (Role is System-Wide)
              </span>
            )}
          </label>
          <select
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {availableBranches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Account Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
          <strong className="font-semibold text-gray-900">{admin.name}</strong>{" "}
          ({admin.role} at {admin.branch})?
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
  const [currentTime] = React.useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " PHT"
  );

  // State for admin list
  const [admins, setAdmins] = React.useState(mockAdmins);

  // States for Modals
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [currentAdmin, setCurrentAdmin] = React.useState(null); // Admin object for edit/delete

  // Dynamically calculate all KPI data whenever the admin list changes
  const allKpiData = React.useMemo(
    () => generateAdminKpiData(admins),
    [admins]
  );

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

  // Helper function for role styling
  const getRoleClasses = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "bg-purple-600 text-white font-extrabold";
      case "Branch Admin":
        return "bg-indigo-100 text-indigo-800 font-semibold";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Helper function for branch styling (less prominent for separation)
  const getBranchClasses = (branch: string) => {
    // Assigning specific colors for better visual distinction on the table
    switch (branch) {
      case "Imus Branch":
        return "bg-blue-50 text-blue-700";
      case "Bacoor Branch":
        return "bg-teal-50 text-teal-700";
      case "Albay Branch":
        return "bg-emerald-50 text-emerald-700";
      default:
        return "bg-gray-200 text-gray-500";
    }
  };

  // --- Modal Handlers ---

  const openAddModal = () => {
    setCurrentAdmin(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (admin: any) => {
    setCurrentAdmin(admin);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (admin: any) => {
    setCurrentAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  // --- CRUD Handlers (Placeholders) ---

  const handleSaveAdmin = (adminData: any) => {
    if (adminData.id) {
      // Edit existing admin
      setAdmins((prevAdmins) =>
        prevAdmins.map((a) => (a.id === adminData.id ? adminData : a))
      );
      console.log("Admin Permissions Updated:", adminData);
    } else {
      // Add new admin
      setAdmins((prevAdmins) => {
        const newId = Math.max(...prevAdmins.map((a) => a.id), 0) + 1;
        const newAdmin = {
          ...adminData,
          id: newId,
          lastLogin: new Date().toISOString().slice(0, 10),
        };
        console.log("Admin Added:", newAdmin);
        return [...prevAdmins, newAdmin];
      });
    }
  };

  const handleDeleteAdmin = (adminId: number) => {
    setAdmins((prevAdmins) => prevAdmins.filter((a) => a.id !== adminId));
    console.log("Admin Access Revoked:", adminId);
  };

  return (
    <div className="bg-gray-50 p-6 sm:p-8 min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Branch & Super Admin Management
          </h1>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition duration-150 text-sm font-semibold"
          >
            <BuildingStorefrontIcon className="w-5 h-5 mr-2" />
            Grant New Admin
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2 flex items-center">
          <ClockIcon className="w-4 h-4 mr-1" /> Access Control Last Checked:{" "}
          {currentTime}
        </p>
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
                  Admin ID
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
              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{admin.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {admin.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span
                      className={classNames(
                        getRoleClasses(admin.role),
                        "px-3 inline-flex text-xs leading-5 font-semibold rounded-full"
                      )}
                    >
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <span
                      className={classNames(
                        getBranchClasses(admin.branch),
                        "px-3 inline-flex text-xs leading-5 font-semibold rounded-full"
                      )}
                    >
                      {admin.branch}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={classNames(
                        getStatusClasses(admin.status),
                        "px-3 inline-flex text-xs leading-5 font-semibold rounded-full"
                      )}
                    >
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        title="Edit Role/Branch/Status"
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
                    </div>
                  </td>
                </tr>
              ))}
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
