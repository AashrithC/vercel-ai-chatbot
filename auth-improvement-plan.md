# Authentication and Feature Enhancement Plan

## Current Issues
1. Auth error "Auth session missing!" still appears in terminal during logout
2. Users need to confirm email every time during login
3. Need separate login and signup pages with proper routing
4. Need to update chatbot to use 4omini

## Plan of Action

### Phase 1: Fix Authentication Errors & Implement Proper Auth Flow
1. **Fix Remaining Auth Errors**
   - Further investigate the "Auth session missing!" errors in terminal
   - Update error handling in `auth.ts` to suppress console logs for expected auth state changes
   - Add more specific error handling in the `auth.ts` file to catch and gracefully handle "Auth session missing!" errors
   - Modify the error handling to not log errors that are expected during logout

2. **Solve Email Confirmation Issue**
   - Based on research, the email confirmation issue is likely related to Supabase Auth settings
   - Check Supabase dashboard for "Email confirmation" settings - disable if possible
   - Create an auth webhook to automatically confirm emails or skip confirmation
   - Implement proper session persistence to prevent repeated confirmations
   - If direct setting changes don't work, we may need to modify the sign-up flow in our app to handle confirmation differently

3. **Create Separate Login & Signup Pages**
   - Create a dedicated `app/signup/page.tsx` for registration
   - Modify existing `app/sign-in/page.tsx` to focus only on sign-in functionality
   - Implement Server Actions for both pages to handle form submissions
   - Structure based on Next.js App Router best practices:
     ```tsx
     // app/signup/page.tsx
     import { signup } from './actions'
     
     export default function SignUpPage() {
       return (
         <form>
           <input name="email" type="email" required />
           <input name="password" type="password" required />
           <button formAction={signup}>Sign up</button>
           <a href="/sign-in">Already have an account? Sign in</a>
         </form>
       )
     }
     ```
     
     ```tsx
     // app/signup/actions.ts
     'use server'
     import { createClient } from '@/utils/supabase/server'
     import { redirect } from 'next/navigation'
     
     export async function signup(formData: FormData) {
       const supabase = await createClient()
       const data = {
         email: formData.get('email') as string,
         password: formData.get('password') as string,
       }
       
       const { error } = await supabase.auth.signUp(data)
       if (error) {
         // Handle error
         redirect('/error?message=' + encodeURIComponent(error.message))
       }
       
       redirect('/auth-confirmation')
     }
     ```

### Phase 2: Routing and Navigation Improvements
1. **Implement Proper Page Routing**
   - Create a dedicated auth confirmation page at `app/auth-confirmation/page.tsx`
   - Set up server-side auth confirmation endpoint at `app/auth/confirm/route.ts` based on Supabase docs:
     ```tsx
     // app/auth/confirm/route.ts
     import { createClient } from '@/utils/supabase/server'
     import { NextResponse } from 'next/server'
     
     export async function GET(request: Request) {
       const requestUrl = new URL(request.url)
       const token_hash = requestUrl.searchParams.get('token_hash')
       const type = requestUrl.searchParams.get('type')
       const next = requestUrl.searchParams.get('next') || '/'
       
       if (token_hash && type) {
         const supabase = await createClient()
         const { error } = await supabase.auth.verifyOtp({ 
           token_hash, 
           type: type as any
         })
         
         if (error) {
           return NextResponse.redirect(
             `${requestUrl.origin}/error?message=${encodeURIComponent(error.message)}`
           )
         }
       }
       
       return NextResponse.redirect(`${requestUrl.origin}${next}`)
     }
     ```
   - Implement proper redirects for authenticated/unauthenticated states
   - Add route guards for protected pages

2. **Enhance Navigation UI**
   - Add clear links between login and signup pages
   - Create a consistent header with auth state-dependent navigation
   - Add proper logout flow that redirects to sign-in page

### Phase 3: Chatbot Integration with 4omini
1. **Research 4omini API**
   - Locate API documentation for 4omini
   - Compare API structure with current OpenAI integration
   - Identify necessary changes to the API calls and response handling
   - Check if streaming is supported and how it differs from OpenAI

2. **Update Chatbot Implementation**
   - Modify the API route handler at `app/api/chat/route.ts` to use 4omini
   - Update the streaming implementation for 4omini responses
   - Implementation will follow this pattern:
     ```typescript
     // app/api/chat/route.ts
     import { StreamingTextResponse, Message } from 'ai'
     
     export async function POST(req: Request) {
       const { messages } = await req.json()
       
       // Format messages for 4omini API
       const formattedMessages = formatMessages(messages)
       
       // Call 4omini API with streaming enabled
       const response = await fetch('https://api.4omini.ai/v1/chat/completions', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${process.env.FOUROMI_API_KEY}`
         },
         body: JSON.stringify({
           model: '4omini-latest',
           messages: formattedMessages,
           stream: true
         })
       })
       
       // Return streaming response to client
       return new StreamingTextResponse(response.body)
     }
     ```
   - Test chat functionality with 4omini model
   - Ensure error handling works with the new provider

### Phase 4: Testing & Deployment
1. **Comprehensive Testing**
   - Test complete authentication flow end-to-end
   - Verify that users can register without email confirmation issues
   - Test login functionality and session persistence
   - Ensure chat works properly with 4omini
   - Check for any regressions in existing functionality

2. **Deployment Preparation**
   - Update environment variables for production
   - Add 4omini API key to environment variables
   - Ensure Supabase settings are properly configured
   - Document deployment process and required environment variables

## Next Steps
Starting with Phase 1 - focusing on creating separate login/signup pages and fixing the authentication errors.

## References
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Session Management](https://supabase.com/docs/reference/javascript/auth-getsession)
- [Supabase Email Confirmation Settings](https://supabase.com/docs/guides/auth/auth-email) 