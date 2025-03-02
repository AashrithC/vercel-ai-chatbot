'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An error occurred'
  
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center py-10">
      <div className="w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded mb-6">
          {message}
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 