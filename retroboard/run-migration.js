/**
 * Script per applicare migration 018
 * Usa @supabase/supabase-js per eseguire la migration
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim()
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.VITE_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Credenziali Supabase mancanti nel file .env')
  console.error('\n📝 Applica manualmente la migration:')
  console.error('1. Vai su https://supabase.com/dashboard')
  console.error('2. Seleziona il tuo progetto')
  console.error('3. Vai su SQL Editor')
  console.error('4. Copia e incolla il contenuto di:')
  console.error('   supabase/migrations/018_fix_team_delete_cascade.sql')
  console.error('5. Esegui la query\n')
  process.exit(1)
}

console.log('🔗 Connessione a Supabase...')
console.log('📍 URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

// Leggi migration
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '018_fix_team_delete_cascade.sql')
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

console.log('📄 Migration caricata:', migrationPath)
console.log('\n🚀 Esecuzione migration...\n')

// Split SQL in statements ed esegui
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--') && s !== '')

async function runMigration() {
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (!statement.trim()) continue

    console.log(`[${i + 1}/${statements.length}] ${statement.substring(0, 80)}...`)

    try {
      // Esegui tramite SQL query diretta
      const { data, error } = await supabase.rpc('exec', { sql: statement + ';' })

      if (error) {
        // Se fallisce, prova senza rpc
        console.warn('⚠️  RPC non disponibile, la migration deve essere eseguita manualmente')
        console.error('\n❌ Per completare la migration:')
        console.error('1. Vai su https://cwyqrigyikbssummvuoo.supabase.co/project/_/sql')
        console.error('2. Copia e incolla TUTTO il contenuto del file:')
        console.error('   supabase/migrations/018_fix_team_delete_cascade.sql')
        console.error('3. Clicca "Run"\n')
        process.exit(1)
      }
    } catch (err) {
      console.error('❌ Errore:', err.message)
    }
  }

  console.log('\n✅ Migration completata!')
  console.log('🎉 Ora la funzione "elimina team" dovrebbe funzionare correttamente!\n')
}

runMigration().catch(err => {
  console.error('\n❌ Errore durante la migration:', err.message)
  console.error('\n💡 Applica manualmente la migration tramite Supabase Dashboard SQL Editor')
  process.exit(1)
})
