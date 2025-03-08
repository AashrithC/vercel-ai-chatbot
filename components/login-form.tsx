'use client'

import * as React from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconSpinner } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const { refreshSession } = useAuth()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        setError(error.message)
        toast.error(error.message)
        return
      }
      
      setEmail('')
      toast.success('Check your email for the login link')
      router.push('/auth-confirmation')
    } catch (error) {
      console.error('Error during magic link sign in:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-2 text-sm text-red-500">
          {error}
        </div>
      )}
      <Button disabled={isLoading}>
        {isLoading && <IconSpinner className="mr-2 animate-spin" />}
        Send Magic Link
      </Button>
    </form>
  )
}
