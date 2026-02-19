import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This route handles the redirect from Google after login
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successfully logged in — send to dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Something went wrong — send back to home
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}