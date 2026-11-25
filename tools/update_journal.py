"""솔로몬 저널 갱신: data/journal.json 점검 → journal.html 다시 만들기.
실행: 저장소 맨 위 폴더에서  python3 tools/update_journal.py"""
import os, sys, subprocess, json, datetime
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
print(f'완료: 기사 {len(items)}건 · journal.html 갱신')
