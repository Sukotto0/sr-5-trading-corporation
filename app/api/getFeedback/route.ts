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
    const avgRating = feedback.length > 0 
      ? (feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedback.length).toFixed(1)
      : 0;
    
    // Get feedback from last week for trend calculation
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekFeedback = feedback.filter(fb => 
      new Date(fb.createdAt) >= oneWeekAgo
    );

    const stats = {
      totalFeedback,
      avgRating,
      thisWeekCount: thisWeekFeedback.length,
      // Simple trend calculation (you can enhance this)
      totalTrend: 12.4, // Placeholder - you can calculate based on previous period
      ratingTrend: 3.2, // Placeholder
      weeklyTrend: thisWeekFeedback.length > 5 ? 8.5 : -1.8
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