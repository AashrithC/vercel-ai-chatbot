import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export function createClient(request: NextRequest) {
  const response = NextResponse.next()

  return {
    supabase: createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            response.cookies.set({
              name,
              value,
              ...options
            })
          },
          remove(name, options) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0
            })
          }
        }
      }
    ),
    response
  }
} 