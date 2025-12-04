import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    // Get total users from Clerk
    const client = await clerkClient();
    const usersResponse = await client.users.getUserList();
    const totalUsers = usersResponse.totalCount || 0;

    // Get total sales and appointments from MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db("main");

    // Get count of successful transactions (sales)
    const totalSales = await db.collection("transactions").countDocuments({
      status: { $in: ["confirmed", "success"] }
    });

    // Get total appointments count
    const totalAppointments = await db.collection("appointments").countDocuments();

    return NextResponse.json({
      success: true,
      totalUsers,
      totalSales,
      totalAppointments,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
