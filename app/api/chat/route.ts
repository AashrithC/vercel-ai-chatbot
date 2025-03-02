import 'server-only'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Database } from '@/lib/db_types'
import { PostgrestError } from '@supabase/supabase-js'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    const json = await req.json()
    const { messages, previewToken } = json
    
    // Use auth helper which now uses getUser() for better security
    const userData = await auth({ cookieStore })
    const userId = userData?.user?.id
    
    if (!userId) {
      return new Response('Unauthorized', {
        status: 401
      })
    }

    if (previewToken) {
      configuration.apiKey = previewToken
    }

    const res = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      stream: true
    })

    const stream = OpenAIStream(res, {
      async onCompletion(completion) {
        try {
          const title = json.messages[0].content.substring(0, 100)
          const id = json.id ?? nanoid()
          const createdAt = Date.now()
          const path = `/chat/${id}`
          const payload = {
            id,
            title,
            userId,
            createdAt,
            path,
            messages: [
              ...messages,
              {
                content: completion,
                role: 'assistant'
              }
            ]
          }
          
          // Insert chat into database with proper error handling
          const { error } = await supabase.from('chats').upsert({ id, payload })
          
          if (error) {
            console.error('Database error saving chat:', error)
            // We can't return an error response here because the stream has already started
            // Just log the error for now
          }
        } catch (error) {
          console.error('Error in onCompletion handler:', error)
        }
      }
    })

    try {
      return new StreamingTextResponse(stream)
    } catch (error) {
      // Handle errors in the streaming response
      console.error('Streaming error:', error)
      
      // If headers haven't been sent yet, we can return an error response
      // Otherwise, the error will be handled by the client
      return new Response('Error in streaming response', { status: 500 })
    }
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Return appropriate error response based on error type
    if (error instanceof PostgrestError) {
      return new Response('Database access error', { status: 403 })
    }
    
    return new Response('Internal server error', { status: 500 })
  }
}
