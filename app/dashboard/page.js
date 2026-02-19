import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import BookmarkForm from '@/components/BookmarkForm'
import BookmarkList from '@/components/BookmarkList'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get the logged-in user
  const { data: { user } } = await supabase.auth.getUser()

  // Shouldn't happen (middleware handles it), but just in case
  if (!user) redirect('/')

  // Fetch the user's bookmarks from the database
  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarks:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        
        {/* Welcome message */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Your personal bookmark collection — private and always in sync.
          </p>
        </div>

        {/* Form to add a bookmark */}
        <BookmarkForm userId={user.id} />

        {/* List of bookmarks */}
        <BookmarkList 
          initialBookmarks={bookmarks || []} 
          userId={user.id} 
        />
      </main>
    </div>
  )
}