// 메이크에듀 API 동기화 — 자리만 잡아 둔 뼈대입니다.
// 메이크에듀 콘솔 "환경설정 > API문서"의 원생·수업·출결 엔드포인트(주소·인증 헤더·응답 형식)가
// 확인되는 대로 아래를 채웁니다. 그전까지는 배포 파이프라인이 도는지만 확인하는 자리입니다.
//
// 완성되면 할 일(운영/메이크에듀_API연동_진행_261125.md 참고):
//   1. 메이크에듀 API로 원생 전체 목록 + 수업 목록 + 출결을 받아온다.
//   2. 받은 데이터를 member.html의 "엑셀로 자료 올리기"가 쓰는 것과 같은 모양으로 맞춘다
//      (S: {me_id,name,school,grade,status,birth,guardian_phone,joined_on,left_on},
//       C: {me_id,name,teacher,cap,target}, E: {class_id,student_id}).
//   3. 이미 만들어져 있는 RPC를 그대로 호출해 반영한다 — 새 테이블/RPC를 새로 만들지 않는다.
//        supabase.rpc('apply_snapshot', {p_source:'api', p_students:S, p_classes:C, p_enrollments:E})
//        supabase.rpc('apply_attendance_named', {p_rows:[...]})
//   4. 원생 생년월일 등은 메이크에듀 값이 비어 있으면 기존 값을 덮어쓰지 않는다(원장 입력값 우선).
//   5. 스케줄 실행(예: pg_cron이 이 함수를 주기 호출)은 비밀값 등록 뒤 별도로 설정한다.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (_req: Request) => {
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
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // TODO: 메이크에듀 API 문서가 확인되면 실제 엔드포인트 호출로 교체.
  // const res = await fetch("https://<메이크에듀 API 주소>/students", {
  //   headers: { Authorization: `Bearer ${makeeduKey}` },
  // });

  const sb = supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;

  return new Response(
    JSON.stringify({
      ok: false,
      step: "not_implemented",
      message:
        "makeedu-sync: 배포는 정상이지만 메이크에듀 API 호출부가 아직 비어 있습니다. " +
        "환경설정>API문서 확인 후 이 함수에 실제 호출을 채워 주세요.",
      has_makeedu_key: true,
      has_supabase_client: !!sb,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
