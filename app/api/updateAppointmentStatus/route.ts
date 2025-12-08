import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const { appointmentId, status, markedByAdmin } = await req.json();

    if (!appointmentId || !status) {
      return NextResponse.json(
        { success: false, error: "Appointment ID and status are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("main");

    const updateData: any = {
      status,
      lastUpdated: new Date().toISOString(),
    };

    // If marked by admin, add flag
    if (markedByAdmin) {
      updateData.completedBy = "admin";
      updateData.completedAt = new Date().toISOString();
    }

    const result = await db
      .collection("appointments")
      .updateOne(
        { _id: new ObjectId(appointmentId) },
        { $set: updateData }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to update appointment status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Appointment status updated successfully" 
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update appointment status" },
      { status: 500 }
    );
  }
}
