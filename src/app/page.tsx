'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Mitzvah, UserStats } from '@/lib/supabase'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [mitzvot, setMitzvot] = useState<Mitzvah[]>([])
  const [fulfilledIds, setFulfilledIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadData()
      }
      setLoading(false)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadData = async () => {
    const [mitzvotRes, logRes, statsRes] = await Promise.all([
      supabase.from('mitzvot').select('*').order('number'),
      supabase.from('mitzvot_log').select('mitzvah_id'),
      supabase.rpc('get_my_stats')
    ])

    if (mitzvotRes.data) setMitzvot(mitzvotRes.data)
    if (logRes.data) setFulfilledIds(new Set(logRes.data.map((r: any) => r.mitzvah_id)))
    if (statsRes.data?.[0]) setStats(statsRes.data[0])
  }

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setStats(null)
    setMitzvot([])
    setFulfilledIds(new Set())
  }

  const toggleMitzvah = async (id: number) => {
    if (!user) return
    if (fulfilledIds.has(id)) {
      await supabase.rpc('unlog_mitzvah', { p_mitzvah_id: id })
      setFulfilledIds(prev => { const n = new Set(prev); n.delete(id); return n })
    } else {
      await supabase.rpc('log_mitzvah', { p_mitzvah_id: id })
      setFulfilledIds(prev => new Set([...prev, id]))
    }
    await loadData()
  }

  const filteredMitzvot = mitzvot.filter(m => {
    const matchesFilter = filter === 'all' || m.category === filter
    const matchesSearch = !search || m.name_hebrew.includes(search) || m.name_english.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-950">
      <div className="text-white text-2xl">טוען... Loading...</div>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-950 text-white gap-6">
      <h1 className="text-5xl font-bold">תרי"ג מצוות</h1>
      <p className="text-xl text-blue-200">Track your mitzvot fulfillment in real-time</p>
      <button
        onClick={handleSignIn}
        className="px-8 py-3 bg-blue-500 hover:bg-blue-400 rounded-lg text-white font-semibold text-lg transition"
      >
        התחבר עם Google / Sign in with Google
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-blue-950 text-white" dir="rtl">
      <header className="sticky top-0 z-10 bg-blue-900 shadow-lg px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">תרי"ג מצוות</h1>
        <div className="flex items-center gap-4">
          <span className="text-blue-300 text-sm">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-blue-300 hover:text-white transition"
          >
            יציאה / Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-900 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.unique_mitzvot_fulfilled}</div>
              <div className="text-xs text-blue-300">מצוות ייחודיות</div>
            </div>
            <div className="bg-blue-900 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{stats.positive_fulfilled}</div>
              <div className="text-xs text-blue-300">מצוות עשה</div>
            </div>
            <div className="bg-blue-900 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-400">{stats.negative_fulfilled}</div>
              <div className="text-xs text-blue-300">מצוות לא תעשה</div>
            </div>
            <div className="bg-blue-900 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-300">{stats.total_log_entries}</div>
              <div className="text-xs text-blue-300">סה"כ רשומות</div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="חפש מצווה... / Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2 rounded-lg bg-blue-900 border border-blue-700 text-white placeholder-blue-400 focus:outline-none focus:border-blue-400"
          />
          {(['all', 'positive', 'negative'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-blue-500 text-white' : 'bg-blue-900 text-blue-300 hover:bg-blue-800'}`}
            >
              {f === 'all' ? 'הכל' : f === 'positive' ? 'עשה' : 'לא תעשה'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredMitzvot.map(m => {
            const isFulfilled = fulfilledIds.has(m.id)
            return (
              <div
                key={m.id}
                onClick={() => toggleMitzvah(m.id)}
                className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                  isFulfilled
                    ? 'bg-green-900 border-green-500 shadow-green-500/20 shadow-lg'
                    : 'bg-blue-900 border-blue-700 hover:border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-blue-400">#{m.number}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.category === 'positive' ? 'bg-green-800 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {m.category === 'positive' ? 'עשה' : 'לא תעשה'}
                  </span>
                </div>
                <p className="text-sm font-semibold mt-2 text-right leading-snug">{m.name_hebrew}</p>
                <p className="text-xs text-blue-300 mt-1 text-right leading-snug">{m.name_english}</p>
                {isFulfilled && (
                  <div className="mt-2 text-green-400 text-xs text-center">✓ קיימתי</div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
