
// Import Clerk middleware helpers and Next.js response utility
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';


// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/groups(.*)",
  "/expenses(.*)",
  "/settlements(.*)",
  "/person(.*)",
]);


// Main middleware function to protect routes
export default clerkMiddleware(async (auth, req) => {
  // Get the current user's ID (if authenticated)
  const { userId } = await auth();

  // If not authenticated and accessing a protected route, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  // Otherwise, allow the request to proceed
  return NextResponse.next();
});


// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};