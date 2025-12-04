import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("Saving appointment...");
  const sendData = await req.json();
  
  // Validate that userId is present
  if (!sendData.userId) {
    console.error("Missing userId in appointment data");
    return NextResponse.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }
  
  try {
    const client = await clientPromise;
    const db = client.db("main");
    
    // Add timestamps and ensure status exists
    const itemWithTimestamps = {
      ...sendData,
      status: sendData.status || "scheduled",
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    console.log("Appointment data to be saved:", {
      userId: itemWithTimestamps.userId,
      purpose: itemWithTimestamps.purpose,
      date: itemWithTimestamps.preferredDate
    });
    
    const data = await db.collection("appointments").insertOne(itemWithTimestamps);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error saving appointment:", error);
    return NextResponse.json(
      { error: "Failed to save appointment" },
      { status: 500 }
    );
  }
}

