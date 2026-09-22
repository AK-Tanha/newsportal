import "reflect-metadata";
import { DataSource, type DataSourceOptions } from "typeorm";
import { entities } from "./entities";
import { InitialSchema20260919000000 } from "./migrations/20260919000000-initial-schema";
import { AddAuthSessions20260921000000 } from "./migrations/20260921000000-auth-sessions";

// One DataSource per Node process. Under Next.js dev, HMR re-imports modules,
// so we stash the instance on globalThis to avoid double initialization.
const globalForDb = globalThis as unknown as {
  __rudroKhoborDataSource?: DataSource;
  __rudroKhoborDbContext?: string;
};

export function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  // PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE fallback, mirroring pg defaults.
  const database = process.env.PGDATABASE;
  if (database) {
    const host = process.env.PGHOST ?? "localhost";
    const port = process.env.PGPORT ?? "5432";
    const user = process.env.PGUSER;
    const password = process.env.PGPASSWORD;
    const credential = password ? `${user ?? ""}:${password}` : (user ?? "");
    return `postgresql://${credential ? `${credential}@` : ""}${host}:${port}/${database}`;
  }
  throw new Error(
    "DATABASE_URL is not set. Create a .env file from .env.example and set DATABASE_URL.",
  );
}

export function createDataSourceOptions(): DataSourceOptions {
  return {
    type: "postgres",
    url: databaseUrl(),
    entities,
    migrations: [InitialSchema20260919000000, AddAuthSessions20260921000000],
    // Only a single dev migration exists so far; new schema is added by
    // writing migrations. The DataSource must never auto-create the schema.
    synchronize: false,
    logging: ["error", "schema", "warn"],
    extra: {
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    },
  };
}

export function createDataSource(): DataSource {
  return new DataSource(createDataSourceOptions());
}

export function getDataSource(): DataSource {
  const context = databaseUrl();
  if (
    !globalForDb.__rudroKhoborDataSource ||
    globalForDb.__rudroKhoborDbContext !== context
  ) {
    globalForDb.__rudroKhoborDataSource = createDataSource();
    globalForDb.__rudroKhoborDbContext = context;
  }
  return globalForDb.__rudroKhoborDataSource;
}

function clearDataSource(): void {
  delete globalForDb.__rudroKhoborDataSource;
  delete globalForDb.__rudroKhoborDbContext;
}

// Cached init promise so concurrent callers await a single initialization.
let initPromise: Promise<DataSource> | null = null;

export async function getInitializedDataSource(): Promise<DataSource> {
  const dataSource = getDataSource();
  if (dataSource.isInitialized) {
    initPromise = null;
    return dataSource;
  }
  if (!initPromise) {
    initPromise = dataSource
      .initialize()
      .then((ds) => {
        initPromise = null;
        return ds;
      })
      .catch((error) => {
        initPromise = null;
        clearDataSource();
        throw error;
      });
  }
  return initPromise;
}