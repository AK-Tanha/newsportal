"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { adminAppInfo } from "@/lib/admin";
import { Alert } from "@/components/admin/ui/Alert";
import { Button } from "@/components/admin/ui/Button";
import { Field } from "@/components/admin/ui/Field";

type LoginError = {
  code?: string;
  message?: string;
  details?: Array<{ field?: string; issues?: string[] }>;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<LoginError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailIssue =
    error?.details?.find((d) => d.field === "email")?.issues?.join(" ") ?? undefined;
  const passwordIssue =
    error?.details?.find((d) => d.field === "password")?.issues?.join(" ") ?? undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body: unknown = await response.json().catch(() => null);
      const payload = (body ?? {}) as { data?: unknown; error?: LoginError };
      if (!response.ok) {
        setError(payload.error ?? {
          code: "UNKNOWN",
          message: "Unable to sign in. Please try again.",
        });
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError({ code: "NETWORK", message: "Unable to reach the server. Check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
            {adminAppInfo.brandName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{adminAppInfo.panelLabel}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <Field label="Email" htmlFor="login-email" required error={emailIssue}>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-ink-900 placeholder-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              placeholder="admin@example.com"
            />
          </Field>

          <div className="mt-4">
            <Field label="Password" htmlFor="login-password" required error={passwordIssue}>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-ink-900 placeholder-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                placeholder="••••••••"
              />
            </Field>
          </div>

          {error?.message && !emailIssue && !passwordIssue && (
            <div className="mt-4">
              <Alert tone="error" title="Sign in failed">
                {error.message}
              </Alert>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="mt-6 w-full"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Authorized newsroom only. All access is logged.
        </p>
      </div>
    </div>
  );
}
