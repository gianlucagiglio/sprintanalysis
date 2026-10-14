#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cwyqrigyikbssummvuoo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3eXFyaWd5aWtic3N1bW12dW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMTQ5OTMsImV4cCI6MjA4NjU5MDk5M30.7fcKsRWRzsfBnBwTdAmZRUkME1MbHCbeotnu6hc6Z4Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOrphanedSessions() {
  console.log('🔍 Verifico sessioni senza team_id...\n')

  const { data, error, count } = await supabase
    .from('sessions')
    .select('id, title, organizer_id, team_id, created_at', { count: 'exact' })
    .is('team_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Errore:', error.message)
    return
  }

  console.log(`📊 Trovate ${count} sessioni senza team_id\n`)

  if (count > 0) {
    console.log('Sessioni orfane:\n')
    data.forEach((s, i) => {
      console.log(`${i + 1}. "${s.title}"`)
      console.log(`   ID: ${s.id}`)
      console.log(`   Organizer: ${s.organizer_id}`)
      console.log(`   Creata: ${new Date(s.created_at).toLocaleDateString('it-IT')}`)
      console.log('')
    })

    console.log('\n⚠️  Queste sessioni vengono mostrate a TUTTI i team!')
    console.log('📋 Prossimo passo: esegui la migration 028 per fixare.\n')
  } else {
    console.log('✅ Nessuna sessione orfana! Database OK!\n')
  }

  // Check total sessions
  const { count: totalCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })

  console.log(`ℹ️  Totale sessioni nel database: ${totalCount}`)
  console.log(`ℹ️  Sessioni con team: ${totalCount - count}`)
  console.log(`ℹ️  Sessioni senza team: ${count}\n`)
}

checkOrphanedSessions().catch(console.error)
