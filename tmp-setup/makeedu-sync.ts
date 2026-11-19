// 메이크에듀 → 주니어솔로몬 자료 받기 (Supabase Edge Function: makeedu-sync)
// 비밀 설정(Secrets)에 넣을 값: MAKEEDU_API_KEY, MAKEEDU_BASE_URL, SYNC_SECRET
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 는 Supabase가 자동으로 넣어 줍니다.
//
// ※ 메이크에듀 API 문서를 받으면 아래 PATHS 와 pick() 칸 이름만 맞추면 됩니다.

import { createClient } from "npm:@supabase/supabase-js@2";

const PATHS = {
  students: "/students",          // 원생 목록      ← 문서 확인 후 수정
  classes: "/classes",            // 수업 목록      ← 문서 확인 후 수정
  classStudents: "/class-students", // 수업별 원생  ← 문서 확인 후 수정
  attendance: "/attendance",      // 출결 이력      ← 문서 확인 후 수정
};

const env = (k: string) => Deno.env.get(k) ?? "";
function serviceKey(): string {
  if (env("SUPABASE_SERVICE_ROLE_KEY")) return env("SUPABASE_SERVICE_ROLE_KEY");
  if (env("SUPABASE_SECRET_KEY")) return env("SUPABASE_SECRET_KEY");
  try { const o = JSON.parse(env("SUPABASE_SECRET_KEYS") || "{}"); return String(Object.values(o)[0] ?? ""); } catch { return ""; }
}
const sb = createClient(env("SUPABASE_URL"), serviceKey(), { auth: { persistSession: false } });

// 여러 이름 가운데 먼저 있는 칸의 값을 씁니다(문서 확인 전 대비).
function pick(o: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = o?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

// 목록이 data / items / list / result 안에 들어 오는 경우까지 꺼냅니다.
function listOf(j: unknown): Record<string, unknown>[] {
  if (Array.isArray(j)) return j as Record<string, unknown>[];
  const o = j as Record<string, unknown>;
  for (const k of ["data", "items", "list", "result", "rows", "students", "classes"]) {
    if (Array.isArray(o?.[k])) return o[k] as Record<string, unknown>[];
    if (o?.[k] && typeof o[k] === "object") {
      const inner = listOf(o[k]);
      if (inner.length) return inner;
    }
  }
  return [];
}

async function getAll(path: string, query: Record<string, string> = {}) {
  const base = env("MAKEEDU_BASE_URL").replace(/\/+$/, "");
  const out: Record<string, unknown>[] = [];
  for (let page = 1; page <= 50; page++) {
    const u = new URL(base + path);
    for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v);
    if (page > 1) u.searchParams.set("page", String(page));
    const r = await fetch(u, { headers: { "X-API-Key": env("MAKEEDU_API_KEY"), Accept: "application/json" } });
    if (!r.ok) throw new Error(`메이크에듀 ${path} 응답 ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const j = await r.json();
    const rows = listOf(j);
    out.push(...rows);
    const total = Number((j as Record<string, unknown>)?.totalPages ?? (j as Record<string, unknown>)?.total_pages ?? 0);
    if (!total || page >= total || rows.length === 0) break;
  }
  return out;
}

const ymd = (v: string) => v.replace(/[^0-9]/g, "").slice(0, 8);

function statusOf(o: Record<string, unknown>): string {
  const s = pick(o, "status", "상태", "재원상태", "studentStatus");
  if (/휴원|pause|hold/i.test(s)) return "휴원";
  if (/퇴원|leave|withdraw|quit/i.test(s)) return "퇴원";
  if (/재원|active|enrolled/i.test(s)) return "재원";
  const 재원 = pick(o, "재원여부", "isActive"), 휴원 = pick(o, "휴원여부", "isPaused");
  if (/^(O|Y|true|1)$/i.test(휴원)) return "휴원";
  if (/^(O|Y|true|1)$/i.test(재원)) return "재원";
  return "퇴원";
}

async function run() {
  const [rs, rc, rcs] = await Promise.all([getAll(PATHS.students), getAll(PATHS.classes), getAll(PATHS.classStudents)]);

  const students = rs.map((o) => ({
    me_id: pick(o, "studentId", "student_id", "id", "원생고유번호"),
    name: pick(o, "name", "studentName", "이름"),
    school: pick(o, "school", "schoolName", "학교"),
    grade: pick(o, "grade", "학년"),
    status: statusOf(o),
    birth: ymd(pick(o, "birth", "birthday", "birthDate", "생일", "생년월일")),
    guardian_phone: pick(o, "parentPhone", "guardianPhone", "parent_phone", "보호자연락처"),
    joined_on: ymd(pick(o, "joinDate", "admissionDate", "입학일")),
    left_on: ymd(pick(o, "leaveDate", "withdrawDate", "퇴원일")),
  }));
  const classes = rc.map((o) => ({
    me_id: pick(o, "classId", "class_id", "id", "수업명", "name"),
    name: pick(o, "name", "className", "수업명"),
    teacher: pick(o, "teacher", "teacherName", "담임강사"),
    cap: pick(o, "capacity", "maxStudents", "정원"),
    target: pick(o, "target", "대상"),
  }));
  const enrollments = rcs.map((o) => ({
    class_id: pick(o, "classId", "class_id", "수업명"),
    student_id: pick(o, "studentId", "student_id", "원생고유번호"),
  }));

  const { data, error } = await sb.rpc("apply_snapshot", {
    p_source: "api", p_students: students, p_classes: classes, p_enrollments: enrollments,
  });
  if (error) throw new Error("저장 실패: " + error.message);

  // 출결: 최근 3일
  const from = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
  const ra = await getAll(PATHS.attendance, { from, startDate: from });
  const att = ra.map((o) => ({
    student_id: pick(o, "studentId", "student_id", "원생고유번호"),
    class_id: pick(o, "classId", "class_id", "수업명"),
    day: pick(o, "date", "attendDate", "day", "출결일").slice(0, 10).replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3"),
    status: pick(o, "status", "attendStatus", "출결"),
    checked_at: pick(o, "checkedAt", "checkInTime", "등원시간") || null,
  }));
  if (att.length) {
    const { error: e2 } = await sb.rpc("apply_attendance", { p_rows: att });
    if (e2) throw new Error("출결 저장 실패: " + e2.message);
  }
  return { ...data, attendance: att.length };
}

Deno.serve(async (req) => {
  if (req.headers.get("x-sync-secret") !== env("SYNC_SECRET") || !env("SYNC_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }
  try {
    const result = await run();
    return Response.json({ ok: true, result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await sb.rpc("log_sync_error", { p_source: "api", p_error: msg });
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
});
