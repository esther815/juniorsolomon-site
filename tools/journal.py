"""솔로몬 저널(journal.html) 생성 + 홈페이지 미리보기 조각 생성.
data/journal.json 한 파일만 고치면 페이지와 홈페이지 미리보기가 함께 바뀐다.
(소포스 입시노트 tools/brief.py 방식을 그대로 본뜸 — 색만 솔로몬 보라·금색)"""
import json, html, sys, base64, datetime, os
ROOT = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

E = html.escape
items = sorted(json.load(open(os.path.join(ROOT, 'data', 'journal.json'), encoding='utf8')), key=lambda x: x['date'], reverse=True)
CATS = ['전체', '교육', '시사', '세계', '과학', '문화']
WD = '월화수목금토일'
# 카카오톡 바로 보내기 — 카카오 개발자 > 내 애플리케이션 > 앱 키 > 'JavaScript 키'(공개용 키).
# 비워 두면 휴대폰 공유창·링크 복사로 대신한다. 키를 넣은 앱의 플랫폼 > Web 에 https://juniorsolomon.com 이 등록돼 있어야 한다.
KAKAO_JS_KEY = '1970bf47704aa8766cc9184c492fec6d'
OG_IMAGE = 'https://juniorsolomon.com/assets/og-share-v9.jpg'
# 공유: 기사 아래 작은 아이콘 한 줄 — 누르면 바로 해당 서비스로(중간 창 없음). 원장 원칙: 지적 큐레이션과 단순화.
SHARE_BTNS = ''.join(f'<button type="button" data-k="{k}" aria-label="{n}" title="{n}" style="background:{bg};color:{fg}">{t}</button>' for k, n, bg, fg, t in [
    ('kakao', '카카오톡으로 보내기', '#FEE500', '#191919', 'K'), ('naver', '네이버 블로그에 공유', '#03C75A', '#fff', 'N'),
    ('x', 'X에 공유', '#000', '#fff', 'X'), ('threads', '스레드에 공유', '#000', '#fff', '@'), ('copy', '링크 복사', '#EDE6F1', '#5F3D66', '🔗')])

def NB(s):
    p = s.rsplit(' ', 2)
    if len(p) < 3 or len(p[1]) + len(p[2]) > 10:
        p = s.rsplit(' ', 1); return s if len(p) < 2 else p[0] + ' <span style="white-space:nowrap">' + p[1] + '</span>'
    return p[0] + ' <span style="white-space:nowrap">' + p[1] + ' ' + p[2] + '</span>'
def kdate(d):
    t = datetime.date.fromisoformat(d)
    return f"{t.year}. {t.month}. {t.day}.({WD[t.weekday()]})"

def card(x):
    pts = ''.join(f'<li>{E(p)}</li>' for p in x['points'])
    upd = ''
    if x.get('updates'):
        lis = ''.join(f'<li><time datetime="{u["date"]}">{kdate(u["date"])}</time> {E(u["text"])}</li>' for u in x['updates'])
        upd = f'<div class="updates"><p class="lab">후속보도</p><ul>{lis}</ul></div>'
    return f'''<article class="nc" data-cat="{E(x['cat'])}" id="{E(x['id'])}">
  <div class="meta"><span class="cat">{E(x['cat'])}</span><time datetime="{x['date']}">{kdate(x['date'])}</time><span class="src">{E(x['source'])}</span></div>
  <h2>{E(x['title'])}</h2>
  <p class="deck">{E(x['deck'])}</p>
  <div class="three"><p class="lab">세 줄 요약</p><ol>{pts}</ol></div>
  <p class="note"><b>솔로몬 노트</b>{E(x['note'])}</p>
  {upd}
  <a class="orig" href="{E(x['url'])}" target="_blank" rel="noopener nofollow">원문 기사 보기 · {E(x['source'])} →</a>
  <div class="sr" data-id="{E(x['id'])}" data-t="{E(x['title'])}" data-d="{E(x['deck'])}"><span>공유</span>{SHARE_BTNS}</div>
</article>'''

def page(icon_src, home_href):
    KAKAO_SDK = ('<script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js" crossorigin="anonymous"></script>'
                 f'<script>try{{Kakao.init({json.dumps(KAKAO_JS_KEY)})}}catch(e){{}}</script>') if KAKAO_JS_KEY else ''
    pinned = [x for x in items if x.get('pin')]
    feed = [x for x in items if not x.get('pin')]
    latest = E(feed[0]['id']) if feed else ''
    notice = ''
    if pinned:
        ncards = '\n'.join(card(x) for x in pinned)
        notice = f'<section class="notice" aria-label="공지"><p class="notice-lab">공지 · 꼭 읽어 주세요</p>{ncards}</section>'
    top3 = ''.join(f'<li><a href="#{E(x["id"])}"><span>{E(x["cat"])}</span>{E(x["title"])}</a></li>' for x in feed[:3])
    chips = ''.join(f'<button type="button" class="chip" data-f="{c}" aria-pressed="{"true" if c=="전체" else "false"}">{c}</button>' for c in CATS)
    cards = '\n'.join(card(x) for x in feed)
    ld = json.dumps({"@context": "https://schema.org", "@type": "CollectionPage", "name": "솔로몬 저널",
                     "description": "주니어솔로몬이 고른 교육·시사 뉴스 세 줄 요약", "publisher": {"@type": "EducationalOrganization", "name": "주니어솔로몬"}}, ensure_ascii=False)
    return f'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>솔로몬 저널 | 교육·시사 뉴스 세 줄 요약 · 주니어솔로몬</title>
<meta name="description" content="주니어솔로몬이 재원생 가정을 위해 꼭 알아야 할 교육·시사 뉴스를 골라 세 줄로 정리합니다.">
<meta property="og:title" content="솔로몬 저널 · 교육과 세상을 읽는 눈">
<meta property="og:description" content="교육·시사 뉴스를 세 줄로 정리합니다.">
<meta property="og:type" content="website"><meta property="og:url" content="https://juniorsolomon.com/journal.html"><meta property="og:image" content="{OG_IMAGE}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#5F3D66"><link rel="icon" href="favicon.ico" sizes="any"><link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Noto+Serif+KR:wght@600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<script type="application/ld+json">{ld}</script>
<style>
:root{{--cream:#FDFBF6;--paper:#FFFFFF;--purple:#5F3D66;--purple2:#4A2C52;--lilac:#D5C1DE;--lilac-l:#EFE9F2;--gold:#B9973E;--gold-l:#D9C48A;--ink:#2B1233;--text:#3A3440;--muted:#8A8290;--line:#E4DEE8;--serif:'Noto Serif KR',serif;--latin:'Cormorant Garamond','Noto Serif KR',serif}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--cream);color:var(--text);font-family:'Noto Sans KR',sans-serif;font-size:17px;line-height:1.8;word-break:keep-all;overflow-wrap:break-word;-webkit-font-smoothing:antialiased}}
a{{color:inherit}}h1,h2{{text-wrap:balance}}p,li{{text-wrap:pretty}}
.wrap{{max-width:880px;margin:0 auto;padding:0 24px}}
.hd{{position:sticky;top:0;z-index:20;background:rgba(253,251,246,.95);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}}
.hd .wrap{{max-width:1200px;display:flex;align-items:center;justify-content:space-between;height:68px}}
.brand{{display:flex;align-items:center;gap:10px;text-decoration:none}}.brand img{{height:34px}}
.brand b{{font-family:var(--serif);font-size:19px;letter-spacing:.02em;color:var(--purple2)}}.brand span{{display:block;font-size:11px;color:var(--gold);font-weight:700;letter-spacing:.14em}}
.back{{font-size:15px;text-decoration:none;color:var(--purple);font-weight:700}}
.mast{{padding:72px 0 46px;text-align:center}}
.mast .crown{{display:block;margin:0 auto 20px;width:38px;height:auto}}
.plate{{display:flex;align-items:center;justify-content:center;gap:20px}}
.plate .ln{{height:1px;width:72px;background:linear-gradient(90deg,transparent,var(--gold))}}
.plate .ln.r{{background:linear-gradient(90deg,var(--gold),transparent)}}
.plate .kk{{font-family:var(--latin);letter-spacing:.5em;color:var(--gold);font-size:14.5px;font-weight:600;padding-left:.5em;white-space:nowrap}}
.mast h1{{margin:20px 0 0;font-family:var(--serif);font-weight:700;font-size:clamp(46px,7.4vw,76px);color:var(--ink);letter-spacing:-.025em;line-height:1.08}}
.mast .tag{{margin:18px 0 0;font-family:var(--serif);font-size:clamp(18px,2.4vw,23px);color:var(--purple);font-weight:600;letter-spacing:-.01em}}
.mast .ed{{margin:9px auto 0;max-width:520px;color:var(--muted);font-size:15px}}
.top3{{background:var(--purple);color:#F3ECF6;padding:30px 34px;margin-top:10px}}
.top3 p{{margin:0 0 12px;font-family:var(--latin);letter-spacing:.3em;color:var(--gold-l);font-size:14px}}
.top3 ol{{margin:0;padding-left:22px}}.top3 li{{margin:8px 0;font-family:var(--serif);font-size:18.5px;line-height:1.55}}
.top3 a{{text-decoration:none;color:#fff}}.top3 a span{{display:inline-block;margin-right:10px;padding:0 9px;border:1px solid rgba(217,196,138,.6);color:var(--gold-l);font-family:'Noto Sans KR',sans-serif;font-size:12.5px;vertical-align:2px}}
.tools{{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:40px 0 10px}}
.chips{{display:flex;flex-wrap:wrap;gap:8px}}
.chip{{font:inherit;font-size:14.5px;padding:7px 16px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer}}
.chip[aria-pressed="true"]{{background:var(--purple);border-color:var(--purple);color:#fff}}
.q{{font:inherit;font-size:15px;padding:9px 16px;border:1px solid var(--line);border-radius:999px;background:#fff;min-width:220px}}
.nc{{padding:40px 0 36px;border-bottom:1px solid var(--line)}}
.meta{{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;font-size:14px;color:var(--muted)}}
.cat{{padding:1px 10px;background:var(--lilac-l);border:1px solid var(--line);color:var(--purple2);font-weight:700;font-size:13px}}
.nc h2{{margin:14px 0 0;font-family:var(--serif);font-size:clamp(25px,3vw,32px);line-height:1.38;color:var(--ink);letter-spacing:-.02em}}
.deck{{margin:12px 0 0;font-size:17.5px;color:var(--purple2);font-weight:500;line-height:1.7}}
.three{{margin-top:20px;padding:20px 24px;background:#fff;border:1px solid var(--line)}}
.three .lab{{margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.08em;color:var(--gold)}}
.three ol{{margin:0;padding-left:22px}}.three li{{margin:6px 0;font-size:16px;line-height:1.7}}
.note{{margin:16px 0 0;font-size:15.5px;line-height:1.7;color:var(--text);padding-left:14px;border-left:3px solid var(--gold)}}
.note b{{display:inline-block;margin-right:10px;color:var(--gold);font-size:13.5px;letter-spacing:.04em}}
.updates{{margin:16px 0 0;padding:14px 18px;background:var(--lilac-l);border:1px solid var(--line)}}
.updates .lab{{margin:0 0 8px;font-size:12.5px;font-weight:700;letter-spacing:.08em;color:var(--purple2)}}
.updates ul{{margin:0;padding-left:18px}}.updates li{{margin:6px 0;font-size:15px;line-height:1.65}}
.updates time{{font-weight:700;color:var(--purple);margin-right:6px}}
.notice{{margin:28px 0 6px}}
.notice-lab{{display:inline-block;margin:0 0 2px;padding:5px 15px;background:var(--purple);color:#fff;font-size:13px;font-weight:700;letter-spacing:.06em}}
.notice .nc{{border:2px solid var(--gold-l);border-bottom:2px solid var(--gold-l);background:#fff;padding:26px 24px 24px;margin-top:10px}}
.notice .nc .cat{{background:var(--gold);border-color:var(--gold);color:#fff}}
.orig{{display:inline-block;margin-top:16px;font-size:14.5px;color:var(--purple);text-decoration:none;border-bottom:1px solid var(--gold-l)}}
.nc{{scroll-margin-top:84px}}
.nc.hl{{animation:hlpulse 1.5s ease 2}}
@keyframes hlpulse{{0%,100%{{background:transparent}}50%{{background:var(--lilac-l)}}}}
.sr{{display:flex;align-items:center;gap:6px;margin-top:14px}}.sr span{{font-size:12.5px;color:var(--muted);margin-right:2px}}
.sr button{{width:28px;height:28px;padding:0;border:0;border-radius:50%;font:700 12.5px/28px 'Noto Sans KR',sans-serif;text-align:center;cursor:pointer;opacity:.9}}.sr button:hover{{opacity:1;transform:translateY(-1px)}}
.toast{{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:var(--ink);color:#fff;padding:12px 22px;border-radius:999px;font-size:14px;z-index:999;opacity:0;pointer-events:none;transition:opacity .25s;max-width:88vw;text-align:center}}
.toast.show{{opacity:1}}
.empty{{display:none;padding:50px 0;text-align:center;color:var(--muted)}}
footer{{margin-top:70px;padding:34px 0 50px;border-top:1px solid var(--line);font-size:13px;color:var(--muted);line-height:1.9}}
@media (max-width:600px){{.top3{{padding:24px 20px}}.q{{min-width:0;width:100%}}}}
</style></head><body>
<header class="hd"><div class="wrap"><a class="brand" href="{home_href}"><img src="{icon_src}" alt=""><span><b>주니어솔로몬</b><span>SOLOMON JOURNAL</span></span></a><a class="back" href="{home_href}">홈으로 →</a></div></header>
<main class="wrap">
<section class="mast">
<svg class="crown" viewBox="0 0 48 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 28 L2.5 9 L15 17 L24 4 L33 17 L45.5 9 L43 28 Z" fill="#C9A24A" stroke="#B9973E" stroke-width="1.1" stroke-linejoin="round"/><rect x="5" y="28" width="38" height="3.4" rx="1" fill="#B9973E"/><circle cx="24" cy="3.6" r="2.3" fill="#C9A24A" stroke="#B9973E" stroke-width="1"/></svg>
<div class="plate"><span class="ln"></span><span class="kk">SOLOMON JOURNAL</span><span class="ln r"></span></div>
<h1>솔로몬 저널</h1>
<p class="tag">교육과 세상을 읽는 눈</p>
<p class="ed">주니어솔로몬이 고른 교육·시사 소식을 세 줄로 정리합니다.</p>

</section>
{notice}
<section class="top3" aria-label="최근 소식 세 줄"><p>LATEST · 이번 호 세 줄</p><ol>{top3}</ol></section>
<div class="tools"><div class="chips" role="group" aria-label="분류">{chips}</div><input class="q" type="search" placeholder="검색 (예: 문해력, 수행평가)" aria-label="솔로몬 저널 검색"></div>
<section id="list">{cards}</section>
<p class="empty" id="empty">해당하는 소식이 아직 없습니다.</p>
<footer>요약과 솔로몬 노트는 주니어솔로몬이 기사를 읽고 정리한 것입니다. 정확한 내용은 각 원문 기사에서 확인해 주세요.<br>© 주니어솔로몬. 주니어솔로몬®은 등록상표(제40-1582862호)입니다.</footer>
</main>
<script>
(function(){{var f='전체',q='';var cards=[].slice.call(document.querySelectorAll('#list .nc'));
function run(){{var n=0;cards.forEach(function(c){{var ok=(f==='전체'||c.getAttribute('data-cat')===f)&&(!q||c.textContent.indexOf(q)>=0);c.style.display=ok?'':'none';if(ok)n++}});document.getElementById('empty').style.display=n?'none':'block'}}
[].forEach.call(document.querySelectorAll('.chip'),function(b){{b.onclick=function(){{f=b.getAttribute('data-f');[].forEach.call(document.querySelectorAll('.chip'),function(x){{x.setAttribute('aria-pressed',x===b?'true':'false')}});run()}}}});
document.querySelector('.q').addEventListener('input',function(e){{q=e.target.value.trim();run()}});
/* 공유 — 기사 아래 아이콘을 누르면 바로 해당 서비스로 */
var toastEl=null;
function toast(t){{if(!toastEl){{toastEl=document.createElement('div');toastEl.className='toast';document.body.appendChild(toastEl)}}toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(function(){{toastEl.classList.remove('show')}},2800)}}
function pageUrl(){{return location.origin+location.pathname}}
function copyLink(u,msg){{
  var done=function(){{toast(msg||'링크를 복사했어요.')}};
  if(navigator.clipboard&&navigator.clipboard.writeText){{navigator.clipboard.writeText(u).then(done).catch(function(){{window.prompt('이 주소를 복사해 주세요.',u)}})}}
  else window.prompt('이 주소를 복사해 주세요.',u);
}}
function openWin(u){{window.open(u,'_blank','noopener,width=600,height=640')}}
function go(k,d){{var u=d.url,t=d.title,e=encodeURIComponent;
  if(k==='kakao'){{if(window.Kakao&&Kakao.isInitialized&&Kakao.isInitialized()){{try{{Kakao.Share.sendDefault({{objectType:'feed',content:{{title:t,description:d.text||'',imageUrl:'{OG_IMAGE}',link:{{mobileWebUrl:u,webUrl:u}}}},buttons:[{{title:'기사 보기',link:{{mobileWebUrl:u,webUrl:u}}}}]}});return}}catch(er){{}}}}
    if(navigator.share){{navigator.share(d).catch(function(){{}});return}} copyLink(u,'링크를 복사했어요. 카카오톡에 붙여 넣어 보내 주세요.');return}}
  if(k==='naver'){{openWin('https://share.naver.com/web/shareView?url='+e(u)+'&title='+e(t));return}}
  if(k==='x'){{openWin('https://twitter.com/intent/tweet?text='+e(t)+'&url='+e(u));return}}
  if(k==='threads'){{openWin('https://www.threads.net/intent/post?text='+e(t+' '+u));return}}
  copyLink(u);
}}
document.addEventListener('click',function(ev){{var b=ev.target.closest('.sr button');if(!b)return;var r=b.parentNode;
  go(b.getAttribute('data-k'),{{title:'솔로몬 저널 — '+r.getAttribute('data-t'),text:r.getAttribute('data-d'),url:pageUrl()+'#'+r.getAttribute('data-id')}})}});
/* 공유 링크로 들어오면 그 기사로 이동해 잠깐 강조 */
if(location.hash.length>1){{var tgt=document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if(tgt){{setTimeout(function(){{tgt.scrollIntoView({{behavior:'smooth',block:'start'}});tgt.classList.add('hl');setTimeout(function(){{tgt.classList.remove('hl')}},3000)}},80)}}}}
}})();
</script>{KAKAO_SDK}<script src="assets/install.js?v=7" defer></script><script>try{{localStorage.setItem('js_journal_seen','{latest}')}}catch(e){{}}</script></body></html>'''

def teaser(journal_href):
    return ''.join(f'''<a class="bt-item" href="{journal_href}#{E(x['id'])}"><span class="bt-cat">{E(x['cat'])}</span><span class="bt-t">{NB(E(x['title']))}</span><span class="bt-d">{NB(E(x['deck']))}</span><time>{kdate(x['date'])}</time></a>''' for x in items[:3])

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'page-file':
        print(page('assets/icon-192.png', sys.argv[2]))
    elif mode == 'page-inline':
        ic = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(ROOT, 'assets', 'icon-192.png'), 'rb').read()).decode()
        print(page(ic, 'index.html'))
    elif mode == 'teaser':
        print(teaser(sys.argv[2]))
