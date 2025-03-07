import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PasswordLoginForm } from '@/components/password-login-form'

export default async function SignInPage() {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      redirect('/')
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Sign in to your account
            </p>
          </div>

          <div className="mt-6">
            <PasswordLoginForm />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error checking session:', error)
    // Return the sign-in form even if there's an error checking the session
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Sign in to your account
            </p>
          </div>

          <div className="mt-6">
            <PasswordLoginForm />
          </div>
        </div>
      </div>
    )
  }
}
