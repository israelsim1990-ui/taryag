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
        const [mitzvotRes, statsRes, logRes] = await Promise.all([
                supabase.from('mitzvot').select('*').order('number'),
                supabase.rpc('get_my_stats'),
                supabase.from('mitzvot_log').select('mitzvah_id')
              ])
              if (mitzvotRes.data) setMitzvot(mitzvotRes.data)
        if (statsRes.data && statsRes.data[0]) setStats(statsRes.data[0])
        if (logRes.data) {
                setFulfilledIds(new Set(logRes.data.map((l: any) => l.mitzvah_id)))
        }
  }

  const handleSignIn = async () => {
        await supabase.auth.signInWithOtp({ email: prompt('Enter your email:') || '' })
        alert('Check your email for the magic link!')
  }

  const handleSignOut = async () => {
        await supabase.auth.signOut()
        setStats(null)
        setFulfilledIds(new Set())
  }

  const toggleMitzvah = async (mitzvah: Mitzvah) => {
        if (fulfilledIds.has(mitzvah.id)) {
                const { data } = await supabase
                  .from('mitzvot_log')
                  .select('id')
                  .eq('mitzvah_id', mitzvah.id)
                  .order('fulfilled_at', { ascending: false })
                  .limit(1)
                if (data?.[0]) {
                          await supabase.rpc('unlog_mitzvah', { p_log_id: data[0].id })
                          setFulfilledIds(prev => { const n = new Set(prev); n.delete(mitzvah.id); return n })
                }
        } else {
                await supabase.rpc('log_mitzvah', { p_mitzvah_id: mitzvah.id })
                setFulfilledIds(prev => new Set([...prev, mitzvah.id]))
        }
        await loadData()
  }

  const filtered = mitzvot
      .filter(m => filter === 'all' || m.category === filter)
      .filter(m => !search || m.name_he.includes(search) || m.name_en.toLowerCase().includes(search.toLowerCase()))

  if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-blue-950">
              <div className="text-white text-2xl">טוען... Loading...</div>div>
        </div>div>
      )
    
      if (!user) return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-blue-950 text-white gap-6">
                  <h1 className="text-5xl font-bold">תרי"ג מצוות</h1>h1>
                  <p className="text-xl text-blue-200">Track your mitzvot fulfillment in real-time</p>p>
                  <button
                            onClick={handleSignIn}
                            className="px-8 py-3 bg-blue-500 hover:bg-blue-400 rounded-lg text-white font-semibold text-lg transition"
                          >
                          Sign In with Email
                  </button>button>
            </div>div>
          )
        
          return (
                <div className="min-h-screen bg-blue-950 text-white" dir="rtl">
                  {/* Header */}
                      <header className="bg-blue-900 shadow-lg p-4 flex justify-between items-center">
                              <h1 className="text-2xl font-bold">תרי"ג מצוות</h1>h1>
                              <div className="flex items-center gap-4">
                                        <span className="text-blue-300 text-sm">{user.email}</span>span>
                                        <button onClick={handleSignOut} className="text-sm text-blue-400 hover:text-white">
                                                    Sign Out
                                        </button>button>
                              </div>div>
                      </header>header>
                
                  {/* Stats Bar */}
                  {stats && (
                          <div className="bg-blue-800 p-4 grid grid-cols-4 gap-4 text-center">
                                    <div>
                                                <div className="text-3xl font-bold text-yellow-400">{stats.unique_mitzvot_fulfilled}</div>div>
                                                <div className="text-xs text-blue-300">מצוות ייחודיות</div>div>
                                    </div>div>
                                    <div>
                                                <div className="text-3xl font-bold text-green-400">{stats.positive_fulfilled}</div>div>
                                                <div className="text-xs text-blue-300">מצוות עשה</div>div>
                                    </div>div>
                                    <div>
                                                <div className="text-3xl font-bold text-red-400">{stats.negative_fulfilled}</div>div>
                                                <div className="text-xs text-blue-300">מצוות לא תעשה</div>div>
                                    </div>div>
                                    <div>
                                                <div className="text-3xl font-bold text-blue-300">{stats.completion_percentage}%</div>div>
                                                <div className="text-xs text-blue-300">מתוך 613</div>div>
                                    </div>div>
                          </div>div>
                      )}
                
                  {/* Progress Bar */}
                      <div className="bg-blue-900 px-4 py-2">
                              <div className="w-full bg-blue-700 rounded-full h-3">
                                        <div
                                                      className="bg-yellow-400 h-3 rounded-full transition-all"
                                                      style={{ width: `${stats?.completion_percentage || 0}%` }}
                                                    />
                              </div>div>
                      </div>div>
                
                  {/* Filters */}
                      <div className="p-4 flex gap-4 flex-wrap">
                              <div className="flex gap-2">
                                {(['all', 'positive', 'negative'] as const).map(f => (
                              <button
                                              key={f}
                                              onClick={() => setFilter(f)}
                                              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                                                filter === f ? 'bg-blue-500 text-white' : 'bg-blue-800 text-blue-300 hover:bg-blue-700'
                                              }`}
                                            >
                                {f === 'all' ? 'הכל' : f === 'positive' ? 'עשה' : 'לא תעשה'}
                              </button>button>
                            ))}
                              </div>div>
                              <input
                                          type="text"
                                          placeholder="חפש מצווה..."
                                          value={search}
                                          onChange={e => setSearch(e.target.value)}
                                          className="flex-1 bg-blue-800 border border-blue-600 rounded-lg px-4 py-2 text-white placeholder-blue-400 text-right"
                                        />
                      </div>div>
                
                  {/* Mitzvot Grid */}
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filtered.map(mitzvah => {
                            const fulfilled = fulfilledIds.has(mitzvah.id)
                                        return (
                                                      <button
                                                                      key={mitzvah.id}
                                                                      onClick={() => toggleMitzvah(mitzvah)}
                                                                      className={`p-4 rounded-xl border-2 text-right transition-all hover:scale-105 ${
                                                                                        fulfilled
                                                                                          ? 'bg-green-900 border-green-500 text-green-100'
                                                                                          : 'bg-blue-800 border-blue-600 text-white hover:border-blue-400'
                                                                      }`}
                                                                    >
                                                                    <div className="flex justify-between items-start mb-2">
                                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                                        mitzvah.category === 'positive'
                                                                                          ? 'bg-green-800 text-green-200'
                                                                                          : 'bg-red-900 text-red-200'
                                                                    }`}>
                                                                                      {mitzvah.category_he}
                                                                                      </span>span>
                                                                                    <span className="text-blue-400 text-sm font-mono">#{mitzvah.number}</span>span>
                                                                    </div>div>
                                                                    <div className="font-bold text-lg leading-tight mb-1">{mitzvah.name_he}</div>div>
                                                                    <div className="text-xs text-blue-300 leading-tight">{mitzvah.name_en}</div>div>
                                                                    <div className="text-xs text-blue-500 mt-1">{mitzvah.source}</div>div>
                                                        {fulfilled && (
                                                                                      <div className="mt-2 text-green-400 text-sm font-bold">✓ קיימתי</div>div>
                                                                    )}
                                                      </button>button>
                                                    )
                        })}
                      </div>div>
                </div>div>
              )
}</div>
