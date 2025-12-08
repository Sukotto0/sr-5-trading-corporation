import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const { appointmentId, userId } = await req.json();

    if (!appointmentId || !userId) {
      return NextResponse.json(
        { success: false, error: "Appointment ID and User ID are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("main");

    // Find the appointment first to verify ownership and check date
    const appointment = await db
      .collection("appointments")
      .findOne({ _id: new ObjectId(appointmentId), userId: userId });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if appointment is already cancelled
    if (appointment.status === "cancelled") {
      return NextResponse.json(
        { success: false, error: "Appointment is already cancelled" },
        { status: 400 }
      );
    }

    // Check if the appointment date is at least 2 days away
    const appointmentDate = new Date(appointment.preferredDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const twoDaysFromNow = new Date(currentDate);
    twoDaysFromNow.setDate(currentDate.getDate() + 2);

    if (appointmentDate < twoDaysFromNow) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Appointments can only be cancelled at least 2 days before the scheduled date" 
        },
        { status: 400 }
      );
    }

    // Delete the appointment from the database
    const result = await db
      .collection("appointments")
      .deleteOne({ _id: new ObjectId(appointmentId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to cancel appointment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Appointment cancelled and removed successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}
