import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Pages that require a signed-in user (others are redirected to sign in).
// API routes verify the session themselves and respond with 401 instead.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/workspace(.*)",
  "/createworkspace(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
