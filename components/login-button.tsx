'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { IconGitHub } from '@/components/ui/icons'

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      console.error('Error during GitHub login:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      className="w-full" 
      onClick={handleGitHubLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin">◌</span>
      ) : (
        <IconGitHub className="mr-2 h-4 w-4" />
      )}
      Continue with GitHub
    </Button>
  )
}
