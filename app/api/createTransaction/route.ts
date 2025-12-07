import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// const response: any = paymaya.createCheckout({
//     totalAmount: {
//       currency: "PHP",
//       value: toPay,
//     },
//     buyer: {
//       firstName: firstName,
//       lastName: lastName,
//       contact: { phone: phone, email: email },
//     },
//     items: [
//       {
//         name: productName,
//         code: productId,
//         quantity: 1,
//         amount: { value: toPay },
//         totalAmount: { value: toPay },
//       },
//     ],
//     redirectUrl: {
//       success: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/success?id=${referenceNumber}`,
//       failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/failed?id=${referenceNumber}`,
//       cancel: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/cancelled?id=${referenceNumber}`,
//     },
//     metadata: {
//       userId,
//       appointment,
//     },
//     requestReferenceNumber: referenceNumber,
//   });

export async function POST(request: Request) {
  const {
    firstName,
    lastName,
    email,
    phone,
    items,
    toPay,
    referenceNumber,
    productPrice,
    appointment,
    userId,
    branch,
    paymentMethod,
  } = await request.json();

  let mayaResponse: any = null;
  let paymentDetails: any = null;

  // Only create Maya checkout for online payments
  if (paymentMethod === "online") {
    try {
      // Use Maya Checkout API directly
      const mayaApiUrl = process.env.MAYA_PUBLIC_KEY?.includes("pk-")
        ? "https://pg-sandbox.paymaya.com/checkout/v1/checkouts"
        : "https://pg.paymaya.com/checkout/v1/checkouts";

      const checkoutData = {
        totalAmount: {
          currency: "PHP",
          value: toPay,
        },
        buyer: {
          firstName: firstName,
          lastName: lastName,
          contact: { phone: phone, email: email },
        },
        items: items,
        redirectUrl: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/success?id=${referenceNumber}`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/failed?id=${referenceNumber}`,
          cancel: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/cancelled?id=${referenceNumber}`,
        },
        metadata: {
          userId,
          appointment,
          branch,
        },
        requestReferenceNumber: referenceNumber,
      };

      // console.log(
      //   "Sending to Maya API:",
      //   JSON.stringify(checkoutData, null, 2)
      // );

      const mayaApiResponse = await fetch(mayaApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(process.env.MAYA_PUBLIC_KEY + ":").toString("base64")}`,
        },
        body: JSON.stringify(checkoutData),
      });

      if (!mayaApiResponse.ok) {
        const errorText = await mayaApiResponse.text();
        console.error("Maya API Error Response:", errorText);
        return NextResponse.json(
          {
            error: "Failed to create Maya checkout",
            details: errorText,
          },
          { status: 500 }
        );
      }

      mayaResponse = await mayaApiResponse.json();
      paymentDetails = mayaResponse?.checkoutId;

      // console.log("Maya Response:", JSON.stringify(mayaResponse, null, 2));

      if (!mayaResponse || !mayaResponse.redirectUrl) {
        console.error("Maya response missing redirectUrl:", mayaResponse);
        return NextResponse.json(
          {
            error: "Maya checkout created but no redirect URL received",
            mayaResponse,
          },
          { status: 500 }
        );
      }
    } catch (mayaError: any) {
      console.error("Maya API Error:", mayaError);
      return NextResponse.json(
        {
          error: "Failed to create Maya checkout",
          details: mayaError.message,
        },
        { status: 500 }
      );
    }
  }

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
      items,
      toPay,
      productPrice,
      userId,
      appointment,
      branch,
      paymentMethod,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: paymentMethod === "online" ? "pending" : "confirmed",
      paymentId: paymentDetails,
    };

    await db.collection("transactions").insertOne(itemWithTimestamps);
    items.forEach(async (item: any) => {
      await db
        .collection("userCartItems")
        .deleteOne({ productId: item.code, userId: userId });

      await db.collection("inventory").updateOne(
        { _id: new ObjectId(item.code) },
        { 
          $inc: { quantity: -item.quantity },
          $set: { lastUpdated: new Date().toISOString() }
        }
      );
    });

    // Return appropriate response based on payment method
    if (paymentMethod === "online" && mayaResponse) {
      return NextResponse.json(
        {
          success: true,
          redirectUrl: mayaResponse.redirectUrl,
          referenceNumber,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: true,
          referenceNumber,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error saving transaction:", error);
    return NextResponse.json(
      { error: "Failed to save transaction" },
      { status: 500 }
    );
  }
}
