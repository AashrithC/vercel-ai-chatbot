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
  
  // Use getUser() instead of getSession() for better security
  // getUser() verifies with the Supabase Auth server every time
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  
  // Return the verified user instead of the session
  return data
}
