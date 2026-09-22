import { loadEnv } from "./env";
import { getInitializedDataSource } from "@/lib/server/db/data-source";

async function main(): Promise<void> {
  loadEnv();
  const dataSource = await getInitializedDataSource();
  const hasExecuted = await dataSource.query(
    `SELECT EXISTS (SELECT 1 FROM "migrations" "m" INNER JOIN (SELECT MAX("id") "id" FROM "migrations") "mm" ON "m"."id" = "mm"."id") AS "did"`,
  );
  await dataSource.undoLastMigration();
  await dataSource.destroy();
  const did = hasExecuted?.[0]?.did === true;
  process.stdout.write(did ? `reverted last migration\n` : `nothing to revert\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : error}\n`);
  process.exitCode = 1;
});