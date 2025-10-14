import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("Saving item...");
  const sendData = await req.json();
  try {
    const client = await clientPromise;
    const db = client.db("main");
    
    // Add timestamps to the item data
    const itemWithTimestamps = {
      ...sendData,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    const data = await db.collection("inventory").insertOne(itemWithTimestamps);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error saving item:", error);
    return NextResponse.json(
      { error: "Failed to save item" },
      { status: 500 }
    );
  }
}

