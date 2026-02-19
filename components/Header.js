'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header({ user }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">Smart Bookmarks</span>
        </div>

        {/* User info + Sign out */}
        <div className="flex items-center gap-3">
          {/* User avatar */}
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Your avatar"
              className="w-8 h-8 rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-indigo-600">
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
          )}

          {/* Name (hidden on small screens) */}
          <span className="hidden sm:block text-sm text-gray-600">
            {user?.user_metadata?.name || user?.email}
          </span>

          {/* Sign out button */}
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-lg px-3 py-1.5 transition-colors duration-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}