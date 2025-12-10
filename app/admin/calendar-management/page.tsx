"use client";

import React, { useEffect, useState } from "react";
import { Calendar as CalendarIcon, X, Plus, Trash2, AlertCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  getBranchCalendarSettings,
  addClosedDate,
  removeClosedDate,
  updateBranchCalendarSettings,
} from "@/app/actions";

interface ClosedDate {
  date: string;
  reason: string;
  addedBy: string;
  addedAt: string;
}

interface CalendarSettings {
  branch: string;
  closedDates: ClosedDate[];
  businessHours: {
    start: string;
    end: string;
  };
  disableSundays: boolean;
  bufferTimeMinutes: number;
}

export default function BranchCalendarManagementPage() {
  const { user } = useUser();
  const [selectedBranch, setSelectedBranch] = useState<string>("Camalig");
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newClosedDate, setNewClosedDate] = useState<string>("");
  const [closedReason, setClosedReason] = useState<string>("");
  const [isAddingDate, setIsAddingDate] = useState<boolean>(false);
  const [applyToAllBranches, setApplyToAllBranches] = useState<boolean>(false);

  // Get admin role and assigned branch from user metadata
  const adminRole = (user?.publicMetadata as any)?.adminRole;
  const assignedBranch = (user?.publicMetadata as any)?.assignedBranch;
  const isSuperAdmin = adminRole === 'superadmin';

  const allBranches = ["Camalig", "Imus", "Bacoor"];
  // Filter branches for regular admins to show only their assigned branch
  const branches = isSuperAdmin ? allBranches : (assignedBranch ? [assignedBranch] : allBranches);

  useEffect(() => {
    // Set initial branch for regular admins
    if (!isSuperAdmin && assignedBranch && selectedBranch !== assignedBranch) {
      setSelectedBranch(assignedBranch);
    }
  }, [isSuperAdmin, assignedBranch]);

  useEffect(() => {
    loadSettings();
  }, [selectedBranch]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await getBranchCalendarSettings(selectedBranch);
      if (result.success) {
        // Ensure businessHours exists with defaults
        const settingsData = {
          ...result.data,
          businessHours: result.data.businessHours || {
            start: "08:00",
            end: "15:00",
          },
          disableSundays: result.data.disableSundays !== undefined ? result.data.disableSundays : true,
          bufferTimeMinutes: result.data.bufferTimeMinutes || 120,
          closedDates: result.data.closedDates || [],
        };
        setSettings(settingsData);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClosedDate = async () => {
    if (!newClosedDate) {
      alert("Please select a date");
      return;
    }

    // Check if it's a Sunday
    const date = new Date(newClosedDate);
    if (date.getDay() === 0) {
      alert("Sundays are already disabled by default");
      return;
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      alert("Cannot add past dates as closed dates");
      return;
    }

    setIsAddingDate(true);
    try {
      if (applyToAllBranches) {
        // Add to all branches
        const promises = allBranches.map((branch) =>
          addClosedDate(
            branch,
            newClosedDate,
            closedReason || "Branch closed",
            user?.id || ""
          )
        );
        const results = await Promise.all(promises);
        const allSuccess = results.every((r) => r.success);
        if (allSuccess) {
          alert("Closed date added to all branches successfully!");
          setNewClosedDate("");
          setClosedReason("");
          setApplyToAllBranches(false);
          loadSettings();
        } else {
          alert("Some branches failed to update. Please try again.");
        }
      } else {
        // Add to selected branch only
        const result = await addClosedDate(
          selectedBranch,
          newClosedDate,
          closedReason || "Branch closed",
          user?.id || ""
        );
        if (result.success) {
          alert("Closed date added successfully!");
          setNewClosedDate("");
          setClosedReason("");
          loadSettings();
        } else {
          alert("Failed to add closed date");
        }
      }
    } catch (error) {
      console.error("Error adding closed date:", error);
      alert("Failed to add closed date");
    } finally {
      setIsAddingDate(false);
    }
  };

  const handleRemoveClosedDate = async (closedDate: string) => {
    if (!confirm("Are you sure you want to remove this closed date?")) {
      return;
    }

    try {
      const result = await removeClosedDate(selectedBranch, closedDate);
      if (result.success) {
        alert("Closed date removed successfully!");
        loadSettings();
      } else {
        alert("Failed to remove closed date");
      }
    } catch (error) {
      console.error("Error removing closed date:", error);
      alert("Failed to remove closed date");
    }
  };

  const handleUpdateBusinessHours = async () => {
    if (!settings) return;

    try {
      const result = await updateBranchCalendarSettings({
        branch: selectedBranch,
        businessHours: settings.businessHours,
        disableSundays: settings.disableSundays,
        bufferTimeMinutes: settings.bufferTimeMinutes,
        adminUserId: user?.id || "",
      });

      if (result.success) {
        alert("Business hours updated successfully!");
      } else {
        alert("Failed to update business hours");
      }
    } catch (error) {
      console.error("Error updating business hours:", error);
      alert("Failed to update business hours");
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="w-11/12 mx-auto py-8 space-y-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <CalendarIcon className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-extrabold text-gray-900">
            Branch Calendar Management
          </h1>
        </div>
        <p className="text-gray-600">
          Manage closed dates and business hours for each branch
        </p>
      </header>

      {/* Branch Selector */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Branch
        </label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          disabled={!isSuperAdmin}
          className="w-full sm:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
        {!isSuperAdmin && (
          <p className="text-xs text-gray-500 mt-2">
            Branch locked to your assigned location
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      ) : (
        <>
          {/* Business Hours Settings */}
          {/* <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Business Hours & Settings
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={settings?.businessHours?.start || "08:00"}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              businessHours: {
                                ...prev.businessHours,
                                start: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Time (Current: 3:00 PM)
                  </label>
                  <input
                    type="time"
                    value={settings?.businessHours?.end || "15:00"}
                    max="15:00"
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev
                          ? {
                              ...prev,
                              businessHours: {
                                ...prev.businessHours,
                                end: e.target.value,
                              },
                            }
                          : null
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Business hours limited to 3:00 PM
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffer Time (minutes between appointments)
                </label>
                <input
                  type="number"
                  min="0"
                  step="30"
                  value={settings?.bufferTimeMinutes || 120}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev
                        ? {
                            ...prev,
                            bufferTimeMinutes: parseInt(e.target.value),
                          }
                        : null
                    )
                  }
                  className="w-full sm:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: {settings?.bufferTimeMinutes || 120} minutes (
                  {((settings?.bufferTimeMinutes || 120) / 60).toFixed(1)} hours)
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Sundays are disabled for all branches
                  </p>
                  <p className="text-xs text-blue-700">
                    This setting cannot be changed
                  </p>
                </div>
              </div>

              <button
                onClick={handleUpdateBusinessHours}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition duration-150"
              >
                Save Business Hours
              </button>
            </div>
          </div> */}

          {/* Add Closed Date */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add Closed Date
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newClosedDate}
                    min={getTodayDate()}
                    onChange={(e) => setNewClosedDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (optional)
                  </label>
                  <input
                    type="text"
                    value={closedReason}
                    onChange={(e) => setClosedReason(e.target.value)}
                    placeholder="e.g., Holiday, Maintenance"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddClosedDate}
                    disabled={isAddingDate || !newClosedDate}
                    className="w-full bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {isAddingDate ? "Adding..." : "Add Closed Date"}
                  </button>
                </div>
              </div>

              {/* Apply to All Branches Checkbox */}
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <input
                  type="checkbox"
                  id="applyToAll"
                  checked={applyToAllBranches}
                  onChange={(e) => setApplyToAllBranches(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="applyToAll" className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium text-amber-900">
                    Apply to all branches
                  </p>
                  <p className="text-xs text-amber-700">
                    This will close all branch locations on the selected date
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Closed Dates List */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Closed Dates for {selectedBranch}
            </h2>

            {settings?.closedDates && settings.closedDates.length > 0 ? (
              <div className="space-y-2">
                {settings.closedDates
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((closed, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {new Date(closed.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{closed.reason}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Added on{" "}
                          {new Date(closed.addedAt).toLocaleDateString("en-US")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveClosedDate(closed.date)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition duration-150"
                        title="Remove closed date"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No closed dates set for this branch</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
