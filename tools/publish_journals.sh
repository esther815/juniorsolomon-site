#!/usr/bin/env bash
# 저널 홍보 페이지(journals.html)를 juniorsolomon.com 과 sophosedu.co.kr 에 함께 올린다.
# 사용: juniorsolomon-site 맨 위에서  bash tools/publish_journals.sh   (원장님 「올려」 뒤에만)
# 전제: 소포스 저장소가 ../sophosedu-site 또는 $SOPHOS_DIR 에 내려받아져 있고 push 권한이 있다.
set -euo pipefail
SOL="$(cd "$(dirname "$0")/.." && pwd)"
SOP="${SOPHOS_DIR:-$SOL/../sophosedu-site}"
MSG="${1:-저널 홍보 페이지(journals.html) 두 사이트 동시 반영}"
git -C "$SOL" pull -q --rebase origin main
git -C "$SOL" add journals.html assets/journals-og.png assets/journals-kakao-1080.png
git -C "$SOL" diff --cached --quiet || git -C "$SOL" commit -q -m "$MSG"
git -C "$SOL" push -q origin HEAD:main
git -C "$SOP" pull -q --rebase origin main
cp "$SOL/journals.html" "$SOP/journals.html"
git -C "$SOP" add journals.html
git -C "$SOP" diff --cached --quiet || git -C "$SOP" commit -q -m "$MSG (juniorsolomon-site 에서 동기화)"
git -C "$SOP" -c push.negotiate=true push -q origin HEAD:main
echo "완료: juniorsolomon.com/journals.html · sophosedu.co.kr/journals.html"
