import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please ensure DATABASE_URL, JWT_SECRET, and NODE_ENV=production are configured.",
  );
}

const databaseUrl = process.env.DATABASE_URL;
const isLocal = databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  query_timeout: 10000,
});

export const db = drizzle(pool, { schema });
