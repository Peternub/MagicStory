import "server-only";

import { Pool, types, type QueryResult, type QueryResultRow } from "pg";

import { getDatabaseConfig } from "@/lib/db/config";

types.setTypeParser(1114, (value) => value);
types.setTypeParser(1184, (value) => value);

const globalDatabase = globalThis as typeof globalThis & {
  magicStoryDatabasePool?: Pool;
};

function createDatabasePool() {
  const config = getDatabaseConfig();

  return new Pool({
    connectionString: config.connectionString,
    max: config.poolMax,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000
  });
}

export function getDatabasePool() {
  if (!globalDatabase.magicStoryDatabasePool) {
    globalDatabase.magicStoryDatabasePool = createDatabasePool();
  }

  return globalDatabase.magicStoryDatabasePool;
}

export function queryDatabase<Row extends QueryResultRow>(
  text: string,
  values: readonly unknown[] = []
): Promise<QueryResult<Row>> {
  return getDatabasePool().query<Row>(text, [...values]);
}
