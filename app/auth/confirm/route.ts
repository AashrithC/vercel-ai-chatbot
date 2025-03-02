import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/'
  
  if (!token_hash || !type) {
    return NextResponse.redirect(
      `${requestUrl.origin}/error?message=${encodeURIComponent('Missing token or type')}`
    )
  }
  
  const supabase = createClient()
  
  if (type === 'email') {
    const { error } = await supabase.auth.verifyOtp({ 
      token_hash, 
      type: 'email'
    })
    
    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/error?message=${encodeURIComponent(error.message)}`
      )
    }
  } else if (type === 'recovery') {
    // Handle password recovery flow
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?token_hash=${token_hash}`
    )
  } else {
    return NextResponse.redirect(
      `${requestUrl.origin}/error?message=${encodeURIComponent('Invalid token type')}`
    )
  }
  
  // All verifications successful, redirect to requested page or home
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
} 