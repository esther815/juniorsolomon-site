// 수업 피드백 맞춤법·문장 검사 (OpenAI)
// 강사가 「맞춤법 확인」을 누르면 '오늘 수업' 글을 받아 맞춤법/띄어쓰기/주술 호응/어색한 문장을 찾아 돌려준다.
// 키는 Edge Function Secret OPENAI_API_KEY 에서 읽는다(브라우저에 노출되지 않음).

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const SYS = [
  "너는 한국어 교정 도우미다. 학원 교사가 학부모에게 보내는 '수업 피드백' 글을 검사한다.",
  "다음 유형의 문제만 찾아라: 맞춤법 오류, 띄어쓰기 오류, 주어와 서술어가 호응하지 않는 문장(주술 불일치), 어색하거나 비문인 문장.",
  "맞춤법·띄어쓰기는 명백한 오류만 지적하고, 멀쩡한 표현을 억지로 바꾸지 마라.",
  "각 문제는 원문에 '있는 그대로'(글자·공백 동일) 존재하는 부분 문자열 span 과, 고친 제안 suggest, 유형 type(맞춤법|띄어쓰기|호응|어색) 으로 준다.",
  "같은 문장이 어색하면 그 문장 전체를 span 으로 잡아 자연스러운 문장으로 suggest 하라.",
  "문제가 없으면 빈 배열을 준다.",
  '반드시 JSON 객체만 출력한다: {"issues":[{"span":"...","suggest":"...","type":"..."}]}',
].join("\n");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (!OPENAI_API_KEY) return json({ error: "no_key" }, 500);
    const { text } = await req.json().catch(() => ({ text: "" }));
    if (!text || typeof text !== "string") return json({ error: "bad_input" }, 400);
    if (text.length > 2000) return json({ error: "too_long" }, 400);

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYS },
          { role: "user", content: text },
        ],
      }),
    });
    if (!r.ok) return json({ error: "openai", detail: (await r.text()).slice(0, 500) }, 502);
    const d = await r.json();
    let out: { issues: unknown[] } = { issues: [] };
    try {
      out = JSON.parse(d?.choices?.[0]?.message?.content ?? '{"issues":[]}');
    } catch (_) {
      out = { issues: [] };
    }
    if (!Array.isArray(out.issues)) out.issues = [];
    return json(out, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
