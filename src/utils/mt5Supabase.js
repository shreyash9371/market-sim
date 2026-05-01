import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_MT5_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_MT5_SUPABASE_ANON_KEY || 'placeholder'

if (!import.meta.env.VITE_MT5_SUPABASE_URL) {
  console.error("Missing MT5 Supabase B credentials in .env. Please restart your dev server!")
}

export const mt5Supabase = createClient(supabaseUrl, supabaseAnonKey)
