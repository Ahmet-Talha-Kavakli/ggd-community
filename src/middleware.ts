import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protected route'lar — auth gerekiyor
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/profil(.*)",
  "/sikayet(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next internals + static asset'ler hariç her route
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
