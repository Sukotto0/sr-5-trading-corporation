import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET - Fetch calendar settings for a specific branch
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get("branch");

    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch parameter is required" },
        { status: 400 }
      );
    }

    // Capitalize first letter of branch
    const formattedBranch = branch.charAt(0).toUpperCase() + branch.slice(1).toLowerCase();

    const client = await clientPromise;
    const db = client.db("main");
    
    const settings = await db
      .collection("branchCalendarSettings")
      .findOne({ branch: formattedBranch });

    // If no settings exist, return default settings
    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          branch: formattedBranch,
          closedDates: [],
          businessHours: {
            start: "08:00",
            end: "15:00", // 3 PM
          },
          disableSundays: true,
          bufferTimeMinutes: 120, // 2 hours buffer for double-booking prevention
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching branch calendar settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch calendar settings" },
      { status: 500 }
    );
  }
}

// POST - Create or update calendar settings for a branch
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { branch, closedDates, businessHours, disableSundays, bufferTimeMinutes, adminUserId } = data;

    if (!branch) {
      return NextResponse.json(
        { success: false, error: "Branch is required" },
        { status: 400 }
      );
    }

    // Capitalize first letter of branch
    const formattedBranch = branch.charAt(0).toUpperCase() + branch.slice(1).toLowerCase();

    const client = await clientPromise;
    const db = client.db("main");

    const settingsData = {
      branch: formattedBranch,
      closedDates: closedDates || [],
      businessHours: businessHours || { start: "08:00", end: "15:00" },
      disableSundays: disableSundays !== undefined ? disableSundays : true,
      bufferTimeMinutes: bufferTimeMinutes || 120,
      lastUpdatedBy: adminUserId,
      lastUpdated: new Date().toISOString(),
    };

    const result = await db.collection("branchCalendarSettings").updateOne(
      { branch: formattedBranch },
      { $set: settingsData },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating branch calendar settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update calendar settings" },
      { status: 500 }
    );
  }
}

// PUT - Add a closed date to a branch
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { branch, closedDate, reason, adminUserId } = data;

    if (!branch || !closedDate) {
      return NextResponse.json(
        { success: false, error: "Branch and closedDate are required" },
        { status: 400 }
      );
    }

    // Capitalize first letter of branch
    const formattedBranch = branch.charAt(0).toUpperCase() + branch.slice(1).toLowerCase();

    const client = await clientPromise;
    const db = client.db("main");

    const result = await db.collection("branchCalendarSettings").updateOne(
      { branch: formattedBranch },
      {
        $addToSet: {
          closedDates: {
            date: closedDate,
            reason: reason || "Branch closed",
            addedBy: adminUserId,
            addedAt: new Date().toISOString(),
          },
        },
        $set: {
          lastUpdatedBy: adminUserId,
          lastUpdated: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error adding closed date:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add closed date" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a closed date from a branch
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get("branch");
    const closedDate = searchParams.get("closedDate");

    if (!branch || !closedDate) {
      return NextResponse.json(
        { success: false, error: "Branch and closedDate are required" },
        { status: 400 }
      );
    }

    // Capitalize first letter of branch
    const formattedBranch = branch.charAt(0).toUpperCase() + branch.slice(1).toLowerCase();

    const client = await clientPromise;
    const db = client.db("main");

    const result = await db.collection("branchCalendarSettings").updateOne(
      { branch: formattedBranch },
      {
        $pull: {
          closedDates: { date: closedDate } as any,
        },
      }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error removing closed date:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove closed date" },
      { status: 500 }
    );
  }
}
