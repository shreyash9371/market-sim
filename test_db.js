import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kejegtkwkdwpzgscdqus.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlamVndGt3a2R3cHpnc2NkcXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NzYyOTEsImV4cCI6MjA4OTU1MjI5MX0.-_JEBaqGvzpKVAfE4TQHcU_hv13ybTrvSEwKrwJs0yc'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  const newTrade = {
    user_id: '672dfd64-24d3-4bea-9972-0d36855e8c5f',
    pair: 'EURUSD',
    dir: 'long',
    date: new Date().toISOString().split('T')[0],
    session: 'New York',
    entry: 1.0500,
    exit: 1.0550,
    sl: 1.0480,
    tp: 1.0600,
    lots: 1.0,
    pipval: 10,
    emotion: 'Confident',
    notes: 'Test trade',
    images: []
  }

  const { data, error } = await supabase.from('trades').insert([newTrade]).select()
  console.log("Insert result:", data, error)
}

testInsert()
