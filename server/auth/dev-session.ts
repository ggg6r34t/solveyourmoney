import "server-only";

import { cookies } from "next/headers";
import type { AppSession } from "@/server/dal/session";

export const DEV_SESSION_COOKIE = "sym_dev_session";

type DevSessionInput = {
  email: string;
  displayName?: string | null;
};

export function isDevAuthEnabled() {
  return process.env.NODE_ENV !== "production";
}

export async function createDevSession({
  email,
  displayName,
}: DevSessionInput): Promise<AppSession> {
  const session: AppSession = {
    userId: `dev:${email.toLowerCase()}`,
    email,
    role: getDevRole(email),
    displayName: displayName ?? email.split("@")[0] ?? "Dev user",
  };

  const cookieStore = await cookies();
  cookieStore.set(DEV_SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  return session;
}

export async function getDevSession(): Promise<AppSession | null> {
  if (!isDevAuthEnabled()) {
    return null;
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(DEV_SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as AppSession;
  } catch {
    return null;
  }
}

export async function clearDevSession() {
  const cookieStore = await cookies();
  cookieStore.delete(DEV_SESSION_COOKIE);
}

function encodeSession(session: AppSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function getDevRole(email: string): AppSession["role"] {
  const allowlist = process.env.ADMIN_EMAIL_ALLOWLIST?.split(",").map((item) =>
    item.trim().toLowerCase(),
  );

  return allowlist?.includes(email.toLowerCase()) ? "admin" : "user";
}
