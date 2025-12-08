import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

import { NextResponse } from "next/server";

type Transaction = {
  _id: string;
  [key: string]: any;
};

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const url = new URL(req.url);
    const transactionId = url.searchParams.get("id");
    const paymentStatus = url.searchParams.get("type");

    if (transactionId && !paymentStatus) {
      const data = await db.collection<Transaction>("transactions").findOne({ _id: transactionId });
      return NextResponse.json({ success: true, data });
    }

    if (transactionId) {
      const data = await db
        .collection<Transaction>("transactions")
        .findOne({ _id: transactionId, mayaStatus: paymentStatus });
      return NextResponse.json({ success: true, data });
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
