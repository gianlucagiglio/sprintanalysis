#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env variables
const envPath = join(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) envVars[key.trim()] = value.trim()
})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOrphanedSessions() {
  console.log('🔍 Verifico sessioni senza team_id...\n')

  const { data, error } = await supabase
    .from('sessions')
    .select('id, title, organizer_id, team_id, created_at')
    .is('team_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Errore:', error.message)
    return null
  }

  console.log(`📊 Trovate ${data.length} sessioni senza team_id\n`)

  if (data.length > 0) {
    console.log('Sessioni orfane:')
    data.forEach(s => {
      console.log(`  - ${s.title} (${s.id.substring(0, 8)}...) - ${new Date(s.created_at).toLocaleDateString()}`)
    })
    console.log('')
  }

  return data
}

async function executeMigration() {
  console.log('🚀 Eseguo migration 028_enforce_team_id_not_null.sql...\n')

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '028_enforce_team_id_not_null.sql')
  const migrationSQL = readFileSync(migrationPath, 'utf-8')

  // Split by semicolon and execute each statement
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`📝 Eseguo ${statements.length} statement SQL...\n`)

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    console.log(`[${i + 1}/${statements.length}] Eseguo statement...`)

    const { error } = await supabase.rpc('exec_sql', { sql: stmt })

    if (error) {
      console.error(`❌ Errore nello statement ${i + 1}:`, error.message)
      console.error('Statement:', stmt.substring(0, 100) + '...')
      return false
    }

    console.log(`✅ Statement ${i + 1} completato`)
  }

  return true
}

async function verifyFix() {
  console.log('\n🔍 Verifico che non ci siano più sessioni senza team_id...\n')

  const { count, error } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .is('team_id', null)

  if (error) {
    console.error('❌ Errore:', error.message)
    return
  }

  if (count === 0) {
    console.log('✅ Nessuna sessione orfana trovata! Team isolation OK!\n')
  } else {
    console.log(`⚠️ Ancora ${count} sessioni senza team_id\n`)
  }
}

async function main() {
  console.log('🔧 Fix Team Isolation\n')
  console.log('=====================\n')

  // Step 1: Check orphaned sessions
  const orphanedSessions = await checkOrphanedSessions()

  if (!orphanedSessions) {
    console.log('❌ Impossibile procedere')
    process.exit(1)
  }

  if (orphanedSessions.length === 0) {
    console.log('✅ Nessuna sessione orfana trovata! Niente da fare.')
    process.exit(0)
  }

  // Step 2: Ask confirmation
  console.log('⚠️  ATTENZIONE: La migration eliminerà le sessioni orfane senza team.\n')
  console.log('Vuoi procedere? Questo script usa ANON_KEY e potrebbe non avere i permessi necessari.')
  console.log('È meglio eseguire la migration manualmente in Supabase SQL Editor.\n')
  console.log('File migration: supabase/migrations/028_enforce_team_id_not_null.sql\n')
}

main().catch(console.error)
