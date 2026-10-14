#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://cwyqrigyikbssummvuoo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3eXFyaWd5aWtic3N1bW12dW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMTQ5OTMsImV4cCI6MjA4NjU5MDk5M30.7fcKsRWRzsfBnBwTdAmZRUkME1MbHCbeotnu6hc6Z4Q'

const supabase = createClient(supabaseUrl, supabaseKey)

const TABLES = [
  'profiles',
  'teams',
  'team_members',
  'sessions',
  'session_participants',
  'sections',
  'comments',
  'votes',
  'actions',
  'mood_votes',
  'team_mood_votes',
  'quiz_themes',
  'quiz_questions',
  'quiz_answers',
  'quiz_leagues',
  'user_points',
  'point_transactions',
  'badge_definitions',
  'user_badges'
]

async function backupTable(tableName) {
  // console.log(`📦 Backup ${tableName}...`)

  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(10000)

  if (error) {
    // console.error(`  ❌ Errore: ${error.message}`)
    return { table: tableName, count: 0, data: [] }
  }

  // console.log(`  ✅ ${count} record`)
  return { table: tableName, count, data }
}

async function main() {
  // console.log('💾 Backup Database RetroBoard')
  // console.log('============================\n')

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)
  const backupDir = join(__dirname, '..', 'backups')
  const backupFile = join(backupDir, `backup-${timestamp}.json`)

  // console.log(`📁 Directory backup: ${backupDir}`)
  // console.log(`📄 File backup: backup-${timestamp}.json\n`)

  // Create backups directory if not exists
  try {
    const { mkdirSync } = await import('fs')
    mkdirSync(backupDir, { recursive: true })
  } catch (e) {
    // Directory already exists
  }

  const backup = {
    timestamp: new Date().toISOString(),
    supabaseUrl,
    tables: {}
  }

  let totalRecords = 0

  for (const table of TABLES) {
    const result = await backupTable(table)
    backup.tables[table] = result
    totalRecords += result.count
  }

  // Save backup
  writeFileSync(backupFile, JSON.stringify(backup, null, 2))

  // console.log('\n📊 Riepilogo Backup')
  // console.log('===================')
  // console.log(`Totale record: ${totalRecords}`)
  // console.log(`Tabelle: ${TABLES.length}`)
  // console.log(`\n✅ Backup salvato in: ${backupFile}`)
  // console.log(`📦 Dimensione: ${(Buffer.byteLength(JSON.stringify(backup)) / 1024).toFixed(2)} KB\n`)

  // console.log('🔒 Il backup è sicuro localmente.')
  // console.log('📋 Ora puoi eseguire la migration con tranquillità!\n')

  // Summary by table
  // console.log('Dettaglio per tabella:')
  Object.entries(backup.tables).forEach(([table, data]) => {
    if (data.count > 0) {
      // console.log(`  ${table}: ${data.count} record`)
    }
  })
}

main().catch(// console.error)
