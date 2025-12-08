import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (userId) {
      const cartItems = await db.collection("userCartItems").find({ userId: userId }).toArray();
      
      // Fetch current stock and location for each product from inventory collection
      const enrichedCartItems = await Promise.all(
        cartItems.map(async (item) => {
          const inventory = await db.collection("inventory").findOne({ _id: new ObjectId(item.productId) });
          return {
            ...item,
            availableStock: inventory?.quantity || 0,
            location: inventory?.location || "Albay",
          };
        })
      );
      
      return NextResponse.json({ success: true, data: enrichedCartItems });
    } else {
      return NextResponse.json({
        success: false,
        error: "No search parameter given.",
      });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
