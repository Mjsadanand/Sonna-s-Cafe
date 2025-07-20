import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/menu',
  '/about',
  '/contact',
  '/api/offers(.*)',
  '/api/menu(.*)',
  '/api/menu-items(.*)',
  '/api/categories(.*)',
  '/api/webhooks(.*)',
  '/api/otp(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)'
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
  '/api/upload(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Skip Clerk middleware entirely for admin routes (they use custom JWT auth)
  if (isAdminRoute(req)) {
    return
  }

  // Apply Clerk auth to protected routes (non-public, non-admin)
  if (!isPublicRoute(req)) {
    await auth.protect()
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
