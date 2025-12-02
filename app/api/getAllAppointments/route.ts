import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    
    // Get all appointments from the database
    const appointments = await db.collection("appointments")
      .find({})
      .sort({ createdAt: -1 }) // Sort by most recent first
      .toArray();

    return NextResponse.json({ 
      success: true, 
      appointments 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}