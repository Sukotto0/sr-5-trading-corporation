import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Get date 2 days ago
    const twoDaysAgo = new Date(currentDate);
    twoDaysAgo.setDate(currentDate.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    // Find appointments that are past their date by 2+ days and not already completed/cancelled
    const result = await db
      .collection("appointments")
      .updateMany(
        {
          preferredDate: { $lt: twoDaysAgoStr },
          status: { $nin: ["completed", "cancelled", "rejected"] }
        },
        {
          $set: {
            status: "auto-completed",
            completedBy: "system",
            completedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          }
        }
      );

    return NextResponse.json({ 
      success: true, 
      message: `${result.modifiedCount} appointments auto-completed`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error("Error auto-completing appointments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to auto-complete appointments" },
      { status: 500 }
    );
  }
}
