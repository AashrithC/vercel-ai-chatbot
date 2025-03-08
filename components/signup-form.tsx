"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/contexts/auth-context'

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { refreshSession } = useAuth()

  // Check if email exists without creating an account
  const checkEmailExists = async (email: string) => {
    try {
      // Using the signIn method with wrong password is a way to check if email exists
      // This is not ideal but it's a workaround since Supabase doesn't have a direct "check email exists" method
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'temporary-check-password', // This will fail if email exists
      })

      // If the error is "Invalid login credentials" then the email exists
      // Any other error means the email doesn't exist or something else went wrong
      if (error && error.message.includes('Invalid login credentials')) {
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error checking email:', error)
      return false
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      toast.error("Passwords don't match")
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      toast.error("Password must be at least 8 characters")
      return
    }

    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email)
      if (emailExists) {
        setError("An account with this email already exists. Please sign in instead.")
        toast.error("Email already in use")
        setIsLoading(false)
        return
      }

      // Proceed with signup
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        let errorMessage = signUpError.message
        
        // Replace technical error messages with user-friendly ones
        if (errorMessage.includes('already registered')) {
          errorMessage = 'This email is already registered. Please sign in instead.'
        }
        
        setError(errorMessage)
        toast.error(errorMessage)
        return
      }

      toast.success('Check your email for the confirmation link!')
      router.push('/auth-confirmation')
      
      // Refresh session after successful signup
      refreshSession()
    } catch (error) {
      console.error('Error during sign up:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          Password must be at least 8 characters
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-2 text-sm text-red-500">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing up...' : 'Sign up'}
      </Button>
      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
          Sign in
        </Link>
      </div>
    </form>
  )
} 