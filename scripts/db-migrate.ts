#!/usr/bin/env node

import { execSync } from 'child_process';

import { Pool, neonConfig } from '@neondatabase/serverless';
import { migrate as migrateWithNeon } from 'drizzle-orm/neon-serverless/migrator';
import { drizzle } from 'drizzle-orm/neon-serverless';

import { envConfigs } from '@/config';

function shouldUseNeonServerless(databaseUrl: string) {
  if (process.env.DATABASE_USE_NEON_SERVERLESS === 'true') {
    return true;
  }

  try {
    return new URL(databaseUrl).hostname.includes('neon.tech');
  } catch {
    return databaseUrl.includes('neon.tech');
  }
}

async function migrateWithDrizzleKit() {
  execSync('npx drizzle-kit migrate --config=src/core/db/config.ts', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
}

async function main() {
  const databaseUrl = envConfigs.database_url;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  if (
    envConfigs.database_provider !== 'postgresql' ||
    !shouldUseNeonServerless(databaseUrl)
  ) {
    await migrateWithDrizzleKit();
    return;
  }

  neonConfig.poolQueryViaFetch = true;
  if (
    typeof globalThis.WebSocket !== 'undefined' &&
    !neonConfig.webSocketConstructor
  ) {
    neonConfig.webSocketConstructor = globalThis.WebSocket;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });

  try {
    const db = drizzle({ client: pool });
    await migrateWithNeon(db, {
      migrationsFolder: envConfigs.db_migrations_out,
      migrationsSchema: envConfigs.db_migrations_schema,
      migrationsTable: envConfigs.db_migrations_table,
    });

    console.log('✅ Neon serverless migration completed');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('❌ Database migration failed:', error);
  process.exit(1);
});
