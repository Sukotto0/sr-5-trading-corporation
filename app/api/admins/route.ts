import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user to verify they are superadmin
    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const currentUserMetadata = currentUser.publicMetadata as any;

    if (
      !currentUserMetadata?.isAdmin ||
      currentUserMetadata?.adminRole !== "superadmin"
    ) {
      return NextResponse.json(
        { error: "Access denied. Superadmin required." },
        { status: 403 }
      );
    }

    // Get all users from Clerk
    const { data: allUsers } = await client.users.getUserList({
      limit: 500,
      orderBy: "-created_at",
    });

    // Filter only admin users
    const adminUsers = allUsers.filter((user) => {
      const metadata = user.publicMetadata as any;
      return metadata?.isAdmin === true;
    });

    // Calculate statistics
    const superAdmins = adminUsers.filter((user) => {
      const metadata = user.publicMetadata as any;
      return metadata?.adminRole === "superadmin";
    });

    const branchAdmins = adminUsers.filter((user) => {
      const metadata = user.publicMetadata as any;
      return metadata?.adminRole === "admin";
    });

    // Count by branch
    const imusBranch = branchAdmins.filter((user) => {
      const metadata = user.publicMetadata as any;
      return metadata?.assignedBranch === "Imus";
    }).length;

    const bacoorBranch = branchAdmins.filter((user) => {
      const metadata = user.publicMetadata as any;
      return metadata?.assignedBranch === "Bacoor";
    }).length;

    const albayBranch = branchAdmins.filter((user) => {
      const metadata = user.publicMetadata as any;
      return metadata?.assignedBranch === "Albay";
    }).length;

    const stats = {
      totalAdmins: adminUsers.length,
      superAdmins: superAdmins.length,
      imusBranch,
      bacoorBranch,
      albayBranch,
    };

    // Format admin data
    const formattedAdmins = adminUsers.map((user) => {
      const metadata = user.publicMetadata as any;
      return {
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0]?.emailAddress || "",
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        adminRole: metadata?.adminRole || "admin",
        assignedBranch: metadata?.assignedBranch || "",
      };
    });

    return NextResponse.json(
      {
        success: true,
        admins: formattedAdmins,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admins from Clerk:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { email, firstName, lastName, username, password, adminRole, assignedBranch, userId } =
    await req.json();

  try {
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clerkClient();

    // Get current user to check if they're a superadmin
    const currentUser = await client.users.getUser(userId);
    const currentMetadata = currentUser.publicMetadata as any;

    if (currentMetadata?.adminRole !== "superadmin") {
      return NextResponse.json(
        { success: false, error: "Only superadmins can create admin users" },
        { status: 403 }
      );
    }

    if (!email || !firstName || !lastName || !username || !password || !adminRole) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new user with admin metadata
    const newUser = await client.users.createUser({
      emailAddress: [email],
      username,
      password,
      firstName,
      lastName,
      publicMetadata: {
        isAdmin: true,
        adminRole,
        assignedBranch: adminRole === "superadmin" ? "" : assignedBranch || "",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin user created successfully",
        admin: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.emailAddresses[0]?.emailAddress,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    
    // Extract Clerk-specific error details if available
    const errorMessage = error.errors?.[0]?.message || error.message || "Failed to create admin user";
    const errorDetails = error.errors ? JSON.stringify(error.errors) : "";
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clerkClient();

    // Get current user to check if they're a superadmin
    const currentUser = await client.users.getUser(userId);
    const currentMetadata = currentUser.publicMetadata as any;

    if (currentMetadata?.adminRole !== "superadmin") {
      return NextResponse.json(
        { success: false, error: "Only superadmins can update admin users" },
        { status: 403 }
      );
    }

    const { adminId, adminRole, assignedBranch } = await req.json();

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Update user metadata
    await client.users.updateUser(adminId, {
      publicMetadata: {
        isAdmin: true,
        adminRole,
        assignedBranch: adminRole === "superadmin" ? "" : assignedBranch || "",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin user updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating admin user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update admin user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clerkClient();

    // Get current user to check if they're a superadmin
    const currentUser = await client.users.getUser(userId);
    const currentMetadata = currentUser.publicMetadata as any;

    if (currentMetadata?.adminRole !== "superadmin") {
      return NextResponse.json(
        { success: false, error: "Only superadmins can delete admin users" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return NextResponse.json(
        { success: false, error: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Prevent deleting yourself
    if (adminId === userId) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete admin user
    await client.users.deleteUser(adminId);

    return NextResponse.json(
      {
        success: true,
        message: "Admin user deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete admin user" },
      { status: 500 }
    );
  }
}
