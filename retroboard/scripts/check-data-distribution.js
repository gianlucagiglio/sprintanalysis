#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cwyqrigyikbssummvuoo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3eXFyaWd5aWtic3N1bW12dW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMTQ5OTMsImV4cCI6MjA4NjU5MDk5M30.7fcKsRWRzsfBnBwTdAmZRUkME1MbHCbeotnu6hc6Z4Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDataDistribution() {
  // console.log('🔍 Verifico distribuzione dati tra team...\n')

  // Check teams
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')
    .order('name')

  if (!teams || teams.length === 0) {
    // console.log('❌ Nessun team trovato!')
    return
  }

  // console.log(`📊 Team trovati: ${teams.length}\n`)
  teams.forEach(t => // console.log(`  - ${t.name} (${t.id.substring(0, 8)}...)`))
  // console.log('')

  // Check sessions per team
  for (const team of teams) {
    const { count: sessionCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', team.id)

    // console.log(`Team "${team.name}":`)
    // console.log(`  Sessioni: ${sessionCount}`)

    if (sessionCount > 0) {
      // Get session IDs for this team
      const { data: teamSessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('team_id', team.id)

      const sessionIds = teamSessions.map(s => s.id)

      // Count related data
      const [commentsRes, actionsRes, moodsRes] = await Promise.all([
        supabase.from('sections').select('id').in('session_id', sessionIds),
        supabase.from('actions').select('*', { count: 'exact', head: true }).in('session_id', sessionIds),
        supabase.from('mood_votes').select('*', { count: 'exact', head: true }).in('session_id', sessionIds)
      ])

      const sectionIds = commentsRes.data?.map(s => s.id) || []
      let commentCount = 0
      if (sectionIds.length > 0) {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .in('section_id', sectionIds)
        commentCount = count
      }

      // console.log(`  Commenti: ${commentCount}`)
      // console.log(`  Azioni: ${actionsRes.count}`)
      // console.log(`  Mood votes: ${moodsRes.count}`)
    }
    // console.log('')
  }

  // Check for sessions without team_id
  const { count: orphanedCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .is('team_id', null)

  if (orphanedCount > 0) {
    // console.log(`⚠️  ATTENZIONE: ${orphanedCount} sessioni senza team_id!\n`)
  }
}

checkDataDistribution().catch(// console.error)
