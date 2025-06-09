import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

// Clerk middleware protects /dashboard and its subroutes.
// To make sign-out redirect to /dashboard, configure Clerk's signOutUrl in your ClerkProvider (see layout.js).

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/workspace(.*)',
]);
export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) auth().protect()
  })
