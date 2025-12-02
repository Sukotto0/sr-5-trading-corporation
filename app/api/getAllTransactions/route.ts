import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    
    // Get all transactions from the database
    const transactions = await db.collection("transactions")
      .find({})
      .sort({ createdAt: -1 }) // Sort by most recent first
      .toArray();

    return NextResponse.json({ 
      success: true, 
      transactions 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}