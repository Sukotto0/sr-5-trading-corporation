import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");

    const announcements = await db
      .collection("announcements")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const userId = data.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is superadmin
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const adminRole = user.publicMetadata?.adminRole;

    if (adminRole !== "superadmin") {
      return NextResponse.json(
        { success: false, error: "Only superadmins can create announcements" },
        { status: 403 }
      );
    }

    
    const mongoClient = await clientPromise;
    const db = mongoClient.db("main");

    const announcement = {
      title: data.title,
      description: data.description,
      fileUrl: data.fileUrl || null,
      fileName: data.fileName || null,
      fileType: data.fileType || null,
      createdBy: userId,
      createdByName: `${user.firstName} ${user.lastName}`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    const result = await db.collection("announcements").insertOne(announcement);

    return NextResponse.json({
      success: true,
      announcement: { ...announcement, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const userId = data.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is superadmin
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const adminRole = user.publicMetadata?.adminRole;

    if (adminRole !== "superadmin") {
      return NextResponse.json(
        { success: false, error: "Only superadmins can update announcements" },
        { status: 403 }
      );
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db("main");

    const updateData: any = {
      title: data.title,
      description: data.description,
      lastUpdated: new Date().toISOString(),
    };

    if (data.fileUrl !== undefined) {
      updateData.fileUrl = data.fileUrl;
      updateData.fileName = data.fileName;
      updateData.fileType = data.fileType;
    }

    await db.collection("announcements").updateOne(
      { _id: new ObjectId(data.id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
        
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is superadmin
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const adminRole = user.publicMetadata?.adminRole;

    if (adminRole !== "superadmin") {
      return NextResponse.json(
        { success: false, error: "Only superadmins can delete announcements" },
        { status: 403 }
      );
    }

    
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Announcement ID required" },
        { status: 400 }
      );
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db("main");

    await db.collection("announcements").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
