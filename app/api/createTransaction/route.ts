import paymaya from "@api/paymaya";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const {
    firstName,
    lastName,
    email,
    phone,
    productName,
    productId,
    reservationFee,
    referenceNumber,
    productPrice,
    appointment,
  } = await request.json();

  paymaya.auth(process.env.MAYA_PUBLIC_KEY!, process.env.MAYA_SECRET_KEY!);
  const response = await paymaya.createV1Checkout({
    totalAmount: {
      currency: "PHP",
      value: reservationFee,
    },
    buyer: {
      firstName: firstName,
      lastName: lastName,
      contact: { phone: phone, email: email },
    },
    items: [
      {
        name: productName,
        code: productId,
        quantity: "1",
        amount: { value: reservationFee },
        totalAmount: { value: reservationFee, currency: "PHP" },
      },
    ],
    redirectUrl: {
      success: `https://www.sr5tradingcorp.com/payments/success?id=${referenceNumber}`,
      failure: `https://www.sr5tradingcorp.com/payments/failed?id=${referenceNumber}`,
      cancel: `https://www.sr5tradingcorp.com/payments/cancelled?id=${referenceNumber}`,
    },
    requestReferenceNumber: referenceNumber,
  });

  const paymentDetails = await response.data

  try {
    const client = await clientPromise;
    const db = client.db("main");

    // Add timestamps to the item data
    const itemWithTimestamps = {
      _id: referenceNumber,
      firstName,
      lastName,
      email,
      phone,
      productName,
      productId,
      reservationFee,
      productPrice,
      appointment,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: "pending",
      paymentId: paymentDetails.checkoutId,
    };

    const data = await db
      .collection("transactions")
      .insertOne(itemWithTimestamps);
  } catch (error) {
    console.error("Error saving item:", error);
    return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
  }

  return new Response(JSON.stringify(response), { status: 200 });
}
