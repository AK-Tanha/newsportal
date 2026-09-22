import { resolve } from "node:path";

export function loadEnv(): void {
  try {
    process.loadEnvFile(resolve(process.cwd(), ".env"));
  } catch {
    // No .env file; fall back to environment variables.
  }
}