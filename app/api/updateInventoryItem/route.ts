import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { send } from "process";

export async function PATCH(req: Request) {
  console.log("Updating product...");
  const sendData = await req.json();
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const { productId, data } = sendData;

    console.log("Product ID:", productId, "Update Data:", data);

    // Add updated timestamp to the update data
    const updateDataWithTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    console.log(updateDataWithTimestamp);
    const updateData = await db
      .collection("inventory")
      .updateOne(
        { _id: ObjectId.createFromHexString(productId) },
        { $set: updateDataWithTimestamp }
      );

    console.log("Update result:", updateData);
    return NextResponse.json({ success: true, updateData }, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const sendData = await req.json();

  try {
    const client = await clientPromise;
    const db = client.db("main");
    const { documentId } = sendData;

    const data = await db
      .collection("inventory")
      .deleteOne({ _id: ObjectId.createFromHexString(documentId) });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
