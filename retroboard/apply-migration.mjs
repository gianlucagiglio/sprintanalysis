#!/usr/bin/env node

/**
 * Script per applicare migration 018 al database Supabase
 * Esegue il file SQL della migration usando le credenziali dal .env
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carica variabili d'ambiente
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.VITE_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Errore: VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti nel file .env')
  console.error('\nAggiungi al file .env:')
  console.error('VITE_SUPABASE_URL=your_url')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  console.error('\nOppure applica manualmente la migration tramite Supabase Dashboard.')
  process.exit(1)
}

// Crea client Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Leggi il file SQL della migration
const migrationPath = join(__dirname, 'supabase', 'migrations', '018_fix_team_delete_cascade.sql')
let migrationSQL

try {
  migrationSQL = readFileSync(migrationPath, 'utf-8')
  console.log('✅ Migration 018 caricata da:', migrationPath)
} catch (error) {
  console.error('❌ Errore nel leggere il file migration:', error.message)
  process.exit(1)
}

// Esegui la migration
console.log('\n🚀 Applicando migration 018...\n')

try {
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

  if (error) {
    // Se la funzione exec_sql non esiste, prova con query diretta
    // (richiede service_role key con privilegi admin)
    console.log('⚠️  Tentativo con query diretta...')

    // Dividi in statement singoli ed eseguili uno alla volta
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`\n📝 Eseguendo: ${statement.substring(0, 60)}...`)

        // Usa la connessione diretta al database
        const result = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ query: statement })
        })

        if (!result.ok) {
          throw new Error(`Errore nell'eseguire statement: ${await result.text()}`)
        }
      }
    }

    console.log('\n✅ Migration 018 applicata con successo!')
  } else {
    console.log('✅ Migration 018 applicata con successo!')
    if (data) console.log('📊 Risultato:', data)
  }

  console.log('\n🎉 Ora puoi eliminare i team senza problemi!')
  console.log('🧪 Testa la funzionalità dal TeamPage')

} catch (error) {
  console.error('\n❌ Errore durante l\'applicazione della migration:', error.message)
  console.error('\n💡 Soluzione alternativa:')
  console.error('1. Vai su https://supabase.com/dashboard/project/YOUR_PROJECT/editor')
  console.error('2. Apri SQL Editor')
  console.error('3. Copia e incolla il contenuto di supabase/migrations/018_fix_team_delete_cascade.sql')
  console.error('4. Esegui la query')
  process.exit(1)
}
