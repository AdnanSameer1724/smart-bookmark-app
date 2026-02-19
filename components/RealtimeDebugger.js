'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RealtimeDebugger({ userId }) {
  const [logs, setLogs] = useState([])
  const [status, setStatus] = useState('initializing...')
  const supabase = createClient()

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  useEffect(() => {
    addLog(`🔧 Starting Realtime setup for user: ${userId}`)

    const channel = supabase
      .channel('debug-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          addLog(`✅ Realtime event received!`)
          addLog(`Event type: ${payload.eventType}`)
          addLog(`Data: ${JSON.stringify(payload.new || payload.old)}`)
        }
      )
      .subscribe((subscribeStatus) => {
        addLog(`📡 Subscription status: ${subscribeStatus}`)
        setStatus(subscribeStatus)
      })

    return () => {
      addLog('🧹 Cleaning up subscription')
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
      <h3 className="font-bold text-yellow-900 mb-2">
        🔍 Realtime Debugger
      </h3>
      <p className="text-sm text-yellow-800 mb-3">
        Status: <span className="font-mono font-bold">{status}</span>
      </p>
      
      <div className="bg-white rounded-lg p-3 max-h-48 overflow-y-auto">
        <div className="text-xs font-mono space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-400">Waiting for events...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-gray-700">{log}</div>
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-yellow-700 mt-2">
        💡 Try adding or deleting a bookmark. You should see events appear above.
      </p>
    </div>
  )
}