import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    
    const { itemId } = await req.json();
    
    if (!itemId) {
      return NextResponse.json({
        success: false,
        error: "Item ID is required.",
      });
    }

    const result = await db.collection("userCartItems").deleteOne({ 
      _id: new ObjectId(itemId) 
    });

    if (result.deletedCount === 1) {
      return NextResponse.json({ 
        success: true, 
        message: "Item removed from cart successfully" 
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Item not found in cart.",
      });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}