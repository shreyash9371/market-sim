import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kejegtkwkdwpzgscdqus.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlamVndGt3a2R3cHpnc2NkcXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NzYyOTEsImV4cCI6MjA4OTU1MjI5MX0.-_JEBaqGvzpKVAfE4TQHcU_hv13ybTrvSEwKrwJs0yc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)