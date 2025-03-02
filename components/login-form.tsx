'use client'

import * as React from 'react'
import { createClient } from '@/utils/supabase/client'

import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconSpinner } from '@/components/ui/icons'

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const supabase = createClient()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`
      }
    })
    setIsLoading(false)
    setEmail('')
    if (error) {
      return toast.error(error.message)
    }
    return toast.success('Check your inbox to signin')
  }
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <Button disabled={isLoading}>
        {isLoading && <IconSpinner className="mr-2 animate-spin" />}
        Sign In
      </Button>
    </form>
  )
}
