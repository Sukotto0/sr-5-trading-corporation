import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("main");
    
    // Get appointments for the specific user
    const appointments = await db.collection("appointments")
      .find({ userId: userId })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .toArray();

    return NextResponse.json({ success: true, appointments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}