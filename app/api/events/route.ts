import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Fetch all events
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const events = await db.collection("events").find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({ 
      success: true, 
      events: events.map((event: any) => ({
        ...event,
        _id: event._id.toString()
      }))
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST - Create a new event
export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const eventData = await req.json();
    
    const newEvent = {
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.collection("events").insertOne(newEvent);
    
    return NextResponse.json({ 
      success: true, 
      eventId: result.insertedId.toString(),
      event: {
        ...newEvent,
        _id: result.insertedId.toString()
      }
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}

// PUT - Update an existing event
export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const { _id, ...eventData } = await req.json();
    
    if (!_id) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }
    
    const updatedEvent = {
      ...eventData,
      updatedAt: new Date().toISOString()
    };
    
    const result = await db.collection("events").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updatedEvent }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      event: {
        ...updatedEvent,
        _id
      }
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an event
export async function DELETE(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("id");
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }
    
    const result = await db.collection("events").deleteOne({
      _id: new ObjectId(eventId)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}