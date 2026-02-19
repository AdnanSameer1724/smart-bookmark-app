'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BookmarkForm({ userId }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  // Make sure URL has http/https prefix
  function normalizeUrl(inputUrl) {
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      return 'https://' + inputUrl
    }
    return inputUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!title.trim() || !url.trim()) {
      setError('Please fill in both title and URL.')
      return
    }

    setLoading(true)

    const cleanUrl = normalizeUrl(url.trim())

    const { error: insertError } = await supabase
      .from('bookmarks')
      .insert({
        title: title.trim(),
        url: cleanUrl,
        user_id: userId,
      })

    if (insertError) {
      setError('Failed to save bookmark. Please try again.')
      console.error(insertError)
    } else {
      // Clear the form on success
      setTitle('')
      setUrl('')
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add a Bookmark</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g. My Favorite Article"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* URL input */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            id="url"
            type="text"
            placeholder="e.g. https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-xl transition-colors duration-200 text-sm"
        >
          {loading ? 'Saving...' : 'Save Bookmark'}
        </button>
      </form>
    </div>
  )
}