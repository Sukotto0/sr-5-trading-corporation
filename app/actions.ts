"use server";

export async function getInventory() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/getInventory`,
    { method: "GET" }
  );

  const data = await response.json();
  if (data.success) {
    return data;
  }
}

export async function getProduct(slug: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/getProduct?slug=${slug}`,
    { method: "GET" }
  );

  const data = await response.json();
  if (data.success) {
    return data;
  }
}

export async function createInventoryItem(data: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/createInventoryItem`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
}

export async function updateProduct({
  productId,
  sendData,
}: {
  productId: string | undefined;
  sendData: any;
}) {
  if (!productId) {
    return { success: false, error: "No product ID provided" };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/updateInventoryItem`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        data: sendData,
      }),
    }
  );
  const data: any = await response.json();

  if (data.success) {
    return { success: true };
  } else {
    console.error("Error deleting:", data.error);
    return { success: false, error: "Failed to delete" };
  }
}

export async function deleteProduct({ documentId }: { documentId: string }) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/updateInventoryItem`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId,
      }),
    }
  );
  const data: any = await response.json();

  if (data.success) {
    return { success: true };
  } else {
    console.error("Error deleting:", data.error);
    return { success: false, error: "Failed to delete" };
  }
}

export const uploadImageToBlob = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export async function createReservation(formData: FormData) {
  console.log("Creating reservation...");

  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const appointment = formData.get("appointment");
  const productName = "Reservation Fee: " + formData.get("productName");
  const productId = formData.get("productId");
  const productPrice = formData.get("productPrice");
  const toPay = formData.get("reservationFee");
  const userId = formData.get("userId");

  const referenceNumber = `SR5-${firstName?.slice(0, 1)}${lastName?.slice(0, 1)}-${Date.now()}`;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/createTransaction`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        productName,
        productId,
        toPay,
        referenceNumber,
        productPrice,
        appointment,
        userId,
      }),
    }
  );

  const data = await response.json();
  if (data.status != 200) {
    throw new Error(data.error || "Failed to create transaction");
  }

  return data.data;
}

// TODO: move type status to get official status on transaction
export async function getTransaction(id: string, type?: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/getTransaction?id=${id}&type=${type}`,
    { method: "GET" }
  );

  const data = await response.json();
  if (data.success) {
    return data;
  }
}

export async function getTransactionsByUser(userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/getTransactionsByUser?userId=${userId}`,
    { method: "GET" }
  );

  const data = await response.json();
  if (data.success) {
    return data.data;
  }
}

export async function getServices() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/getServices`,
    { method: "GET" }
  );

  const data = await response.json();
  if (data.success) {
    return data;
  }
}

export async function createAppointment(data: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/createAppointment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export async function createFeedback(data: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/createFeedback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export async function addToCart(data: any) {
  const formattedData = data;
  formattedData.quantity = parseInt(data.quantity, 10);
  formattedData.price = parseFloat(data.price);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/addToCart`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export async function getCartItems(userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/getCartItems?userId=${userId}`,
    { method: "GET" }
  );
  const data = await response.json();
  if (data.success) {
    return data.data;
  }
}

export async function removeCartItem(itemId: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/removeCartItem`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId }),
    }
  );

  return response.json();
}

