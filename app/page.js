import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already logged in, skip this page
  if (user) redirect('/dashboard')

  async function signInWithGoogle() {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (data.url) {
      redirect(data.url)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
        
        {/* Logo / Icon */}
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg 
            width="32" 
            height="32" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            className="text-white"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Bookmarks</h1>
        <p className="text-gray-500 mb-8">
          Save and organize your favorite links. Sign in to get started.
        </p>

        {/* Google Sign In Button */}
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full cursor-pointer flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            {/* Google SVG Logo */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6">
          Your bookmarks are private and only visible to you.
        </p>
      </div>
    </main>
  )
}