import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    // Parse the webhook payload from Maya
    const payload = await request.json();

    console.log("Maya Webhook Received:", JSON.stringify(payload, null, 2));

    // Extract relevant data from the webhook
    const {
      id: paymentId,
      status,
      amount,
      currency,
      description,
      requestReferenceNumber,
      metadata,
      createdAt,
      updatedAt,
    } = payload;

    console.log(payload);

    // Validate that we have the reference number to identify the transaction
    if (!requestReferenceNumber) {
      console.error("Missing requestReferenceNumber in webhook payload");
      return NextResponse.json(
        { error: "Missing reference number" },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db("main");

    // Find the transaction by reference number
    const transaction = await db
      .collection("transactions")
      .findOne({ _id: requestReferenceNumber });

    if (!transaction) {
      console.error(`Transaction not found: ${requestReferenceNumber}`);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Update transaction based on payment status
    let updateData: any = {
      paymentId,
      lastUpdated: new Date().toISOString(),
      webhookReceivedAt: new Date().toISOString(),
      mayaStatus: status,
    };

    // Map Maya payment status to our transaction status
    switch (status) {
      case "PAYMENT_SUCCESS":
      case "COMPLETED":
        updateData.status = "confirmed";
        updateData.paymentConfirmedAt = new Date().toISOString();
        metadata.items.map(async (item: any) => {
          await db.collection("inventory").updateOne(
            { _id: new ObjectId(item.code) },
            {
              $inc: { quantity: -item.quantity },
              $set: { lastUpdated: new Date().toISOString() },
            }
          );
        });
        console.log(
          `Payment confirmed for transaction: ${requestReferenceNumber}`
        );
        break;

      case "PAYMENT_FAILED":
      case "FAILED":
        updateData.status = "failed";
        updateData.paymentFailedAt = new Date().toISOString();
        console.log(
          `Payment failed for transaction: ${requestReferenceNumber}`
        );
        break;

      case "PAYMENT_EXPIRED":
      case "EXPIRED":
        updateData.status = "expired";
        updateData.paymentExpiredAt = new Date().toISOString();
        console.log(
          `Payment expired for transaction: ${requestReferenceNumber}`
        );
        break;

      case "FOR_AUTHENTICATION":
      case "AUTHENTICATING":
        updateData.status = "authenticating";
        console.log(
          `Payment authenticating for transaction: ${requestReferenceNumber}`
        );
        break;

      case "PENDING":
        updateData.status = "pending";
        console.log(
          `Payment pending for transaction: ${requestReferenceNumber}`
        );
        break;

      default:
        console.log(
          `Unknown payment status: ${status} for transaction: ${requestReferenceNumber}`
        );
        updateData.status = status.toLowerCase();
    }

    // Store the full webhook payload for reference
    updateData.webhookPayload = payload;

    // Update the transaction in database
    const result = await db
      .collection("transactions")
      .updateOne({ _id: requestReferenceNumber }, { $set: updateData });

    if (result.modifiedCount === 0) {
      console.warn(`No changes made to transaction: ${requestReferenceNumber}`);
    } else {
      console.log(
        `Transaction updated successfully: ${requestReferenceNumber}`
      );
    }

    // Return success response to Maya
    return NextResponse.json(
      {
        success: true,
        message: "Webhook processed successfully",
        referenceNumber: requestReferenceNumber,
        status: updateData.status,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing Maya webhook:", error);

    // Return error response but with 200 status to prevent Maya from retrying
    // (you may want to change this based on your needs)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
      },
      { status: 200 } // Return 200 to acknowledge receipt even if processing failed
    );
  }
}

// Handle GET requests (for webhook verification/testing)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: "Maya Webhook Endpoint",
      status: "active",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
