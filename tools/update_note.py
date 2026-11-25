"""솔로몬 저널 갱신: data/note.json 점검 → note.html 다시 만들기 + index.html 첫 화면 '솔로몬 저널' 미리보기(최신 3건) 교체.
실행: 저장소 맨 위 폴더에서  python3 tools/update_note.py"""
import os, re, sys, subprocess, json, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
G = os.path.join(ROOT, 'tools', 'note.py')
CATS = ['교육정책', '초등', '독서·문해력', '평가']
BANNED = ['충격', '비상', '대혼란', '폭탄', '초비상', '필독', '!', '?', '…']

# 1) note.json 점검
items = json.load(open(os.path.join(ROOT, 'data', 'note.json'), encoding='utf8'))
need = ['id', 'date', 'cat', 'source', 'url', 'title', 'deck', 'points', 'note']
ids, urls, bad, warn = set(), set(), [], []
for x in items:
    i = x.get('id', '?')
    for k in need:
        if not x.get(k): bad.append(f"{i}: '{k}' 비어 있음")
    if x.get('cat') not in CATS: bad.append(f"{i}: 분류 '{x.get('cat')}'는 쓸 수 없음 ({', '.join(CATS)}) — 중등·고입 기사는 소포스 입시 노트로")
    if len(x.get('points', [])) != 3: bad.append(f"{i}: 세 줄 요약은 정확히 3개")
    try:
        d = datetime.date.fromisoformat(x.get('date', ''))
        if d > datetime.date.today() + datetime.timedelta(days=1): bad.append(f"{i}: 날짜가 미래입니다 (기사 게재일을 적습니다)")
    except Exception:
        bad.append(f"{i}: 날짜는 YYYY-MM-DD")
    if not re.match(r'^\d{4}-\d{2}-[a-z0-9-]+$', str(i)): bad.append(f"{i}: id 는 YYMM-DD-영문짧은말")
    if not str(x.get('url', '')).startswith('http'): bad.append(f"{i}: url 은 원문 주소")
    if 'utm_' in str(x.get('url', '')): warn.append(f"{i}: url 의 ?utm_ 꼬리를 지우세요")
    if i in ids: bad.append(f"id 중복: {i}")
    if x.get('url') in urls: warn.append(f"같은 원문을 두 건으로 나눔: {i} — 의도한 것인지 확인")
    for w in BANNED:
        if w in str(x.get('title', '')): bad.append(f"{i}: 제목에 '{w}' 금지")
    if len(x.get('title', '')) > 34: warn.append(f"{i}: 제목 {len(x['title'])}자 — 28자 안팎 권장")
    if len(x.get('deck', '')) > 110: warn.append(f"{i}: 풀이 {len(x['deck'])}자 — 90자 안팎 권장")
    for p in x.get('points', []):
        if len(p) > 90: warn.append(f"{i}: 요약 한 줄 {len(p)}자 — 70자 안팎 권장")
    if not re.search(r'(니다|세요|십시오)\.?$', str(x.get('note', '')).strip()): warn.append(f"{i}: 솔로몬 노트는 존댓말로 끝냅니다")
    ids.add(i); urls.add(x.get('url'))
for w in warn: print('참고:', w)
if bad:
    print('고칠 곳:\n- ' + '\n- '.join(bad)); sys.exit(1)

# 2) note.html
page = subprocess.run([sys.executable, G, 'page'], capture_output=True, text=True, check=True).stdout
open(os.path.join(ROOT, 'note.html'), 'w', encoding='utf8').write(page)

# 3) index.html 미리보기 조각
teaser = subprocess.run([sys.executable, G, 'teaser'], capture_output=True, text=True, check=True).stdout.strip()
ip = os.path.join(ROOT, 'index.html'); s = open(ip, encoding='utf8').read()
new, n = re.subn(r'(<!--NOTE:START-->).*?(<!--NOTE:END-->)', lambda m: m.group(1) + teaser + m.group(2), s, flags=re.S)
if n != 1: print('index.html에서 <!--NOTE:START--> 표시를 찾지 못했습니다.'); sys.exit(1)
open(ip, 'w', encoding='utf8').write(new)
print(f'완료: 기사 {len(items)}건 · note.html · 첫 화면 미리보기 갱신')
