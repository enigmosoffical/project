import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Only create the Supabase client if the URL and key are provided
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('Supabase configuration not found. Some features may be disabled.')
  supabase = null
}

export { supabase }

export type Paper = {
  id: string
  title: string
  stream: string
  file_url: string
  created_at: string
}