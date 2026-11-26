#!/bin/bash
# 메이크에듀 중계 서버 설치 — AWS Lightsail makeedu-relay(고정 IP 15.134.103.239)의 브라우저 터미널에서 한 번 실행한다.
# 하는 일: Caddy(자동 HTTPS)를 설치하고, 올바른 비밀 토큰이 붙은 요청만 메이크에듀로 전달하게 설정한다.
# 이 서버에는 학생 정보도, 메이크에듀 키도 저장하지 않는다(키는 요청에 실려 지나가기만 한다).
set -e
DOMAIN="15-134-103-239.sslip.io"          # sslip.io: 이 IP를 가리키는 무료 주소(도메인 구입 불필요)
TOKEN="$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 32)"

if ! command -v caddy >/dev/null 2>&1; then
  sudo apt-get update -y
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y caddy
fi

sudo tee /etc/caddy/Caddyfile >/dev/null <<EOF
$DOMAIN {
  @ok header X-Relay-Token $TOKEN
  handle @ok {
    reverse_proxy https://mx7.makeedu.co.kr {
      header_up Host mx7.makeedu.co.kr
      header_up -X-Relay-Token
    }
  }
  handle {
    respond "forbidden" 403
  }
}
EOF
sudo systemctl enable caddy >/dev/null 2>&1 || true
sudo systemctl restart caddy
sleep 3
echo
echo "=== 설치 끝 ==="
echo "내 바깥 IP(15.134.103.239여야 함): $(curl -s https://checkip.amazonaws.com)"
echo "중계 주소  : https://$DOMAIN"
echo "중계 토큰  : $TOKEN"
echo "위 두 값을 Claude에게 알려 주세요(또는 Supabase 비밀 값 MAKEEDU_RELAY_URL / MAKEEDU_RELAY_TOKEN에 넣기)."
