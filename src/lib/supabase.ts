import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Mitzvah = {
    id: number
    number: number
    name_he: string
    name_en: string
    category: 'positive' | 'negative'
    category_he: string
    source: string
    applies_to: string
    is_time_bound: boolean
}

export type MitzvotLog = {
    id: string
    user_id: string
    mitzvah_id: number
    fulfilled_at: string
    notes: string | null
    location: string | null
}

export type UserStats = {
    unique_mitzvot_fulfilled: number
    total_fulfillments: number
    last_fulfilled_at: string | null
    positive_fulfilled: number
    negative_fulfilled: number
    completion_percentage: number
}

export type RecentActivity = {
    id: string
    user_id: string
    mitzvah_id: number
    mitzvah_number: number
    name_he: string
    name_en: string
    category: string
    category_he: string
    fulfilled_at: string
    notes: string | null
    location: string | null
}
