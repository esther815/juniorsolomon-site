# 메이크에듀 중계 서버 (고정 IP)

메이크에듀 API는 등록된 IP에서 온 호출만 받는다. Supabase는 고정 IP가 없어 403이 난다.
그래서 고정 IP 15.134.103.239가 붙은 AWS Lightsail `makeedu-relay`가 대신 호출한다.

흐름: Supabase 함수 → https://15-134-103-239.sslip.io (토큰 확인) → 메이크에듀

## 설치(1회)
1. Lightsail 콘솔 → makeedu-relay → 「네트워킹」 → IPv4 방화벽에 **HTTPS 443** 규칙 추가(80은 기본으로 열려 있음).
2. 「연결」 → 브라우저 터미널(SSH) 열기 → `install.sh` 내용을 붙여 넣어 실행.
3. 끝에 나오는 **중계 주소·중계 토큰**을 Supabase → Edge Functions → Secrets에
   `MAKEEDU_RELAY_URL`, `MAKEEDU_RELAY_TOKEN`으로 넣는다.
4. 다음 자동 호출(매일 06:10 KST)부터 반영된다. 바로 확인하려면 makeedu-sync를 수동 실행.

비밀 두 값이 없으면 함수는 예전처럼 직접 호출한다(403).
