"use client";

import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { View, Event as RBCEvent } from "react-big-calendar";
import moment from "moment";
// @ts-ignore
import "react-big-calendar/lib/css/react-big-calendar.css";

import { getAllAppointments, getAllTransactions } from '@/app/actions';

// Database interfaces
interface Appointment {
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
  date: string;
  time: string;
  type: 'appointment' | 'transaction';
  purpose: string;
  notes?: string;
  status?: string;
  vehicleDetails?: string;
  createdAt: string;
}

const localizer = momentLocalizer(moment);

export default function AdminAppointmentsPage() {
  const [combinedEvents, setCombinedEvents] = useState<CombinedEvent[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<RBCEvent[]>([]);
  const [view, setView] = useState<View>("month");
  const [selectedEvent, setSelectedEvent] = useState<CombinedEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setView("day");
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [appointmentResult, transactionResult] = await Promise.all([
          getAllAppointments(),
          getAllTransactions()
        ]);

        const appointments = appointmentResult.success ? appointmentResult.data : [];
        const transactions = transactionResult.success ? transactionResult.data : [];

        // Transform appointments
        const appointmentEvents: CombinedEvent[] = appointments.map((apt: Appointment) => ({
          _id: apt._id,
          title: `${apt.purpose} - ${apt.firstName} ${apt.surname}`,
          customerName: `${apt.firstName} ${apt.surname}`,
          email: apt.email,
          phoneNumber: apt.contactNumber,
          date: apt.preferredDate,
          time: apt.preferredTime,
          type: 'appointment' as const,
          purpose: apt.purpose,
          notes: apt.details,
          status: undefined,
          vehicleDetails: undefined,
          createdAt: apt.createdAt
        }));

        // Transform transactions
        const transactionEvents: CombinedEvent[] = transactions.map((txn: Transaction) => ({
          _id: txn._id,
          title: `${txn.transactionType} - ${txn.customerName}`,
          customerName: txn.customerName,
          email: txn.email,
          phoneNumber: txn.phoneNumber,
          date: txn.scheduledDate,
          time: txn.scheduledTime,
          type: 'transaction' as const,
          purpose: txn.transactionType,
          notes: txn.notes,
          status: txn.status,
          vehicleDetails: txn.vehicleDetails,
          createdAt: txn.createdAt
        }));

        const combined = [...appointmentEvents, ...transactionEvents]
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
  }, []);

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

  return (
    <div className="w-11/12 mx-auto py-8 space-y-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Appointments
          </h1>
        </div>
      </header>

      {/* Appointment Table */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Upcoming Appointments
        </h2>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading appointments and transactions...</div>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-left border-b">Purpose</th>
                  <th className="py-3 px-4 text-left border-b">Customer Name</th>
                  <th className="py-3 px-4 text-left border-b">Phone</th>
                  <th className="py-3 px-4 text-left border-b">Date & Time</th>
                  <th className="py-3 px-4 text-left border-b">Type</th>
                  <th className="py-3 px-4 text-left border-b">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {combinedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No appointments or transactions found
                    </td>
                  </tr>
                ) : (
                  combinedEvents.map((event) => (
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
                        {event.phoneNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4 border-b text-gray-600">
                        {moment(event.date + 'T' + event.time).format("MMM DD, YYYY h:mm A")}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.type === 'appointment' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {event.type === 'appointment' ? 'Appointment' : 'Transaction'}
                        </span>
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedEvent.type === 'appointment' 
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {selectedEvent.type === 'appointment' ? 'Appointment' : 'Transaction'}
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
                  <p className="text-gray-700 capitalize">{selectedEvent.status}</p>
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
              <button
                onClick={() => {
                  alert(`✅ Marked as completed for ${selectedEvent.customerName}`);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-all"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
