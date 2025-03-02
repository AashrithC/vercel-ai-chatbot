import 'server-only'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

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
      console.log('Auth error:', error.message)
      // Return null instead of throwing the error
      return null
    }
    
    // Return the verified user data
    return data
  } catch (err) {
    console.error('Unexpected auth error:', err)
    // Return null for any unexpected errors
    return null
  }
}
