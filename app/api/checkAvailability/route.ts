import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET - Check available time slots for a branch on a specific date
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get("branch");
    const date = searchParams.get("date");

    if (!branch || !date) {
      return NextResponse.json(
        { success: false, error: "Branch and date are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("main");

    // Get branch calendar settings
    const settings = await db
      .collection("branchCalendarSettings")
      .findOne({ branch });

    const businessHours = settings?.businessHours || { start: "08:00", end: "15:00" };
    const bufferTimeMinutes = settings?.bufferTimeMinutes || 120;
    const disableSundays = settings?.disableSundays !== false;
    const closedDates = settings?.closedDates || [];

    // Check if date is a Sunday
    const requestedDate = new Date(date);
    if (disableSundays && requestedDate.getDay() === 0) {
      return NextResponse.json({
        success: false,
        error: "Sundays are not available for booking",
      });
    }

    // Check if date is in closed dates
    const isClosed = closedDates.some(
      (closed: any) => closed.date === date
    );
    if (isClosed) {
      return NextResponse.json({
        success: false,
        error: "This date is not available for booking",
      });
    }

    // Get all appointments for this branch on this date
    const appointments = await db
      .collection("appointments")
      .find({
        location: branch,
        preferredDate: date,
        status: { $nin: ["cancelled", "rejected"] },
      })
      .toArray();

    // Generate all possible time slots
    const [startHour, startMinute] = businessHours.start.split(":").map(Number);
    const [endHour, endMinute] = businessHours.end.split(":").map(Number);

    const availableSlots: string[] = [];
    const bookedSlots: Array<{ time: string; bufferStart: Date; bufferEnd: Date }> = [];

    // Convert booked appointments to time ranges with buffer
    appointments.forEach((apt: any) => {
      const [aptHour, aptMinute] = apt.preferredTime.split(":").map(Number);
      const aptDateTime = new Date(date);
      aptDateTime.setHours(aptHour, aptMinute, 0, 0);

      const bufferStart = new Date(aptDateTime.getTime() - bufferTimeMinutes * 60 * 1000);
      const bufferEnd = new Date(aptDateTime.getTime() + bufferTimeMinutes * 60 * 1000);

      bookedSlots.push({
        time: apt.preferredTime,
        bufferStart,
        bufferEnd,
      });
    });

    // Generate 30-minute interval slots
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Stop if we've reached the end time
        if (hour === endHour && minute >= endMinute) break;
        if (hour > endHour) break;

        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour, minute, 0, 0);

        // Check if this slot conflicts with any booked slot's buffer time
        const isBooked = bookedSlots.some(
          (booked) =>
            slotDateTime >= booked.bufferStart && slotDateTime <= booked.bufferEnd
        );

        if (!isBooked) {
          availableSlots.push(timeString);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        date,
        branch,
        availableSlots,
        bookedCount: appointments.length,
        businessHours,
      },
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
