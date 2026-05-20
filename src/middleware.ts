import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Protected route'lar — auth gerekiyor
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/profil(.*)",
  "/sikayet(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      // Clerk'in hosted sign-in'i yerine kendi /giris sayfamıza yönlendir.
      // (Default auth.protect() accounts.goosecage.com'a gider, CORS sorunu yaratır.)
      const url = new URL("/giris", req.url);
      url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Next internals + static asset'ler hariç her route
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
