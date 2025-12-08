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

export async function getAnnouncements() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/announcements`,
    { method: "GET", cache: "no-store" }
  );

  const data = await response.json();
  if (data.success) {
    return data.announcements;
  }
  return [];
}

export async function createAnnouncement(announcementData: {
  title: string;
  description: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  userId: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/announcements`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(announcementData),
    }
  );

  const data = await response.json();
  return data;
}

export async function updateAnnouncement(
  id: string,
  announcementData: {
    title: string;
    description: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
  },
  userId: string
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/announcements`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...announcementData, userId }),
    }
  );

  const data = await response.json();
  return data;
}

export async function deleteAnnouncement(id: string, userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/announcements?id=${id}&userId=${userId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, userId }),
    }
  );

  const data = await response.json();
  return data;
}

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
  const queryType = type ? `&type=${type}` : "";
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/getTransaction?id=${id}${queryType}`,
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

export async function removeCartItem(itemId: string) {
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

export async function updateCartItem(itemId: string, quantity: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/updateCartItem`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId, quantity }),
    }
  );

  return response.json();
}

export async function getAppointmentsByUser(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAppointmentsByUser?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      return data.appointments;
    }
    return [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

export async function cancelAppointment(appointmentId: string, userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/cancelAppointment`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId, userId }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { success: false, error: "Failed to cancel appointment" };
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: string, markedByAdmin: boolean = false) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/updateAppointmentStatus`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId, status, markedByAdmin }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return { success: false, error: "Failed to update appointment status" };
  }
}

export async function autoCompleteAppointments() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/autoCompleteAppointments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error auto-completing appointments:", error);
    return { success: false, error: "Failed to auto-complete appointments" };
  }
}

export async function getAllFeedback() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getFeedback`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      return {
        feedback: data.feedback || [],
        stats: data.stats || {}
      };
    }
    return { feedback: [], stats: {} };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return { feedback: [], stats: {} };
  }
}

export async function updateFeedbackStatus(id: string, status: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/manageFeedback`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error updating feedback status:", error);
    return false;
  }
}

export async function deleteFeedback(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/manageFeedback?id=${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return false;
  }
}

export async function getAllAppointments() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAllAppointments`,
      { 
        method: "GET",
        cache: "no-store" // Ensure fresh data
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    
    const data = await response.json();
    if (data.success) {
      return { success: true, data: data.appointments };
    }
    return { success: false, data: [], error: 'API returned unsuccessful response' };
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    return { success: false, data: [], error: 'Failed to fetch appointments' };
  }
}

export async function getAllTransactions() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/getAllTransactions`,
      { 
        method: "GET",
        cache: "no-store" // Ensure fresh data
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    const data = await response.json();
    if (data.success) {
      // Filter for test drives and reservation claiming
      const filteredTransactions = data.transactions.filter((t: any) => 
        t.transactionType?.toLowerCase().includes('test drive') ||
        t.transactionType?.toLowerCase().includes('reservation') ||
        t.transactionType?.toLowerCase().includes('claiming')
      );

      return { success: true, data: data.transactions };
    }
    return { success: false, data: [], error: 'API returned unsuccessful response' };
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return { success: false, data: [], error: 'Failed to fetch transactions' };
  }
}

// Server actions for events
export async function getAllEvents() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events`,
      { 
        method: "GET",
        cache: "no-store" // Ensure fresh data
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    const data = await response.json();
    if (data.success) {
      return { success: true, data: data.events };
    }
    return { success: false, data: [], error: 'API returned unsuccessful response' };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, data: [], error: 'Failed to fetch events' };
  }
}

export async function createEvent(eventData: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    
    const data = await response.json();
    if (data.success) {
      return { success: true, event: data.event };
    }
    return { success: false, error: 'API returned unsuccessful response' };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function updateEvent(eventData: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update event');
    }
    
    const data = await response.json();
    if (data.success) {
      return { success: true, event: data.event };
    }
    return { success: false, error: 'API returned unsuccessful response' };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: 'Failed to update event' };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events?id=${eventId}`,
      {
        method: "DELETE",
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
    
    const data = await response.json();
    if (data.success) {
      return { success: true };
    }
    return { success: false, error: 'API returned unsuccessful response' };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error: 'Failed to delete event' };
  }
}

// User Management Actions
export async function getAllUsers() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, users: [], stats: {} };
  }
}

export async function updateUserMetadata(userId: string, metadata: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, metadata }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return false;
  }
}

export async function deleteUser(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}

// Admin Management Actions
export async function getAllAdmins(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admins?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching admins:", error);
    return { success: false, admins: [], stats: {} };
  }
}

export async function createAdmin(adminData: {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  adminRole: string;
  assignedBranch?: string;
  userId: string;
}) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admins`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: data.success, error: null };
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return { success: false, error: error.message || "Failed to create admin" };
  }
}

export async function updateAdmin(adminId: string, adminRole: string, assignedBranch?: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admins`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminId, adminRole, assignedBranch }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error updating admin:", error);
    return false;
  }
}

export async function deleteAdmin(adminId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admins?adminId=${adminId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error deleting admin:", error);
    return false;
  }
}

export async function createCheckoutOnsite(data: any) {
  // console.log(data)
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/createTransaction`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const responseData = await response.json();
  return responseData;
}

// export async function createCheckoutOnline(data: any) {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_BASE_URL}/api/createTransaction`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     }
//   );
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }
//   const responseData = await response.json();
//   return responseData;
// }

// Branch Calendar Settings Actions
export async function getBranchCalendarSettings(branch: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/branchCalendarSettings?branch=${encodeURIComponent(branch)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching branch calendar settings:", error);
    return { success: false, error: "Failed to fetch calendar settings" };
  }
}

export async function updateBranchCalendarSettings(data: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/branchCalendarSettings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating branch calendar settings:", error);
    return { success: false, error: "Failed to update calendar settings" };
  }
}

export async function addClosedDate(branch: string, closedDate: string, reason: string, adminUserId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/branchCalendarSettings`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ branch, closedDate, reason, adminUserId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding closed date:", error);
    return { success: false, error: "Failed to add closed date" };
  }
}

export async function removeClosedDate(branch: string, closedDate: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/branchCalendarSettings?branch=${encodeURIComponent(branch)}&closedDate=${closedDate}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing closed date:", error);
    return { success: false, error: "Failed to remove closed date" };
  }
}

export async function checkAvailability(branch: string, date: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkAvailability?branch=${encodeURIComponent(branch)}&date=${date}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking availability:", error);
    return { success: false, error: "Failed to check availability" };
  }
}