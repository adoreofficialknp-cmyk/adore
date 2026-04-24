#!/usr/bin/env node
/**
 * ADORE – PostgreSQL Database Import
 * Usage:
 *   node scripts/db-import.js --in ./backup-2026-04-16.sql [options]
 *
 * Options:
 *   --in      <path>   SQL dump file to import  (REQUIRED)
 *   --db      <name>   Database name            (default: from DATABASE_URL or "adore")
 *   --user    <name>   DB user                  (default: from DATABASE_URL or "postgres")
 *   --host    <host>   DB host                  (default: from DATABASE_URL or "localhost")
 *   --port    <port>   DB port                  (default: 5432)
 *   --drop             Drop and recreate the DB before importing (DESTRUCTIVE)
 *   --yes              Skip confirmation prompt
 *
 * Works with Render, Supabase, Railway, and local PostgreSQL.
 * DATABASE_URL is parsed automatically if set; CLI flags override it.
 *
 * ⚠️  WARNING: Importing will APPEND data unless --drop is used.
 *     With --drop, the entire database is wiped before import.
 *
 * Examples:
 *   node scripts/db-import.js --in ./backup-2026-04-16.sql
 *   node scripts/db-import.js --in ./backup.sql --drop --yes
 *   DATABASE_URL=postgres://user:pass@host/db node scripts/db-import.js --in ./backup.sql
 *
 * Supabase note:
 *   Use the "Direct connection" string from Supabase → Settings → Database.
 *   Supabase uses port 5432. The database name is always "postgres".
 *
 * Render note:
 *   Use the "External Database URL" from Render → Dashboard → your DB.
 */

'use strict';

const { execSync, spawnSync } = require('child_process');
const path     = require('path');
const fs       = require('fs');
const readline = require('readline');

// ── 1. Load .env if present ─────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', 'server', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...rest] = line.split('=');
    if (k && rest.length && !process.env[k.trim()]) {
      process.env[k.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

// ── 2. Parse DATABASE_URL ───────────────────────────────────────────────────
function parseDbUrl(url) {
  try {
    const u = new URL(url);
    return {
      host:     u.hostname,
      port:     u.port || '5432',
      user:     u.username,
      password: u.password,
      db:       u.pathname.slice(1),
    };
  } catch { return {}; }
}

const fromUrl = parseDbUrl(process.env.DATABASE_URL || '');

// ── 3. Parse CLI args ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get  = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const config = {
  db:       get('--db')   || fromUrl.db       || 'adore',
  user:     get('--user') || fromUrl.user     || 'postgres',
  host:     get('--host') || fromUrl.host     || 'localhost',
  port:     get('--port') || fromUrl.port     || '5432',
  password: fromUrl.password || process.env.PGPASSWORD || '',
  inFile:   get('--in'),
  drop:     args.includes('--drop'),
  yes:      args.includes('--yes'),
};

// ── 4. Validate input ────────────────────────────────────────────────────────
if (!config.inFile) {
  console.error('❌  --in <file> is required.\n');
  console.error('    Example: node scripts/db-import.js --in ./backup-2026-04-16.sql');
  process.exit(1);
}

const resolvedFile = path.resolve(config.inFile);
if (!fs.existsSync(resolvedFile)) {
  console.error(`❌  File not found: ${resolvedFile}`);
  process.exit(1);
}

// ── 5. Validate psql availability ────────────────────────────────────────────
try {
  execSync('psql --version', { stdio: 'pipe' });
} catch {
  console.error('❌  psql not found. Install PostgreSQL client tools:');
  console.error('    Ubuntu/Debian : sudo apt-get install postgresql-client');
  console.error('    macOS         : brew install libpq && brew link --force libpq');
  process.exit(1);
}

const sizeKB = Math.round(fs.statSync(resolvedFile).size / 1024);
const env    = { ...process.env };
if (config.password) env.PGPASSWORD = config.password;

// ── 6. Print plan ────────────────────────────────────────────────────────────
console.log('\n📥  ADORE Database Import');
console.log('─'.repeat(50));
console.log(`Host     : ${config.host}:${config.port}`);
console.log(`Database : ${config.db}`);
console.log(`User     : ${config.user}`);
console.log(`File     : ${resolvedFile} (${sizeKB} KB)`);
if (config.drop) {
  console.log('Mode     : ⚠️  DROP + RECREATE (all existing data will be lost)');
} else {
  console.log('Mode     : Append (existing data is preserved)');
}
console.log('─'.repeat(50));

// ── 7. Confirm if destructive ────────────────────────────────────────────────
async function confirm(question) {
  if (config.yes) return true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim().toLowerCase() === 'y'); }));
}

async function run() {
  if (config.drop) {
    const ok = await confirm('⚠️  This will DROP the database and all data. Continue? (y/N) ');
    if (!ok) { console.log('Aborted.'); process.exit(0); }

    // Drop + recreate using psql against the postgres maintenance DB
    console.log('\n🗑️  Dropping database…');
    const dropResult = spawnSync('psql', [
      '--host', config.host, '--port', config.port,
      '--username', config.user, '--dbname', 'postgres',
      '--no-password',
      '--command', `DROP DATABASE IF EXISTS "${config.db}"; CREATE DATABASE "${config.db}";`,
    ], { stdio: ['ignore', 'pipe', 'pipe'], env });

    if (dropResult.status !== 0) {
      console.error('❌  Drop/recreate failed:\n');
      console.error(dropResult.stderr?.toString() || 'Unknown error');
      process.exit(dropResult.status || 1);
    }
    console.log('✅  Database recreated.');
  }

  // ── 8. Run import ──────────────────────────────────────────────────────────
  console.log('\n⏳  Importing SQL dump…');
  const importResult = spawnSync('psql', [
    '--host', config.host, '--port', config.port,
    '--username', config.user, '--dbname', config.db,
    '--no-password',
    '--file', resolvedFile,
    '--echo-errors',    // show SQL errors but keep going
    '--set', 'ON_ERROR_STOP=0',
  ], { stdio: ['ignore', 'pipe', 'pipe'], env });

  const stderr = importResult.stderr?.toString() || '';
  const stdout = importResult.stdout?.toString() || '';

  // psql exits 0 even on some errors; check stderr for real failures
  const hasError = importResult.status !== 0 || /ERROR:/.test(stderr);

  if (stdout) console.log(stdout.slice(0, 2000));  // cap output
  if (stderr) {
    if (hasError) {
      console.error('\n⚠️  Warnings / errors during import:');
      console.error(stderr.slice(0, 2000));
    }
  }

  if (importResult.status !== 0 && !stderr.includes('already exists')) {
    console.error('\n❌  Import may have failed. Check errors above.');
    process.exit(importResult.status || 1);
  }

  console.log('\n✅  Import complete.\n');

  // ── 9. Optional: run Prisma migrate to sync schema ─────────────────────────
  console.log('💡  Tip: Run the following to sync Prisma migrations table:');
  console.log('    cd server && npx prisma migrate deploy\n');
}

run().catch(err => {
  console.error('❌  Unexpected error:', err.message);
  process.exit(1);
});
