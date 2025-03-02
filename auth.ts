import 'server-only'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

// List of expected error messages that shouldn't be logged as errors
const EXPECTED_AUTH_ERRORS = [
  'Auth session missing!',
  'Invalid JWT',
  'JWT expired',
  'User not found',
  'Session not found'
]

export const auth = async ({
  cookieStore
}: {
  cookieStore: ReturnType<typeof cookies>
}) => {
  // Create a Supabase client configured to use cookies
  const supabase = createClient()
  
  try {
    // Use getUser() instead of getSession() for better security
    // getUser() verifies with the Supabase Auth server every time
    const { data, error } = await supabase.auth.getUser()
    
    // Check for errors including AuthSessionMissingError
    if (error) {
      // Only log unexpected errors
      if (!EXPECTED_AUTH_ERRORS.some(msg => error.message.includes(msg))) {
        console.log('Auth error:', error.message)
      }
      
      // Return null instead of throwing the error
      return null
    }
    
    // Return the verified user data
    return data
  } catch (err) {
    // Only log unexpected errors
    if (err instanceof Error && !EXPECTED_AUTH_ERRORS.some(msg => err.message.includes(msg))) {
      console.error('Unexpected auth error:', err)
    }
    
    // Return null for any unexpected errors
    return null
  }
}
