import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/browse/(.*)'
])

const isLoggedInRoute = createRouteMatcher([
  "/cart(.*)",
  "/feedback",
  "/schedule(.*)"
])

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();
  
  // User is accessing logged in route without logging in
  if(isLoggedInRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/", req.url));
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