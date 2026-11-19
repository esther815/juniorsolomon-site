// 원장님 카카오톡 「나에게 보내기」 알림 (Supabase Edge Function: kakao-alert)
// Secrets: KAKAO_REST_KEY, KAKAO_CLIENT_SECRET, SYNC_SECRET
// 동작
//   POST {action:'authorize_url'}            (원장님 로그인 상태) → 카카오 동의 화면 주소
//   POST {action:'connect', code}            (원장님 로그인 상태) → 토큰 저장 + 시험 메시지
//   POST {action:'notify', text, link?}      (x-sync-secret)      → 원장님 카톡으로 알림
import { createClient } from "npm:@supabase/supabase-js@2";

const env = (k: string) => Deno.env.get(k) ?? "";
function serviceKey(): string {
  if (env("SUPABASE_SERVICE_ROLE_KEY")) return env("SUPABASE_SERVICE_ROLE_KEY");
  if (env("SUPABASE_SECRET_KEY")) return env("SUPABASE_SECRET_KEY");
  try { const o = JSON.parse(env("SUPABASE_SECRET_KEYS") || "{}"); return String(Object.values(o)[0] ?? ""); } catch { return ""; }
}
const sb = createClient(env("SUPABASE_URL"), serviceKey(), { auth: { persistSession: false } });
const REDIRECT = "https://juniorsolomon.com/member.html";
const cors = {
  "Access-Control-Allow-Origin": "https://juniorsolomon.com",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

async function isAdmin(req: Request): Promise<boolean> {
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return false;
  const { data } = await sb.auth.getUser(jwt);
  if (!data?.user) return false;
  const { data: a } = await sb.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  return !!a;
}

async function tokenRequest(params: Record<string, string>) {
  const body = new URLSearchParams({ client_id: env("KAKAO_REST_KEY"), client_secret: env("KAKAO_CLIENT_SECRET"), ...params });
  const r = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" }, body,
  });
  const j = await r.json();
  if (!r.ok) throw new Error("카카오 토큰 오류: " + (j.error_description ?? j.error ?? r.status));
  return j as { access_token: string; refresh_token?: string; expires_in: number };
}

async function accessToken(): Promise<string> {
  const { data: t } = await sb.from("kakao_tokens").select("*").eq("id", 1).maybeSingle();
  if (!t) throw new Error("카톡 알림이 아직 연결되지 않았습니다");
  if (t.access_token && new Date(t.access_expires_at).getTime() > Date.now() + 120000) return t.access_token;
  const j = await tokenRequest({ grant_type: "refresh_token", refresh_token: t.refresh_token });
  await sb.from("kakao_tokens").update({
    access_token: j.access_token,
    access_expires_at: new Date(Date.now() + j.expires_in * 1000).toISOString(),
    refresh_token: j.refresh_token ?? t.refresh_token,
    updated_at: new Date().toISOString(),
  }).eq("id", 1);
  return j.access_token;
}

async function sendMe(text: string, link = "https://juniorsolomon.com/member.html") {
  const at = await accessToken();
  const template = { object_type: "text", text: text.slice(0, 200), link: { web_url: link, mobile_web_url: link }, button_title: "원장님 화면 열기" };
  const r = await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send", {
    method: "POST",
    headers: { Authorization: "Bearer " + at, "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams({ template_object: JSON.stringify(template) }),
  });
  if (!r.ok) throw new Error("카톡 보내기 오류 " + r.status + ": " + (await r.text()).slice(0, 200));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  let b: Record<string, string> = {};
  try { b = await req.json(); } catch { /* empty */ }
  try {
    if (b.action === "notify") {
      if (!env("SYNC_SECRET") || req.headers.get("x-sync-secret") !== env("SYNC_SECRET")) return json({ ok: false }, 403);
      await sendMe(String(b.text ?? "알림"), b.link || undefined);
      return json({ ok: true });
    }
    if (!(await isAdmin(req))) return json({ ok: false, error: "not allowed" }, 403);
    if (b.action === "authorize_url") {
      const u = new URL("https://kauth.kakao.com/oauth/authorize");
      u.searchParams.set("client_id", env("KAKAO_REST_KEY"));
      u.searchParams.set("redirect_uri", REDIRECT);
      u.searchParams.set("response_type", "code");
      u.searchParams.set("scope", "talk_message");
      u.searchParams.set("state", "kakao_alert");
      return json({ ok: true, url: u.toString() });
    }
    if (b.action === "connect") {
      const j = await tokenRequest({ grant_type: "authorization_code", redirect_uri: REDIRECT, code: String(b.code ?? "") });
      if (!j.refresh_token) throw new Error("카카오에서 갱신 토큰을 받지 못했습니다");
      await sb.from("kakao_tokens").upsert({
        id: 1, access_token: j.access_token, refresh_token: j.refresh_token,
        access_expires_at: new Date(Date.now() + j.expires_in * 1000).toISOString(), updated_at: new Date().toISOString(),
      });
      await sendMe("[주니어솔로몬] 카톡 알림이 연결되었습니다. 승인할 학부모·강사가 생기면 여기로 알려 드립니다.");
      return json({ ok: true });
    }
    if (b.action === "test") { await sendMe("[주니어솔로몬] 알림 시험 메시지입니다."); return json({ ok: true }); }
    return json({ ok: false, error: "unknown action" }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await sb.from("sync_runs").insert({ source: "kakao", ok: false, error: msg.slice(0, 2000) });
    return json({ ok: false, error: msg }, 500);
  }
});
