import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { supabase, response } = createClient(req)

  // Use getUser() instead of getSession() for better security
  // It verifies the token with Supabase Auth server
  const {
    data: { user }
  } = await supabase.auth.getUser()

  // OPTIONAL: this forces users to be logged in to use the chatbot.
  // If you want to allow anonymous users, simply remove the check below.
  if (
    !user &&
    !req.url.includes('/sign-in') &&
    !req.url.includes('/sign-up')
  ) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/sign-in'
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - share (publicly shared chats)
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!share|api|_next/static|_next/image|favicon.ico).*)'
  ]
}
