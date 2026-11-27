// 메이크에듀 API 동기화 — 원생·수업 전체 스냅샷 + 최근 출결 반영.
//
// 메이크에듀 콘솔 "환경설정 > API문서"(2026-11-25 확인) 기준:
//   GET /api/v1/students  — status=ALL이면 재원·휴원·퇴원 전체. 학생별 classes[]에 소속 반(classId·className) 포함.
//   GET /api/v1/classes   — status=ALL이면 삭제되지 않은 모든 반(classId·className·teacherName 등).
//   GET /api/v1/attendances — 시작일~종료일(최대 31일), 등원(checkInTime)·하원(checkOutTime) 시각만 줌(출석/결석/지각 같은 판정 값은 없음).
//   공통: Base URL https://mx7.makeedu.co.kr, 헤더 X-API-Key, 응답 JSON {page,pageSize,totalCount,items:[...]}.
//
// 반영은 이미 만들어져 있는 RPC 그대로 호출한다(새 테이블/RPC를 새로 만들지 않음):
//   supabase.rpc('apply_snapshot', {p_source:'api', p_students:S, p_classes:C, p_enrollments:E})
//   supabase.rpc('apply_attendance_named', {p_rows:[{name,school,class,day,mark}]})
// (member.html의 "엑셀로 자료 올리기"·"월별 출석부 올리기"가 쓰는 것과 같은 모양 — uploadExcel/uploadAttendance 참고)
//
// ⚠ 알아 둘 점 두 가지(원장님께 보고한 내용):
//   1. 반(class) 식별자: 메이크에듀는 이제 진짜 classId가 있지만, 기존 엑셀 방식은 반 이름(className)을
//      식별자로 써 왔고 홈페이지 반 연결(site_key)도 그 이름에 걸려 있다. 지금 당장 classId로 바꾸면
//      기존에 연결된 반이 전부 "연결 끊김"으로 보여 원장님이 일일이 다시 연결해야 한다. 그래서 이번에도
//      className을 식별자로 그대로 쓴다(E.class_id = className). 실제 classId는 나중에 필요하면 쓸 수
//      있게 classItems 안에 들어 있다.
//   2. 출결: 메이크에듀 출결 API는 등원·하원 "시각"만 주고, 결석(X)·지각(△) 같은 판정 값은 주지 않는다.
//      그래서 이 함수는 "등원 기록이 있으면 출석(O)"만 반영하고, 결석·지각은 반영하지 않는다(기존 엑셀
//      출석부의 X·△ 표시와 똑같이 맞출 수 없다는 뜻). 더 정확하게 하려면 메이크에듀 쪽에 결석 판정을
//      어떻게 따로 주는지(혹은 반별 수업일에 등원 기록이 없는 학생을 결석으로 볼지) 확인이 필요하다.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MAKEEDU_BASE = "https://mx7.makeedu.co.kr";
// 메이크에듀는 등록된 고정 IP(15.134.103.239, AWS Lightsail makeedu-relay)에서 온 호출만 받는다.
// 비밀 값 MAKEEDU_RELAY_URL(예: https://15-134-103-239.sslip.io)을 넣으면 그 중계 서버를 거쳐 호출한다.
// MAKEEDU_RELAY_TOKEN은 중계 서버가 아무나 쓰지 못하게 확인하는 값이다. 둘 다 없으면 직접 호출(지금처럼 403).
const RELAY_URL = (Deno.env.get("MAKEEDU_RELAY_URL") || "").replace(/\/+$/, "");
const RELAY_TOKEN = Deno.env.get("MAKEEDU_RELAY_TOKEN") || "";
const API_BASE = RELAY_URL || MAKEEDU_BASE;
const PAGE_SIZE = 100;
const MAX_PAGES = 200; // 안전장치(무한 루프 방지) — 학생·반 수가 이보다 많아질 일은 없음

async function fetchAllPages(
  path: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<any[]> {
  const items: any[] = [];
  let page = 1;
  while (page <= MAX_PAGES) {
    const qs = new URLSearchParams({ ...params, page: String(page), pageSize: String(PAGE_SIZE) });
    const res = await fetch(`${API_BASE}${path}?${qs.toString()}`, {
      headers: RELAY_URL
        ? { "X-API-Key": apiKey, "X-Relay-Token": RELAY_TOKEN }
        : { "X-API-Key": apiKey },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`${path} 호출 실패 (HTTP ${res.status}): ${body.slice(0, 300)}`);
    }
    const json = await res.json();
    const pageItems = json.items || [];
    items.push(...pageItems);
    const total = typeof json.totalCount === "number" ? json.totalCount : items.length;
    if (items.length >= total || pageItems.length < PAGE_SIZE) break;
    page++;
  }
  return items;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const STATUS_MAP: Record<string, string> = {
  ACTIVE: "재원",
  PAUSED: "휴원",
  WITHDRAWN: "퇴원",
};

// 앱의 "새로고침" 버튼이 브라우저에서 직접 이 함수를 호출한다(원장·데스크 화면).
// 기존에는 GitHub Actions(서버 대 서버)만 호출해서 CORS가 필요 없었음.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (_req: Request) => {
  if (_req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const makeeduKey = Deno.env.get("MAKEEDU_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!makeeduKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        step: "config",
        message:
          "MAKEEDU_API_KEY 비밀 값을 찾지 못했습니다. Supabase 대시보드 Edge Functions > Secrets에서 확인해 주세요.",
      }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        step: "config",
        message: "SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 비밀 값을 찾지 못했습니다.",
      }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  // 로그인한 사람이 브라우저에서 직접 부른 경우(새로고침 버튼)엔 원장인지 확인한다.
  // 공개 키·service role 키로만 부르는 자동 동기화(cron)는 그대로 통과시킨다(로그인 사용자가 없음).
  const authHeader = _req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "sb_publishable_Kj2bX4fe9CRSkhvGzBbaJw_y1ZqkjOz";
  if (jwt && jwt !== serviceRoleKey) {
    try {
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
      });
      const { data: userData } = await authClient.auth.getUser(jwt);
      if (userData?.user) {
        const { data: isAdmin } = await authClient.rpc("is_admin");
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ ok: false, step: "auth", message: "원장만 새로고침할 수 있습니다." }),
            { status: 403, headers: { ...cors, "Content-Type": "application/json" } },
          );
        }
      }
    } catch (_e) {
      // 토큰 확인 자체가 실패해도 기존 자동 동기화(cron)를 막지 않도록 조용히 통과
    }
  }

  const sb = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1) 원생 전체(재원+휴원+퇴원) — 학생별 소속 반(classes[])도 함께 옴
    const studentItems = await fetchAllPages("/api/v1/students", { status: "ALL" }, makeeduKey);
    // 2) 반 전체(삭제되지 않은 모든 반)
    const classItems = await fetchAllPages("/api/v1/classes", { status: "ALL" }, makeeduKey);

    const S = studentItems.map((x: any) => ({
      me_id: String(x.studentId),
      name: x.studentName || "",
      school: x.schoolName || "",
      grade: x.gradeName || "",
      status: STATUS_MAP[x.status as string] || "퇴원",
      birth: x.birthDate || "",
      guardian_phone: x.guardianPhone || "",
      joined_on: x.admissionDate || "",
      left_on: x.withdrawalDate || "",
    }));

    // 식별자는 className 그대로 사용(위 ⚠1 참고). 같은 이름의 반이 둘 있으면 뒤 것이 앞 것을 덮으므로,
    // 그런 경우가 실제로 있는지는 아래 응답의 classes 길이와 메이크에듀 반 개수를 한 번 비교해 보는 게 좋다.
    const C = classItems.map((c: any) => ({
      me_id: c.className || String(c.classId),
      name: c.className || String(c.classId),
      teacher: c.teacherName || "",
      cap: "",
      target: "",
    }));

    const E: { class_id: string; student_id: string }[] = [];
    studentItems.forEach((x: any) => {
      if (STATUS_MAP[x.status as string] === "퇴원") return; // 퇴원생은 반 배정 제외(엑셀 방식과 동일)
      (x.classes || []).forEach((cl: any) => {
        if (cl.className) E.push({ class_id: cl.className, student_id: String(x.studentId) });
      });
    });

    const snap = await sb.rpc("apply_snapshot", {
      p_source: "api",
      p_students: S,
      p_classes: C,
      p_enrollments: E,
    });
    if (snap.error) throw new Error(`apply_snapshot 실패: ${snap.error.message}`);

    // 3) 최근 출결(기본 7일, MAKEEDU_ATTENDANCE_DAYS 비밀 값으로 조절 가능 · 최대 31일)
    const rawDays = Number(Deno.env.get("MAKEEDU_ATTENDANCE_DAYS") || "7");
    const days = Math.min(31, Math.max(1, Number.isFinite(rawDays) ? rawDays : 7));
    const end = new Date();
    const start = new Date(end.getTime() - (days - 1) * 86400000);
    const attendanceItems = await fetchAllPages(
      "/api/v1/attendances",
      { startDate: fmtDate(start), endDate: fmtDate(end) },
      makeeduKey,
    );

    const schoolByStudentId: Record<string, string> = {};
    studentItems.forEach((x: any) => {
      schoolByStudentId[String(x.studentId)] = x.schoolName || "";
    });

    // 등원 기록이 있는 날만 출석(O)으로 반영. 결석(X)·지각(△)은 API가 판정 값을 주지 않아 반영하지 않음(위 ⚠2 참고).
    const rows = attendanceItems
      .filter((a: any) => a.checkInTime && a.attendanceDate)
      .map((a: any) => ({
        name: a.studentName || "",
        school: schoolByStudentId[String(a.studentId)] || "",
        class: a.className || "",
        day: a.attendanceDate,
        mark: "O",
      }));

    let attendanceSaved: number | null = null;
    let attendanceUnmatched: string[] = [];
    if (rows.length) {
      const att = await sb.rpc("apply_attendance_named", { p_rows: rows });
      if (att.error) throw new Error(`apply_attendance_named 실패: ${att.error.message}`);
      attendanceSaved = att.data?.saved ?? null;
      attendanceUnmatched = att.data?.unmatched || [];
    }

    return new Response(
      JSON.stringify({
        ok: true,
        students: S.length,
        classes: C.length,
        enrollments: E.length,
        snapshot_changes: snap.data?.changes ?? null,
        attendance_range: `${fmtDate(start)}~${fmtDate(end)}`,
        attendance_rows_sent: rows.length,
        attendance_saved: attendanceSaved,
        attendance_unmatched: attendanceUnmatched,
        note:
          "출결은 '등원 기록 있음=O'만 반영했습니다. 결석·지각 판정은 메이크에듀 API에 값이 없어 반영하지 않았습니다.",
      }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const message = String((e as any)?.message || e);
    try {
      await sb.rpc("log_sync_error", { p_source: "api", p_error: message });
    } catch (_logErr) {
      // 오류 기록 자체가 실패해도 아래 응답은 정상적으로 내려가야 함
    }
    return new Response(
      JSON.stringify({ ok: false, step: "sync", message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});
