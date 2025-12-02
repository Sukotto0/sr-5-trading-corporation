"use client";

import React, { useState, useEffect } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  StarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { TrendingUpIcon } from "lucide-react";
import { getAllFeedback, updateFeedbackStatus, deleteFeedback } from "@/app/actions";

// --- Types ---
type Feedback = {
  _id: string;
  comment: string;
  rating?: number;
  feedbackType?: string;
  status?: string;
  createdAt: string;
  lastUpdated?: string;
};

type FeedbackStats = {
  totalFeedback: number;
  avgRating: string;
  thisWeekCount: number;
  totalTrend: number;
  ratingTrend: number;
  weeklyTrend: number;
};



// --- Helper ---
function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

// --- KPI Card Component ---
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
  const trendIcon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const trendClass = isPositive
    ? "text-green-500 bg-green-100"
    : "text-red-500 bg-red-100";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between transition-shadow hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div
          className={classNames(
            `bg-${color}-500`,
            "text-white p-3 rounded-full shadow-lg"
          )}
        >
          <Icon className="w-12 h-12 text-black/50" />
        </div>
        <div
          className={classNames(
            trendClass,
            "flex items-center text-xs font-semibold px-2 py-1 rounded-full"
          )}
        >
          <TrendingUpIcon className="w-4 h-4 mr-1" />
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

// --- Main Page Component ---
const Feedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    avgRating: "0",
    thisWeekCount: 0,
    totalTrend: 0,
    ratingTrend: 0,
    weeklyTrend: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }) + " PHT"
  );

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

  // Fetch feedback data
  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    setLoading(true);
    try {
      const data = await getAllFeedback();
      setFeedback(data.feedback);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const success = await updateFeedbackStatus(id, newStatus);
    if (success) {
      setFeedback(prev => 
        prev.map(fb => fb._id === id ? { ...fb, status: newStatus } : fb)
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      const success = await deleteFeedback(id);
      if (success) {
        setFeedback(prev => prev.filter(fb => fb._id !== id));
      }
    }
  };

  const openModal = (feedbackItem: Feedback) => {
    setSelectedFeedback(feedbackItem);
    setShowModal(true);
  };

  // Create dynamic stats for KPI cards
  const feedbackStats = [
    {
      name: "Total Feedbacks",
      icon: ChatBubbleBottomCenterTextIcon,
      value: stats.totalFeedback.toString(),
      trend: stats.totalTrend,
      isPositive: stats.totalTrend > 0,
      color: "indigo",
    },
    {
      name: "Avg. Rating",
      icon: StarIcon,
      value: `${stats.avgRating} / 5`,
      trend: stats.ratingTrend,
      isPositive: stats.ratingTrend > 0,
      color: "yellow",
    },
    {
      name: "New Reviews (This Week)",
      icon: UserGroupIcon,
      value: stats.thisWeekCount.toString(),
      trend: stats.weeklyTrend,
      isPositive: stats.weeklyTrend > 0,
      color: "green",
    },
  ];

  // Modal component for viewing detailed feedback
  const FeedbackModal = () => {
    if (!showModal || !selectedFeedback) return null;

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900">Feedback Details</h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Feedback Type</label>
              <p className="text-gray-900 capitalize">{selectedFeedback.feedbackType || 'Not specified'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <div className="text-yellow-500 text-lg">
                {selectedFeedback.rating ? (
                  <>
                    {"★".repeat(selectedFeedback.rating)}
                    <span className="text-gray-400">{"☆".repeat(5 - selectedFeedback.rating)}</span>
                    <span className="text-gray-900 ml-2">({selectedFeedback.rating}/5)</span>
                  </>
                ) : (
                  <span className="text-gray-500">No rating provided</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Comment</label>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedFeedback.comment}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Submitted</label>
              <p className="text-gray-900">
                {new Date(selectedFeedback.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-6 border-t">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                handleDelete(selectedFeedback._id);
                setShowModal(false);
              }}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-8 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Feedback Records
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Current time: {currentTime}
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {feedbackStats.map((kpi) => (
          <KPICard key={kpi.name} {...kpi} />
        ))}
      </div>

      {/* Feedback Records Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Feedback ({feedback.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading feedback...</div>
          </div>
        ) : feedback.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <ChatBubbleBottomCenterTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <div className="text-gray-500">No feedback found.</div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[480px]">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase sticky top-0">
                <tr>
                  <th className="px-6 py-3 border-b">Type</th>
                  <th className="px-6 py-3 border-b">Date</th>
                  <th className="px-6 py-3 border-b">Rating</th>
                  <th className="px-6 py-3 border-b">Comment</th>
                  <th className="px-6 py-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((fb) => (
                  <tr
                    key={fb._id}
                    className="hover:bg-gray-50 transition-colors border-b"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 capitalize">
                        {fb.feedbackType || 'Not specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(fb.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {fb.rating ? (
                        <div className="text-yellow-500 font-semibold">
                          {"★".repeat(fb.rating)}
                          <span className="text-gray-400">
                            {"☆".repeat(5 - fb.rating)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No rating</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {fb.comment}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(fb)}
                          className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fb._id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                          title="Delete"
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
        )}
      </div>
      
      {/* Feedback Detail Modal */}
      <FeedbackModal />
    </div>
  );
};

export default Feedback;
