import paymaya from "@api/paymaya";

export async function POST(request: Request) {
  const {
    firstName,
    lastName,
    email,
    phone,
    preferredDate,
    preferredTime,
    productName,
    productId,
    productPrice,
  } = await request.json();

  paymaya.auth(process.env.MAYA_PUBLIC_KEY!, process.env.MAYA_SECRET_KEY!);
  const response = await paymaya.createV1Checkout({
    totalAmount: {
      currency: "PHP",
      value: productPrice,
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
        description: "Shoes",
        quantity: "1",
        amount: { value: productPrice },
        totalAmount: { value: productPrice },
      },
    ],
    redirectUrl: {
      success:
        "https://www.merchantsite.com/success?id=5fc10b93-bdbd-4f31-b31d-4575a3785009",
      failure:
        "https://www.mechantsite.com/failure?id=5fc10b93-bdbd-4f31-b31d-4575a3785009",
      cancel:
        "https://www.merchantsite.com/cancel?id=5fc10b93-bdbd-4f31-b31d-4575a3785009",
    },
    requestReferenceNumber: "5fc10b93-bdbd-4f31-b31d-4575a3785009",
  });

  return new Response(JSON.stringify(response), { status: 200 });
}
