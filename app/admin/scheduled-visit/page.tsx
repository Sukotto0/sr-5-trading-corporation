"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { View, Event as RBCEvent } from "react-big-calendar";
import moment from "moment";
// @ts-ignore
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CalendarDays, Settings } from "lucide-react";
import Link from "next/link";

import { getAllAppointments, updateAppointmentStatus, autoCompleteAppointments } from '@/app/actions';

// Database interfaces
interface Appointment {
  _id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  phoneNumber?: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  branch: string;
  purpose: string;
  details?: string;
  status?: string;
  completedBy?: string;
  createdAt: string;
  lastUpdated: string;
}

interface Transaction {
  _id: string;
  customerName: string;
  email?: string;
  phoneNumber?: string;
  transactionType: string; // 'test drive', 'reservation claiming', etc.
  scheduledDate: string;
  scheduledTime: string;
  vehicleDetails?: string;
  notes?: string;
  status?: string;
  createdAt: string;
}

interface CombinedEvent {
  _id: string;
  title: string;
  customerName: string;
  email?: string;
  phoneNumber?: string;
  contactNumber?: string;
  date: string;
  time: string;
  branch?: string;
  type: 'appointment' | 'transaction';
  purpose: string;
  notes?: string;
  status?: string;
  completedBy?: string;
  vehicleDetails?: string;
  createdAt: string;
}

const localizer = momentLocalizer(moment);

export default function AdminAppointmentsPage() {
  const { user } = useUser();
  const [combinedEvents, setCombinedEvents] = useState<CombinedEvent[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<RBCEvent[]>([]);
  const [view, setView] = useState<View>("month");
  const [selectedEvent, setSelectedEvent] = useState<CombinedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<string>("upcoming");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [completionFilter, setCompletionFilter] = useState<string>("all");

  // Get admin role and assigned branch from user metadata
  const adminRole = (user?.publicMetadata as any)?.adminRole;
  const assignedBranch = (user?.publicMetadata as any)?.assignedBranch;
  const isSuperAdmin = adminRole === 'superadmin';

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setView("day");
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // First auto-complete any past appointments
        await autoCompleteAppointments();
        
        const appointmentResult = await getAllAppointments();
        let appointments = appointmentResult.success ? appointmentResult.data : [];

        // Filter by branch for regular admins
        if (!isSuperAdmin && assignedBranch) {
          appointments = appointments.filter((apt: Appointment) => 
            apt.branch?.toLowerCase() === assignedBranch.toLowerCase()
          );
        }

        // Transform appointments
        const appointmentEvents: CombinedEvent[] = appointments.map((apt: Appointment) => ({
          _id: apt._id,
          title: `${apt.purpose} - ${apt.firstName} ${apt.lastName}`,
          customerName: `${apt.firstName} ${apt.lastName}`,
          email: apt.email,
          phoneNumber: apt.contactNumber || apt.phoneNumber,
          date: apt.preferredDate,
          time: apt.preferredTime,
          branch: apt.branch,
          type: 'appointment' as const,
          purpose: apt.purpose,
          notes: apt.details,
          status: apt.status,
          completedBy: apt.completedBy,
          vehicleDetails: undefined,
          createdAt: apt.createdAt
        }));

        const combined = appointmentEvents
          .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

        setCombinedEvents(combined);

        // Create calendar events
        const calEvents: RBCEvent[] = combined.map(event => {
          const [hours, minutes] = event.time.split(':').map(Number);
          const startDate = new Date(event.date);
          startDate.setHours(hours, minutes);
          const endDate = new Date(startDate);
          endDate.setHours(hours + 1, minutes); // Default 1 hour duration

          return {
            title: event.title,
            start: startDate,
            end: endDate,
            resource: event
          };
        });

        setCalendarEvents(calEvents);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isSuperAdmin, assignedBranch]);

  function handleSelectEvent(event: RBCEvent) {
    if (event.resource) {
      setSelectedEvent(event.resource as CombinedEvent);
    }
  }

  function handleTableRowSelect(event: CombinedEvent) {
    setSelectedEvent(event);
  }

  const eventStyleGetter = () => {
    const style: React.CSSProperties = {
      backgroundColor: "#16a34a",
      color: "white",
      borderRadius: "6px",
      padding: "2px 6px",
      border: "0px",
      display: "block",
    };
    return { style };
  };

  // Apply filters to combined events
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  let filteredEvents = combinedEvents;
  
  // Time filter (upcoming/all/past)
  if (timeFilter === "upcoming") {
    filteredEvents = filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= currentDate;
    });
  } else if (timeFilter === "past") {
    filteredEvents = filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate < currentDate;
    });
  }
  
  // Status filter
  if (statusFilter === "scheduled") {
    filteredEvents = filteredEvents.filter(
      (event) => !event.status || event.status === 'scheduled' || event.status === 'pending'
    );
  } else if (statusFilter !== "all") {
    filteredEvents = filteredEvents.filter(
      (event) => event.status === statusFilter
    );
  }
  
  // Completion filter (for appointments only)
  if (completionFilter === "admin-completed") {
    filteredEvents = filteredEvents.filter(
      (event) => event.type === 'appointment' && event.status === 'completed' && event.completedBy === 'admin'
    );
  } else if (completionFilter === "auto-completed") {
    filteredEvents = filteredEvents.filter(
      (event) => event.type === 'appointment' && (event.status === 'auto-completed' || (event.status === 'completed' && event.completedBy === 'system'))
    );
  } else if (completionFilter === "not-completed") {
    filteredEvents = filteredEvents.filter(
      (event) => !event.status || (event.status !== 'completed' && event.status !== 'auto-completed' && event.status !== 'cancelled')
    );
  }

  return (
    <div className="w-11/12 mx-auto py-8 space-y-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Appointments
          </h1>
          <Link 
            href="/admin/calendar-management"
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition duration-150"
          >
            <Settings className="w-5 h-5" />
            Manage Calendar Settings
          </Link>
        </div>
      </header>

      {/* Appointment Table */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Scheduled Appointments
          </h2>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-emerald-600">{filteredEvents.length}</span> appointments
          </div>
        </div>
        
        {/* Filter Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Time Period Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Period:</span>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="all">All Dates</option>
                  <option value="past">Past</option>
                </select>
              </div>

              {/* Type Filter */}
              {/* <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Types</option>
                  <option value="appointment">Appointments</option>
                  <option value="transaction">Transactions</option>
                </select>
              </div> */}

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="auto-completed">Auto-Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Completion Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Completion:</span>
                <select
                  value={completionFilter}
                  onChange={(e) => setCompletionFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All</option>
                  <option value="not-completed">Not Completed</option>
                  <option value="admin-completed">Admin Marked</option>
                  <option value="auto-completed">Auto-Completed</option>
                </select>
              </div>
            </div>
            
            {/* Active Filters Summary */}
            {(timeFilter !== "upcoming" || statusFilter !== "all" || completionFilter !== "all") && (
              <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-gray-200">
                <span className="text-gray-600">Active filters:</span>
                {timeFilter !== "upcoming" && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                    {timeFilter === "past" ? "Past dates" : "All dates"}
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </span>
                )}
                {completionFilter !== "all" && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                    {completionFilter === "not-completed" ? "Not completed" : 
                     completionFilter === "admin-completed" ? "Admin marked" : "Auto-completed"}
                  </span>
                )}
                <button
                  onClick={() => {
                    setTimeFilter("upcoming");
                    setStatusFilter("all");
                    setCompletionFilter("all");
                  }}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-left border-b">Purpose</th>
                  <th className="py-3 px-4 text-left border-b">Customer Name</th>
                  <th className="py-3 px-4 text-left border-b">Phone</th>
                  <th className="py-3 px-4 text-left border-b">Branch</th>
                  <th className="py-3 px-4 text-left border-b">Date & Time</th>
                  <th className="py-3 px-4 text-left border-b">Status</th>
                  <th className="py-3 px-4 text-left border-b">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No appointments found matching the filters
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr
                      key={event._id}
                      className="hover:bg-emerald-50 transition-all duration-150"
                    >
                      <td className="py-3 px-4 border-b font-medium text-gray-800">
                        {event.purpose}
                      </td>
                      <td className="py-3 px-4 border-b text-gray-700">
                        {event.customerName}
                      </td>
                      <td className="py-3 px-4 border-b text-gray-600">
                        {event.phoneNumber || event.contactNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4 border-b text-gray-600">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium capitalize">
                          {event.branch || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b text-gray-600">
                        {moment(event.date + 'T' + event.time).format("MMM DD, YYYY h:mm A")}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {event.status ? (
                          <div className="flex flex-col">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block w-fit ${
                              event.status === 'completed' || event.status === 'auto-completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : event.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {event.status === 'auto-completed' ? 'Auto-Completed' : event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                            {event.completedBy && (
                              <span className="text-xs text-gray-500 mt-1">
                                {event.completedBy === 'admin' ? 'by Admin' : 'by System'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Scheduled</span>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <button
                          onClick={() => handleTableRowSelect(event)}
                          className="px-4 py-1.5 text-sm rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-all"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Calendar Overview
        </h2>
        <div className="h-[500px] sm:h-[600px] md:h-[700px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={(v) => setView(v as View)}
            views={["month", "week", "day"]}
            defaultView="month"
            onSelectEvent={handleSelectEvent}
            popup
            eventPropGetter={eventStyleGetter}
          />
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[500px] max-w-full border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedEvent.purpose}
              </h3>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Appointment
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer Name</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedEvent.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-gray-700">{selectedEvent.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
              
              {selectedEvent.email && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-700">{selectedEvent.email}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Branch</p>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium inline-block capitalize">
                  {selectedEvent.branch || 'N/A'}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Scheduled Date & Time</p>
                <p className="text-lg text-gray-900">
                  {moment(selectedEvent.date + 'T' + selectedEvent.time).format("LLLL")}
                </p>
              </div>
              
              {selectedEvent.vehicleDetails && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle Details</p>
                  <p className="text-gray-700">{selectedEvent.vehicleDetails}</p>
                </div>
              )}
              
              {selectedEvent.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedEvent.notes}</p>
                </div>
              )}
              
              {selectedEvent.status && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700 capitalize">
                      {selectedEvent.status === 'auto-completed' ? 'Auto-Completed' : selectedEvent.status}
                    </p>
                    {selectedEvent.completedBy && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedEvent.completedBy === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {selectedEvent.completedBy === 'admin' ? 'Marked by Admin' : 'Auto-completed'}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-gray-600 text-sm">
                  {moment(selectedEvent.createdAt).format("MMMM DD, YYYY h:mm A")}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all"
              >
                Close
              </button>
              {selectedEvent.status !== 'completed' && selectedEvent.status !== 'cancelled' && (
                <button
                  onClick={async () => {
                    try {
                      const result = await updateAppointmentStatus(selectedEvent._id, 'completed', true);
                      if (result.success) {
                        alert(`✅ Marked as completed for ${selectedEvent.customerName}`);
                        setSelectedEvent(null);
                        // Reload appointments
                        const appointmentResult = await getAllAppointments();
                        let appointments = appointmentResult.success ? appointmentResult.data : [];
                        
                        // Filter by branch for regular admins
                        if (!isSuperAdmin && assignedBranch) {
                          appointments = appointments.filter((apt: Appointment) => 
                            apt.branch?.toLowerCase() === assignedBranch.toLowerCase()
                          );
                        }
                        
                        const appointmentEvents: CombinedEvent[] = appointments.map((apt: Appointment) => ({
                          _id: apt._id,
                          title: `${apt.purpose} - ${apt.firstName} ${apt.lastName}`,
                          customerName: `${apt.firstName} ${apt.lastName}`,
                          email: apt.email,
                          phoneNumber: apt.contactNumber,
                          date: apt.preferredDate,
                          time: apt.preferredTime,
                          branch: apt.branch,
                          type: 'appointment' as const,
                          purpose: apt.purpose,
                          notes: apt.details,
                          status: apt.status,
                          completedBy: apt.completedBy,
                          vehicleDetails: undefined,
                          createdAt: apt.createdAt
                        }));
                        
                        const combined = appointmentEvents
                          .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
                        setCombinedEvents(combined);
                      } else {
                        alert('Failed to mark as complete. Please try again.');
                      }
                    } catch (error) {
                      console.error('Error marking complete:', error);
                      alert('Failed to mark as complete. Please try again.');
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-all"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
