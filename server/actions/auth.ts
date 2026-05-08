"use server";

import { redirect } from "next/navigation";
import { signUpSchema, authEmailSchema } from "@/lib/validation/forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/server/services/audit";

export type AuthFormState = {
  status: "idle" | "error";
  message: string;
};

export async function signUpAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Check your name, email, and password." };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Authentication is not configured. Add Supabase env vars before launch.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
      },
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  await writeAuditLog({
    actorId: data.user?.id ?? null,
    action: "auth.sign_up",
    targetType: "profile",
    targetId: data.user?.id ?? null,
  });

  redirect("/onboarding");
}

export async function signInAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = authEmailSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email and password." };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Authentication is not configured. Add Supabase env vars before launch.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { status: "error", message: "The email or password was not accepted." };
  }

  await writeAuditLog({
    actorId: data.user.id,
    action: "auth.sign_in",
    targetType: "profile",
    targetId: data.user.id,
  });

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
