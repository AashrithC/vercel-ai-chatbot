import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/'

  // If there's an error, redirect to the error page with the error description
  if (error || !code) {
    const errorMessage = error_description || 'Authentication error'
    return NextResponse.redirect(
      `${requestUrl.origin}/error?error=${encodeURIComponent(errorMessage)}`
    )
  }

  try {
    const cookieStore = cookies()
    const supabase = createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/error?error=${encodeURIComponent(error.message)}`
      )
    }

    // Redirect to the requested page or home page
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/error?error=${encodeURIComponent('An unexpected error occurred')}`
    )
  }
} 