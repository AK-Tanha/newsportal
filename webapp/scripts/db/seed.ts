import { loadEnv } from "./env";
import { getInitializedDataSource } from "@/lib/server/db/data-source";
import { seedDatabase } from "@/lib/server/db/seed";

async function main(): Promise<void> {
  loadEnv();
  const dataSource = await getInitializedDataSource();
  await seedDatabase(dataSource);
  await dataSource.destroy();
  process.stdout.write(`seed complete\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : error}\n`);
  process.exitCode = 1;
});