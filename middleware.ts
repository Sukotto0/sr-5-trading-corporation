import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/browse/(.*)',
  '/testing'
])

const isLoggedInRoute = createRouteMatcher([
  "/cart(.*)",
  "/feedback",
  "/schedule(.*)",
  "/transactions(.*)",
])

const isAdminRoute = createRouteMatcher([
  "/admin/(.*)"
])

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();
  
  // User is accessing logged in route without logging in
  if((isLoggedInRoute(req) || isAdminRoute(req)) && !userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Check if user has admin privileges and redirect to admin dashboard
  if (userId && sessionClaims) {
    const publicMetadata = sessionClaims.publicMetadata as { 
      isAdmin?: boolean; 
      adminRole?: 'admin' | 'superadmin' 
    } | undefined;
    
    const isAdmin = publicMetadata?.isAdmin === true;
    const adminRole = publicMetadata?.adminRole;
    
    // If user is admin and not already on admin route, redirect to admin dashboard
    if (isAdmin && (adminRole === 'admin' || adminRole === 'superadmin') && !isAdminRoute(req)) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    
    // If user is not admin but trying to access admin routes, redirect to home
    if (!isAdmin && isAdminRoute(req)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}