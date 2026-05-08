import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AuditInput = {
  actorId: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(input: AuditInput) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { ok: false as const, reason: "supabase_admin_not_configured" };
  }

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: input.actorId,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  return { ok: true as const };
}
