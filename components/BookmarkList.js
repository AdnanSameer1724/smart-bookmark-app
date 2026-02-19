'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BookmarkList({ initialBookmarks, userId }) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks)
  const [deletingId, setDeletingId] = useState(null)
  const [realtimeStatus, setRealtimeStatus] = useState('initializing')
  const [eventLog, setEventLog] = useState([])

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString()
    setEventLog(prev => [...prev, `[${time}] ${msg}`])
    console.log(msg)
  }

  // Set up Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    
    addLog(`🔧 Setting up Realtime for user: ${userId}`)

    const channel = supabase
      .channel(`bookmarks-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          addLog(`✅ INSERT received: ${payload.new.title}`)
          setBookmarks((current) => {
            const exists = current.some(b => b.id === payload.new.id)
            if (exists) {
              addLog(`⚠️ Duplicate INSERT ignored`)
              return current
            }
            addLog(`➕ Adding to UI`)
            return [payload.new, ...current]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          addLog(`🗑️ DELETE received: ${payload.old.id}`)
          setBookmarks((current) => {
            const filtered = current.filter(b => b.id !== payload.old.id)
            addLog(`➖ Removed from UI (was ${current.length}, now ${filtered.length})`)
            return filtered
          })
        }
      )
      .subscribe((status) => {
        addLog(`📡 Status changed to: ${status}`)
        setRealtimeStatus(status)
      })

    return () => {
      addLog('🧹 Cleaning up subscription')
      channel.unsubscribe()
    }
  }, [userId])

  async function handleDelete(id) {
    addLog(`🔴 Attempting to delete: ${id}`)
    setDeletingId(id)
    
    const supabase = createClient()
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      addLog(`❌ Delete failed: ${error.message}`)
      alert('Failed to delete bookmark')
    } else {
      addLog(`✔️ Delete request successful, waiting for Realtime event...`)
    }

    setDeletingId(null)
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function getHostname(url) {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  return (
    <div className="space-y-4">
      {/* Debug Panel */}
      {/* <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-yellow-900">🔍 Realtime Debug Panel</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            realtimeStatus === 'SUBSCRIBED' 
              ? 'bg-green-200 text-green-800' 
              : 'bg-orange-200 text-orange-800'
          }`}>
            {realtimeStatus}
          </span>
        </div>
        
        <div className="bg-white rounded-lg p-3 max-h-48 overflow-y-auto">
          <div className="text-xs font-mono space-y-1">
            {eventLog.length === 0 ? (
              <p className="text-gray-400">Waiting for events...</p>
            ) : (
              eventLog.map((log, i) => (
                <div key={i} className="text-gray-700">{log}</div>
              ))
            )}
          </div>
        </div>

        <div className="mt-3 text-xs text-yellow-800">
          <p><strong>Expected flow:</strong></p>
          <p>1. Add bookmark → See "✅ INSERT received" → See "➕ Adding to UI"</p>
          <p>2. Delete bookmark → See "🔴 Attempting to delete" → "✔️ Delete request successful" → "🗑️ DELETE received" → "➖ Removed from UI"</p>
        </div>
      </div> */}

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg 
              width="24" 
              height="24" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              className="text-gray-400"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No bookmarks yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first bookmark above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Your Bookmarks{' '}
            <span className="text-sm font-normal text-gray-400">({bookmarks.length})</span>
          </h2>

          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-start gap-4 hover:border-indigo-200 transition-colors duration-200 group"
            >
              {/* Favicon */}
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <img
                  src={`https://www.google.com/s2/favicons?sz=32&domain=${getHostname(bookmark.url)}`}
                  alt=""
                  className="w-4 h-4"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>

              {/* Bookmark content */}
              <div className="flex-1 min-w-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200 block truncate"
                >
                  {bookmark.title}
                </a>
                <p className="text-sm text-gray-400 truncate mt-0.5">
                  {getHostname(bookmark.url)} · {formatDate(bookmark.created_at)}
                </p>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(bookmark.id)}
                disabled={deletingId === bookmark.id}
                className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors duration-200 p-1 opacity-0 group-hover:opacity-100"
                title="Delete bookmark"
              >
                {deletingId === bookmark.id ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="animate-spin">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}