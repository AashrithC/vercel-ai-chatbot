'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate inputs
  if (!email || !password || !confirmPassword) {
    return { error: 'Please fill in all fields' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  try {
    const supabase = createClient()

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/confirm`
      }
    })

    if (error) {
      return { error: error.message }
    }

    // Revalidate the layout to update the auth state
    revalidatePath('/', 'layout')
    
    // If auto-confirm is disabled, redirect to a confirmation page
    if (data?.user?.identities?.length === 0) {
      // User already exists but hasn't confirmed their email
      return { error: 'This email is already registered but not confirmed. Please check your inbox.' }
    } else if (!data?.user?.email_confirmed_at) {
      // New user, needs to confirm email
      return { success: true, confirmation: true }
    }

    // If auto-confirm is enabled, redirect to home
    redirect('/')
  } catch (error) {
    console.error('Sign up error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function signupWithGithub() {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { url: data.url }
} 