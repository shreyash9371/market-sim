import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kejegtkwkdwpzgscdqus.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlamVndGt3a2R3cHpnc2NkcXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NzYyOTEsImV4cCI6MjA4OTU1MjI5MX0.-_JEBaqGvzpKVAfE4TQHcU_hv13ybTrvSEwKrwJs0yc'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCommission() {
  const { data, error } = await supabase
    .from('trades')
    .insert([
      {
        user_id: 'magicalworld004@gmail.com',
        pair: 'TEST',
        dir: 'long',
        date: new Date().toISOString().split('T')[0],
        entry: 1,
        sl: 0.5,
        tp: 2,
        commissions: 15.5
      }
    ])
    .select()

  console.log('Insert Result:', data, error)
  if (data && data.length > 0) {
     // cleanup
     await supabase.from('trades').delete().eq('id', data[0].id)
  }
}

testCommission()
