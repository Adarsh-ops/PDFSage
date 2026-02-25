import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const publicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);
const isAdminRoute = createRouteMatcher(['/upload']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  const isAdmin = sessionClaims?.metadata?.role === 'admin';

  if (isAdminRoute(req)) {
    if (!userId) {
       return (await auth()).redirectToSignIn();
    }
    
    if (!isAdmin) {
      console.log("DEBUG: User is logged in but NOT an admin. Redirecting...");
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (!publicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};