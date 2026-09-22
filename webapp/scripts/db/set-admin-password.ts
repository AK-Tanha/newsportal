import { loadEnv } from "./env";
import { getInitializedDataSource } from "@/lib/server/db/data-source";
import { hashPassword } from "@/lib/server/auth/auth-crypto";
import { User } from "@/lib/server/db/entities";

/**
 * Sets (or rotates) the admin account password to a bcrypt hash.
 *
 * Usage:  ADMIN_PASSWORD="<a strong password>" npm run db:set-admin-password
 *
 * This is how the placeholder seed hash from earlier environments must be
 * replaced before going to production. The password itself is never logged
 * or stored — only its bcrypt hash lands in users.password_hash.
 */
async function main(): Promise<void> {
  loadEnv();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12) {
    process.stderr.write(
      "ADMIN_PASSWORD env var is required and must be at least 12 characters.\n",
    );
    process.exitCode = 1;
    return;
  }

  const dataSource = await getInitializedDataSource();
  const repository = dataSource.getRepository(User);
  const admin = await repository.findOne({ where: { email: "admin@rudrokhobor.dev" } });
  if (!admin) {
    process.stderr.write("admin@rudrokhobor.dev not found; run `npm run db:seed` first.\n");
    process.exitCode = 1;
    await dataSource.destroy();
    return;
  }

  const hash = await hashPassword(password);
  await repository.update(admin.id, { passwordHash: hash });
  await dataSource.destroy();
  process.stdout.write(`updated password hash for ${admin.email}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : error}\n`);
  process.exitCode = 1;
});