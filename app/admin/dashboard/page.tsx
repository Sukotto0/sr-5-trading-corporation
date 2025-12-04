"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Plus } from "lucide-react";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAllEvents, createEvent, updateEvent, deleteEvent } from "@/app/actions";

// --- Types ---
type Event = {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  createdAt: string;
};

// --- Helper Functions ---

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

// MongoDB will generate IDs automatically

// Calendar utility functions
const getMonthName = (monthIndex: number) => {
  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];
  return months[monthIndex];
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const generateCalendarDays = (year: number, month: number) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  const days = [];

  // Add previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false,
    });
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false,
    });
  }

  // Add next month's leading days to fill the grid
  const remainingSlots = 42 - days.length; // 6 rows × 7 days = 42
  for (let day = 1; day <= remainingSlots; day++) {
    days.push({
      day,
      isCurrentMonth: false,
      isPrevMonth: false,
      isNextMonth: true,
    });
  }

  return days;
};

// --- Component Definition ---

const AdminDashboard = () => {
  // Get current date
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentTime, setCurrentTime] = useState("");

  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Form state for add event modal
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });

  // Edit state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Date events viewing state
  const [showDateEventsModal, setShowDateEventsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);

  // Timeline filter state
  const [timelineFilter, setTimelineFilter] = useState<string>("upcoming");

  // Branch locations
  const branchLocations = ["Imus", "Bacoor", "Albay"];


  // Update time every second
  // useEffect(() => {
  //   const updateTime = () => {
  //     const now = new Date();
  //     setCurrentTime(
  //       now.toLocaleTimeString("en-US", {
  //         hour12: true,
  //         timeZone: "Asia/Manila",
  //         hour: "numeric",
  //         minute: "2-digit",
  //         second: "2-digit",
  //       }) + " PHT"
  //     );
  //   };

  //   updateTime();
  //   const interval = setInterval(updateTime, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  // Load events from database on component mount
  useEffect(() => {
    async function loadEvents() {
      const result = await getAllEvents();
      if (result.success) {
        setEvents(result.data);
      } else {
        console.error('Failed to load events:', result.error);
      }
    }
    loadEvents();
  }, []);

  // Navigation functions
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate calendar days for current month
  const calendarDays = generateCalendarDays(currentYear, currentMonth);


  const handleDeleteEvent = async (eventId: string) => {
    const result = await deleteEvent(eventId);
    if (result.success) {
      setEvents(events.filter((event) => event._id !== eventId));
    } else {
      console.error('Failed to delete event:', result.error);
      alert('Failed to delete event. Please try again.');
    }
  };

  // Form handlers for add/edit event modal
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddEvent = async () => {
    if (!formData.title.trim() || !formData.date || !formData.time) {
      alert("Please fill in all required fields (Title, Date, and Time).");
      return;
    }

    const eventData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date,
      time: formData.time,
      location: formData.location || undefined,
    };

    if (isEditMode && editingEventId) {
      // Update existing event
      const result = await updateEvent({ _id: editingEventId, ...eventData });
      if (result.success) {
        setEvents((prev) => prev.map(event => 
          event._id === editingEventId 
            ? { ...event, ...eventData }
            : event
        ));
        handleCloseModal();
      } else {
        console.error('Failed to update event:', result.error);
        alert('Failed to update event. Please try again.');
      }
    } else {
      // Add new event
      const result = await createEvent(eventData);
      if (result.success) {
        setEvents((prev) => [...prev, result.event]);
        handleCloseModal();
      } else {
        console.error('Failed to create event:', result.error);
        alert('Failed to create event. Please try again.');
      }
    }
  };

  const handleCloseModal = () => {
    setShowAddEventModal(false);
    setIsEditMode(false);
    setEditingEventId(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
    });
  };

  const handleEditEvent = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location || "",
    });
    setEditingEventId(event._id);
    setIsEditMode(true);
    setShowAddEventModal(true);
  };

  const handleDateClick = (day: number, isCurrentMonthDay: boolean) => {
    if (!isCurrentMonthDay) return;

    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const eventsForDate = events.filter((event) => event.date === dateString);
    
    setSelectedDate(dateString);
    setSelectedDateEvents(eventsForDate);
    setShowDateEventsModal(true);
  };

  const formatSelectedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get filtered events based on timeline filter
  const getFilteredEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return events.filter((event) => {
      const eventDate = new Date(event.date + "T" + event.time);
      const eventDateOnly = new Date(event.date);
      
      switch (timelineFilter) {
        case "today":
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const todayEnd = new Date(todayStart);
          todayEnd.setDate(todayEnd.getDate() + 1);
          return eventDate >= todayStart && eventDate < todayEnd;
        case "week":
          return eventDate >= now && eventDate <= nextWeek;
        case "month":
          return eventDate >= now && eventDate <= nextMonth;
        case "all":
          return true;
        case "past":
          return eventDate < now;
        case "upcoming":
        default:
          return eventDate >= now;
      }
    })
    .sort((a, b) => {
      const dateA = new Date(a.date + "T" + a.time);
      const dateB = new Date(b.date + "T" + b.time);
      const createdA = new Date(a.createdAt);
      const createdB = new Date(b.createdAt);
      
      if (timelineFilter === "past") {
        // Past events: newest first
        return dateB.getTime() - dateA.getTime();
      } else if (timelineFilter === "today" || timelineFilter === "all") {
        // Today and All: latest created first, then by event time
        if (Math.abs(dateA.getTime() - dateB.getTime()) < 86400000) { // Same day
          return createdB.getTime() - createdA.getTime();
        }
        return dateA.getTime() - dateB.getTime();
      } else {
        // Other filters: earliest event first, but latest created first for same time
        if (dateA.getTime() === dateB.getTime()) {
          return createdB.getTime() - createdA.getTime();
        }
        return dateA.getTime() - dateB.getTime();
      }
    })
    .slice(0, timelineFilter === "all" ? 10 : 5); // Show more for "all" filter
  };

  const filteredEvents = getFilteredEvents();

  // Timeline filter options
  const timelineOptions = [
    { value: "upcoming", label: "Upcoming" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "past", label: "Past Events" },
    { value: "all", label: "All Events" },
  ];

  // Calendar Header Component
  const CalendarHeader = () => (
    <div className="flex justify-between items-center text-white font-bold h-14 px-4 border-b border-red-800/50">
      <button
        className="p-2 rounded-full hover:bg-red-800/50 transition-colors"
        onClick={goToPreviousMonth}
      >
        <ArrowLeftIcon className="w-4 h-4" />
      </button>
      <div className="text-center">
        <div className="text-xl font-bold text-white">
          {getMonthName(currentMonth)}
        </div>
        <div className="text-sm font-medium text-white/90">{currentYear}</div>
      </div>
      <button
        className="p-2 rounded-full hover:bg-red-800/50 transition-colors"
        onClick={goToNextMonth}
      >
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );



  // Calendar Body Component
  const CalendarBody = () => {
    const isToday = (day: number, isCurrentMonthDay: boolean) => {
      return (
        isCurrentMonthDay &&
        currentYear === today.getFullYear() &&
        currentMonth === today.getMonth() &&
        day === today.getDate()
      );
    };

    const hasEventOnDate = (day: number, isCurrentMonthDay: boolean) => {
      if (!isCurrentMonthDay) return false;

      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return events.some((event) => event.date === dateString);
    };

    const getEventsForDate = (day: number, isCurrentMonthDay: boolean) => {
      if (!isCurrentMonthDay) return [];

      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return events.filter((event) => event.date === dateString);
    };

    return (
      <div className="grid grid-cols-7 text-white text-center text-sm font-medium h-full">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div key={day + i} className="py-3 text-white font-semibold text-sm border-b border-white/20">
            {day}
          </div>
        ))}
        {calendarDays.map((dateObj, index) => {
          const isCurrentMonthDay = dateObj.isCurrentMonth;
          const isTodayDate = isToday(dateObj.day, isCurrentMonthDay);
          const hasEvent = hasEventOnDate(dateObj.day, isCurrentMonthDay);
          const eventsOnDate = getEventsForDate(dateObj.day, isCurrentMonthDay);

          return (
            <div
              key={index}
              onClick={() => handleDateClick(dateObj.day, isCurrentMonthDay)}
              className={classNames(
                "flex flex-col items-center justify-center text-sm font-semibold border-r border-b border-white/15 transition-all duration-150 relative min-h-14",
                !isCurrentMonthDay
                  ? "text-white/50"
                  : "hover:bg-red-800/60 cursor-pointer text-white hover:scale-105",
                index % 7 === 6 && "border-r-0",
                index >= 35 && "border-b-0",
                isTodayDate
                  ? "bg-yellow-500 shadow-lg ring-2 ring-yellow-300 text-yellow-900 font-bold scale-105"
                  : ""
              )}
            >
              <div className="mb-1">{dateObj.day}</div>

              {/* Event indicators */}
              {hasEvent && (
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {eventsOnDate
                    .slice(0, 2)
                    .map((event, eventIndex) => (
                      <span
                        key={event._id}
                        className={classNames(
                          "block w-1.5 h-1.5 rounded-full shadow-sm",
                          isTodayDate ? "bg-yellow-900" : "bg-white shadow-md"
                        )}
                        title={event.title}
                      ></span>
                    ))}
                  {eventsOnDate.length > 2 && (
                    <span className={classNames(
                      "text-[9px] font-bold px-1",
                      isTodayDate ? "text-yellow-900" : "text-white drop-shadow-sm"
                    )}>
                      +{eventsOnDate.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Main Content Area
  return (
    <>
      {/* Welcome Banner */}
      <div className="mt-6 mb-8 p-6 bg-white rounded-xl shadow-md border-l-4 border-red-950">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome to SR-5 Admin Page!
        </h2>
        <p className="mt-1 text-gray-600 text-sm">
          Hello, Admin! Manage your branch and track its progress.
        </p>
        <p className="text-xs text-gray-400 mt-1">{currentTime}</p>
      </div>

      {/* Dashboard Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements - Left Side (2 columns) */}
        <div className="lg:col-span-2">
          <AnnouncementsSection />
        </div>

        {/* Calendar & Events - Right Side (1 column) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Upcoming Events Card - Compact */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[380px]">
            <div className="bg-red-950 text-white p-3 border-b border-red-800">
              <div className="flex justify-between items-center mb-2">
                <div className="flex-1">
                  <h3 className="text-base font-bold">
                    {timelineFilter === "upcoming" ? "UPCOMING EVENTS" : timelineOptions.find(opt => opt.value === timelineFilter)?.label.toUpperCase() || "EVENTS"}
                  </h3>
                  <p className="text-xs font-light opacity-80">
                    {today.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddEventModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold shrink-0"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium opacity-90">Filter:</span>
                <Select value={timelineFilter} onValueChange={setTimelineFilter}>
                  <SelectTrigger className="w-32 h-7 bg-red-800/50 border-red-700 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timelineOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1 p-3 overflow-hidden flex flex-col">
              {filteredEvents.length > 0 ? (
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {filteredEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const eventTime = new Date(`1970-01-01T${event.time}`);

                    return (
                      <div
                        key={event._id}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {event.title}
                            </h4>
                            {event.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                {event.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {eventDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {eventTime.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                              title="Edit Event"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event._id)}
                              className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                              title="Delete Event"
                            >
                              <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center px-2">
                  <div>
                    <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400 font-medium text-sm">
                      No {timelineFilter === "past" ? "past" : timelineFilter === "all" ? "" : timelineFilter} events
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {timelineFilter === "past" 
                        ? "No past events to show"
                        : "Click + to add event"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Card - Compact */}
          <div className="bg-red-950 rounded-xl shadow-lg overflow-hidden flex flex-col h-[390px]">
            <CalendarHeader />
            <div className="flex-1 p-3 bg-red-900/40">
              <CalendarBody />
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <Dialog open={showAddEventModal} onOpenChange={setShowAddEventModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the event details below.' : 'Create a new event for your calendar. Fill in the details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="col-span-3"
                placeholder="Enter event title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="col-span-3"
                placeholder="Enter event description (optional)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleInputChange("location", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select branch location (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {branchLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>
              {isEditMode ? 'Update Event' : 'Add Event'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Date Events Modal */}
      <Dialog open={showDateEventsModal} onOpenChange={setShowDateEventsModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Events for {selectedDate && formatSelectedDate(selectedDate)}</DialogTitle>
            <DialogDescription>
              {selectedDateEvents.length > 0 
                ? `${selectedDateEvents.length} event${selectedDateEvents.length === 1 ? '' : 's'} scheduled for this day`
                : "No events scheduled for this day"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto py-4">
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((event) => {
                    const eventTime = new Date(`1970-01-01T${event.time}`);
                    return (
                      <div
                        key={event._id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {event.title}
                            </h4>
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                {event.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {eventTime.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <span>📍</span>
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-4">
                            <button
                              onClick={() => {
                                setShowDateEventsModal(false);
                                handleEditEvent(event);
                              }}
                              className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                              title="Edit Event"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={async () => {
                                await handleDeleteEvent(event._id);
                                setSelectedDateEvents(prev => prev.filter(e => e._id !== event._id));
                              }}
                              className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                              title="Delete Event"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex items-center justify-center text-center py-12">
                <div>
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium text-lg">
                    No events scheduled
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Click the + button in the upcoming events section to add an event
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDateEventsModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDashboard;
