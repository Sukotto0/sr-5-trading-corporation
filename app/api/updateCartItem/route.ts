import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    
    const { itemId, quantity } = await req.json();
    
    if (!itemId || !quantity || quantity < 1) {
      return NextResponse.json({
        success: false,
        error: "Item ID and valid quantity are required.",
      });
    }

    const result = await db.collection("userCartItems").updateOne(
      { _id: new ObjectId(itemId) },
      { $set: { quantity: quantity } }
    );

    if (result.matchedCount === 1) {
      return NextResponse.json({ 
        success: true, 
        message: "Cart item quantity updated successfully" 
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
      { success: false, error: "Failed to update cart item quantity" },
      { status: 500 }
    );
  }
}