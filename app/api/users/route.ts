import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const client = await clerkClient();
    
    // Get all users from Clerk
    const { data: allUsers } = await client.users.getUserList({
      limit: 100,
      orderBy: '-created_at'
    });

    // Filter out admin users (those with isAdmin: true in publicMetadata)
    const users = allUsers.filter(user => {
      const metadata = user.publicMetadata as any;
      return !metadata?.isAdmin;
    });

    // Calculate statistics
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Active users (logged in within last 7 days)
    const activeUsers = users.filter(user => {
      const lastSignIn = user.lastSignInAt ? new Date(user.lastSignInAt) : null;
      return lastSignIn && lastSignIn >= sevenDaysAgo;
    });

    // New signups this month
    const thisMonthSignups = users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= thirtyDaysAgo;
    });

    // Previous month signups (for trend calculation)
    const lastMonthSignups = users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    });

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const totalTrend = calculateTrend(users.length, users.length - thisMonthSignups.length);
    const activeTrend = calculateTrend(activeUsers.length, activeUsers.length * 0.92); // Estimate
    const signupTrend = calculateTrend(thisMonthSignups.length, lastMonthSignups.length);

    const stats = {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      newSignups: thisMonthSignups.length,
      totalTrend,
      activeTrend,
      signupTrend
    };

    // Format user data
    const formattedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.emailAddresses[0]?.emailAddress || '',
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
      unsafeMetadata: user.unsafeMetadata,
    }));

    return NextResponse.json({ 
      success: true, 
      users: formattedUsers,
      stats 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching users from Clerk:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, metadata } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    
    // Update user metadata (for roles, status, etc.)
    await client.users.updateUser(userId, {
      publicMetadata: metadata
    });

    return NextResponse.json({ 
      success: true, 
      message: "User updated successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    
    // Delete user from Clerk
    await client.users.deleteUser(userId);

    return NextResponse.json({ 
      success: true, 
      message: "User deleted successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
