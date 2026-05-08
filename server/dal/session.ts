import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDevSession } from "@/server/auth/dev-session";

export type AppSession = {
  userId: string;
  email: string | null;
  role: "user" | "admin";
  displayName: string | null;
};

export const getOptionalSession = cache(async (): Promise<AppSession | null> => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return getDevSession();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    role: profile?.role === "admin" ? "admin" : "user",
    displayName: profile?.display_name ?? null,
  };
});

export async function requireSession() {
  const session = await getOptionalSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}
