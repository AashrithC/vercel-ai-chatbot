import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthConfirmationPage() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center py-10">
      <div className="w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Check your email</h2>
        
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded mb-6">
          <p className="mb-2">
            We've sent you a confirmation link. Please check your email and click the link to activate your account.
          </p>
          <p className="text-sm">
            If you don't see the email, check your spam folder or try signing in again.
          </p>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 justify-center">
          <Button asChild>
            <Link href="/sign-in">Go to Sign In</Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 