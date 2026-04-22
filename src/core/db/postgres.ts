import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeonServerless } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePostgresJs } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { envConfigs } from '@/config';
import { isCloudflareWorker } from '@/shared/lib/env';

// Global database connection instance (singleton pattern)
let dbInstance:
  | ReturnType<typeof drizzlePostgresJs>
  | ReturnType<typeof drizzleNeonServerless>
  | null = null;
let client: ReturnType<typeof postgres> | Pool | null = null;

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

function ensureNeonRuntimeConfig() {
  neonConfig.poolQueryViaFetch = true;

  if (
    typeof globalThis.WebSocket !== 'undefined' &&
    !neonConfig.webSocketConstructor
  ) {
    neonConfig.webSocketConstructor = globalThis.WebSocket;
  }
}

export function getPostgresDb() {
  let databaseUrl = envConfigs.database_url;

  let isHyperdrive = false;
  const schemaName = (envConfigs.db_schema || 'public').trim();
  const connectionSchemaOptions =
    schemaName && schemaName !== 'public'
      ? { connection: { options: `-c search_path=${schemaName}` } }
      : {};

  if (isCloudflareWorker) {
    const { env }: { env: any } = { env: {} };
    // Detect if set Hyperdrive
    isHyperdrive = 'HYPERDRIVE' in env;

    if (isHyperdrive) {
      const hyperdrive = env.HYPERDRIVE;
      databaseUrl = hyperdrive.connectionString;
      console.log('using Hyperdrive connection');
    }
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const useNeonServerless = shouldUseNeonServerless(databaseUrl);

  // In Cloudflare Workers, create new connection each time
  if (isCloudflareWorker) {
    console.log('in Cloudflare Workers environment');

    if (useNeonServerless) {
      ensureNeonRuntimeConfig();
      const pool = new Pool({
        connectionString: databaseUrl,
        max: 1,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 5_000,
      });

      return drizzleNeonServerless({ client: pool });
    }

    // Workers environment uses minimal configuration
    const client = postgres(databaseUrl, {
      prepare: false,
      max: 1, // Limit to 1 connection in Workers
      idle_timeout: 10, // Shorter timeout for Workers
      connect_timeout: 5,
      ...connectionSchemaOptions,
    });

    return drizzlePostgresJs(client);
  }

  // Singleton mode: reuse existing connection (good for traditional servers and serverless warm starts)
  if (envConfigs.db_singleton_enabled === 'true') {
    // Return existing instance if already initialized
    if (dbInstance) {
      return dbInstance;
    }

    if (useNeonServerless) {
      ensureNeonRuntimeConfig();

      client = new Pool({
        connectionString: databaseUrl,
        max: Number(envConfigs.db_max_connections) || 1,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
      });

      dbInstance = drizzleNeonServerless({ client });
      return dbInstance;
    }

    // Create connection pool only once
    client = postgres(databaseUrl, {
      prepare: false,
      max: Number(envConfigs.db_max_connections) || 1, // Maximum connections in pool (default 1)
      idle_timeout: 30, // Idle connection timeout (seconds)
      connect_timeout: 10, // Connection timeout (seconds)
      ...connectionSchemaOptions,
    });

    dbInstance = drizzlePostgresJs({ client });
    return dbInstance;
  }

  if (useNeonServerless) {
    ensureNeonRuntimeConfig();

    const pool = new Pool({
      connectionString: databaseUrl,
      max: 1,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
    });

    return drizzleNeonServerless({ client: pool });
  }

  // Non-singleton mode: create new connection each time (good for serverless)
  // In serverless, the connection will be cleaned up when the function instance is destroyed
  const serverlessClient = postgres(databaseUrl, {
    prepare: false,
    max: 1, // Use single connection in serverless
    idle_timeout: 20,
    connect_timeout: 10,
    ...connectionSchemaOptions,
  });

  return drizzlePostgresJs({ client: serverlessClient });
}

// Optional: Function to close database connection (useful for testing or graceful shutdown)
// Note: Only works in singleton mode
export async function closePostgresDb() {
  if (envConfigs.db_singleton_enabled && client) {
    await client.end();
    client = null;
    dbInstance = null;
  }
}
