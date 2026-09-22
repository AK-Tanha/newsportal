import { loadEnv } from "./env";
import { getInitializedDataSource } from "@/lib/server/db/data-source";

async function main(): Promise<void> {
  loadEnv();
  const dataSource = await getInitializedDataSource();
  const applied = await dataSource.runMigrations();
  for (const migration of applied) process.stdout.write(`applied: ${migration.name}\n`);
  await dataSource.destroy();
  process.stdout.write(applied.length ? `ok\n` : `no pending migrations\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : error}\n`);
  process.exitCode = 1;
});