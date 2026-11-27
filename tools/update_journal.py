"""솔로몬 저널 갱신: data/journal.json 점검 → journal.html 다시 만들기 + index.html 첫 화면 미리보기(최신 3건) 교체.
※ 알림톡: main 에 올리는 순간 새 기사가 구독 학부모께 카카오 알림톡으로 나갈 수 있다(ALIMTALK_MODE=live 일 때). 원장님 「올려」 전에는 main 에 올리지 않는다. supabase/알림톡_준비_안내.md 참고.
실행: 저장소 맨 위 폴더에서  python3 tools/update_journal.py"""
import os, re, sys, subprocess, json, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
J = os.path.join(ROOT, 'tools', 'journal.py')
CATS = ['교육', '시사', '세계', '과학', '문화']
items = json.load(open(os.path.join(ROOT, 'data', 'journal.json'), encoding='utf8'))
need = ['id', 'date', 'cat', 'source', 'url', 'title', 'deck', 'points', 'note']
ids, bad = set(), []
for x in items:
    for k in need:
        if not x.get(k): bad.append(f"{x.get('id','?')}: '{k}' 비어 있음")
    if x.get('cat') not in CATS: bad.append(f"{x.get('id')}: 분류 '{x.get('cat')}'는 쓸 수 없음 ({', '.join(CATS)})")
    if len(x.get('points', [])) != 3: bad.append(f"{x.get('id')}: 세 줄 요약은 정확히 3개")
    try: datetime.date.fromisoformat(x.get('date', ''))
    except Exception: bad.append(f"{x.get('id')}: 날짜는 YYYY-MM-DD")
    if x.get('id') in ids: bad.append(f"id 중복: {x.get('id')}")
    ids.add(x.get('id'))
if bad:
    print('고칠 곳:\n- ' + '\n- '.join(bad)); sys.exit(1)
page = subprocess.run([sys.executable, J, 'page-file', 'index.html'], capture_output=True, text=True, check=True).stdout
open(os.path.join(ROOT, 'journal.html'), 'w', encoding='utf8').write(page)
teaser = subprocess.run([sys.executable, J, 'teaser', 'journal.html'], capture_output=True, text=True, check=True).stdout.strip().replace('class="bt-', 'class="nt-')
ip = os.path.join(ROOT, 'index.html'); s = open(ip, encoding='utf8').read()
s, n = re.subn(r'(<!--JOURNAL:START-->).*?(<!--JOURNAL:END-->)', lambda m: m.group(1) + teaser + m.group(2), s, flags=re.S)
if n != 1: print('index.html에서 <!--JOURNAL:START--> 표시를 찾지 못했습니다.'); sys.exit(1)
latest = max(x['date'] for x in items)
s = re.sub(r'<div class="nt-list"[^>]*>', f'<div class="nt-list" data-latest="{latest}">', s, count=1)
open(ip, 'w', encoding='utf8').write(s)
print(f'완료: 기사 {len(items)}건 · journal.html · 첫 화면 미리보기 갱신')
