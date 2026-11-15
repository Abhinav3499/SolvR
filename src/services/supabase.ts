import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon')
  )
}

// Fallback dummy client if credentials are not yet set
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface UserProfile {
  id: string
  username: string
  display_name: string
  avatar_url: string
  current_streak: number
  longest_streak: number
  total_solved: number
  is_public: boolean
}

export interface FriendActivityItem {
  id: string
  user_id: string
  username: string
  display_name: string
  avatar_url: string
  solved_date: string
  current_streak: number
  total_solved: number
}
