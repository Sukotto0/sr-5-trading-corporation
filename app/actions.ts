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
  const reservationFee = formData.get("reservationFee");
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
        reservationFee,
        referenceNumber,
        productPrice,
        appointment,
      }),
    }
  );

  const data = await response.json();
  if (data.status != 200) {
    throw new Error(data.error || "Failed to create transaction");
  }

  return data.data;
}

export async function getTransaction(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/getTransaction?id=${id}`,
    { method: "GET" }
  );

  const data = await response.json();
  if (data.success) {
    return data;
  }
}
