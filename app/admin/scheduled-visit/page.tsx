"use client";

import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import type { View, Event as RBCEvent } from "react-big-calendar";
import moment from "moment";
// @ts-ignore
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const placeholderEvents: RBCEvent[] = [
  {
    title: "Test Drive Schedule",
    start: new Date(2025, 8, 21, 14, 0),
    end: new Date(2025, 8, 21, 15, 0),
  },
  {
    title: "Customer Visit",
    start: new Date(2025, 8, 22, 10, 0),
    end: new Date(2025, 8, 22, 11, 30),
  },
  {
    title: "Unit Delivery",
    start: new Date(2025, 8, 25, 19, 0),
    end: new Date(2025, 8, 25, 20, 0),
  },
];

export default function AdminAppointmentsPage() {
  const [events] = useState<RBCEvent[]>(placeholderEvents);
  const [view, setView] = useState<View>("month");
  const [selectedEvent, setSelectedEvent] = useState<RBCEvent | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setView("day");
    }
  }, []);

  function handleSelectEvent(event: RBCEvent) {
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
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left border-b">Title</th>
                <th className="py-3 px-4 text-left border-b">Start</th>
                <th className="py-3 px-4 text-left border-b">End</th>
                <th className="py-3 px-4 text-left border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr
                  key={index}
                  className="hover:bg-emerald-50 transition-all duration-150"
                >
                  <td className="py-3 px-4 border-b font-medium text-gray-800">
                    {event.title}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-600">
                    {moment(event.start).format("LLL")}
                  </td>
                  <td className="py-3 px-4 border-b text-gray-600">
                    {moment(event.end).format("LLL")}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="px-4 py-1.5 text-sm rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-all"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Calendar Overview
        </h2>
        <div className="h-[500px] sm:h-[600px] md:h-[700px]">
          <Calendar
            localizer={localizer}
            events={events}
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
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 max-w-full border border-gray-100">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              {selectedEvent.title}
            </h3>
            <p className="text-gray-600 mb-2">
              <strong>From:</strong> {moment(selectedEvent.start).format("LLLL")}
            </p>
            <p className="text-gray-600 mb-6">
              <strong>To:</strong> {moment(selectedEvent.end).format("LLLL")}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("📌 You joined this session!");
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-all"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
