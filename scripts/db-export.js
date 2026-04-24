#!/usr/bin/env node
/**
 * ADORE – PostgreSQL Database Export
 * Usage:
 *   node scripts/db-export.js [options]
 *
 * Options:
 *   --db      <name>   Database name   (default: from DATABASE_URL or "adore")
 *   --user    <name>   DB user         (default: from DATABASE_URL or "postgres")
 *   --host    <host>   DB host         (default: from DATABASE_URL or "localhost")
 *   --port    <port>   DB port         (default: 5432)
 *   --out     <path>   Output file     (default: ./backup-YYYY-MM-DD.sql)
 *   --schema-only      Export schema only (no data)
 *   --data-only        Export data only (no schema)
 *
 * Works with Render, Supabase, Railway, and local PostgreSQL.
 * If DATABASE_URL is set in .env or environment, connection details are
 * parsed from it automatically; CLI flags override individual values.
 *
 * Examples:
 *   node scripts/db-export.js
 *   node scripts/db-export.js --out ./backups/prod-backup.sql
 *   node scripts/db-export.js --db adore_prod --user postgres --host dpg-xxx.oregon-postgres.render.com
 *   DATABASE_URL=postgres://user:pass@host/db node scripts/db-export.js
 */

'use strict';

const { execSync, spawnSync } = require('child_process');
const path  = require('path');
const fs    = require('fs');

// ── 1. Load .env if present ─────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', 'server', '.env');
if (fs.existsSync(envPath)) {
  require('fs').readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...rest] = line.split('=');
    if (k && rest.length && !process.env[k.trim()]) {
      process.env[k.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

// ── 2. Parse DATABASE_URL if available ──────────────────────────────────────
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
  db:         get('--db')   || fromUrl.db       || 'adore',
  user:       get('--user') || fromUrl.user     || 'postgres',
  host:       get('--host') || fromUrl.host     || 'localhost',
  port:       get('--port') || fromUrl.port     || '5432',
  password:   fromUrl.password || process.env.PGPASSWORD || '',
  schemaOnly: args.includes('--schema-only'),
  dataOnly:   args.includes('--data-only'),
  out:        get('--out') || path.join(
    process.cwd(),
    `backup-${new Date().toISOString().slice(0, 10)}.sql`
  ),
};

// ── 4. Validate pg_dump availability ────────────────────────────────────────
try {
  execSync('pg_dump --version', { stdio: 'pipe' });
} catch {
  console.error('❌  pg_dump not found. Install PostgreSQL client tools:');
  console.error('    Ubuntu/Debian : sudo apt-get install postgresql-client');
  console.error('    macOS         : brew install libpq && brew link --force libpq');
  process.exit(1);
}

// ── 5. Ensure output directory exists ───────────────────────────────────────
const outDir = path.dirname(config.out);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ── 6. Build pg_dump command ─────────────────────────────────────────────────
const pgArgs = [
  '--host',   config.host,
  '--port',   config.port,
  '--username', config.user,
  '--dbname', config.db,
  '--format', 'plain',      // plain SQL — compatible with psql import
  '--no-password',          // use PGPASSWORD env var
  '--verbose',
  '--file',   config.out,
];

if (config.schemaOnly) pgArgs.push('--schema-only');
if (config.dataOnly)   pgArgs.push('--data-only');

// ── 7. Run export ────────────────────────────────────────────────────────────
console.log('\n📦  ADORE Database Export');
console.log('─'.repeat(50));
console.log(`Host     : ${config.host}:${config.port}`);
console.log(`Database : ${config.db}`);
console.log(`User     : ${config.user}`);
console.log(`Output   : ${config.out}`);
if (config.schemaOnly) console.log('Mode     : Schema only');
if (config.dataOnly)   console.log('Mode     : Data only');
console.log('─'.repeat(50));

const env = { ...process.env };
if (config.password) env.PGPASSWORD = config.password;

const result = spawnSync('pg_dump', pgArgs, {
  stdio: ['ignore', 'pipe', 'pipe'],
  env,
});

if (result.status !== 0) {
  console.error('\n❌  Export failed:\n');
  console.error(result.stderr?.toString() || 'Unknown error');
  process.exit(result.status || 1);
}

const sizeKB = Math.round(fs.statSync(config.out).size / 1024);
console.log(`\n✅  Export complete — ${sizeKB} KB written to:`);
console.log(`    ${config.out}\n`);
