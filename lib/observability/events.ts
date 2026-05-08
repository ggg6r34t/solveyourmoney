export function emitEvent(name: string, payload: Record<string, unknown> = {}) {
  const ts = new Date().toISOString();
  const out = { event: name, ts, payload };
  if (name === "mock_data_blocked_production") {
    console.error("[OBS][CRITICAL]", JSON.stringify(out));
  } else {
    console.info("[OBS]", JSON.stringify(out));
  }
}
