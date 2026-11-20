// 원장님 카카오톡 「나에게 보내기」 알림 (Supabase Edge Function: kakao-alert)
// Secrets: KAKAO_REST_KEY, KAKAO_CLIENT_SECRET, SYNC_SECRET
// 동작
//   POST {action:'authorize_url'}            (원장님 로그인 상태) → 카카오 동의 화면 주소
//   POST {action:'connect', code}            (원장님 로그인 상태) → 토큰 저장 + 시험 메시지
//   POST {action:'notify', text, link?}      (x-sync-secret)      → 원장님 카톡 + 휴대폰 푸시 알림
//   POST {action:'push_key'}                 (누구나)             → 푸시 공개 키 (처음 부를 때 자동 생성, 비밀 키는 DB에만)
//   POST {action:'push_subscribe', sub}      (로그인 회원)        → 이 휴대폰을 알림 받는 기기로 등록
//   POST {action:'push_test'}                (원장님)             → 원장님 휴대폰으로 시험 푸시
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

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

// 카카오 앱 키: 홈페이지 카카오 로그인에 실제로 쓰이는 키를 Supabase 로그인 설정에서 자동으로 읽어 옴(공개값).
let cachedId = "";
async function kakaoClientId(): Promise<string> {
  if (cachedId) return cachedId;
  try {
    const r = await fetch(env("SUPABASE_URL") + "/auth/v1/authorize?provider=kakao&redirect_to=https://juniorsolomon.com/member.html", { redirect: "manual" });
    const loc = r.headers.get("location") ?? "";
    const id = loc ? new URL(loc).searchParams.get("client_id") ?? "" : "";
    if (id) { cachedId = id; return id; }
  } catch (_) { /* 아래 비밀값 사용 */ }
  return env("KAKAO_REST_KEY");
}

async function tokenRequest(params: Record<string, string>) {
  const body = new URLSearchParams({ client_id: await kakaoClientId(), ...params });
  if (env("KAKAO_CLIENT_SECRET")) body.set("client_secret", env("KAKAO_CLIENT_SECRET"));
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


// ── 휴대폰 푸시 (웹 푸시) ──
let vapidReady = false;
async function vapid(): Promise<string> {
  const { data } = await sb.from("app_settings").select("key,val").in("key", ["vapid_public", "vapid_private"]);
  let pub = data?.find((x) => x.key === "vapid_public")?.val ?? "";
  let pri = data?.find((x) => x.key === "vapid_private")?.val ?? "";
  if (!pub || !pri) {
    const k = webpush.generateVAPIDKeys(); pub = k.publicKey; pri = k.privateKey;
    await sb.from("app_settings").upsert([{ key: "vapid_public", val: pub }, { key: "vapid_private", val: pri }]);
  }
  if (!vapidReady) { webpush.setVapidDetails("mailto:jrsolomoncom@gmail.com", pub, pri); vapidReady = true; }
  return pub;
}
async function userId(req: Request): Promise<string> {
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return "";
  const { data } = await sb.auth.getUser(jwt);
  return data?.user?.id ?? "";
}
async function pushTo(userIds: string[] | null, payload: Record<string, unknown>): Promise<number> {
  await vapid();
  let q = sb.from("push_subs").select("id,endpoint,p256dh,auth,user_id");
  if (userIds) q = q.in("user_id", userIds);
  const { data: subs } = await q;
  let n = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 86400, urgency: "high" });
      n++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode ?? 0;
      if (code === 404 || code === 410) await sb.from("push_subs").delete().eq("id", s.id);
    }
  }
  return n;
}
async function adminIds(): Promise<string[]> {
  const { data } = await sb.from("admins").select("user_id");
  return (data ?? []).map((x) => x.user_id);
}
function splitText(text: string) {
  const lines = text.replace(/^\[주니어솔로몬\]\s*/, "").split("\n");
  return { title: lines[0] || "새 소식", body: lines.slice(1).join(" · ") };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  let b: Record<string, any> = {};
  try { b = await req.json(); } catch { /* empty */ }
  try {
    if (b.action === "notify") {
      if (!env("SYNC_SECRET") || req.headers.get("x-sync-secret") !== env("SYNC_SECRET")) return json({ ok: false }, 403);
      const text = String(b.text ?? "알림");
      let kakao = true, pushed = 0;
      try { await sendMe(text, b.link || undefined); } catch (e) { kakao = false; await sb.from("sync_runs").insert({ source: "kakao", ok: false, error: String(e).slice(0, 2000) }); }
      try { const t = splitText(text); pushed = await pushTo(await adminIds(), { ...t, url: "/member.html", tag: "admin-" + Date.now(), star: true }); } catch (_) { /* 푸시 실패가 알림 전체를 막지 않게 */ }
      return json({ ok: kakao || pushed > 0, kakao, pushed });
    }
    if (b.action === "push_key") return json({ ok: true, key: await vapid() });
    if (b.action === "push_subscribe") {
      const uid = await userId(req);
      const sub = b.sub as unknown as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      if (!uid || !sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return json({ ok: false }, 400);
      await sb.from("push_subs").upsert({ user_id: uid, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth,
        ua: (req.headers.get("user-agent") ?? "").slice(0, 200), updated_at: new Date().toISOString() }, { onConflict: "endpoint" });
      return json({ ok: true });
    }
    if (!(await isAdmin(req))) return json({ ok: false, error: "not allowed" }, 403);
    if (b.action === "authorize_url") {
      const u = new URL("https://kauth.kakao.com/oauth/authorize");
      u.searchParams.set("client_id", await kakaoClientId());
      u.searchParams.set("redirect_uri", REDIRECT);
      u.searchParams.set("response_type", "code");
      u.searchParams.set("scope", "talk_message");
      u.searchParams.set("state", "kakao_alert");
      u.searchParams.set("prompt", "login");   // 매번 계정을 직접 골라 로그인
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
    if (b.action === "push_test") {
      const n = await pushTo([await userId(req)], { title: "알림이 연결되었습니다", body: "승인 대기·상담 신청이 오면 이렇게 알려 드립니다.", url: "/member.html", tag: "test", star: true });
      return json({ ok: n > 0, pushed: n });
    }
    if (b.action === "test") { await sendMe("[주니어솔로몬] 알림 시험 메시지입니다."); return json({ ok: true }); }
    return json({ ok: false, error: "unknown action" }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await sb.from("sync_runs").insert({ source: "kakao", ok: false, error: msg.slice(0, 2000) });
    return json({ ok: false, error: msg }, 500);
  }
});
