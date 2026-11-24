// MTG Decktester – KI-Zwischenstation. Hält den Anthropic-Schlüssel geheim.
// Secrets: ANTHROPIC_API_KEY (Pflicht), MTG_PASSWORD (Pflicht), MTG_DAILY_LIMIT (optional, Standard 200)
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const MODELS: Record<string, { model: string; max: number }> = {
  quick: { model: "claude-haiku-5-5", max: 1000 },
  default: { model: "claude-sonnet-5-5", max: 2500 },
  complex: { model: "claude-sonnet-5-5", max: 8000 },
};

let mem = { day: "", n: 0 };
async function countToday(): Promise<number> {
  const day = new Date().toISOString().slice(0, 10);
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await sb.rpc("mtg_ai_count", { d: day });
    if (error) throw error;
    return Number(data);
  } catch (_) {
    if (mem.day !== day) mem = { day, n: 0 };
    mem.n++;
    return mem.n;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ code: "bad_request", message: "POST erwartet" }, 405);
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  const pw = Deno.env.get("MTG_PASSWORD");
  if (!key || !pw) return json({ code: "not_configured", message: "ANTHROPIC_API_KEY oder MTG_PASSWORD fehlt in den Secrets." }, 503);
  let body: { password?: string; prompt?: string; tier?: string };
  try { body = await req.json(); } catch (_) { return json({ code: "bad_request", message: "Ungültige Anfrage" }, 400); }
  if (typeof body.password !== "string" || body.password !== pw) return json({ code: "not_granted", message: "Passwort falsch" }, 401);
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  if (!prompt || prompt.length > 80000) return json({ code: "bad_request", message: "Anfrage leer oder zu lang" }, 400);
  const limit = Number(Deno.env.get("MTG_DAILY_LIMIT") || 200);
  const n = await countToday();
  if (n > limit) return json({ code: "rate_limited", message: "Tageslimit erreicht" }, 429);
  const m = MODELS[body.tier || "default"] || MODELS.default;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: m.model, max_tokens: m.max, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok || !data) {
    const msg = data?.error?.message || `Anthropic antwortet mit ${r.status}`;
    return json({ code: r.status === 429 ? "rate_limited" : "upstream_error", message: msg }, r.status === 429 ? 429 : 502);
  }
  const text = (data.content || []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("");
  return json({ text, truncated: data.stop_reason === "max_tokens", used: n, limit });
});
