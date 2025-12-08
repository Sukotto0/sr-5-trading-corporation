"use client";
import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  Filter,
} from "lucide-react";
import { getAppointmentsByUser, cancelAppointment, autoCompleteAppointments } from "@/app/actions";
import { useUser } from "@clerk/nextjs";

type Appointment = {
  _id: string;
  firstName: string;
  surname: string;
  contactNumber: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  purpose: string;
  details?: string;
  status?: string;
  completedBy?: string;
  createdAt: string;
  lastUpdated: string;
  userId: string;
};

// Utility function to get status theme
const getStatusTheme = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return {
        color: "text-emerald-600",
        icon: CheckCircle,
        bgColor: "bg-emerald-100",
        dotColor: "bg-emerald-500",
      };
    case "completed":
      return {
        color: "text-green-600",
        icon: CheckCircle,
        bgColor: "bg-green-100",
        dotColor: "bg-green-500",
      };
    case "auto-completed":
      return {
        color: "text-teal-600",
        icon: CheckCircle,
        bgColor: "bg-teal-100",
        dotColor: "bg-teal-500",
      };
    case "cancelled":
    case "rejected":
      return {
        color: "text-red-600",
        icon: XCircle,
        bgColor: "bg-red-100",
        dotColor: "bg-red-500",
      };
    case "pending":
    case "scheduled":
      return {
        color: "text-blue-600",
        icon: AlertCircle,
        bgColor: "bg-blue-100",
        dotColor: "bg-blue-500",
      };
    default:
      return {
        color: "text-gray-600",
        icon: Clock,
        bgColor: "bg-gray-100",
        dotColor: "bg-gray-500",
      };
  }
};

// --- Appointment Detail Modal Component ---
const AppointmentDetailModal = ({ appointment, onClose, onCancel }: any) => {
  if (!appointment) return null;

  const { color, icon: Icon, bgColor } = getStatusTheme(appointment.status);
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  const formattedDate = new Date(appointment.preferredDate).toLocaleDateString(
    "en-US",
    dateOptions
  );
  const formattedTime = new Date(
    `1970-01-01T${appointment.preferredTime}`
  ).toLocaleTimeString("en-US", timeOptions);

  const createdDate = new Date(appointment.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Check if appointment can be cancelled (at least 2 days before)
  const appointmentDate = new Date(appointment.preferredDate);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const twoDaysFromNow = new Date(currentDate);
  twoDaysFromNow.setDate(currentDate.getDate() + 2);
  
  const canCancel = appointmentDate >= twoDaysFromNow && 
                    appointment.status !== 'cancelled' && 
                    appointment.status !== 'completed' &&
                    appointment.status !== 'auto-completed';
  const isCancelled = appointment.status === 'cancelled';

  return (
    <div
      className="fixed inset-0 bg-black/40 bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100 my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Themed) */}
        <div className={`p-6 sm:p-8 text-center ${bgColor}`}>
          <Icon className={`w-12 h-12 ${color} mx-auto mb-3`} />
          <h2 className="text-2xl font-bold text-gray-900">
            {appointment.purpose}
          </h2>
          <p className="text-lg font-semibold mt-2 text-gray-700">
            {appointment.status === 'auto-completed' ? 'Completed' : 
             appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Scheduled'}
          </p>
          {/* {(appointment.status === 'completed' || appointment.status === 'auto-completed') && appointment.completedBy && (
            <p className="text-sm text-gray-600 mt-1">
              {appointment.completedBy === 'admin' ? '(Marked by Admin)' : '(Auto-completed by System)'}
            </p>
          )} */}
        </div>

        {/* Details Body */}
        <div className="p-6 sm:p-8 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 gap-4">
            <DetailRow
              icon={Calendar}
              label="Date"
              value={formattedDate}
            />
            <DetailRow
              icon={Clock}
              label="Time"
              value={formattedTime}
            />
            <DetailRow
              icon={User}
              label="Name"
              value={`${appointment.firstName} ${appointment.surname}`}
            />
            <DetailRow
              icon={Mail}
              label="Email"
              value={appointment.email}
            />
            <DetailRow
              icon={Phone}
              label="Phone"
              value={appointment.contactNumber}
            />
            <DetailRow
              icon={MapPin}
              label="Location"
              value={appointment.location}
            />
            {appointment.details && (
              <DetailRow
                icon={MapPin}
                label="Details"
                value={appointment.details}
              />
            )}
            <DetailRow
              icon={CalendarDays}
              label="Booked On"
              value={createdDate}
            />
          </div>
        </div>

        {/* Cancellation Warning */}
        {!isCancelled && (
          <div className="px-6 pb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-blue-900">
                <strong>Cancellation Policy:</strong> Appointments must be cancelled at least 2 days before the scheduled date. 
                {canCancel ? " You can cancel this appointment." : " This appointment can no longer be cancelled."}
              </p>
            </div>
          </div>
        )}

        {/* Footer / Action */}
        <div className="flex gap-4 p-4 border-t border-gray-100 bg-gray-50">
          {canCancel && (
            <button
              className="flex-1 bg-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-red-700 transition duration-150"
              onClick={() => onCancel(appointment._id)}
            >
              Cancel Appointment
            </button>
          )}
          <button
            className={`${canCancel ? 'flex-1' : 'w-full'} bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-emerald-700 transition duration-150`}
            onClick={onClose}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper for Modal Details
const DetailRow = ({ icon: Icon, label, value }: any) => (
  <div className="flex justify-between items-start py-2">
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5 text-gray-400" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <span className="text-sm text-gray-900 font-semibold text-right max-w-[60%]">
      {value}
    </span>
  </div>
);

// --- Main Appointments Component ---
const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("upcoming");
  const [completionFilter, setCompletionFilter] = useState<string>("all");

  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      console.log("🔑 Your Clerk userId:", user.id);
      setLoading(true);
      
      // First auto-complete any past appointments
      autoCompleteAppointments().then(() => {
        // Then fetch appointments
        return getAppointmentsByUser(user.id);
      })
        .then((data) => {
          console.log("Fetched appointments:", data);
          if (data && Array.isArray(data)) {
            // Additional client-side filtering to ensure only current user's appointments
            const userAppointments = data.filter(
              (appointment: Appointment) => appointment.userId === user.id
            );
            console.log("Filtered user appointments:", userAppointments.length);
            setAppointments(userAppointments);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [user]);

  const openModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setIsModalOpen(false);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await cancelAppointment(appointmentId, user?.id || "");
      if (result.success) {
        alert("Appointment cancelled successfully!");
        // Refresh appointments list
        const data = await getAppointmentsByUser(user?.id || "");
        if (data && Array.isArray(data)) {
          const userAppointments = data.filter(
            (appointment: Appointment) => appointment.userId === user?.id
          );
          setAppointments(userAppointments);
        }
        closeModal();
      } else {
        alert(result.error || "Failed to cancel appointment. Please try again.");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  // Filter and sort appointments
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  let filteredAppointments = appointments;
  
  // Time filter (upcoming/all/past)
  if (timeFilter === "upcoming") {
    filteredAppointments = filteredAppointments.filter((appt) => {
      const apptDate = new Date(appt.preferredDate);
      apptDate.setHours(0, 0, 0, 0);
      return apptDate >= currentDate;
    });
  } else if (timeFilter === "past") {
    filteredAppointments = filteredAppointments.filter((appt) => {
      const apptDate = new Date(appt.preferredDate);
      apptDate.setHours(0, 0, 0, 0);
      return apptDate < currentDate;
    });
  }
  
  // Status filter (scheduled/completed/cancelled/etc)
  if (statusFilter !== "all") {
    filteredAppointments = filteredAppointments.filter(
      (appt) => (appt.status || 'scheduled').toLowerCase() === statusFilter.toLowerCase()
    );
  }
  
  // Completion filter (marked by admin vs auto-completed vs not completed)
  if (completionFilter === "Marked-completed") {
    filteredAppointments = filteredAppointments.filter(
      (appt) => appt.status === 'completed' && appt.completedBy === 'admin'
    );
  } else if (completionFilter === "auto-completed") {
    filteredAppointments = filteredAppointments.filter(
      (appt) => appt.status === 'auto-completed' || (appt.status === 'completed' && appt.completedBy === 'system')
    );
  } else if (completionFilter === "not-completed") {
    filteredAppointments = filteredAppointments.filter(
      (appt) => appt.status !== 'completed' && appt.status !== 'auto-completed' && appt.status !== 'cancelled'
    );
  }

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    // Sort by appointment date (upcoming first for upcoming filter, recent first otherwise)
    const aDate = new Date(a.preferredDate).getTime();
    const bDate = new Date(b.preferredDate).getTime();
    if (timeFilter === "upcoming") {
      // For upcoming: earliest date first
      if (aDate !== bDate) {
        return aDate - bDate;
      }
    } else {
      // For all/past: most recent first
      if (aDate !== bDate) {
        return bDate - aDate;
      }
    }
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  // Calculate pagination values
  const totalItems = sortedAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedAppointments.slice(startIndex, endIndex);
  const showingFrom = totalItems > 0 ? startIndex + 1 : 0;
  const showingTo = Math.min(endIndex, totalItems);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, timeFilter, completionFilter]);

  // Get unique statuses for filter options
  const uniqueStatuses = Array.from(
    new Set(appointments.map((appt) => appt.status || 'scheduled'))
  );

  return (
    <div className="bg-white min-h-screen flex items-start justify-center">
      <div className="w-full bg-white rounded-3xl overflow-hidden">
        {/* --- Header Section --- */}
        <div className="p-6 sm:p-8 bg-white border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <CalendarDays className="w-8 h-8 text-emerald-600" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  My Appointments
                </h1>
              </div>
              <p className="text-md text-gray-600">
                View and manage all your scheduled appointments.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Time Period Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Period:</span>
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-w-[130px]"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="all">All Dates</option>
                    <option value="past">Past</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-w-[130px]"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    {/* <option value="auto-completed">Auto-Completed</option> */}
                    {/* <option value="cancelled">Cancelled</option> */}
                  </select>
                </div>

                {/* Completion Type Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Completion:</span>
                  <select
                    value={completionFilter}
                    onChange={(e) => setCompletionFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-w-[150px]"
                  >
                    <option value="all">All Types</option>
                    <option value="not-completed">Not Completed</option>
                    {/* <option value="admin-completed">Marked Completed</option> */}
                    {/* <option value="auto-completed">Auto-Completed</option> */}
                  </select>
                </div>
              </div>
              
              {/* Active Filter Summary */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span>Showing:</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                  {timeFilter === "upcoming" ? "Upcoming" : timeFilter === "past" ? "Past" : "All"} appointments
                </span>
                {statusFilter !== "all" && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </span>
                )}
                {completionFilter !== "all" && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    {completionFilter === "not-completed" ? "Not Completed" : 
                     completionFilter === "admin-completed" ? "Marked Completed" : "Auto-Completed"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Appointments Table --- */}
        <div className="overflow-x-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading appointments...</div>
            </div>
          ) : totalItems === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 text-lg font-medium">
                  No appointments found.
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  {statusFilter !== "all"
                    ? "Try changing the filter or"
                    : ""}{" "}
                  Book your first appointment to get started.
                </div>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Purpose / Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((appointment) => {
                  const { color, dotColor } = getStatusTheme(appointment.status);
                  const appointmentDate = new Date(appointment.preferredDate);
                  const formattedDate = appointmentDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={appointment._id}
                      className="hover:bg-emerald-50/50 transition duration-150 cursor-pointer"
                      onClick={() => openModal(appointment)}
                    >
                      {/* Purpose / Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {appointment.purpose}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {formattedDate}
                        </div>
                      </td>

                      {/* Time (Hidden on XS Screens) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {new Date(
                          `1970-01-01T${appointment.preferredTime}`
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Contact (Hidden on small screens) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        <div>{appointment.firstName} {appointment.surname}</div>
                        <div className="text-xs text-gray-400">{appointment.contactNumber}</div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${color
                            .replace("text", "bg")
                            .replace("600", "100")}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full mr-2 ${dotColor}`}
                          ></span>
                          {appointment.status === "auto-completed" ? 'Completed' : appointment.status || 'Scheduled'}
                        </span>
                      </td>

                      {/* View Button */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-emerald-600 hover:text-emerald-900 font-semibold transition duration-100">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* --- Footer / Pagination Area --- */}
        {!loading && totalItems > 0 && (
          <div className="p-4 sm:p-6 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span className="whitespace-nowrap">
                Showing {showingFrom} to {showingTo} of {totalItems} results
              </span>
              <div className="flex items-center gap-2">
                <span>Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="hidden sm:inline">per page</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded font-semibold transition duration-150 text-sm ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              <span className="px-2 text-xs sm:text-sm whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded font-semibold transition duration-150 text-sm ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conditional Modal Render */}
      {isModalOpen && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={closeModal}
          onCancel={handleCancelAppointment}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
