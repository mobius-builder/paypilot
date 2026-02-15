#!/usr/bin/env node

/**
 * Run Migrations Script
 * Runs all SQL migrations against Supabase in order
 *
 * Usage: node scripts/run-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xhtqwyibrhgmauygoebr.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodHF3eWlicmhnbWF1eWdvZWJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExNDg4NCwiZXhwIjoyMDg2NjkwODg0fQ.0BPr9Mf_nsY4Fd--vkqsJTZya6pgCyB8iCQ-wRa3mqA'

// Database connection string for direct SQL execution
const dbPassword = process.env.SUPABASE_DB_PASSWORD || ''

async function runMigrations() {
  console.log('🚀 Starting migrations...\n')
  console.log(`Database: ${supabaseUrl}\n`)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Get migration files
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  console.log(`Found ${migrationFiles.length} migration files:\n`)
  migrationFiles.forEach(f => console.log(`  - ${f}`))
  console.log('')

  // We need to use the Supabase REST API or direct PostgreSQL connection
  // Since we can't execute raw SQL via the JS client, we'll output instructions

  console.log('='.repeat(70))
  console.log('MIGRATION INSTRUCTIONS')
  console.log('='.repeat(70))
  console.log('')
  console.log('Since Supabase JS client cannot execute raw DDL statements,')
  console.log('please run these migrations in the Supabase SQL Editor:')
  console.log('')
  console.log(`  https://supabase.com/dashboard/project/xhtqwyibrhgmauygoebr/sql`)
  console.log('')
  console.log('Copy and paste the contents of each migration file in order:')
  console.log('')

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const lineCount = content.split('\n').length
    console.log(`  ${file} (${lineCount} lines)`)
  }

  console.log('')
  console.log('Or, concatenate all migrations and run at once:')
  console.log('')
  console.log('  cat supabase/migrations/*.sql > all_migrations.sql')
  console.log('')

  // Output combined SQL for convenience
  const combinedPath = path.join(__dirname, '..', 'ALL_MIGRATIONS.sql')
  let combinedSql = '-- Combined Migrations for PayPilot\n'
  combinedSql += '-- Generated: ' + new Date().toISOString() + '\n\n'

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    combinedSql += `-- ========================================\n`
    combinedSql += `-- Migration: ${file}\n`
    combinedSql += `-- ========================================\n\n`
    combinedSql += content + '\n\n'
  }

  fs.writeFileSync(combinedPath, combinedSql)
  console.log(`✅ Combined SQL written to: ALL_MIGRATIONS.sql`)
  console.log('')
  console.log('Copy this file contents into the Supabase SQL Editor.')
  console.log('')
}

runMigrations().catch(console.error)
