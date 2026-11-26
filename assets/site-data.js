/* 주니어솔로몬 홈페이지·앱 공통 자료 — 이 파일 하나만 고치면 홈페이지 팝업·방학 특강·앱 공지/특강이 함께 바뀝니다 */
window.JS_DATA = {
  // 이벤트: 홈페이지 첫 화면 팝업 + 앱 공지 맨 위. until(마지막 날)이 지나면 모두에서 자동으로 사라짐
  events: [
    {id:'quest', img:'assets/38d8901671523352e0071b88494cd34c.jpg', alt:'새로 나왔습니다 — 솔로몬 QUEST 자기주도 학습지 12월 오픈. 재원생은 문해력 자기주도 학습 시간에 학원에서 별도 비용 없이 풉니다', href:'programs.html#havruta', until:'2026-12-31'},
    {id:'note',   img:'assets/03b20bf0d8abd195548f67557be817d4.jpg', imgs:['assets/03b20bf0d8abd195548f67557be817d4.jpg','assets/955a510be0512b0b5310a247c01c99b6.jpg'], alt:'크리스마스 반짝 노트 선물 — 재원생 전원과 12월 15일까지 겨울방학 특강 얼리 등록 친구에게 드립니다', href:'special.html#note-event', until:'2026-12-15'},
    {id:'sophos', img:'assets/0f9d29382158b1b52d3697f3654cb8a8.jpg', alt:'소포스의 문장을 선물합니다 — 얼리 등록·신규 등록 상담 고객께 3색 볼펜과 명언 L파일 1세트', href:'special.html#sophos-gift', until:'2027-02-28'}
  ],
  // 방학 특강(임시 방): end(마지막 수업일)이 지나면 홈페이지·앱 모두 '지난 특강'으로 넘어감 (지난 특강에는 포스터·금액을 보이지 않음)
  specials: [
      { id: 'maum', title: '문학으로 마음여행', sub: '장화연 원장 직강 하브루타', period: '2027 겨울 · 1/11–2/26', deadline: '2026-12-24', end: '2027-02-26', posters: ['assets/dcb4db7c1b9ba97096b7767217a25911.jpg', 'assets/b2a64420c63d9c6c119a2d3d6b3ffafe.jpg'], guide: 'assets/8da441d4dc827fd6e8347646fafe95b4.jpg' },
      { id: 'lab', title: '생각의 실험실', sub: '장화연 원장 직강 비문학 사고력 · 초등 3–6학년', period: '2027 겨울 · 1/11–2/26', deadline: '2026-12-24', end: '2027-02-26', posters: ['assets/02b5641ea51b63ecc224680ccee75fe9.jpg', 'assets/a45f7301b153464d7f515eff664526ab.jpg'], guide: 'assets/4698cf8e4f7bb404ad73b833ca9e2697.jpg' },
      { id: 'premium', title: '프리미엄 글쓰기반', sub: '하정빈 선생님 · 초등 4–6학년 · 매주 금요일 8회', period: '2027 겨울 · 1/8–2/26', deadline: null, end: '2027-02-26', posters: ['assets/796c673d9036f7ea7ee3df2e5e0319b0.jpg'] },
      { id: 'ocean', title: '리딩오션 겨울 무제한반', sub: '방학 동안 매일 읽는 집중 독서', period: '2027 겨울 · 1–2월', deadline: null, end: '2027-02-26', posters: ['assets/f0b017b788e77932a3de9cac94e6ee58.jpg', 'assets/dc3435e2570ee55d68f38de69477dcfd.jpg', 'assets/1e207de38a26d16cc76b89e44d7bd484.jpg'] },
      { id: 'sophos', title: '소포스 프라이빗', sub: '중고등 국어·수학 소수정예 코칭', period: '2027 겨울', deadline: '2026-12-30', end: '2027-02-26', posters: ['assets/ea1914603b99f184d13eca3d2b77aedf.jpg', 'assets/d3b8b140d3d1e4d8e132ee148bdcc67c.jpg'] }
  ]
};
