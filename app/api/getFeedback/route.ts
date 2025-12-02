import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    
    // Get all feedback from the database
    const feedback = await db.collection("feedback")
      .find({})
      .sort({ createdAt: -1 }) // Sort by most recent first
      .toArray();

    // Calculate statistics
    const totalFeedback = feedback.length;
    
    // Calculate average rating
    const feedbackWithRatings = feedback.filter(fb => fb.rating);
    const avgRating = feedbackWithRatings.length > 0 
      ? (feedbackWithRatings.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedbackWithRatings.length).toFixed(1)
      : "0";
    
    // Get time ranges for trend calculation
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    // Filter feedback by time periods
    const thisWeekFeedback = feedback.filter(fb => 
      new Date(fb.createdAt) >= oneWeekAgo
    );
    
    const lastWeekFeedback = feedback.filter(fb => {
      const date = new Date(fb.createdAt);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    });
    
    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };
    
    // Total feedback trend
    const totalTrend = calculateTrend(totalFeedback, totalFeedback - thisWeekFeedback.length);
    
    // Average rating trend
    const thisWeekAvgRating = thisWeekFeedback.filter(fb => fb.rating).length > 0
      ? thisWeekFeedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) / thisWeekFeedback.filter(fb => fb.rating).length
      : 0;
    
    const lastWeekAvgRating = lastWeekFeedback.filter(fb => fb.rating).length > 0
      ? lastWeekFeedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) / lastWeekFeedback.filter(fb => fb.rating).length
      : 0;
    
    const ratingTrend = calculateTrend(thisWeekAvgRating, lastWeekAvgRating);
    
    // Weekly count trend
    const weeklyTrend = calculateTrend(thisWeekFeedback.length, lastWeekFeedback.length);

    const stats = {
      totalFeedback,
      avgRating,
      thisWeekCount: thisWeekFeedback.length,
      totalTrend,
      ratingTrend,
      weeklyTrend
    };

    return NextResponse.json({ 
      success: true, 
      feedback,
      stats 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}