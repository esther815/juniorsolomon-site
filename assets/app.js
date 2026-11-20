/* 주니어솔로몬 앱 화면 (회원 로그인 뒤)
   역할: 원장 · 지점장 · 관리자 · 강사 · 학부모 (학생은 로그인 코드 단계에서 추가)
   PC와 휴대폰이 같은 구성 — 첫 화면 큰 버튼(타일) → 누르면 그 화면, 뒤로 가면 첫 화면 */
(function(){
'use strict';
var I={
 home:'<svg viewBox="0 0 24 24"><path class="w" d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"/><path class="a" d="M10 20.5v-4.5a2 2 0 0 1 4 0v4.5z"/></svg>',
 bell:'<svg viewBox="0 0 24 24"><path class="w" d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.7h-15z"/><circle class="a" cx="12" cy="20.6" r="1.6"/><circle class="g" cx="17.8" cy="5.6" r="2.4"/></svg>',
 cal:'<svg viewBox="0 0 24 24"><rect class="w" x="3.5" y="5" width="17" height="15.5" rx="2.6"/><path class="a" d="M3.5 7.6A2.6 2.6 0 0 1 6.1 5h11.8a2.6 2.6 0 0 1 2.6 2.6V10h-17z"/><path d="M8 3v4M16 3v4"/><circle class="g" cx="12" cy="15.2" r="1.9"/></svg>',
 chat:'<svg viewBox="0 0 24 24"><path class="w" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10.5L6 19.8V16h.5A2.5 2.5 0 0 1 4 13.5z"/><circle class="a" cx="8.6" cy="10" r="1.15"/><circle class="a" cx="12" cy="10" r="1.15"/><circle class="g" cx="15.4" cy="10" r="1.15"/></svg>',
 book:'<svg viewBox="0 0 24 24"><path class="w" d="M12 6.5C10 5 7 4.5 3.5 5v13.3c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13.3"/><path class="g" d="M15.2 4.9v5.2l1.6-1.1 1.6 1.1V4.7z"/></svg>',
 check:'<svg viewBox="0 0 24 24"><circle class="w" cx="12" cy="12" r="8.6"/><path d="M8.2 12.3l2.6 2.6 5-5.4" stroke-width="2"/></svg>',
 users:'<svg viewBox="0 0 24 24"><circle class="w" cx="9" cy="8.5" r="3.3"/><path class="w" d="M3 19.8a6 6 0 0 1 12 0z"/><circle class="a" cx="17.2" cy="9.4" r="2.3"/><path class="a" d="M15.6 14.4a4.6 4.6 0 0 1 5.9 4.4v1h-4.2"/></svg>',
 note:'<svg viewBox="0 0 24 24"><path class="w" d="M6.5 3.5H15l4 4v11.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5z"/><path class="g" d="M15 3.8V7.5h3.7z"/><path d="M8.5 12h7M8.5 15.5h4.5"/></svg>',
 chart:'<svg viewBox="0 0 24 24"><rect class="w" x="3.8" y="11" width="4.2" height="9.2" rx="1.3"/><rect class="a" x="9.9" y="4.8" width="4.2" height="15.4" rx="1.3"/><rect class="g" x="16" y="8.4" width="4.2" height="11.8" rx="1.3"/></svg>',
 send:'<svg viewBox="0 0 24 24"><path class="w" d="M20.5 3.5 3.5 10.3l6.4 2.6 2.6 6.6z"/><path class="g" d="M9.9 12.9l2.6 6.6 1.6-4z"/><path d="M20.5 3.5 9.9 12.9"/></svg>',
 gear:'<svg viewBox="0 0 24 24"><circle class="w" cx="12" cy="12" r="8.4"/><circle class="a" cx="12" cy="12" r="3"/><path d="M12 3.6v2.2M12 18.2v2.2M3.6 12h2.2M18.2 12h2.2"/><circle class="g" cx="18" cy="6" r="1.6"/></svg>',
 me:'<svg viewBox="0 0 24 24"><circle class="w" cx="12" cy="8.6" r="3.8"/><path class="w" d="M4.6 20a7.4 7.4 0 0 1 14.8 0z"/><circle class="g" cx="17.6" cy="5" r="1.5"/></svg>',
 star:'<svg viewBox="0 0 24 24"><path class="g" d="M12 2.5c.9 4.6 2.6 6.4 7.5 7.5-4.9 1.1-6.6 2.9-7.5 7.5-.9-4.6-2.6-6.4-7.5-7.5 4.9-1.1 6.6-2.9 7.5-7.5z"/><path class="w" d="M18.5 15.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5z"/></svg>',
 info:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
 back:'<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
 home2:'<svg viewBox="0 0 24 24"><path d="M4 11 12 4l8 7"/><path d="M6 10v9.5h12V10"/></svg>',
 refresh:'<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4.5V11h-6.5"/></svg>'
};
var DAYS='일월화수목금토', NAVER='https://buly.kr/6tf0VoO', GOAL={ichon:170};
var C,S;   // C: 연결 정보, S: 화면 상태

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function $(q){return document.querySelector(q)}
function kst(){ var d=new Date(Date.now()+9*3600e3); return {day:d.toISOString().slice(0,10), hm:d.toISOString().slice(11,16)} }
function addDays(ds,n){ var d=new Date(ds+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10) }
function wd(ds){ return new Date(ds+'T00:00:00Z').getUTCDay() }
function md(ds){ var p=String(ds).slice(5).split('-'); return (+p[0])+'/'+(+p[1]) }
function hm12(t){ if(!t) return ''; var h=+t.slice(0,2), m=t.slice(3,5); return (h<12?'오전 ':'오후 ')+(h>12?h-12:h)+':'+m }
function ago(t){ var m=Math.round((Date.now()-new Date(t))/60000); if(m<60) return Math.max(m,1)+'분 전'; if(m<1440) return Math.round(m/60)+'시간 전'; if(m<10080) return Math.round(m/1440)+'일 전'; return md(new Date(new Date(t).getTime()+9*3600e3).toISOString().slice(0,10)) }
function phone(t){ return esc(String(t||'').replace(/(\d{3})(\d{3,4})(\d{4})/,'$1-$2-$3')) }
function toast(t){ var e=$('#aToast'); e.textContent=t; e.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(function(){e.classList.remove('show')},2200) }
function rpc(n,a){ return C.sb.rpc(n,a||{}).then(function(r){ if(r.error) throw r.error; return r.data }) }
function tip(t){ return '<div class="tip">'+I.info+'<span>'+t+'</span></div>' }
function nb(n,big){ if(!(n>0)) return ''; var t=n>99?'99+':String(n);
 if(big){ var P='M50 9 L61 36.4 L90.4 38.6 L67.8 57.6 L75 86.6 L50 71 L25 86.6 L32.2 57.6 L9.6 38.6 L39 36.4 Z';
  return '<span class="nbstar'+(t.length>2?' w':t.length>1?' d':'')+'" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><radialGradient id="nbsg" cx="40%" cy="32%" r="75%"><stop offset="0" stop-color="#FFF6D6"/><stop offset=".55" stop-color="#EBCB7E"/><stop offset="1" stop-color="#B8975A"/></radialGradient></defs><path d="'+P+'" fill="#fff" stroke="#fff" stroke-width="12" stroke-linejoin="round"/><path d="'+P+'" fill="url(#nbsg)" stroke="url(#nbsg)" stroke-width="5" stroke-linejoin="round"/></svg><b>'+t+'</b></span>' }
 return '<span class="nb">'+t+'</span>' }

/* 반 이름 다듬기: 「3학년 하브루타 독서토론_장화연원장 (화4:30)」 → 「3학년 하브루타 독서토론」 */
function cname(n){ var s=String(n||'').replace(/\s*\([^)]*\)\s*$/,''); if(s.indexOf('_')>0) s=s.replace(/_[^_]*$/,''); s=s.trim(); if(/^(\d학년|\d세|[1-6]학년)$/.test(s)) s+=' 반'; return s||String(n||'') }
function who(c){ if(/원장/.test(c.name||'')) return '원장 직강'; return c.teacher?c.teacher+' 선생님':'' }
function when(c){ return c.weekday==null?'':DAYS[c.weekday]+'요일 '+hm12(c.starts) }
function stCls(s){ return s==='출석'?'ok':s==='지각'?'late':s==='결석'?'abs':'etc' }
function stTag(s){ return '<span class="tag '+({'출석':'ok','지각':'y','결석':'warn'}[s]||'g')+'">'+esc(s)+'</span>' }

/* ── 역할별 첫 화면 버튼 ── */
function tilesFor(role){ var T0=tilesFor0(role); if(specials().length&&role!=='teacher') T0=T0.concat([['special','방학 특강','지금 모집 중',I.star||I.cal]]); return T0 }
function tilesFor0(role){
 var T={
  parent:[['today','오늘 우리 아이','출결·다음 수업',I.home],['fb','수업 피드백','선생님이 보낸 수업 이야기',I.note],['asg','과제','선생님이 보낸 학습지',I.book],['notice','공지','학원 소식',I.bell],['time','시간표','수업 요일·예약',I.cal],
          ['req','보강·상담','결석 알림·상담 신청',I.chat],['att','출결 기록','달력으로 한눈에',I.check],['mine','내 정보','자녀 추가·로그아웃',I.me]],
  teacher:[['fb','수업 피드백','오늘 수업 보내기',I.send],['asg','학습지 과제','보내기·제출 확인',I.book],['tboard','내 반 출결','반별 학생·최근 출결',I.users],['mk','보강','보강 시간·출석 체크',I.cal],['sreq','받은 상담','학부모가 보낸 신청',I.chat],['notice','공지','학원 소식',I.bell]],
  desk:[['approve','가입 승인','학부모 가입 확인',I.check],['sreq','상담·요청','앱 요청·홈페이지 상담',I.chat],['mk','보강','보강권·보강 달력',I.cal],['wait','대기 명단','반별 대기',I.note],
        ['board','반별 정원','마감·모집',I.users],['notice','공지','올리기·보기',I.send]],
  manager:[['over','한눈에 현황','우리 지점',I.chart],['approve','가입 승인','학부모 가입 확인',I.check],['sreq','상담·요청','앱 요청·홈페이지 상담',I.chat],
           ['mk','보강','보강권·보강 달력',I.cal],['wait','대기 명단','반별 대기',I.note],['board','반별 정원','마감·모집',I.users],['notice','공지','올리기·보기',I.send]],
  admin:[['ops','운영 숫자','재원·위험·미납·빈자리',I.chart],['fbw','피드백 현황','이번 주 안 나간 반',I.check],['fb','수업 피드백','올리기·기록',I.send],['asg','학습지 과제','보내기·제출 확인',I.book],['over','한눈에 현황','지점별 비교',I.chart],['stat','숫자 기록','방문·가입·탈퇴',I.chart],['approve','가입 승인','학부모·직원 확인',I.check],['sreq','상담·요청','앱 요청·홈페이지 상담',I.chat],
         ['mk','보강','보강권·보강 달력',I.cal],['wait','대기 명단','반별 대기',I.note],
         ['me','반별·출석부','정원·자료 올리기',I.users],['notice','공지','올리기·보기',I.send],['set','직원·설정','초대·알림·테스터',I.gear]]
 };
 if(role==='parent'){ var acc=pAccess(); var pk=function(ks){ return T.parent.filter(function(t){return ks.indexOf(t[0])>=0}) }; if(acc==='paused') return pk(['notice','mine']); if(acc==='closed') return pk(['mine']) }
 return T[role]||[];
}
var LABEL={parent:'For Parents',teacher:'Teacher',desk:'Office',manager:'Branch',admin:'Director'};
var TITLE={ops:'운영 숫자',asg:'과제',special:'방학 특강',today:'오늘 우리 아이',notice:'공지',time:'시간표',req:'보강·상담',att:'출결 기록',mine:'내 정보',tboard:'내 반 출결',sreq:'상담·요청',
           approve:'가입 승인',board:'반별 정원',over:'한눈에 현황',me:'반별·출석부',set:'직원·설정',mk:'보강',wait:'대기 명단',stat:'숫자 기록',fb:'수업 피드백',fbw:'피드백 현황'};
function pAccess(){ var k=S.kids||[]; if(!k.length) return 'open'; if(k.some(function(x){return !x.access||x.access==='open'})) return 'open'; if(k.some(function(x){return x.access==='paused'})) return 'paused'; return 'closed' }

function badge(k){
 if(k==='notice') return (S.notices||[]).filter(function(n){return !n.read}).length+evUnseen();
 if(k==='sreq') return (S.sreq||[]).filter(function(r){return r.status==='접수'}).length+(C.role==='teacher'?0:sum('consults'));
 if(k==='approve') return sum('pending');
 if(k==='fb'&&C.role==='parent') return fbUnseen();
 if(k==='asg') return asgUnseen();
 if((k==='fb'&&C.role==='teacher')||k==='fbw') return fbMissing().length;
 if(k==='req') return (S.mk||[]).reduce(function(a,c){ return a+(c.tickets||[]).filter(function(t){return t.state==='발급'&&(t.slots||[]).length}).length },0);
 if(k==='mk'&&S.mb){ var td=kst().day; return (S.mb.slots||[]).reduce(function(a,z){ return a+(S.mb.staff&&z.status==='대기'?1:0)+((z.day<=td&&(S.mb.staff||z.mine))?(z.bookings||[]).filter(function(b){return b.status==='신청'}).length:0) },0) }
 return 0;
}
function sum(f){ return (S.over||[]).filter(function(b){return S.branch==='all'||b.id===S.branch}).reduce(function(a,b){return a+(+b[f]||0)},0) }

/* ── 첫 화면 ── */
function home(){
 var p=C.p, r=C.role, h='';
 var name=esc(p.teacher_name||p.nickname||'');
 var hi={parent:'안녕하세요, 학부모님',teacher:(name?name+' 선생님, ':'')+'오늘도 수고 많으십니다',desk:'오늘도 수고 많으십니다',manager:'지점장님, 오늘 현황입니다',admin:'원장님, 오늘 현황입니다'}[r];
 var un=badge('notice');
 h+='<div class="row" style="align-items:flex-start"><div><p class="hello">'+LABEL[r]+'</p><div class="hello-b">'+hi+'</div></div>'+
    (r==='parent'&&pAccess()==='closed'?'':'<button class="bell" data-go="notice" aria-label="공지 '+un+'건">'+I.bell+nb(un,true)+'</button>')+'</div>';
 h+='<div id="pushSlot"></div>'+(r==='parent'&&pAccess()!=='open'?accCard():summary());
 if(!C.pv&&C.real==='admin') h=h.replace('<div id="pushSlot"></div>','<div id="pushSlot"></div>'+pvCard());
 if(r==='teacher'||r==='admin'){ var fm=fbMissing(); if(fm.length) h+='<button class="card fbwarn" data-go="'+(r==='admin'?'fbw':'fb')+'"><b>⚠️ 피드백이 안 나간 수업 '+fm.length+'개</b><span>'+fm.slice(0,3).map(function(x){return esc(cname(x.class))+' '+md(x.day)}).join(' · ')+(fm.length>3?' 외':'')+'</span></button>' }
 h+='<div class="tiles"'+(r==='teacher'&&!C.pv?' id="tTiles" hidden':'')+'>'+tilesFor(r).map(function(t,i){ return '<button class="tile t'+i+'" data-go="'+t[0]+'">'+nb(badge(t[0]))+'<div class="ti">'+t[3]+'</div><div><b>'+t[1]+'</b><span class="s">'+t[2]+'</span></div></button>' }).join('')+'</div>';
 if(r!=='parent') h+='<div style="margin-top:18px">'+C.L.installBox()+'</div>';
 h+=foot(r!=='parent');
 return h;
}
function accCard(){
 if(pAccess()==='closed') return '<div class="card hl"><p class="sub">학부모 화면</p><h3 style="font-size:19px;margin:6px 0 4px">퇴원 처리되어 화면을 닫았습니다</h3><p class="sub">다시 등록하시면 이 화면이 바로 다시 열립니다.<br>문의 <a class="link" href="tel:027948123">02-794-8123</a></p></div>';
 return '<div class="card hl"><p class="sub">학부모 화면</p><h3 style="font-size:19px;margin:6px 0 4px">휴원 중입니다</h3><p class="sub">휴원 중에는 학원 공지만 볼 수 있습니다. 복귀하시면 출결·보강 화면이 다시 열립니다.<br>문의 <a class="link" href="tel:027948123">02-794-8123</a></p></div>';
}
function foot(withOut){
 return '<div class="foot">주니어솔로몬®(상표등록 제40-1582862호)<br>중부교육지원청 제3336호 · 서울 용산구 이촌로 200, LG프라자 4층'+
  (withOut?'<br><button type="button" id="logout">로그아웃</button>'+(C.role!=='admin'?'<button type="button" id="delacct">회원 탈퇴</button>':''):'')+'</div>';
}
function summary(){
 var r=C.role;
 if(r==='parent'){
  var kids=S.kids||[]; if(!kids.length) return '<div class="card hl"><p class="sub">우리 아이</p><h3 style="font-size:19px;margin:4px 0 0">수업 정보를 준비하고 있습니다</h3></div>';
  var k=kids[S.kid]||kids[0], st=kidState(k);
  return chips()+'<button class="card hl" data-go="today" style="display:block;width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer"><p class="sub">'+esc(k.name)+(k.grade?' · '+esc(k.grade):'')+(k.classes&&k.classes[0]?' · '+esc(cname(k.classes[0].name)):'')+'</p>'+
   '<h3 style="font-size:20px;margin:4px 0 2px">'+st.head+'</h3>'+(st.sub?'<p class="sub">'+st.sub+'</p>':'')+'</button>';
 }
 if(r==='teacher'){
  var w=(S.sreq||[]).filter(function(x){return x.status==='접수'}).length;
  return '<div class="card hl"><p class="sub">받은 상담 신청</p><h3 style="font-size:20px;margin:4px 0 0">'+(w?'새 신청 '+w+'건':'새 신청이 없습니다')+'</h3></div>';
 }
 // 원장·지점장·관리자
 var br=S.over||[], h='';
 if(r==='admin'&&br.length>1) h+='<div class="seg">'+['all'].concat(br.map(function(b){return b.id})).map(function(id){ var b=br.filter(function(x){return x.id===id})[0]; return '<button class="sm'+(S.branch===id?' on':'')+'" data-br="'+esc(id)+'">'+(id==='all'?'전체 지점':esc(b.name))+'</button>' }).join('')+'</div>';
 var stu=sum('students'), att=attRate(), pend=sum('pending'), open=(S.sreq||[]).filter(function(x){return x.status==='접수'}).length+sum('consults');
 if(r!=='desk'){
  var goal=S.branch==='all'?br.reduce(function(a,b){return a+(GOAL[b.id]||0)},0):(GOAL[S.branch]||0);
  h+='<div class="card hl"><p class="sub">재원생'+(S.branch==='all'?(br.length>1?' · 전체 '+br.length+'개 지점':''):' · '+esc((br.filter(function(b){return b.id===S.branch})[0]||{}).name))+(goal?' · 2027년 10월 목표 대비':'')+'</p>'+
     '<div class="row" style="margin-top:4px"><b class="big" style="font-size:30px">'+stu+'명</b>'+(goal?'<span class="sub">목표 '+goal+'명</span>':'')+'</div>'+(goal?'<div class="bar"><i style="width:'+Math.min(100,Math.round(stu/goal*100))+'%"></i></div>':'')+'</div>';
 }
 h+='<div class="grid2 k4">'+
   (r==='desk'?'<button class="kpi" data-go="board"><b>'+stu+'명</b><span>재원생</span></button>':'')+
   '<button class="kpi" data-go="'+(r==='desk'?'board':'over')+'"><b>'+(att==null?'—':att+'%')+'</b><span>이번 주 출석률</span></button>'+
   '<button class="kpi" data-go="approve"><b>'+pend+'건</b><span>가입 승인 대기</span></button>'+
   '<button class="kpi" data-go="sreq"><b>'+open+'건</b><span>처리 전 상담·요청</span></button>'+
   (r!=='desk'?'<button class="kpi" data-go="over"><b>'+sum('paused')+'명</b><span>휴원</span></button>':'')+'</div>';
 return h;
}
function attRate(){ var p=0,t=0; (S.over||[]).forEach(function(b){ if(S.branch!=='all'&&b.id!==S.branch) return; p+=(b.att_week&&b.att_week.present)||0; t+=(b.att_week&&b.att_week.total)||0 }); return t?Math.round(p/t*100):null }
function chips(){ var k=S.kids||[]; if(k.length<2) return ''; return '<div class="seg">'+k.map(function(x,i){return '<button class="sm'+(i===S.kid?' on':'')+'" data-kid="'+i+'">'+esc(x.name)+'</button>'}).join('')+'</div>' }

/* 아이의 오늘 상태 / 다음 수업 */
function nextClass(k){
 var cl=(k.classes||[]).filter(function(c){return c.weekday!=null}); if(!cl.length) return null;
 var t=kst();
 for(var i=0;i<8;i++){ var d=addDays(t.day,i), w=wd(d);
  var c=cl.filter(function(x){return x.weekday===w&&(i>0||x.starts>=t.hm)}).sort(function(a,b){return a.starts<b.starts?-1:1})[0];
  if(c) return {day:d,c:c,today:i===0} }
 return null;
}
function kidState(k){
 if(!k.linked) return {head:'원생 명부와 연결을 기다리고 있습니다',sub:'연결되면 출결과 수업이 여기에 나옵니다.'};
 if(k.access==='closed') return {head:'퇴원 처리된 원생입니다',sub:''};
 if(k.access==='paused') return {head:'휴원 중입니다',sub:'복귀하시면 출결·수업이 다시 보입니다.'};
 if(k.status&&k.status!=='재원') return {head:esc(k.status)+' 중입니다',sub:''};
 var t=kst(), todayAtt=(k.attendance||[]).filter(function(a){return a.day===t.day})[0];
 var n=nextClass(k);
 if(todayAtt) return {head:'오늘 수업 '+esc(todayAtt.status)+(todayAtt.status==='출석'?' ✓':''),sub:n&&!n.today?'다음 수업 · '+md(n.day)+'('+DAYS[wd(n.day)]+') '+hm12(n.c.starts):''};
 if(n&&n.today) return {head:'오늘 '+hm12(n.c.starts)+' 수업이 있습니다',sub:esc(cname(n.c.name))+(who(n.c)?' · '+esc(who(n.c)):'')};
 if(n) return {head:'다음 수업 · '+md(n.day)+'('+DAYS[wd(n.day)]+') '+hm12(n.c.starts),sub:esc(cname(n.c.name))+(who(n.c)?' · '+esc(who(n.c)):'')};
 return {head:'배정된 반을 준비하고 있습니다',sub:''};
}

/* ── 학부모 화면 ── */
function vToday(){
 var kids=S.kids||[]; if(!kids.length) return '<h2>오늘 우리 아이</h2><div class="card"><p class="sub">원장님 확인 뒤 자녀 정보가 열립니다.</p></div>';
 var k=kids[S.kid]||kids[0], st=kidState(k), h='<h2>오늘 우리 아이</h2>'+chips();
 h+='<div class="card hl"><p class="sub">'+esc(k.name)+(k.grade?' · '+esc(k.grade):'')+(k.school?' · '+esc(k.school):'')+(k.solomon_no?' · 원생번호 '+esc(k.solomon_no):'')+'</p><h3 style="font-size:19px;margin:6px 0 2px">'+st.head+'</h3>'+(st.sub?'<p class="sub">'+st.sub+'</p>':'')+'</div>';
 if(k.linked){
  var mon=kst().day.slice(0,7), a=(k.attendance||[]).filter(function(x){return x.day.slice(0,7)===mon});
  var c=function(s){return a.filter(function(x){return x.status===s}).length};
  h+='<button class="card" data-go="att" style="display:block;width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer"><div class="row"><h3 style="margin:0">이번 달 출결</h3><span class="sub">달력 보기 ›</span></div>'+
     '<div class="row" style="margin-top:10px;justify-content:flex-start;gap:8px;flex-wrap:wrap">'+(a.length?'<span class="tag ok">출석 '+c('출석')+'</span>'+(c('지각')?'<span class="tag y">지각 '+c('지각')+'</span>':'')+(c('결석')?'<span class="tag warn">결석 '+c('결석')+'</span>':'')+(a.length-c('출석')-c('지각')-c('결석')?'<span class="tag g">기타 '+(a.length-c('출석')-c('지각')-c('결석'))+'</span>':''):'<span class="sub">이번 달 기록이 아직 없습니다.</span>')+'</div></button>';
  h+='<div class="card"><h3>수업</h3><div class="list">'+((k.classes||[]).map(function(x){return '<div><span>'+esc(cname(x.name))+'<br><span class="sub">'+esc(who(x))+'</span></span><span class="sub">'+esc(when(x)||'시간 확인 중')+'</span></div>'}).join('')||'<div><span class="sub">배정된 반을 준비하고 있습니다.</span></div>')+'</div></div>';
 }
 var latest=(S.notices||[])[0];
 if(latest) h+='<button class="card" data-go="notice" style="display:block;width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer"><div class="row"><h3 style="margin:0">최근 공지</h3><span class="sub">전체 ›</span></div><p style="margin-top:8px">'+(latest.read?'':'<span class="ndot"></span>')+esc(latest.title)+'</p></button>';
 return h;
}
function vTime(){
 var kids=S.kids||[], h='<h2>시간표</h2>'+chips(), k=kids[S.kid]||kids[0];
 if(k&&k.linked){
  var cl=(k.classes||[]).slice().sort(function(a,b){return (a.weekday==null?9:a.weekday)-(b.weekday==null?9:b.weekday)||(a.starts<b.starts?-1:1)});
  h+='<div class="card"><h3>'+esc(k.name)+' · 하브루타 정규 수업</h3><div class="list">'+(cl.map(function(x){return '<div><span><b style="font-weight:600">'+esc(x.weekday==null?'요일 확인 중':DAYS[x.weekday]+'요일')+'</b> '+esc(hm12(x.starts))+'<br><span class="sub">'+esc(cname(x.name))+(who(x)?' · '+esc(who(x)):'')+'</span></span></div>'}).join('')||'<div><span class="sub">배정된 반을 준비하고 있습니다.</span></div>')+'</div></div>';
  var t=kst(), up=[]; for(var i=0;i<14&&up.length<4;i++){ var d=addDays(t.day,i); cl.forEach(function(x){ if(x.weekday===wd(d)&&(i>0||x.starts>=t.hm)) up.push({d:d,x:x}) }) }
  if(up.length) h+='<div class="card"><h3>다가오는 수업</h3><div class="list">'+up.slice(0,4).map(function(u){return '<div><span>'+md(u.d)+'('+DAYS[wd(u.d)]+') '+hm12(u.x.starts)+'<br><span class="sub">'+esc(cname(u.x.name))+'</span></span></div>'}).join('')+'</div></div>';
 }
 h+='<div class="card"><h3>문해력 집중 독서 · 자기주도 학습</h3><p class="sub" style="margin-bottom:12px">정규반 수강생은 월 교습비에 포함되며, 네이버 예약으로 시간을 정합니다.</p><a class="btn ghost" href="'+NAVER+'" target="_blank" rel="noopener">네이버 예약 열기</a></div>';
 return h+tip('공휴일은 휴강하고, 대체공휴일에는 수업합니다. 학원 휴무일은 공지로 알려 드립니다.');
}
function vAtt(){
 var kids=S.kids||[], k=kids[S.kid]||kids[0], h='<h2>출결 기록</h2>'+chips();
 if(!k||!k.linked) return h+'<div class="card"><p class="sub">원생 명부와 연결되면 출결이 나옵니다.</p></div>';
 var t=kst(), mon=S.mon||t.day.slice(0,7), A={}; (k.attendance||[]).forEach(function(a){ if(!A[a.day]) A[a.day]=a.status });
 var y=+mon.slice(0,4), m=+mon.slice(5,7), first=mon+'-01', days=new Date(Date.UTC(y,m,0)).getUTCDate(), lead=wd(first);
 var wds=(k.classes||[]).map(function(c){return c.weekday}).filter(function(x){return x!=null});
 var minMon=addDays(t.day,-118).slice(0,7), MK={}, mkl=[];
 (S.mk||[]).filter(function(c){return c.child_id===k.id}).forEach(function(c){ (c.tickets||[]).forEach(function(x){ if(x.booking&&x.booking.status!=='취소'){ MK[x.booking.day]=x.booking.status; mkl.push(x) } }) });
 var list=Object.keys(A).filter(function(d){return d.slice(0,7)===mon}).sort().reverse();
 var cnt=function(s){return list.filter(function(d){return A[d]===s}).length};
 h+='<div class="card hl"><p class="sub">'+esc(k.name)+' · '+y+'년 '+m+'월</p><div class="row" style="margin-top:4px"><b class="big" style="font-size:26px">'+(cnt('출석')+cnt('지각'))+'/'+list.length+'회 출석</b><span class="sub">지각 포함</span></div></div>';
 h+='<div class="card"><div class="row"><button class="sm" data-mon="'+addDays(first,-1).slice(0,7)+'"'+(mon<=minMon?' disabled':'')+'>‹ 이전 달</button><b style="font-family:\'Noto Serif KR\',serif">'+m+'월</b><button class="sm" data-mon="'+addDays(first,days).slice(0,7)+'"'+(mon>=t.day.slice(0,7)?' disabled':'')+'>다음 달 ›</button></div>';
 h+='<div class="cal">'+'일월화수목금토'.split('').map(function(d){return '<div class="h">'+d+'</div>'}).join('');
 for(var i=0;i<lead;i++) h+='<div class="d x">.</div>';
 for(var d=1;d<=days;d++){ var ds=mon+'-'+(d<10?'0':'')+d, s=A[ds], cls='d';
  if(s) cls+=' s-'+stCls(s); else if(MK[ds]) cls+=' s-mk'; else if(wds.indexOf(wd(ds))>=0&&ds>=t.day) cls+=' sch';
  if(ds===t.day) cls+=' today';
  h+='<div class="'+cls+'" title="'+esc(s||'')+'">'+d+(s?'<i></i>':'')+'</div>' }
 h+='</div><div class="legend"><span><i style="background:#3E8A62"></i>출석</span><span><i style="background:#C9A227"></i>지각</span><span><i style="background:#B9573A"></i>결석</span><span><i style="background:#9C94A0"></i>기타</span><span><i style="background:#8A5A97"></i>보강</span><span><i style="background:#fff;outline:1px dashed #CDBBD6"></i>수업 예정</span></div></div>';
 if(mkl.length) h+='<div class="card"><h3>보강</h3><div class="list">'+mkl.map(function(x){return '<div><span>'+md(x.booking.day)+'('+DAYS[wd(x.booking.day)]+') 보강<br><span class="sub">'+md(x.absent_day)+' 결석분 · '+esc(x.reason)+'</span></span><span class="tag '+(x.booking.status==='출석'?'ok':x.booking.status==='결석'?'warn':'')+'">'+(x.booking.status==='신청'?'예정':esc(x.booking.status))+'</span></div>'}).join('')+'</div></div>';
 if(list.length) h+='<div class="card"><div class="list">'+list.map(function(d){return '<div><span>'+md(d)+'('+DAYS[wd(d)]+')</span>'+stTag(A[d])+'</div>'}).join('')+'</div></div>';
 return h+tip('출결은 학원 출결 기록(메이크에듀)과 같습니다. 기록이 다르면 보강·상담에서 알려 주세요.');
}
function vReq(){
 var kids=(S.kids||[]), h='<h2>보강·상담</h2>';
 h+='<div class="card"><h3>보강 원칙 (학원 규약)</h3><div class="list">'+
   '<div><span>병결·학교 행사로 결석하면 담임 선생님과 상의해 보강할 수 있습니다.</span></div>'+
   '<div><span>여행·가족 행사 등 개인 사정 결석은 보강하지 않습니다.</span></div>'+
   '<div><span>보강은 그 달 안에 합니다. 월 중순이 지나 결석해 그 달 보강이 어려우면 다음 달까지 합니다.</span></div>'+
   '<div><span>법정 공휴일·학원 지정 휴무일은 보강하지 않습니다.</span></div>'+
   '<div><span>결석은 수업 시작 전에 알려 주세요.</span></div></div></div>';
 if(!kids.length) return h+'<div class="card"><p class="sub">원장님 확인 뒤 신청할 수 있습니다.</p></div>';
 h=h.replace('<h2>보강·상담</h2>','<h2>보강·상담</h2>'+mkParent());
 var k=S.rkind||'결석 알림';
 h+='<div class="card"><h3>보내기</h3><form id="fReq">'+
   (kids.length>1?'<label class="l">자녀</label><select name="child">'+kids.map(function(x,i){return '<option value="'+esc(x.id)+'"'+(i===S.kid?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select>':'<input type="hidden" name="child" value="'+esc(kids[0].id)+'">')+
   '<label class="l">무엇을 보낼까요?</label><div class="seg" style="margin:0">'+['결석 알림','보강 문의','상담 신청'].map(function(x){return '<button type="button" class="sm'+(x===k?' on':'')+'" data-rk="'+x+'">'+x+'</button>'}).join('')+'</div>'+
   '<input type="hidden" name="to" value="'+(k==='상담 신청'?'원장':'담임')+'"><p class="sub" style="margin:10px 0 0">'+(k==='상담 신청'?'원장님과 담임 선생님께 함께 갑니다.':'담임 선생님께 갑니다.')+'</p>'+
   '<label class="l">'+(k==='결석 알림'?'결석하는 날':'희망 날짜')+'</label><input name="day" type="date" min="'+kst().day+'">'+
   (k==='결석 알림'?'<label class="l">사유</label><select name="why"><option>병결</option><option>학교 행사</option><option>개인 사정</option><option>기타</option></select>':'<label class="l">편한 연락 방법</label><select name="method"><option>전화</option><option>카톡</option><option>방문</option></select>')+
   '<label class="l">내용</label><textarea name="memo" placeholder="'+(k==='결석 알림'?'선생님께 전할 말씀이 있으면 적어 주세요.':'궁금하신 점을 적어 주세요.')+'"></textarea>'+
   '<div style="margin-top:16px"><button class="btn">보내기</button></div></form></div>';
 var mine=S.myreq||[];
 h+='<div class="card"><h3>보낸 신청</h3>'+(mine.length?'<div class="list">'+mine.map(function(r){return '<div><span>'+esc(r.kind)+' · '+esc(r.child)+'<br><span class="sub">'+tName(r)+(r.day?' · '+md(r.day):'')+' · '+ago(r.created_at)+'</span></span>'+reqTag(r.status)+'</div>'}).join('')+'</div>':'<p class="sub">아직 보낸 신청이 없습니다.</p>')+'</div>';
 return h+tip('결석 알림·보강 문의는 담임 선생님께, 상담 신청은 원장님과 담임 선생님께 함께 갑니다. 병결·학교 행사 결석을 알려 주시면 담임 선생님 확인 뒤 보강권이 나오고, 위에서 보강 날짜를 고를 수 있습니다.');
}
function reqTag(s,staff){ return '<span class="tag '+(s==='완료'?'ok':s==='확인'?'':'y')+'">'+(s==='접수'?(staff?'새 신청':'보냄'):s==='확인'?'확인함':'완료')+'</span>' }
function tName(r){ return r.to==='담임'?(r.teacher==='원장'?'담임 원장님':'담임 '+esc(r.teacher||'')+' 선생님'):esc(r.to) }
function vMine(){
 var p=C.p, h='<h2>내 정보</h2>';
 h+='<div class="card"><div class="list"><div><span>보호자</span><span>'+esc(p.nickname||'')+'</span></div><div><span>연락처</span><span>'+phone(p.phone)+'</span></div></div></div>';
 h+='<div class="card"><h3>자녀</h3><div class="list" id="kidsList"><div><span class="sub">불러오는 중…</span></div></div>'+
    '<div style="margin-top:14px"><button class="btn ghost" type="button" id="editKids">자녀 추가 · 정보 고치기</button></div></div>';
 h+=sndCard()+C.L.installBox();
 h+='<div style="margin-top:14px"><button class="btn ghost" type="button" id="logout">로그아웃</button></div>'+
    '<p style="text-align:center;margin-top:14px"><button type="button" id="delacct" style="border:0;background:none;color:#8A7F8E;font-size:13px;text-decoration:underline;cursor:pointer;font-family:inherit">회원 탈퇴</button></p>';
 return h+tip('개인정보는 학원 수업 안내와 연락에만 씁니다. <a class="link" href="privacy.html">개인정보 처리방침</a>');
}

/* ── 보강 ── */
var GR=['4세','5세','6세','7세','초1','초2','초3','초4','초5','초6','중1','중2','중3','고1','고2','고3'];
function grLabel(a){ return a&&a.length?a.join('·'):'학년 무관' }
function dLabel(ds,t){ return md(ds)+'('+DAYS[wd(ds)]+')'+(t?' '+hm12(t):'') }
function mkSt(s){ return {'발급':['y','날짜 고르기'],'신청':['','신청함'],'완료':['ok','보강 완료'],'만료':['g','기한 지남']}[s]||['g',s] }
function mkParent(){
 var kids=S.mk||[], any=kids.some(function(k){return (k.tickets||[]).length}), h='<div class="card"><h3>보강권</h3>';
 if(!any) return h+'<p class="sub">발급된 보강권이 없습니다. 병결·학교 행사로 결석하시면 아래에서 「결석 알림」을 보내 주세요. 담임 선생님 확인 뒤 보강권이 나옵니다.</p></div>';
 kids.forEach(function(k){ (k.tickets||[]).forEach(function(t){ var st=mkSt(t.state);
   h+='<div class="mk"><div class="row"><b>'+esc(k.name)+' · '+md(t.absent_day)+' 결석분</b><span class="tag '+st[0]+'">'+st[1]+'</span></div><p class="sub">'+esc(t.reason)+' · '+(t.state==='완료'?'보강을 마쳤습니다':'보강 기한 '+md(t.expires)+'까지')+'</p>';
   if(t.booking) h+='<div class="mkb"><span>'+dLabel(t.booking.day,t.booking.starts)+'<br><span class="sub">'+esc(t.booking.teacher)+' 선생님 · '+t.booking.minutes+'분</span></span>'+(t.booking.status==='신청'?'<button class="sm" data-mkc="'+t.booking.id+'">취소</button>':'<span class="tag '+(t.booking.status==='출석'?'ok':'warn')+'">보강 '+esc(t.booking.status)+'</span>')+'</div>';
   else if(t.state==='발급') h+=(t.slots||[]).length?'<p class="l2">보강 날짜를 고르세요</p><div class="mkslots">'+t.slots.map(function(z){return '<button type="button" data-mkb="'+t.id+'|'+z.id+'"><b>'+md(z.day)+'('+DAYS[wd(z.day)]+') '+z.starts+'</b><span>'+esc(z.teacher)+' 선생님 · '+z.minutes+'분'+(z.memo?' · '+esc(z.memo):'')+'</span></button>'}).join('')+'</div>'
     :'<p class="sub" style="margin-top:8px">아직 열린 보강 시간이 없습니다. 열리면 여기에 나오고 알려 드립니다.</p>';
   h+='</div>' }) });
 return h+'</div>';
}
function slotRow(z){
 var st=z.status, b=z.bookings||[], full=b.length>=z.cap, td=kst().day, can=S.mb.staff||z.mine;
 var h='<div class="slot"><div class="row"><b>'+dLabel(z.day,z.starts)+' · '+z.minutes+'분</b><span class="tag '+(st==='열림'?(full?'warn':'ok'):st==='대기'?'y':'g')+'">'+(st==='열림'?(full?'정원 참':'열림 '+b.length+'/'+z.cap):st==='대기'?'원장님 확인 대기':'닫힘')+'</span></div>'+
  '<p class="sub">'+esc(z.teacher)+' 선생님 · '+esc(grLabel(z.grades))+(z.memo?' · '+esc(z.memo):'')+'</p>';
 if(b.length) h+='<div class="list">'+b.map(function(x){ return '<div><span>'+esc(x.name)+(x.grade?' ('+esc(x.grade)+')':'')+'<br><span class="sub">'+md(x.absent_day)+' 결석분 · '+esc(x.reason)+'</span></span>'+
   (x.status==='신청'?(z.day<=td&&can?'<span><button class="sm" data-mkm="'+x.id+'|출석">출석</button> <button class="sm" data-mkm="'+x.id+'|결석">결석</button></span>':'<span class="tag">신청</span>')
     :'<span class="tag '+(x.status==='출석'?'ok':'warn')+'">'+esc(x.status)+'</span>')+'</div>' }).join('')+'</div>';
 var bt=[]; if(S.mb.staff&&st==='대기') bt.push('<button class="sm on" data-mks="'+z.id+'|열림">열기</button>');
 if(st!=='닫힘'&&can&&z.day>=td) bt.push('<button class="sm" data-mks="'+z.id+'|닫힘">닫기</button>');
 return h+(bt.length?'<div class="row" style="justify-content:flex-start;gap:8px;margin-top:10px">'+bt.join('')+'</div>':'')+'</div>';
}
function vMk(){
 var b=S.mb, h='<h2>보강</h2>';
 if(!b) return h+'<div class="card"><p class="sub">불러오는 중…</p></div>';
 var staff=b.staff, td=kst().day, sl=b.slots||[];
 var pend=sl.filter(function(z){return z.status==='대기'&&z.day>=td}), up=sl.filter(function(z){return z.status==='열림'&&z.day>=td}),
     past=sl.filter(function(z){return z.day<td&&(z.bookings||[]).length});
 if(pend.length) h+='<div class="card hl"><h3>'+(staff?'열어 주세요 · 선생님이 올린 보강 시간':'원장님 확인을 기다리는 시간')+'</h3>'+pend.map(slotRow).join('')+'</div>';
 h+='<div class="card"><h3>열린 보강 시간</h3>'+(up.length?up.map(slotRow).join(''):'<p class="sub">열린 보강 시간이 없습니다.</p>')+'</div>';
 if(past.length) h+='<div class="card"><h3>지난 보강 · 출석 체크</h3>'+past.slice().reverse().map(slotRow).join('')+'</div>';
 h+='<div class="card"><h3>보강 시간 '+(staff?'열기':'올리기')+'</h3><form id="fSlot">'+(staff?'<label class="l">선생님</label><input name="teacher" maxlength="30" placeholder="예) 손수영 · 비우면 원장님">':'')+
  '<label class="l">날짜</label><input name="day" type="date" min="'+td+'" max="'+addDays(td,70)+'">'+
  '<div class="two"><div><label class="l">시작</label><input name="starts" type="time" value="16:00" step="600"></div><div><label class="l">수업 시간</label><select name="minutes"><option value="60">60분</option><option value="90" selected>90분</option><option value="120">120분</option></select></div></div>'+
  '<label class="l">학년 (안 고르면 학년 무관)</label><div class="chips">'+GR.map(function(g){return '<label><input type="checkbox" name="g" value="'+g+'"><span>'+g+'</span></label>'}).join('')+'</div>'+
  '<div class="two"><div><label class="l">정원</label><select name="cap">'+[1,2,3,4,5,6].map(function(n){return '<option'+(n===4?' selected':'')+'>'+n+'</option>'}).join('')+'</select></div><div><label class="l">교실·메모</label><input name="memo" maxlength="200"></div></div>'+
  '<div style="margin-top:16px"><button class="btn">'+(staff?'바로 열기':'올리기 · 원장님 확인 뒤 열림')+'</button></div></form></div>';
 h+='<div class="card"><h3>보강권 발급</h3><p class="sub">병결·학교 행사·학원 사정 결석만 보강합니다. 개인 사정 결석은 보강하지 않습니다(학원 규약). 보강 기한은 15일까지 결석이면 그 달 말일, 16일 이후 결석이면 다음 달 말일입니다.</p><form id="fTicket">'+
  '<label class="l">학생</label><select name="st"><option value="">고르세요</option>'+(b.students||[]).slice().sort(function(a,c){return a.name<c.name?-1:1}).map(function(x){return '<option value="'+esc(x.id)+'">'+esc(x.name)+(x.grade?' ('+esc(x.grade)+')':'')+'</option>'}).join('')+'</select>'+
  '<div class="two"><div><label class="l">결석한 날</label><input name="day" type="date" min="'+addDays(td,-62)+'" max="'+addDays(td,60)+'"></div><div><label class="l">사유</label><select name="why"><option>병결</option><option>학교 행사</option><option>학원 사정</option>'+(staff?'<option>기타 인정</option>':'')+'</select></div></div>'+
  '<label class="l">메모</label><input name="memo" maxlength="200">'+
  '<div style="margin-top:16px"><button class="btn ghost">발급하기</button></div></form>'+
  (staff?'<details class="more"><summary>학원 사정으로 한 반이 통째로 휴강했을 때</summary><form id="fClassOff"><label class="l">반</label><select name="cls"><option value="">고르세요</option>'+(b.classes||[]).map(function(c){return '<option value="'+esc(c.id)+'">'+esc(cname(c.name))+'</option>'}).join('')+'</select>'+
   '<label class="l">휴강한 날</label><input name="day" type="date" min="'+addDays(td,-62)+'" max="'+addDays(td,60)+'"><div style="margin-top:12px"><button class="btn ghost">그 반 재원생 모두에게 발급</button></div></form></details>':'')+'</div>';
 if(staff){ var tk=b.tickets||[], open=tk.filter(function(t){return t.state==='발급'||t.state==='신청'||t.state==='만료'});
  h+='<div class="card"><h3>쓰지 않은 보강권</h3>'+(open.length?'<div class="list">'+open.map(function(t){ var st=mkSt(t.state); return '<div><span>'+esc(t.name)+(t.grade?' ('+esc(t.grade)+')':'')+'<br><span class="sub">'+md(t.absent_day)+' 결석 · '+esc(t.reason)+' · 기한 '+md(t.expires)+'</span></span><span><span class="tag '+st[0]+'">'+(t.state==='발급'?'미신청':st[1])+'</span> <button class="sm" data-mkt="'+t.id+'">취소</button></span></div>' }).join('')+'</div>':'<p class="sub">쓰지 않은 보강권이 없습니다.</p>')+'</div>';
 }
 return h+tip('보강 출석은 보강이 끝난 날부터 이 화면에서 체크합니다. 메이크에듀 출석부에도 보강으로 적어 주세요.');
}

function sub2(f){
 var b=f.querySelector('button.btn'), job, ok;
 if(f.id==='fSlot'){ if(!f.day.value) return toast('날짜를 골라 주세요.'); if(!f.starts.value) return toast('시작 시간을 골라 주세요.');
   var g=[].slice.call(f.querySelectorAll('input[name=g]:checked')).map(function(x){return x.value});
   job=rpc('makeup_slot_add',{p_day:f.day.value,p_starts:f.starts.value,p_minutes:+f.minutes.value,p_grades:g,p_cap:+f.cap.value,p_memo:f.memo.value.trim(),p_teacher:f.teacher?f.teacher.value.trim():null});
   ok=S.mb&&S.mb.staff?'보강 시간을 열었습니다. 학부모 화면에 보입니다.':'올렸습니다. 원장님이 확인하면 열립니다.' }
 if(f.id==='fTicket'){ if(!f.st.value) return toast('학생을 골라 주세요.'); if(!f.day.value) return toast('결석한 날을 골라 주세요.');
   job=rpc('makeup_issue',{p_student:f.st.value,p_day:f.day.value,p_reason:f.why.value,p_class:null,p_memo:f.memo.value.trim(),p_request:null}); ok='보강권을 발급했습니다' }
 if(f.id==='fClassOff'){ if(!f.cls.value||!f.day.value) return toast('반과 날짜를 골라 주세요.'); if(!confirm('그 반 재원생 모두에게 보강권을 발급할까요?')) return;
   job=rpc('makeup_issue_class',{p_class:f.cls.value,p_day:f.day.value,p_memo:'학원 사정 휴강'}); ok='발급했습니다' }
 if(f.id==='fWait'){ if(!f.cls.value) return toast('반을 골라 주세요.'); if(!f.child.value.trim()) return toast('학생 이름을 적어 주세요.');
   job=rpc('waitlist_add',{p_class:f.cls.value,p_child:f.child.value.trim(),p_grade:f.grade.value.trim(),p_guardian:f.guardian.value.trim(),p_phone:f.phone.value.trim(),p_source:f.src.value,p_memo:f.memo.value.trim()}); ok='대기 명단에 넣었습니다' }
 b.disabled=true;
 job.then(function(r){ if(f.id==='fClassOff') ok=r+'명에게 '+ok; return f.id==='fWait'?rpc('waitlist_board').then(function(x){S.wl=x}):loadMb() })
  .then(function(){ render(); toast(ok) })
  .catch(function(er){ b.disabled=false; toast(er&&er.message?er.message.replace(/^.*?: /,''):'저장하지 못했습니다. 다시 눌러 주세요.') });
}

/* ── 대기 명단 (원장·지점장·관리자) ── */
function vWait(){
 var w=S.wl, h='<h2>대기 명단</h2>';
 if(!w) return h+'<div class="card"><p class="sub">불러오는 중…</p></div>';
 var cap=w.cap, it=w.items||[], act=it.filter(function(x){return x.status==='대기'||x.status==='연락함'}), done=it.filter(function(x){return x.status==='등록'||x.status==='취소'}), G={}, order=[];
 act.forEach(function(x){ var k=x.class_name||x.class_label; if(!G[k]){ G[k]=[]; order.push(k) } G[k].push(x) });
 h+=order.length?order.map(function(k){ var L=G[k]; return '<div class="card"><div class="row"><h3 style="margin:0">'+esc(cname(k))+'</h3><span class="tag '+(L.length>=cap?'warn':'')+'">대기 '+L.length+'/'+cap+'</span></div><div class="list">'+L.map(function(x,i){
   return '<div><span><b style="font-weight:600">'+(i+1)+'. '+esc(x.child)+'</b>'+(x.grade?' ('+esc(x.grade)+')':'')+'<br><span class="sub">'+esc(x.source)+' · '+ago(x.created_at)+(x.guardian?' · '+esc(x.guardian):'')+(x.phone?' · <a class="link" href="tel:'+esc(x.phone)+'">'+phone(x.phone)+'</a>':'')+(x.memo?'<br>'+esc(x.memo):'')+'</span></span>'+
    '<span class="wb">'+(x.status==='대기'?'<button class="sm" data-wls="'+x.id+'|연락함">연락함</button>':'<span class="tag">연락함</span>')+'<button class="sm on" data-wls="'+x.id+'|등록">등록</button><button class="sm" data-wls="'+x.id+'|취소">빼기</button></span></div>' }).join('')+'</div></div>' }).join('')
  :'<div class="card"><p class="sub">지금 대기 중인 학생이 없습니다.</p></div>';
 h+='<div class="card"><h3>대기 넣기</h3><p class="sub">반마다 '+cap+'명까지 받습니다. 다 차면 홈페이지에 「대기 마감」으로 바뀝니다.</p><form id="fWait">'+
  '<label class="l">반</label><select name="cls"><option value="">고르세요</option>'+(w.classes||[]).map(function(c){return '<option value="'+esc(c.id)+'">'+esc(cname(c.name))+(c.stage==='full'?' · 마감':'')+'</option>'}).join('')+'</select>'+
  '<div class="two"><div><label class="l">학생 이름</label><input name="child" maxlength="40"></div><div><label class="l">학년</label><input name="grade" maxlength="20" placeholder="예) 초3"></div></div>'+
  '<div class="two"><div><label class="l">보호자</label><input name="guardian" maxlength="40"></div><div><label class="l">연락처</label><input name="phone" inputmode="tel" placeholder="010-0000-0000"></div></div>'+
  '<div class="two"><div><label class="l">받은 곳</label><select name="src"><option>전화</option><option>카톡</option><option>방문</option><option>원장</option></select></div><div><label class="l">메모</label><input name="memo" maxlength="300"></div></div>'+
  '<div style="margin-top:16px"><button class="btn">대기 넣기</button></div></form></div>';
 if(done.length) h+='<details class="more card"><summary>최근 30일 등록·뺀 기록 '+done.length+'건</summary><div class="list">'+done.map(function(x){return '<div><span>'+esc(x.child)+' · '+esc(cname(x.class_name||x.class_label))+'<br><span class="sub">'+esc(x.source)+' · '+ago(x.created_at)+'</span></span><span class="tag '+(x.status==='등록'?'ok':'g')+'">'+(x.status==='등록'?'등록':'뺌')+'</span></div>'}).join('')+'</div></details>';
 return h+tip('홈페이지에서 「대기 신청」한 학부모는 자동으로 올라옵니다(학생 이름은 상담 때 확인). 연락처는 원장·관리자만 봅니다.');
}

/* ── 공지 (모두) ── */
function vNotice(){
 var staff=C.role==='admin'||C.role==='manager'||C.role==='desk', h='<h2>공지</h2>';
 if(staff){
  var br=S.over||[];
  h+='<div class="card"><h3>공지 올리기</h3><form id="fNotice">'+
   '<label class="l">받는 대상</label><select name="aud"><option value="parents">학부모</option><option value="staff">강사·직원</option><option value="all">모두</option></select>'+
   (C.role==='admin'&&br.length>1?'<label class="l">지점</label><select name="br"><option value="">전 지점</option>'+br.map(function(b){return '<option value="'+esc(b.id)+'">'+esc(b.name)+'</option>'}).join('')+'</select>':'')+
   '<label class="l">제목</label><input name="t" maxlength="80" required>'+
   '<label class="l">내용</label><textarea name="b" maxlength="3000" style="min-height:140px"></textarea>'+
   '<label class="chk2"><input type="checkbox" name="pin"> 맨 위에 고정</label>'+
   '<div style="margin-top:16px"><button class="btn">올리기</button></div></form></div>';
 }
 h+=evCards(); var L=S.notices||[];
 if(!L.length) return h+'<div class="card"><p class="sub">아직 공지가 없습니다.</p></div>'+sndCard();
 var AUD={parents:'학부모',staff:'강사·직원',all:'모두'};
 h+=L.map(function(n){ return '<div class="ncard'+(n.read?'':' new')+'"><div class="nt"><b>'+(n.read?'':'<span class="ndot"></span>')+(n.pinned?'📌 ':'')+esc(n.title)+'</b><span class="sub" style="flex:none">'+ago(n.created_at)+'</span></div>'+
   (n.body?'<div class="nb2">'+esc(n.body)+'</div>':'')+
   (staff?'<div class="row" style="margin-top:12px"><span class="sub">'+esc(AUD[n.audience]||'')+' · '+esc(n.branch)+' · '+esc(n.author||'')+'</span><button class="sm" data-delnotice="'+n.id+'">지우기</button></div>':'')+'</div>' }).join('');
 return h+sndCard();
}

/* ── 받은 상담·요청 (원장·지점장·관리자·강사) ── */
function vSreq(){
 var staff=C.role!=='teacher', f=S.rf||'open', L=(S.sreq||[]).filter(function(r){return f==='all'||r.status!=='완료'});
 var h='<h2>'+(staff?'상담·요청':'받은 상담')+'</h2><div class="seg">'+[['open','처리 전'],['all','전체']].map(function(x){return '<button class="sm'+(f===x[0]?' on':'')+'" data-rf="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
 h+=L.length?L.map(function(r){ return '<div class="card"><div class="row"><h3 style="margin:0">'+esc(r.kind)+' · '+esc(r.child)+'</h3>'+reqTag(r.status,true)+'</div>'+
   '<p class="sub" style="margin:4px 0 10px">'+tName(r)+' 앞 · '+ago(r.created_at)+(r.day?' · '+(r.kind==='결석 알림'?'결석일 ':'희망 ')+md(r.day):'')+(r.method?' · '+esc(r.method):'')+'</p>'+
   (r.memo?'<p style="font-size:15px;white-space:pre-wrap">'+esc(r.memo)+'</p>':'')+
   (staff&&r.phone?'<p class="sub" style="margin-top:8px">'+esc(r.parent||'학부모')+' · <a class="link" href="tel:'+esc(r.phone)+'">'+phone(r.phone)+'</a></p>':'')+
   (r.status==='완료'?'':'<div class="row" style="justify-content:flex-start;gap:8px;margin-top:14px;flex-wrap:wrap">'+(r.status==='접수'?'<button class="sm" data-rs="'+r.id+'|확인">확인했어요</button>':'')+
     (r.kind==='결석 알림'&&/^\[사유: (병결|학교 행사)\]/.test(r.memo||'')?'<button class="sm on" data-mki="'+r.id+'">보강권 발급</button>':'')+'<button class="sm'+(r.kind==='결석 알림'&&/^\[사유: (병결|학교 행사)\]/.test(r.memo||'')?'':' on')+'" data-rs="'+r.id+'|완료">처리 완료</button></div>')+'</div>' }).join('')
  :'<div class="card"><p class="sub">'+(f==='open'?'처리할 신청이 없습니다.':'최근 120일 동안 받은 신청이 없습니다.')+'</p></div>';
 if(!staff) h+=tip('학부모 연락처는 보이지 않습니다. 연락이 필요하면 관리자에게 요청해 주세요.');
 if(staff) h+='<div class="legacy" style="margin-top:26px"><div id="cons"></div></div>';
 return h;
}

/* ── 원장·지점장 현황 ── */
function vOver(){
 var br=S.over||[], h='<h2>한눈에 현황</h2>';
 if(!br.length) return h+'<div class="card"><p class="sub">자료를 불러오지 못했습니다.</p></div>';
 h+=br.map(function(b){ var a=b.att_week||{}, rate=a.total?Math.round(a.present/a.total*100):null;
  return '<div class="card"><div class="row"><h3 style="margin:0;font-family:\'Noto Serif KR\',serif;font-weight:600;font-size:19px">'+esc(b.name)+'</h3><span class="tag">반 '+b.classes+'개</span></div>'+
   '<div class="list" style="margin-top:8px"><div><span>재원생</span><b>'+b.students+'명</b></div><div><span>휴원</span><span>'+b.paused+'명</span></div>'+
   '<div><span>이번 주 출석률</span><span>'+(rate==null?'기록 없음':rate+'% ('+a.present+'/'+a.total+')')+'</span></div>'+
   '<div><span>가입 승인 대기</span><span>'+b.pending+'건</span></div><div><span>처리 전 앱 요청</span><span>'+b.requests+'건</span></div><div><span>처리 전 홈페이지 상담</span><span>'+b.consults+'건</span></div></div>'+
   (GOAL[b.id]?'<div class="bar"><i style="width:'+Math.min(100,Math.round(b.students/GOAL[b.id]*100))+'%"></i></div><p class="sub" style="margin-top:6px">2027년 10월 목표 '+GOAL[b.id]+'명 대비 '+Math.round(b.students/GOAL[b.id]*100)+'%</p>':'')+'</div>' }).join('');
 return h+tip(C.role==='admin'?'지점이 늘어나면 지점마다 한 장씩 나오고, 첫 화면에서 지점을 골라 볼 수 있습니다. 지점장 계정은 자기 지점만 봅니다.':'우리 지점 자료만 보입니다.');
}
function fbMissing(){ return ((S.fbw||{}).rows||[]).filter(function(x){return x.state==='안 나감'}) }
function loadFbw(off){ var m=new Date(Date.now()+9*3600e3); m.setUTCDate(m.getUTCDate()+7*(off||0)); var day=m.toISOString().slice(0,10);
 return rpc('feedback_week',{p_monday:day}).then(function(d){ if(!off) S.fbw=d||{rows:[]}; S.fbw2=d||{rows:[]} }).catch(function(){ if(!off) S.fbw=S.fbw||{rows:[]}; S.fbw2=S.fbw2||{rows:[]} }) }
function fbSeenAt(){ try{ return localStorage.getItem('js_fb_seen_'+C.p.id)||'' }catch(x){ return '' } }
function fbUnseen(){ var t=fbSeenAt(); return (S.myfb||[]).filter(function(x){return String(x.at)>t}).length }
function fbSeen(){ var L=S.myfb||[]; if(!L.length) return; var mx=L.reduce(function(a,x){return String(x.at)>a?String(x.at):a},''); try{ localStorage.setItem('js_fb_seen_'+C.p.id,mx) }catch(x){} }
function confirmSoft(el){ if(el.dataset.ok) return true; el.dataset.ok='1'; el.textContent='한 번 더 누르면 휴강으로 표시'; setTimeout(function(){ if(el){ delete el.dataset.ok; el.textContent='이 날 휴강으로 표시' } },4000); return false }
var WD=['일','월','화','수','목','금','토'];
function fbState(st){ var c={'완료':'ok','안 나감':'warn','휴강':'g','예정':'','도입 전':'g'}[st]; return '<span class="tag '+(c||'')+'">'+(st==='완료'?'보냄':st)+'</span>' }
function fbBody(t){ return esc(t||'').replace(/\n/g,'<br>') }
function vFb(){
 var h='<h2>수업 피드백</h2>';
 if(C.role==='parent'){
  var L=S.myfb||[], seen=fbSeenAt();
  if(!L.length) return h+'<div class="card"><p class="sub">아직 도착한 피드백이 없습니다. 선생님이 수업을 마치고 그날의 이야기를 보내 드리면 여기에 쌓입니다.</p></div>';
  return h+L.map(function(x){ return '<div class="card fb'+(String(x.at)>seen?' new':'')+'"><div class="row"><p class="sub" style="margin:0">'+md(x.day)+' · '+esc(x.child)+'</p>'+(String(x.at)>seen?'<span class="tag y">새 피드백</span>':'')+'</div>'+
    '<h3 style="margin:6px 0 10px">'+esc(cname(x['class']))+'</h3><p class="fbt">'+fbBody(x.body)+'</p><p class="sub" style="margin:12px 0 0">'+esc(x.teacher||'')+' 선생님'+(x.edited?' · 고쳐 씀':'')+'</p></div>' }).join('')+
   tip('피드백은 수업이 끝난 뒤 담임 선생님이 반 전체에 보내 드립니다. 지난 피드백도 여기에 계속 남아 있습니다.');
 }
 var W=S.fbw||{rows:[]}, R=W.rows||[];
 if(!S.fbw) return h+'<div class="card"><p class="sub">불러오는 중…</p></div>';
 var miss=R.filter(function(x){return x.state==='안 나감'}), td=kst().day;
 var pick=miss[0]||R.filter(function(x){return x.day===td})[0]||R.filter(function(x){return x.state==='예정'})[0]||R[0];
 if(miss.length) h+='<div class="card fbwarn" style="cursor:default"><b>⚠️ 아직 안 나간 피드백 '+miss.length+'개</b><span>'+miss.map(function(x){return esc(cname(x['class']))+' '+md(x.day)}).join(' · ')+'</span></div>';
 h+='<div class="card"><h3>오늘 수업 피드백 보내기</h3>'+(R.length?'<form id="fFb">'+
  '<label class="l">반</label><select name="cls" id="fbClass">'+R.map(function(x){ return '<option value="'+esc(x.class_id)+'" data-day="'+esc(x.day)+'"'+(pick&&x.class_id===pick.class_id?' selected':'')+'>'+WD[x.weekday]+' '+esc(String(x.starts||'').slice(0,5))+' · '+esc(cname(x['class']))+(C.role==='admin'&&x.teacher?' ('+esc(x.teacher)+')':'')+' — '+(x.state==='완료'?'보냄':x.state)+'</option>' }).join('')+'</select>'+
  '<label class="l">수업 날짜</label><input type="date" name="day" id="fbDay" value="'+esc(pick?pick.day:td)+'" max="'+td+'">'+
  '<label class="l">오늘 수업 이야기</label><textarea name="body" rows="7" placeholder="오늘 읽은 책, 함께 나눈 질문, 아이들이 쓴 글, 가정에서 이어 물어보면 좋을 질문을 적어 주세요."></textarea>'+
  '<p class="sub" style="margin:8px 0 0">보내면 이 반 학부모님께 한 번에 알림이 갑니다. 원장님 기록에도 함께 쌓입니다.</p>'+
  '<div class="two" style="margin-top:14px"><button class="btn">피드백 보내기</button><button type="button" class="btn ghost" data-fbskip="1">이 날 휴강으로 표시</button></div></form>':'<p class="sub">이번 주 맡은 정규반이 없습니다.</p>')+'</div>';
 if(R.length) h+='<div class="card"><h3>이번 주 '+(C.role==='admin'?'전체 반':'내 반')+'</h3><div class="list">'+R.map(function(x){ return '<div><span>'+WD[x.weekday]+' '+md(x.day)+' · '+esc(cname(x['class']))+'</span>'+fbState(x.state)+'</div>' }).join('')+'</div></div>';
 var G=S.fblog||[];
 h+='<div class="card"><h3>보낸 피드백</h3>'+(G.length?G.filter(function(x){return x.kind==='피드백'}).slice(0,30).map(function(x){ return '<div class="fbi"><p class="sub" style="margin:0">'+md(x.day)+' · '+esc(cname(x['class']))+' · '+esc(x.author||'')+' · 학부모 '+(x.sent||0)+'분</p><p class="fbt">'+fbBody(x.body)+'</p></div>' }).join(''):'<p class="sub">아직 보낸 피드백이 없습니다.</p>')+'</div>';
 return h;
}
function vFbw(){
 var W=S.fbw2||S.fbw, off=S.fbwk||0, h='<h2>피드백 현황</h2>';
 if(!W) return h+'<div class="card"><p class="sub">불러오는 중…</p></div>';
 var R=W.rows||[], c={'완료':0,'안 나감':0,'예정':0,'휴강':0}; R.forEach(function(x){ c[x.state]=(c[x.state]||0)+1 });
 var mon=W.monday, sun=new Date(mon+'T00:00:00Z'); sun.setUTCDate(sun.getUTCDate()+6);
 h+='<div class="seg" style="margin:0 0 12px"><button class="sm" data-fbwk="-1">‹ 지난주</button><button class="sm'+(off===0?' on':'')+'" data-fbwk="0">이번 주</button><button class="sm" data-fbwk="1">다음 주 ›</button></div>';
 h+='<p class="sub" style="margin:-4px 0 12px">'+md(mon)+'(월) – '+md(sun.toISOString().slice(0,10))+'(일) · 정규반 '+R.length+'개</p>';
 h+='<div class="grid2 k4"><div class="kpi"><b style="color:var(--warn)">'+c['안 나감']+'</b><span>안 나감</span></div><div class="kpi"><b>'+c['완료']+'</b><span>보냄</span></div><div class="kpi"><b>'+c['예정']+'</b><span>수업 전</span></div><div class="kpi"><b>'+c['휴강']+'</b><span>휴강</span></div></div>';
 var miss=R.filter(function(x){return x.state==='안 나감'});
 if(miss.length){ var T={}; miss.forEach(function(x){ var k=x.teacher||'담당 미정'; (T[k]=T[k]||[]).push(x) });
  h+='<div class="card fbwarn" style="cursor:default"><b>⚠️ 피드백이 안 나간 반 '+miss.length+'개</b><div class="list" style="margin-top:8px">'+Object.keys(T).map(function(k){ return '<div><span><b>'+esc(k)+' 선생님</b><br><span class="sub">'+T[k].map(function(x){return WD[x.weekday]+' '+md(x.day)+' '+esc(cname(x['class']))}).join('<br>')+'</span></span><span class="tag warn">'+T[k].length+'</span></div>' }).join('')+'</div></div>' }
 else if(R.length&&c['예정']<R.length) h+='<div class="card hl"><p class="sub">이번 주</p><h3 style="margin:4px 0 0">빠진 피드백이 없습니다</h3></div>';
 [1,2,3,4,5,6,0].forEach(function(wd){ var D=R.filter(function(x){return x.weekday===wd}); if(!D.length) return;
  h+='<div class="card"><h3>'+WD[wd]+'요일 · '+md(D[0].day)+'</h3><div class="list">'+D.map(function(x){ return '<div><span>'+esc(String(x.starts||'').slice(0,5))+' '+esc(cname(x['class']))+'<br><span class="sub">'+esc(x.teacher||'')+' · 재원 '+x.n+'명'+(x.at?' · '+ago(x.at)+' 보냄 · 학부모 '+(x.sent||0)+'분':'')+'</span></span>'+fbState(x.state)+'</div>' }).join('')+'</div></div>' });
 return h+tip('수업이 끝나고 2시간이 지나도 피드백이 없으면 「안 나감」으로 바뀝니다. 매일 밤 안 나간 반의 담당 선생님께 경고 알림이 갑니다. 1:1 수업처럼 요일이 정해지지 않은 반은 이 표에 나오지 않습니다.');
}
function vOps(){
 var h='<h2>운영 숫자</h2>', d=S.ops;
 if(!d) return h+'<div class="card"><p class="sub">불러오는 중입니다.</p></div>';
 function n(v){ return (v||0).toLocaleString('ko-KR') }
 function won(v){ v=v||0; return v>=10000?Math.round(v/10000).toLocaleString('ko-KR')+'만':n(v) }
 function man(v){ v=v||0; return (Math.round(v/1000)/10).toLocaleString('ko-KR') }
 var g=d.growth||{}, r=d.risk||[], p=d.pay||{}, c=d.consult||{}, se=d.seats||{}, w=d.wait||{}, T=d.teachers||[], re=d.reach||{};
 var W=['일','월','화','수','목','금','토'];
 var gap=Math.max(0,(g.target||170)-(g.students||0)), pct=Math.min(100,Math.round((g.students||0)/(g.target||170)*100));
 h+='<p class="sub" style="margin:-6px 0 12px">'+esc(String(d.today||'').slice(5).replace('-','/'))+' 기준 · 메이크에듀 자료가 들어오는 대로 바뀝니다</p>';
 // 1 재원 순증
 h+='<div class="card hl"><p class="sub">재원생 · 목표 '+n(g.target)+'명</p><div class="row" style="margin-top:4px"><b class="big" style="font-size:30px">'+n(g.students)+'명</b><span class="sub">'+(gap?n(gap)+'명 남음':'목표 달성')+' · 휴원 '+n(g.paused)+'명</span></div>'+
  '<div class="bar"><i style="width:'+pct+'%"></i></div>'+
  '<div class="list" style="margin-top:10px"><div><span>이번 주 신규 등록</span><b>'+n(g.join_week)+'명</b></div><div><span>이번 달 신규 등록 / 퇴원</span><span>'+n(g.join_month)+' / '+n(g.left_month)+'명</span></div>'+
  '<div><span>이번 달 순증</span><b>'+((g.join_month||0)-(g.left_month||0)>=0?'+':'')+n((g.join_month||0)-(g.left_month||0))+'명</b></div></div>'+
  (g.last_left_on&&g.last_left_on<String(d.today).slice(0,8)+'01'?'<p class="sub" style="margin-top:8px">메이크에듀에 기록된 마지막 퇴원일이 '+esc(String(g.last_left_on).slice(5).replace('-','/'))+'입니다. 그 뒤 퇴원생을 메이크에듀에서 퇴원 처리해야 이 숫자가 맞습니다.</p>':'')+'</div>';
 // 2 퇴원 위험
 h+='<div class="card'+(r.length?' fbwarn':'')+'"><h3>퇴원 위험 '+n(r.length)+'명</h3>'+(r.length?'<div class="list">'+r.map(function(x){
   return '<div style="display:block"><b>'+esc(x.name)+'</b> <span class="sub">'+esc(x.grade||'')+' · '+esc(x.teacher||'')+'</span><br><span class="sub">'+esc(x.why)+'</span></div>' }).join('')+'</div>'
   :'<p class="sub">연속 결석·장기 미출석 학생이 없습니다.</p>')+'<p class="sub" style="margin-top:8px">기준: 최근 2회 연속 결석 · 30일 결석 3회 이상 · 3주째 출석 기록 없음 · 보강권 2주 넘게 안 씀. 미납이 겹치면 위로 올립니다. 담임 확인 후 학부모 통화를 권합니다.</p></div>';
 // 미납
 var M=p.months||[], U=p.unpaid||[], m0=M[0]||{};
 h+='<div class="card"><h3>수납 · 미납</h3>'+(M.length?
   '<div class="grid2 k4" style="margin:6px 0 10px"><div class="kpi"><b>'+won(m0.billed)+'</b><span>'+esc(String(m0.month||'').slice(5))+'월 청구(원)</span></div><div class="kpi"><b>'+won(m0.paid)+'</b><span>받은 금액(원)</span></div><div class="kpi"><b>'+won(m0.unpaid)+'</b><span>미납(원) · '+n(m0.unpaid_n)+'명</span></div><div class="kpi"><b>'+(m0.billed?Math.round(m0.paid/m0.billed*100):0)+'%</b><span>수납률</span></div></div>'+
   '<div class="stt"><table><thead><tr><th>달</th><th>인원</th><th>청구</th><th>받음</th><th>미납</th></tr></thead><tbody>'+M.map(function(x){return '<tr><td>'+esc(x.month.slice(5))+'월</td><td>'+n(x.n)+'</td><td>'+man(x.billed)+'</td><td>'+man(x.paid)+'</td><td>'+man(x.unpaid)+(x.unpaid_n?'<br><small>'+x.unpaid_n+'명</small>':'')+'</td></tr>'}).join('')+'</tbody></table></div><p class="sub" style="margin-top:4px">표 금액 단위: 만 원</p>'+
   (U.length?'<h3 style="margin-top:14px">미납 명단 '+n(U.length)+'명 · '+won(U.reduce(function(a,x){return a+(x.total||0)},0))+'원</h3><div class="list">'+U.map(function(x){
     return '<div><span><b>'+esc(x.name)+'</b> <span class="sub">'+esc(x.grade||'')+' · '+esc(x.months)+(x.status&&x.status!=='재원'?' · <span class="tag warn">'+esc(x.status)+'</span>':'')+'</span></span><b>'+n(x.total)+'원</b></div>' }).join('')+'</div>':'')+
   '<p class="sub" style="margin-top:8px">메이크에듀 「월별 수납 내역」 엑셀을 올린 만큼 반영됩니다 (마지막 반영 '+esc(String(p.loaded||'').slice(5,10).replace('-','/'))+').</p>'
   :'<p class="sub">아직 수납 내역이 들어오지 않았습니다.</p>')+'</div>';
 // 3 상담
 h+='<div class="card"><h3>상담 → 등록</h3><div class="list"><div><span>이번 달 홈페이지 상담 신청</span><b>'+n(c.month)+'건</b></div><div><span>이번 달 신규 등록</span><span>'+n(c.join_month)+'명</span></div>'+
  '<div><span>아직 연락 안 한 상담</span>'+(c.open?'<b style="color:#b3261e">'+n(c.open)+'건'+(c.open_old?' (하루 넘김 '+n(c.open_old)+')':'')+'</b>':'<span>0건</span>')+'</div><div><span>앱 상담 신청 접수 대기</span><span>'+n(c.app_open)+'건</span></div></div>'+
  '<p class="sub" style="margin-top:8px">신규 등록 대부분은 전화·카톡·방문으로 들어옵니다. 홈페이지 신청 숫자만으로 홍보 효과를 판단하지 마세요.</p></div>';
 // 4 빈자리 · 대기
 var S2=(se.rows||[]);
 h+='<div class="card"><h3>반별 빈자리 '+n(se.empty_total)+'석 <span class="sub">/ 정원 '+n(se.cap_total)+'석</span></h3>'+(S2.length?'<div class="list">'+S2.map(function(x){
   return '<div><span>'+esc(x.class)+' <span class="sub">'+W[x.weekday]+' '+esc(String(x.starts||'').slice(0,5))+'</span></span><span>'+n(x.n)+'/'+n(x.cap)+(x.wait?' · <span class="tag warn">대기 '+x.wait+'</span>':'')+'</span></div>'}).join('')+'</div>':'')+
  '<p class="sub" style="margin-top:8px">정원은 메이크에듀에 적힌 값입니다. 실제 정원과 다르면 메이크에듀에서 고쳐 주세요.</p></div>';
 var WR=w.rows||[];
 h+='<div class="card"><h3>대기 '+n(w.open)+'명'+(w.old?' · <span class="tag warn">2주 넘음 '+n(w.old)+'</span>':'')+'</h3>'+(WR.length?'<div class="list">'+WR.map(function(x){
   return '<div><span><b>'+esc(x.name)+'</b> <span class="sub">'+esc(x.grade||'')+' · '+esc(x.class||'')+'</span></span><span>'+n(x.days)+'일째</span></div>'}).join('')+'</div>':'<p class="sub">대기 학생이 없습니다.</p>')+'</div>';
 // 5 강사별
 h+='<div class="card"><h3>강사별</h3><div class="stt"><table><thead><tr><th>강사</th><th>반</th><th>재원생</th><th>피드백<br><small>11/23부터</small></th></tr></thead><tbody>'+T.map(function(x){
   return '<tr><td>'+esc(x.teacher)+'</td><td>'+n(x.classes)+'</td><td>'+n(x.students)+'</td><td>'+(x.fb_due?n(x.fb_done)+'/'+n(x.fb_due)+' ('+Math.round(x.fb_done/x.fb_due*100)+'%)':'—')+'</td></tr>'}).join('')+'</tbody></table></div></div>';
 // 앱 도달
 var lr=re.students?Math.round((re.linked||0)/re.students*100):0;
 h+='<div class="card'+(lr<50?' fbwarn':'')+'"><h3>앱이 닿는 학부모</h3><div class="list"><div><span>재원생 중 학부모가 앱에 연결된 학생</span><b>'+n(re.linked)+' / '+n(re.students)+'명 ('+lr+'%)</b></div>'+
  '<div><span>알림을 켠 학부모</span><span>'+n(re.push_parents)+'명</span></div><div><span>알림을 켠 강사</span><span>'+n(re.push_teachers)+' / '+n(re.teachers)+'명</span></div>'+(re.teacher_alerts||[]).map(function(x){return '<div><span>· '+esc(x.name||'')+' 선생님</span>'+(x.push&&x.mode?'<span class="tag ok">'+esc(x.mode)+'</span>':'<span class="tag warn">미설정</span>')+'</div>'}).join('')+'</div>'+
  (lr<50?'<p class="sub" style="margin-top:8px">수업 피드백·공지는 앱에 연결된 학부모에게만 닿습니다. 재원생 학부모 가입 안내를 먼저 보내 주세요.</p>':'')+'</div>';
 var CP=d.captures||[], RL={parent:'학부모',teacher:'강사',desk:'관리자',manager:'지점장'};
 h+='<div class="card'+(CP.length?' fbwarn':'')+'" style="cursor:default"><h3>학습지 캡처 시도 (최근 7일)</h3>'+(CP.length?'<div class="list">'+CP.map(function(x){
   return '<div><span><b>'+esc(x.who)+'</b> <span class="sub">'+esc(RL[x.role]||'')+' · '+x.n+'회 · 마지막 '+esc(md(String(x.last).slice(0,10)))+'</span><br><span class="sub">'+esc(x.what||'')+'</span></span>'+(x.blocked?'<button type="button" class="sm" data-cunb="'+esc(x.user)+'">🔒 잠금 풀기</button>':'')+'</div>' }).join('')+'</div>'
   :'<p class="sub">캡처·인쇄·저장 시도가 없습니다.</p>')+'<p class="sub" style="margin-top:8px">컴퓨터의 캡처 키·단축키, 인쇄, 길게 누르기(오른쪽 클릭)를 기록합니다. 7일 안에 3번이면 학습지가 잠기고 원장님께 알림이 갑니다. 휴대폰 화면 캡처는 정식 앱부터 잡힙니다.</p></div>';
 return h;
}
function vStat(){
 var h='<h2>숫자 기록</h2>', d=S.st;
 if(!d) return h+'<div class="card"><p class="sub">불러오는 중입니다.</p></div>';
 var D=d.days||[], t=d.totals||{}, z=D[0]||{};
 function n(v){ return (v||0).toLocaleString('ko-KR') }
 function sum(k,m){ return D.slice(0,m).reduce(function(a,x){return a+(x[k]||0)},0) }
 function wk(k){ return n(sum(k,7)) }
 h+='<p class="sub" style="margin:-6px 0 12px">오늘 '+esc(String(z.day||'').slice(5).replace('-','/'))+' 기준 · 매일 자정에 새 줄이 생깁니다</p>';
 h+='<div class="grid2 k4">'+
  '<div class="kpi"><b>'+n(z.visitors)+'명</b><span>오늘 홈페이지 방문</span></div>'+
  '<div class="kpi"><b>'+n((z.join_parent||0)+(z.join_staff||0))+'명</b><span>오늘 가입</span></div>'+
  '<div class="kpi"><b>'+n((z.out_enrolled||0)+(z.out_other||0))+'명</b><span>오늘 탈퇴</span></div>'+
  '<div class="kpi"><b>'+n((z.consult||0)+(z.wait||0))+'건</b><span>오늘 상담·대기 신청</span></div></div>';
 var rate=t.students?Math.round((t.students_linked||0)/t.students*100):0;
 h+='<div class="card hl"><p class="sub">재원생 학부모 앱 가입</p><div class="row" style="margin-top:4px"><b class="big" style="font-size:30px">'+n(t.students_linked)+'명</b><span class="sub">재원생 '+n(t.students)+'명 중 '+rate+'%</span></div>'+
  '<div class="bar"><i style="width:'+Math.min(100,rate)+'%"></i></div></div>';
 h+='<div class="card"><h3>지금 회원</h3><div class="list">'+
  '<div><span>승인된 학부모</span><b>'+n(t.parents)+'명</b></div>'+
  '<div><span>· 재원생 학부모</span><span>'+n(t.parents_enrolled)+'명</span></div>'+
  '<div><span>· 비재원 학부모</span><span>'+n((t.parents||0)-(t.parents_enrolled||0))+'명</span></div>'+
  '<div><span>강사</span><span>'+n(t.teachers)+'명</span></div>'+
  '<div><span>승인 대기</span><span>'+n(t.pending)+'명</span></div>'+
  '<div><span>지금까지 탈퇴</span><span>'+n(t.out_total)+'명</span></div></div></div>';
 h+='<div class="card"><h3>최근 7일 합계</h3><div class="list">'+
  '<div><span>홈페이지 방문(하루 첫 방문 기준)</span><b>'+wk('visitors')+'명</b></div>'+
  '<div><span>홈페이지 페이지 열람</span><span>'+wk('views')+'회</span></div>'+
  '<div><span>앱 연 기기 (날마다 센 합)</span><span>'+wk('app')+'대</span></div>'+
  '<div><span>학부모 가입</span><span>'+wk('join_parent')+'명</span></div>'+
  '<div><span>승인 · 재원 / 비재원</span><span>'+wk('ok_enrolled')+' / '+wk('ok_other')+'명</span></div>'+
  '<div><span>탈퇴 · 재원 / 비재원</span><span>'+wk('out_enrolled')+' / '+wk('out_other')+'명</span></div>'+
  '<div><span>홈페이지 상담 / 대기 신청</span><span>'+wk('consult')+' / '+wk('wait')+'건</span></div>'+
  '<div><span>베타 테스터 신청</span><span>'+wk('beta')+'명</span></div></div></div>';
 var W=['일','월','화','수','목','금','토'];
 h+='<div class="card"><h3>날짜별 (최근 14일)</h3><div class="stt"><table><thead><tr><th>날짜</th><th>방문</th><th>열람</th><th>앱</th><th>가입</th><th>승인<br><small>재원/비재원</small></th><th>탈퇴<br><small>재원/비재원</small></th><th>상담</th><th>대기</th></tr></thead><tbody>'+
  D.map(function(x){
   return '<tr><td>'+esc(x.day.slice(5).replace('-','/'))+' '+W[new Date(x.day+'T12:00:00Z').getUTCDay()]+'</td><td>'+n(x.visitors)+'</td><td>'+n(x.views)+'</td><td>'+n(x.app)+'</td><td>'+n((x.join_parent||0)+(x.join_staff||0))+'</td><td>'+n(x.ok_enrolled)+'/'+n(x.ok_other)+'</td><td>'+n(x.out_enrolled)+'/'+n(x.out_other)+'</td><td>'+n(x.consult)+'</td><td>'+n(x.wait)+'</td></tr>' }).join('')+
  '</tbody></table></div></div>';
 var P=t.pages||[], NM={index:'첫 화면',consult:'반·상담',fees:'교습비',programs:'프로그램',special:'방학 특강',member:'앱·회원',beta:'베타 신청',privacy:'개인정보',
   'account-delete':'회원 탈퇴'};
 if(P.length) h+='<div class="card"><h3>많이 본 페이지 (14일)</h3><div class="list">'+P.map(function(x){return '<div><span>'+esc(NM[x.page]||x.page)+'</span><span>'+n(x.views)+'회</span></div>'}).join('')+'</div></div>';
 return h+tip('홈페이지 방문은 기기 정보 없이 하루 합계만 셉니다. 같은 기기는 하루 한 번만 방문자로 셉니다. 홈페이지 방문 기록은 2026년 11월 20일부터 쌓입니다.');
}
function vSet(){
 return '<h2>직원·설정</h2><div class="card"><h3>초대 링크</h3><p class="sub" style="margin-bottom:12px">링크를 받은 사람이 카카오로 가입하면 원장님 승인 뒤 화면이 열립니다.</p>'+
  '<button class="btn ghost" id="tinv" type="button">강사 초대 링크 만들기</button><div id="tinvm"></div>'+
  '<div style="height:10px"></div><button class="btn ghost" id="dinv" type="button">관리자(데스크) 초대 링크 만들기</button><div id="dinvm"></div></div>'+
  '<div class="card"><h3>알림</h3><button class="btn ghost" id="kak" type="button">카톡 알림 연결 (승인·상담 알림)</button><div id="kakm"></div></div>'+
  '<div class="card"><h3>미리보기</h3><button class="btn ghost" id="pv" type="button">학부모 가입 화면 미리보기</button></div>'+
  '<div class="legacy"><div id="beta"></div><div id="usage"></div></div>';
}

/* ── 알림음 (앱이 열려 있을 때) ── */
var SND={solomon:'솔로몬',crown:'왕관 팡파르',xylo:'실로폰 계단',orgel:'오르골 별',kalimba:'칼림바',bubble:'물방울',ding:'띵동'}, AC=null;
function sndPref(){ try{ var v=JSON.parse(localStorage.getItem('js_snd')||'null'); if(v){ if(!SND[v.s]||!v.v2){ v.s='solomon'; v.v2=1; localStorage.setItem('js_snd',JSON.stringify(v)) } return v } }catch(e){} return {on:true,s:'solomon'} }
function sndSave(v){ try{ localStorage.setItem('js_snd',JSON.stringify(v)) }catch(e){} }
function ac(){ try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume(); }catch(e){ AC=null } return AC }
function tone(c,f,t0,dur,vol,type,f2){ var o=c.createOscillator(), g=c.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t0); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t0+dur*0.6);
 g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(vol,t0+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
 o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0+dur+0.05) }
function glock(c,f,t,d,v){ tone(c,f,t,d,v); tone(c,f*2.76,t,d*0.25,v*0.18); tone(c,f*5.4,t,d*0.1,v*0.06) }
function brass(c,f,t,d,v){ tone(c,f,t,d,v,'triangle'); tone(c,f*2,t,d*0.8,v*0.35,'triangle'); tone(c,f*1.003,t,d,v*0.5,'sawtooth') }
function playSnd(name){ var c=ac(); if(!c) return; var t=c.currentTime+0.03;
 if(name==='solomon'){ glock(c,783.99,t,.35,.24); glock(c,783.99,t+.17,.35,.22); glock(c,1046.5,t+.36,1.5,.26);
   tone(c,523.25,t+.36,1.2,.06,'triangle'); tone(c,659.25,t+.36,1.2,.04,'triangle'); tone(c,783.99,t+.36,1.2,.035,'triangle');
   tone(c,2637,t+.62,.35,.07); tone(c,3135.96,t+.7,.35,.06); tone(c,3951.07,t+.78,.5,.05) }
 else if(name==='crown'){ brass(c,392,t,.14,.09); brass(c,523.25,t+.12,.14,.09); brass(c,659.25,t+.24,.14,.09); brass(c,783.99,t+.36,.7,.1); tone(c,1567.98,t+.36,.6,.03) }
 else if(name==='xylo'){ [1046.5,1174.66,1318.5,1567.98,1760,2093].forEach(function(f,i){ tone(c,f,t+i*.07,.35,.2); tone(c,f*4,t+i*.07,.08,.04) }); tone(c,2637,t+.48,.6,.16); tone(c,2093,t+.48,.6,.1) }
 else if(name==='orgel'){ [[1567.98,0],[1318.5,.18],[1046.5,.36],[1318.5,.54],[1567.98,.72],[2093,.9]].forEach(function(x){ tone(c,x[0],t+x[1],1.1,.14); tone(c,x[0]*3,t+x[1],.4,.025); tone(c,x[0]*2.01,t+x[1],.6,.03) }) }
 else if(name==='kalimba'){ [[880,0],[1046.5,.11],[1318.5,.22],[1046.5,.4],[1760,.52]].forEach(function(x){ tone(c,x[0],t+x[1],.5,.22,'triangle'); tone(c,x[0]*2.76,t+x[1],.12,.05) }) }
 else if(name==='bubble'){ [[600,1500,0],[800,2000,.16],[700,2400,.3]].forEach(function(x){ tone(c,x[0],t+x[2],.16,.25,'sine',x[1]) }) }
 else { tone(c,1318.5,t,0.9,0.28); tone(c,2637,t,0.5,0.05); tone(c,1046.5,t+0.32,1.3,0.26); tone(c,2093,t+0.32,0.7,0.05) } }
function sigOf(){ var g={n:{},r:{},a:{}};
 (S.notices||[]).forEach(function(n){ if(!n.read) g.n[n.id]=1 });
 (S.sreq||[]).forEach(function(r){ if(r.status==='접수') g.r[r.id]=1 });
 (S.myreq||[]).forEach(function(r){ g.r[r.id]=r.status });
 (S.kids||[]).forEach(function(k){ var a=(k.attendance||[])[0]; if(a) g.a[k.id]=a.day+a.status });
 return g }
function diff(o,n){ var m=[];
 Object.keys(n.n).forEach(function(k){ if(!o.n[k]) m.push('새 공지가 왔습니다') });
 Object.keys(n.r).forEach(function(k){ if(o.r[k]!==n.r[k]) m.push(C.role==='parent'?'보낸 신청의 답이 왔습니다':'새 상담·요청이 왔습니다') });
 Object.keys(n.a).forEach(function(k){ if(o.a[k]!==n.a[k]) m.push('출결이 기록되었습니다') });
 return m }
function poll(){ if(document.hidden||!document.getElementById('app')) return; var old=S.sig||sigOf();
 load().then(function(){ var nw=sigOf(), m=diff(old,nw); S.sig=nw;
  if(!m.length) return; starAlert(m[0], m.length>1?'새 소식 '+m.length+'건':'');
  var typing=document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName); if(!typing&&!S.asgOpen) render() }).catch(function(){}) }
function sndCard(){ var p=sndPref();
 return '<div class="card"><div class="row"><div><h3 style="margin:0">알림음</h3><p class="sub">앱을 열어 두면 새 소식에 울립니다</p></div>'+
  '<button class="sm'+(p.on?' on':'')+'" data-snd-on="1">'+(p.on?'켜짐':'꺼짐')+'</button></div>'+
  '<div class="seg" style="margin:14px 0 0;flex-wrap:wrap;overflow:visible">'+Object.keys(SND).map(function(k){return '<button class="sm'+(p.s===k?' on':'')+'" data-snd="'+k+'">♪ '+SND[k]+'</button>'}).join('')+'</div>'+
  (/android/i.test(navigator.userAgent)?'<p class="sub" style="margin-top:14px">앱을 닫아 둘 때도 솔로몬 소리로 받으려면 <a class="link" href="/assets/solomon-signature.mp3" download="주니어솔로몬_알림음.mp3">소리 파일 받기</a> → 휴대폰 설정 → 알림 → 크롬 → juniorsolomon.com → 소리에서 이 파일을 고르세요.</p>':'')+'</div>' }

/* ── 큰 별 알림 (앱이 열려 있을 때) ── */
var STAR='<svg viewBox="-120 -120 240 240" width="150" height="150"><defs><radialGradient id="sg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFF6D6"/><stop offset=".55" stop-color="#E8C980"/><stop offset="1" stop-color="#B8975A"/></radialGradient></defs><path d="M0,-118 C11,-28 28,-11 118,0 C28,11 11,28 0,118 C-11,28 -28,11 -118,0 C-28,-11 -11,-28 0,-118 Z" fill="url(#sg)"/></svg>';
function starAlert(title, body){
 var old=document.getElementById('jsStar'); if(old) old.remove();
 var el=document.createElement('div'); el.id='jsStar'; el.className='star-bg';
 el.innerHTML='<div class="star-box"><div class="star-big">'+STAR+'</div><span class="sp s1"></span><span class="sp s2"></span><span class="sp s3"></span>'+
  '<b>'+esc(title)+'</b>'+(body?'<p>'+esc(body)+'</p>':'')+'<button type="button" class="btn">확인</button></div>';
 el.addEventListener('click',function(e){ if(e.target===el||e.target.tagName==='BUTTON') el.remove() });
 (document.getElementById('app')||document.body).appendChild(el);
 var m=nMode(), p=sndPref(); if(m!=='무음'&&m!=='진동'&&p.on) playSnd(p.s);
 try{ if(m!=='무음') navigator.vibrate&&navigator.vibrate(m==='진동'?[300,120,300,120,600]:[80,60,80,60,220]) }catch(e){}
}
navigator.serviceWorker&&navigator.serviceWorker.addEventListener('message',function(e){
 if(e.data&&e.data.jsPush&&!document.hidden){ starAlert(e.data.title,e.data.body); if(window.JSApp&&C) load().then(function(){ S.sig=sigOf(); render() }) }
});


/* ── 알림 방식 (강사 필수: 소리 / 진동 / 무음) ── */
var NMODE={'소리':'휴대폰 알림음과 진동으로 알립니다','진동':'길게 진동으로 알립니다 (휴대폰을 진동 모드로 두면 소리 없이 진동만)','무음':'소리·진동 없이 잠금 화면에 알림만 띄웁니다'};
function nMode(){ try{ return localStorage.getItem('js_nmode')||'' }catch(e){ return '' } }
function nModeSave(m, server){ try{ localStorage.setItem('js_nmode',m) }catch(e){}
 try{ caches.open('js-pref').then(function(c){ return c.put('/__nmode', new Response(m)) }) }catch(e){}
 if(server!==false&&!C.pv) return rpc('set_notify_mode',{p_mode:m}).then(function(){ C.p.notify_mode=m }).catch(function(){}); return Promise.resolve() }
function gateCard(st){
 var m=nMode();
 var how={ios:'<p class="sub" style="margin-top:12px">아이폰은 먼저 이 화면을 <b>홈 화면에 추가</b>한 뒤, 그 아이콘으로 다시 열어 알림을 켜야 합니다.</p><button class="btn" type="button" id="pushIos" style="margin-top:10px">홈 화면에 추가하는 법</button>',
  denied:'<p class="sub" style="margin-top:12px">이 휴대폰에서 알림이 막혀 있습니다. 휴대폰 <b>설정 → 알림</b>에서 juniorsolomon.com(또는 주니어솔로몬)을 허용한 뒤 이 화면을 새로 열어 주세요.</p>',
  unsupported:'<p class="sub" style="margin-top:12px">이 브라우저는 알림을 받을 수 없습니다. 크롬(안드로이드)이나 홈 화면에 추가한 앱(아이폰)으로 열어 주세요.</p>',
  off:'<button class="btn" type="button" id="pushOn" style="margin-top:14px"'+(m?'':' disabled')+'>'+(m?'「'+m+'」으로 알림 켜기':'먼저 알림 방식을 고르세요')+'</button>'}[st]||'';
 return '<div class="card fbwarn" style="cursor:default"><b>✦ 알림 설정이 필요합니다 (필수)</b>'+
  '<span>학부모 상담·요청, 보강 신청이 들어오거나 미결 과제(안 나간 피드백, 보강 출석 체크)가 있을 때 바로 알려 드립니다. 셋 중 하나를 고르고 알림을 켜면 화면이 열립니다.<br>밤 10시~아침 8시에는 소리·진동 없이 알림만 오고, 선생님 수업 중에 온 알림은 모아 두었다가 수업이 끝나면 한 번에 보내 드립니다.</span>'+
  '<div class="seg" style="margin:14px 0 0;flex-wrap:wrap;overflow:visible">'+Object.keys(NMODE).map(function(k){return '<button type="button" class="sm'+(m===k?' on':'')+'" data-nmode="'+k+'">'+(k==='소리'?'🔔 소리':k==='진동'?'📳 진동':'🔕 무음 알림')+'</button>'}).join('')+'</div>'+
  (m?'<p class="sub" style="margin-top:8px">'+esc(NMODE[m])+'</p>':'')+how+'</div>';
}
function modeCard(){ var m=nMode();
 return '<div class="card"><div class="row"><div><h3 style="margin:0">알림 방식 · '+esc(m)+'</h3><p class="sub">'+esc(NMODE[m]||'')+'</p></div></div>'+
  '<div class="seg" style="margin:12px 0 0;flex-wrap:wrap;overflow:visible">'+Object.keys(NMODE).map(function(k){return '<button type="button" class="sm'+(m===k?' on':'')+'" data-nmode="'+k+'">'+(k==='소리'?'🔔 소리':k==='진동'?'📳 진동':'🔕 무음 알림')+'</button>'}).join('')+'</div>'+
  '<p class="sub" style="margin-top:8px">알림 끄기는 없습니다. 밤 10시~아침 8시는 자동으로 무음, 수업 중 알림은 수업이 끝나면 한 번에 옵니다.</p></div>' }
function teacherGate(){
 var sl=$('#pushSlot'), tl=$('#tTiles'); if(!sl) return;
 if(!nMode()&&C.p.notify_mode) nModeSave(C.p.notify_mode,false);
 pushState().then(function(st){
  var ok=st==='on'&&!!nMode();
  if(ok&&!C.p.notify_mode) nModeSave(nMode());
  sl.innerHTML=ok?'<button type="button" class="nmline" data-nmopen="1">'+(nMode()==='소리'?'🔔':nMode()==='진동'?'📳':'🔕')+' 알림 방식 · '+esc(nMode())+' <u>바꾸기</u></button>':gateCard(st); if(tl) tl.hidden=!ok;
  var o=sl.querySelector('[data-nmopen]'); if(o) o.onclick=function(){ sl.innerHTML=modeCard(); sl.querySelectorAll('[data-nmode]').forEach(function(b){ b.onclick=function(){ nModeSave(b.dataset.nmode); toast('알림 방식: '+b.dataset.nmode); teacherGate() } }) };
  sl.querySelectorAll('[data-nmode]').forEach(function(b){ b.onclick=function(){ nModeSave(b.dataset.nmode); teacherGate() } });
  var b=$('#pushOn'); if(b) b.onclick=function(){ if(!nMode()) return; nModeSave(nMode()).then(function(){ pushOn(b) }) };
  var i=$('#pushIos'); if(i) i.onclick=function(){ window.JSInstall&&JSInstall.open('ios') };
 });
}

/* ── 메이크에듀 원생과 맞는 학부모 한 번에 승인 ── */
function bulkLoad(){ var sl=$('#bulkSlot'); if(!sl) return;
 rpc('admin_bulk_candidates').then(function(L){ L=L||[]; S.bulk=L;
  if(!L.length){ sl.innerHTML=''; return }
  sl.innerHTML='<div class="card hl"><h3 style="margin:0 0 4px">메이크에듀 원생과 맞는 학부모 '+L.length+'명</h3><p class="sub">자녀 이름과 생년월일(또는 보호자 번호)이 메이크에듀 재원생과 하나로 맞는 분만 모았습니다. 확인 후 한 번에 승인하세요.</p>'+
   '<div class="list" style="margin-top:10px">'+L.map(function(x){ return '<label style="display:flex;gap:10px;align-items:flex-start;padding:8px 0"><input type="checkbox" data-bk="'+x.id+'" checked style="margin-top:4px"><span><b>보호자 '+esc(x.nickname||'')+'</b><br><span class="sub">'+(x.kids||[]).map(function(k){return esc(k.child)+' → '+esc(k.name)+' '+esc(k.grade||'')+' '+esc(k.school||'')}).join('<br>')+'</span></span></label>' }).join('')+'</div>'+
   '<button class="btn" type="button" id="bulkGo" style="margin-top:12px">선택한 '+L.length+'명 한 번에 승인</button></div>';
  var upd=function(){ var n=sl.querySelectorAll('[data-bk]:checked').length, b=$('#bulkGo'); b.textContent='선택한 '+n+'명 한 번에 승인'; b.disabled=!n };
  sl.querySelectorAll('[data-bk]').forEach(function(c){ c.onchange=upd });
  $('#bulkGo').onclick=function(){ var ids=[].map.call(sl.querySelectorAll('[data-bk]:checked'),function(c){return c.dataset.bk}); if(!ids.length) return;
   var b=this; b.disabled=true; b.textContent='승인하는 중…';
   rpc('admin_bulk_approve',{p_ids:ids}).then(function(r){ toast((r&&r.approved||0)+'명 승인했습니다'+(r&&r.skipped?' · '+r.skipped+'명은 따로 확인해 주세요':'')); bulkLoad(); C.L.admin(C.role==='admin') })
    .catch(function(){ b.disabled=false; upd(); toast('승인하지 못했습니다. 다시 눌러 주세요') }) };
 }).catch(function(){ sl.innerHTML='' });
}

/* ── 앱 아이콘 위 숫자: 앱을 열면 지움 ── */
function badgeClear(){ try{ caches.open('js-pref').then(function(c){ return c.put('/__badge', new Response('0')) }) }catch(e){}
 try{ navigator.clearAppBadge&&navigator.clearAppBadge().catch(function(){}) }catch(e){}
 try{ navigator.serviceWorker&&navigator.serviceWorker.getRegistration('/').then(function(r){ if(r) r.getNotifications().then(function(ns){ ns.forEach(function(n){ n.close() }) }) }) }catch(e){} }
badgeClear(); document.addEventListener('visibilitychange',function(){ if(!document.hidden) badgeClear() });

/* ── 휴대폰 푸시 알림 받기 ── */
function pushSupported(){ return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window }
function iosNotInstalled(){ var ios=/iphone|ipad|ipod/i.test(navigator.userAgent); return ios&&!(navigator.standalone||matchMedia('(display-mode: standalone)').matches) }
function b64(u){ var p='='.repeat((4-u.length%4)%4), s=atob((u+p).replace(/-/g,'+').replace(/_/g,'/')), a=new Uint8Array(s.length); for(var i=0;i<s.length;i++) a[i]=s.charCodeAt(i); return a }
function pushState(){
 if(C.pv) return Promise.resolve('none');
 if(iosNotInstalled()) return Promise.resolve('ios');
 if(!pushSupported()) return Promise.resolve('unsupported');
 if(Notification.permission==='denied') return Promise.resolve('denied');
 return navigator.serviceWorker.getRegistration('/').then(function(r){ return r?r.pushManager.getSubscription():null }).then(function(s){ return s&&Notification.permission==='granted'?'on':'off' }).catch(function(){ return 'off' });
}
function pushCard(st){
 if(st==='none'||st==='on') return '';
 var msg={off:C.role==='parent'?'수업 피드백·공지·보강 소식이 오면 휴대폰 잠금 화면에 별 알림이 뜹니다.':'승인 대기·상담 신청이 오면 휴대폰 잠금 화면에 별 알림이 뜹니다.',
  ios:'아이폰은 먼저 홈 화면에 앱을 추가한 뒤, 그 아이콘으로 열어서 켜야 합니다.',
  denied:'이 휴대폰에서 알림이 꺼져 있습니다. 휴대폰 설정 → 알림에서 juniorsolomon.com(또는 주니어솔로몬)을 허용해 주세요.',
  unsupported:'이 브라우저는 푸시 알림을 지원하지 않습니다. 크롬이나 사파리(홈 화면 앱)에서 열어 주세요.'}[st];
 var btn=st==='off'?'<button class="btn" type="button" id="pushOn">휴대폰 알림 받기</button>':st==='ios'?'<button class="btn" type="button" id="pushIos">홈 화면에 추가하는 법</button>':'';
 return '<div class="card note"><h3 style="margin:0 0 4px">✦ 휴대폰 알림이 아직 꺼져 있습니다</h3><p class="sub" style="margin-bottom:'+(btn?'14px':'0')+'">'+msg+'</p>'+btn+'</div>';
}
function pushOn(btn){
 btn.disabled=true; btn.textContent='연결하는 중…';
 Notification.requestPermission().then(function(p){
  if(p!=='granted') throw new Error('denied');
  return Promise.all([navigator.serviceWorker.register('/sw.js').then(function(){ return navigator.serviceWorker.ready }), C.sb.functions.invoke('kakao-alert',{body:{action:'push_key'}})]);
 }).then(function(a){
  var reg=a[0], key=a[1].data&&a[1].data.key; if(!key) throw new Error('key');
  return reg.pushManager.getSubscription().then(function(s){ return s||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(key)}) });
 }).then(function(sub){
  return C.sb.functions.invoke('kakao-alert',{body:{action:'push_subscribe',sub:sub.toJSON()}});
 }).then(function(r){
  if(!r.data||!r.data.ok) throw new Error('save');
  if(C.real==='admin') return C.sb.functions.invoke('kakao-alert',{body:{action:'push_test'}});
  return navigator.serviceWorker.ready.then(function(reg){ var m=nMode(); return reg.showNotification('✦ 알림이 연결되었습니다',{body:'새 소식이 오면 이렇게 알려 드립니다.',icon:'/assets/icon-192.png',badge:'/assets/badge-star.png',silent:m==='무음',vibrate:m==='무음'?undefined:m==='진동'?[300,120,300,120,600]:[80,60,80,60,220],tag:'js-test'}) });
 }).then(function(){ toast('연결했습니다. 시험 알림을 보냈습니다'); render() })
 .catch(function(e){ btn.disabled=false; btn.textContent='휴대폰 알림 받기'; toast(String(e&&e.message)==='denied'?'알림을 허용해야 받을 수 있습니다':'연결하지 못했습니다. 다시 눌러 주세요') });
}

/* ── 승인 축하: 별이 쏟아짐 (처음 한 번) ── */
function welcome(){
 if(C.real==='admin'||C.pv) return;
 var k='js_welcome_'+C.p.id; try{ if(localStorage.getItem(k)) return; localStorage.setItem(k,'1') }catch(e){ return }
 var who=C.role==='parent'?'학부모님':C.role==='teacher'?((C.p.teacher_name||'')+' 선생님').trim():'선생님';
 var el=document.createElement('div'); el.className='shower';
 var h=''; for(var i=0;i<46;i++){ var sz=8+Math.random()*22, l=Math.random()*100, d=2.4+Math.random()*2.6, dl=Math.random()*1.8, r=Math.random()*360;
  h+='<i style="left:'+l.toFixed(1)+'%;width:'+sz.toFixed(0)+'px;height:'+sz.toFixed(0)+'px;animation-duration:'+d.toFixed(2)+'s,1.1s;animation-delay:'+dl.toFixed(2)+'s,'+dl.toFixed(2)+'s;--r:'+r.toFixed(0)+'deg"></i>' }
 el.innerHTML=h+'<div class="star-box wel"><div class="star-big">'+STAR+'</div><b>환영합니다</b><p>'+esc(who)+', 가입이 승인되었습니다.<br>이제 주니어솔로몬 화면을 쓸 수 있습니다.</p><button type="button" class="btn">시작하기</button></div>';
 el.addEventListener('click',function(e){ if(e.target.tagName==='BUTTON'){ el.remove() } });
 document.getElementById('app').appendChild(el);
 var p=sndPref(); if(p.on){ playSnd('solomon'); }
 setTimeout(function(){ el.classList.add('done') },6000);
}

/* ── 홈페이지와 한 세트: 이벤트·방학 특강 (assets/site-data.js 하나에서 읽음) ── */
function todayK(){ return kst().day }
function events(){ var D=window.JS_DATA||{}; return (D.events||[]).filter(function(e){ return todayK()<=e.until }) }
function specials(){ var D=window.JS_DATA||{}; var t=todayK(); return (D.specials||[]).filter(function(x){ return t<=x.end }) }
function evUnseen(){ try{ var seen=JSON.parse(localStorage.getItem('js_ev_seen')||'[]'); return events().filter(function(e){ return seen.indexOf(e.id)<0 }).length }catch(e){ return 0 } }
function evMarkSeen(){ try{ localStorage.setItem('js_ev_seen',JSON.stringify(events().map(function(e){return e.id}))) }catch(e){} }
function evCards(){
 var E=events(); if(!E.length) return '';
 return '<p class="hello" style="margin:4px 0 10px">Events</p>'+E.map(function(e){ return '<a class="card evc" href="/'+esc(e.href)+'"><img src="/'+esc(e.img)+'" alt="'+esc(e.alt)+'" loading="lazy"><span class="sub">~ '+md(e.until)+'까지 · 자세히 보기 ›</span></a>' }).join('')+'<p class="hello" style="margin:18px 0 10px">Notices</p>';
}
function vSpecial(){
 var L=specials(), t=todayK();
 var h='<h2>방학 특강</h2><p class="sub" style="margin-bottom:14px">방학 동안만 열리는 임시 방입니다. 마지막 수업일이 지나면 자동으로 닫힙니다.</p>';
 if(!L.length) return h+'<div class="card"><p class="sub">지금은 모집 중인 특강이 없습니다.</p></div>';
 h+=L.map(function(x){ var closed=x.deadline&&t>x.deadline;
  return '<a class="card spc" href="/special.html#'+esc(x.id)+'"><img src="/'+esc(x.posters[0])+'" alt="'+esc(x.title)+' 포스터" loading="lazy"><div><span class="tag '+(closed?'g':'')+'">'+(closed?'모집 마감':'모집 중')+'</span><b>'+esc(x.title)+'</b><span class="sub">'+esc(x.sub)+'</span><span class="sub">'+esc(x.period)+'</span></div></a>' }).join('');
 return h+tip('카드를 누르면 포스터와 카톡 상담이 열립니다. 홈페이지 방학 특강과 같은 내용입니다.');
}
/* ── 원장 미리보기: 관리자·강사·학부모·승인 대기·비회원 화면 ── */
function pvCard(){
 if(C.real!=='admin'||C.pv) return '';
 return '<div class="card"><h3 style="margin:0 0 4px">다른 화면 미리보기</h3><p class="sub" style="margin-bottom:12px">그 사람이 보는 화면을 실제 자료로 봅니다. 고칠 곳을 찾을 때 쓰세요.</p>'+
  '<div class="seg" style="margin:0;flex-wrap:wrap;overflow:visible">'+[['desk','관리자'],['teacher','강사'],['parent','학부모'],['pending','승인 대기'],['guest','비회원']].map(function(x){return '<button class="sm" data-pv="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div></div>';
}
function pvBanner(){
 if(!C.pv) return '';
 return '<div class="pvbar"><span>미리보기 · '+esc(C.pv.label)+'</span><button type="button" data-pvexit="1">원장 화면으로</button></div>';
}
function pvPick(kind){
 if(kind==='guest'){ location.href='/member.html?guest=1'; return }
 if(kind==='pending'){ C.L.openForm(null,true); return }
 if(kind==='desk'){ startPv({kind:'desk',label:'관리자 화면'}); return }
 rpc('admin_preview_people').then(function(pp){
  var list=kind==='teacher'?(pp.teachers||[]).map(function(t){return {v:t,l:t+' 선생님'}}):(pp.parents||[]).map(function(x){return {v:x.id,l:(x.kids||'')+' 학부모'}});
  if(!list.length) return toast(kind==='teacher'?'연결된 강사가 없습니다':'승인된 학부모가 없습니다');
  var el=document.createElement('div'); el.className='star-bg';
  el.innerHTML='<div class="star-box" style="padding:24px 20px 18px;max-height:80vh;overflow:auto"><b>'+(kind==='teacher'?'어느 선생님 화면을 볼까요?':'어느 학부모 화면을 볼까요?')+'</b>'+
   '<div class="list" style="text-align:left;margin:10px 0 6px">'+list.map(function(x,i){return '<div><span>'+esc(x.l)+'</span><button class="sm" data-pick="'+i+'">보기</button></div>'}).join('')+'</div>'+
   '<button type="button" class="btn ghost" data-close="1">닫기</button></div>';
  el.addEventListener('click',function(e){ var b=e.target.closest('[data-pick]'); if(b){ var x=list[+b.dataset.pick]; el.remove(); startPv(kind==='teacher'?{kind:'teacher',name:x.v,label:x.l+' 화면'}:{kind:'parent',id:x.v,label:x.l+' 화면'}); return }
   if(e.target===el||e.target.hasAttribute('data-close')) el.remove() });
  document.getElementById('app').appendChild(el);
 }).catch(function(){ toast('목록을 불러오지 못했습니다') });
}
function startPv(pv){ C.pv=pv; C.role=pv.kind; S.tab=null; S.kid=0; S.kids=[]; S.myreq=[]; S.sreq=[]; load().then(function(){ S.sig=sigOf(); render(); window.scrollTo(0,0) }) }
function endPv(){ C.pv=null; C.role=C.real; S.tab=null; load().then(function(){ S.sig=sigOf(); render(); window.scrollTo(0,0) }) }

/* ── 학습지 과제: 강사 → 재원생(학부모 앱) → 위에 써서 제출 → 강사 빨간 펜 확인 ── */
var CR1='© 주니어솔로몬. 무단 복제·전재·배포·변형 및 생성형 AI를 이용한 학습·분석·유사·파생 콘텐츠 제작을 금합니다.';
var CR2='위반 시 관련 법령에 따른 책임을 물을 수 있습니다. · 주니어솔로몬®(상표등록 제40-1582862호)';
function asgSt(x){ var s=x&&x.status||'미제출'; return {'미제출':'새 과제','작성중':'작성 중','제출':'제출함','확인':'확인 완료'}[s]||s }
function asgTag(s){ var c={'미제출':'y','작성중':'y','제출':'ok','확인':'g'}[s||'미제출']; return '<span class="tag '+c+'">'+esc(asgSt({status:s}))+'</span>' }
function loadAsg(){
 if(C.pv){ S.asg=[]; return Promise.resolve() }
 if(C.role==='parent') return rpc('my_assignments').then(function(d){ S.asg=d||[] }).catch(function(){ S.asg=S.asg||[] });
 return Promise.all([rpc('teacher_assignments').then(function(d){ S.asg=d||[] }).catch(function(){ S.asg=S.asg||[] }),
   rpc('assign_classes').then(function(d){ S.asgCls=d||[] }).catch(function(){ S.asgCls=S.asgCls||[] })]);
}
function asgUnseen(){ if(C.role!=='parent') return (S.asg||[]).reduce(function(a,x){ return a+(x.students||[]).filter(function(s){return s.status==='제출'}).length },0);
 return (S.asg||[]).filter(function(x){ return !x.sub||x.sub.status==='작성중'||(x.sub.status==='확인'&&!asgSeenR(x)) }).length }
function asgSeenR(x){ try{ return localStorage.getItem('js_asr_'+x.sub.id)===String(x.sub.reviewed_at) }catch(e){ return true } }
function signed(paths){ if(!paths.length) return Promise.resolve({});
 return C.sb.storage.from('assign').createSignedUrls(paths,3600).then(function(r){ var m={}; ((r&&r.data)||[]).forEach(function(x){ if(x&&x.signedUrl) m[x.path]=x.signedUrl }); return m }) }
function wmText(name){ var t=esc((name||'')+' · 주니어솔로몬 · '+md(kst().day)); var s=''; for(var i=0;i<14;i++) s+='<span>'+t+'</span>'; return s }
function vAsg(){
 var h='<h2>'+(C.role==='parent'?'과제':'학습지 과제')+'</h2>';
 if(S.asgOpen) return h+'<div id="asgView"><div class="card"><p class="sub">학습지를 여는 중입니다.</p></div></div>';
 var L=S.asg;
 if(!L) return h+'<div class="card"><p class="sub">불러오는 중입니다.</p></div>';
 if(C.role==='parent'){
  if(!L.length) return h+'<div class="card"><p class="sub">아직 받은 과제가 없습니다. 선생님이 학습지를 보내면 여기에 쌓이고 휴대폰으로 알려 드립니다.</p></div>';
  return h+L.map(function(x){ var st=x.sub?x.sub.status:'미제출';
   return '<button class="card asgc" data-asgo="'+x.id+'|'+esc(x.student)+'"><div class="row"><b>'+esc(x.title)+'</b>'+asgTag(st)+'</div>'+
    '<span class="sub">'+esc(x.child)+' · '+esc(cname(x.class))+(x.due?' · '+md(x.due)+'까지':'')+' · '+x.pages+'쪽</span>'+(x.note?'<span class="sub">'+esc(x.note)+'</span>':'')+'</button>' }).join('')+
   tip('학습지 위에 손가락이나 펜으로 바로 쓰고 「선생님께 보내기」를 누르면 됩니다. 태블릿이면 더 편합니다.');
 }
 var cls=S.asgCls||[];
 h+=(cls.length?'<button class="btn" type="button" data-asgnew="1" style="margin-bottom:14px">＋ 새 과제 보내기</button>':'');
 if(S.asgNew) h+=asgForm(cls);
 if(!L.length) return h+'<div class="card"><p class="sub">아직 보낸 과제가 없습니다.</p></div>'+tip('과제는 맡은 반의 재원생에게만 보낼 수 있습니다.');
 return h+L.map(function(x){ var S2=x.students||[], done=S2.filter(function(s){return s.status==='제출'||s.status==='확인'}).length, wait=S2.filter(function(s){return s.status==='제출'}).length;
  return '<div class="card"><div class="row"><b>'+esc(x.title)+'</b><span class="tag '+(wait?'warn':'g')+'">'+(wait?'확인할 것 '+wait:'제출 '+done+'/'+S2.length)+'</span></div>'+
   '<p class="sub">'+esc(cname(x.class))+(C.role!=='teacher'?' · '+esc(x.teacher||''):'')+(x.due?' · '+md(x.due)+'까지':'')+' · '+x.pages+'쪽 · 보냄 '+md(String(x.at).slice(0,10))+'</p>'+
   '<div class="list" style="margin-top:8px">'+S2.map(function(s){ return '<div><span>'+esc(s.name)+' <span class="sub">'+esc(s.grade||'')+'</span></span>'+
     (s.sub&&(s.status==='제출'||s.status==='확인')?'<button type="button" class="sm" data-asgr="'+x.id+'|'+s.sub+'">'+(s.status==='제출'?'확인하기':'다시 보기')+'</button>':asgTag(s.status))+'</div>' }).join('')+'</div></div>' }).join('')+
  tip('과제는 맡은 반의 재원생에게만 보낼 수 있습니다. 학습지에는 학생 이름과 저작권 문구가 새겨집니다.');
}
function asgForm(cls){
 var c0=cls[0]||{students:[]}, d=new Date(Date.now()+9*3600e3+7*864e5).toISOString().slice(0,10);
 return '<form id="fAsg" class="card"><h3>새 과제</h3>'+
  '<label>반<select name="cls" id="asgCls">'+cls.map(function(c,i){return '<option value="'+esc(c.class_id)+'"'+(i?'':' selected')+'>'+esc(cname(c.class))+' · '+WD[c.weekday]+' '+esc(String(c.starts||'').slice(0,5))+'</option>'}).join('')+'</select></label>'+
  '<div id="asgStu" class="asgstu">'+asgStu(c0)+'</div>'+
  '<label>제목<input name="title" maxlength="80" required placeholder="예: 「마당을 나온 암탉」 생각 정리"></label>'+
  '<label>안내 (선택)<textarea name="note" rows="2" maxlength="1000" placeholder="예: 3쪽 질문까지 써 오세요"></textarea></label>'+
  '<label>마감일<input type="date" name="due" value="'+d+'"></label>'+
  '<p class="sub" style="margin:10px 0 6px">학습지 (사진·PDF, 30쪽까지)</p><label class="filebtn"><input type="file" name="file" accept="image/*,application/pdf" multiple hidden onchange="this.nextElementSibling.textContent=this.files.length?this.files.length+\'개 파일을 골랐습니다\':\'📎 학습지 파일 고르기\'"><span>📎 학습지 파일 고르기</span></label>'+
  '<p class="sub" id="asgProg"></p><button class="btn" type="submit">보내기</button></form>';
}
function asgStu(c){ return '<p class="sub" style="margin:8px 0 4px">받는 학생 · 재원생만 보입니다</p>'+(c.students||[]).map(function(s){ return '<label class="chk"><input type="checkbox" name="stu" value="'+esc(s.id)+'" checked> '+esc(s.name)+' <span class="sub">'+esc(s.grade||'')+'</span></label>' }).join('') }
function fileToBlobs(files, prog){
 var out=[], list=[].slice.call(files);
 function resize(src){ return new Promise(function(ok,no){ var im=new Image(); im.onload=function(){ var w=Math.min(1400,im.naturalWidth), h=Math.round(im.naturalHeight*w/im.naturalWidth), cv=document.createElement('canvas'); cv.width=w; cv.height=h;
   var g=cv.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,w,h); g.drawImage(im,0,0,w,h); cv.toBlob(function(b){ b?ok(b):no(new Error('img')) },'image/jpeg',.82) }; im.onerror=function(){ no(new Error('img')) }; im.src=src }) }
 function pdf(f){ return import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs').then(function(lib){
   lib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';
   return f.arrayBuffer().then(function(buf){ return lib.getDocument({data:buf}).promise }).then(function(doc){ var p=Promise.resolve();
    for(var i=1;i<=Math.min(doc.numPages,30);i++)(function(n){ p=p.then(function(){ return doc.getPage(n).then(function(pg){ var v=pg.getViewport({scale:1}), sc=1400/v.width, vp=pg.getViewport({scale:sc}), cv=document.createElement('canvas');
      cv.width=Math.round(vp.width); cv.height=Math.round(vp.height); var g=cv.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,cv.width,cv.height);
      return pg.render({canvasContext:g,viewport:vp}).promise.then(function(){ return new Promise(function(ok){ cv.toBlob(function(b){ out.push(b); prog(out.length+'쪽 준비'); ok() },'image/jpeg',.82) }) }) }) }) })(i);
    return p }) }) }
 var p=Promise.resolve();
 list.forEach(function(f){ p=p.then(function(){ if(out.length>=30) return; if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)) return pdf(f);
   var u=URL.createObjectURL(f); return resize(u).then(function(b){ URL.revokeObjectURL(u); out.push(b); prog(out.length+'쪽 준비') }) }) });
 return p.then(function(){ return out.slice(0,30) });
}
function asgSend(f){
 var bb=f.querySelector('button.btn'), pr=$('#asgProg'), ids=[].map.call(f.querySelectorAll('[name=stu]:checked'),function(c){return c.value});
 if(!ids.length){ toast('받는 학생을 골라 주세요'); return }
 if(!f.file.files.length){ toast('학습지를 올려 주세요'); return }
 bb.disabled=true; var prog=function(t){ pr.textContent=t };
 var id;
 fileToBlobs(f.file.files, prog).then(function(bl){ if(!bl.length) throw new Error('학습지를 읽지 못했습니다');
  S._bl=bl; return rpc('assign_create',{p_class:f.cls.value,p_title:f.title.value,p_note:f.note.value,p_due:f.due.value||null,p_students:ids}) })
 .then(function(v){ id=v; var bl=S._bl, p=Promise.resolve();
  bl.forEach(function(b,i){ p=p.then(function(){ prog('올리는 중 '+(i+1)+'/'+bl.length); return C.sb.storage.from('assign').upload('a/'+id+'/'+(i+1)+'.jpg',b,{contentType:'image/jpeg',upsert:true}).then(function(r){ if(r.error) throw r.error }) }) });
  return p.then(function(){ return rpc('assign_publish',{p_id:id,p_pages:bl.length}) }) })
 .then(function(n){ S._bl=null; S.asgNew=0; toast('보냈습니다 · 학부모 '+n+'명에게 알림'); return loadAsg() }).then(function(){ render() })
 .catch(function(x){ bb.disabled=false; prog(''); toast((x&&x.message)||'보내지 못했습니다') });
}
/* 학습지 화면: 원본 + 학생 층 + 선생님 층, 이름 워터마크·저작권 바닥글·캡처 경고 */
function asgOpen(o){ if(!C.pv&&C.real!=='admin'){ return rpc('capture_status').then(function(r){ if(r&&r.blocked){ S.capBlocked=true; toast('학습지가 잠겨 있습니다. 학원(02-794-8123)으로 연락해 주세요'); return } asgOpen0(o) }).catch(function(){ asgOpen0(o) }) } asgOpen0(o) }
function asgOpen0(o){ S.asgOpen=o; S.tab='asg'; render(); window.scrollTo(0,0);
 var x, sub, name, pages, paths=[];
 if(o.mode==='do'){ x=(S.asg||[]).filter(function(a){return a.id==o.id&&a.student===o.student})[0]; if(!x) return asgClose(); sub=x.sub; name=x.child; pages=x.pages }
 else { x=(S.asg||[]).filter(function(a){return a.id==o.id})[0]; if(!x) return asgClose(); var st=(x.students||[]).filter(function(s){return s.sub==o.sub})[0]; sub={id:o.sub,status:st.status,pages:st.pages,answer:st.answer,review_note:st.review_note,review_pages:st.review_pages}; name=st.name; pages=x.pages }
 for(var i=1;i<=pages;i++){ paths.push('a/'+x.id+'/'+i+'.jpg'); if(sub&&sub.pages) paths.push('s/'+sub.id+'/'+i+'.png'); if(sub&&sub.review_pages) paths.push('r/'+sub.id+'/'+i+'.png') }
 var fin=sub&&sub.status==='확인', canDraw=o.mode==='do'?!fin:o.mode==='review';
 if(o.mode==='do'&&fin) try{ localStorage.setItem('js_asr_'+sub.id,String(sub.reviewed_at||'')) }catch(e){}
 signed(paths).then(function(U){
  var v=$('#asgView'); if(!v) return;
  var h='<div class="asgbar"><button type="button" class="sm" data-asgx="1">← 목록</button><b>'+esc(x.title)+'</b></div>'+
   '<div class="asgwarn">🔒 캡처·저장·전송 금지 · '+esc(name)+' 학생 이름이 새겨진 학습지입니다</div>'+
   (canDraw?'<div class="asgtools" id="asgTools"><button type="button" class="sm on" data-pen="1">✏️ 쓰기</button><button type="button" class="sm" data-pen="0">✋ 넘기기</button>'+
     (o.mode==='do'?'<button type="button" class="sm" data-pc="#1F1A24">검정</button><button type="button" class="sm" data-pc="#2456C9">파랑</button>':'')+
     '<button type="button" class="sm" data-er="1">지우개</button><button type="button" class="sm" data-undo="1">한 획 지우기</button></div>':'');
  for(var i=1;i<=pages;i++){ h+='<div class="asgpg" data-pg="'+i+'"><div class="asgimg" style="background-image:url(\''+(U['a/'+x.id+'/'+i+'.jpg']||'')+'\')"><img alt="" src="'+(U['a/'+x.id+'/'+i+'.jpg']||'')+'" draggable="false">'+
    (U['s/'+(sub&&sub.id)+'/'+i+'.png']&&o.mode!=='do'?'<img class="lay" alt="" src="'+U['s/'+sub.id+'/'+i+'.png']+'" draggable="false">':'')+
    (U['r/'+(sub&&sub.id)+'/'+i+'.png']&&o.mode==='do'?'<img class="lay" alt="" src="'+U['r/'+sub.id+'/'+i+'.png']+'" draggable="false">':'')+
    '<canvas data-cv="'+i+'"></canvas><div class="wm">'+wmText(name)+'</div></div>'+
    '<div class="asgcr"><span>'+esc(CR1)+'</span><span>'+esc(CR2)+'</span></div><p class="sub" style="text-align:center;margin:4px 0 16px">'+i+' / '+pages+'쪽</p></div>' }
  if(o.mode==='do'){ h+='<div class="card"><label>하고 싶은 말·긴 답 (선택)<textarea id="asgAns" rows="3" maxlength="3000"'+(fin?' disabled':'')+'>'+esc(sub&&sub.answer||'')+'</textarea></label>'+
    (fin?'<p class="fbt">선생님 한마디</p><p>'+esc(sub.review_note||'잘했어요!')+'</p>':'<button class="btn" type="button" id="asgSubmit">'+(sub&&sub.status==='제출'?'고쳐서 다시 보내기':'선생님께 보내기')+'</button>')+'</div>' }
  else { h+='<div class="card">'+(sub.answer?'<p class="fbt">학생이 쓴 말</p><p>'+esc(sub.answer)+'</p>':'')+
    '<label>선생님 한마디<textarea id="asgNote" rows="3" maxlength="1000" placeholder="예: 질문을 두 개나 만들었네요! 3번은 이유를 한 줄 더 써 볼까요?">'+esc(sub.review_note||'')+'</textarea></label>'+
    '<button class="btn" type="button" id="asgReview">'+(sub.status==='확인'?'고쳐서 다시 보내기':'확인 보내기')+'</button></div>' }
  v.innerHTML=h; asgCanvas(v, o, sub, U, canDraw);
 }).catch(function(){ toast('학습지를 열지 못했습니다'); asgClose() });
}
function asgClose(){ S.asgOpen=null; render() }
function asgCanvas(v, o, sub, U, canDraw){
 var pen=true, color=o.mode==='review'?'#D3261E':'#1F1A24', erase=false, hist=[];
 v.querySelectorAll('canvas[data-cv]').forEach(function(cv){ var box=cv.parentNode, im=box.querySelector('img');
  function fit(){ var w=im.naturalWidth||1400, h=im.naturalHeight||1980; cv.width=w; cv.height=h;
   var pre=o.mode==='do'?U['s/'+(sub&&sub.id)+'/'+cv.dataset.cv+'.png']:U['r/'+(sub&&sub.id)+'/'+cv.dataset.cv+'.png'];
   if(pre){ var p=new Image(); p.crossOrigin='anonymous'; p.onload=function(){ cv.getContext('2d').drawImage(p,0,0,w,h); cv._dirty=true }; p.src=pre } }
  if(im.complete&&im.naturalWidth) fit(); else im.onload=fit;
  if(!canDraw){ cv.style.pointerEvents='none'; return }
  var g=cv.getContext('2d'), down=false, last=null;
  function pt(e){ var r=cv.getBoundingClientRect(); return {x:(e.clientX-r.left)*cv.width/r.width, y:(e.clientY-r.top)*cv.height/r.height} }
  cv.addEventListener('pointerdown',function(e){ if(!pen) return; e.preventDefault(); down=true; cv.setPointerCapture(e.pointerId); last=pt(e); hist.push({cv:cv,img:g.getImageData(0,0,cv.width,cv.height)}); if(hist.length>15) hist.shift() });
  cv.addEventListener('pointermove',function(e){ if(!down) return; var p=pt(e); g.globalCompositeOperation=erase?'destination-out':'source-over'; g.strokeStyle=color; g.lineCap='round'; g.lineJoin='round';
   g.lineWidth=erase?34:(o.mode==='review'?5:4)*(cv.width/1000); g.beginPath(); g.moveTo(last.x,last.y); g.lineTo(p.x,p.y); g.stroke(); last=p; cv._dirty=true });
  ['pointerup','pointercancel','pointerleave'].forEach(function(k){ cv.addEventListener(k,function(){ down=false }) });
 });
 function setPen(on){ pen=on; v.querySelectorAll('canvas[data-cv]').forEach(function(c){ c.style.touchAction=on?'none':'auto'; c.style.pointerEvents=on?'auto':'none' });
  v.querySelectorAll('[data-pen]').forEach(function(b){ b.classList.toggle('on',(b.dataset.pen==='1')===on) }) }
 if(canDraw) setPen(true);
 v.onclick=function(e){ var b=e.target.closest('button'); if(!b) return;
  if(b.dataset.asgx){ asgClose(); return }
  if(b.dataset.pen!=null){ setPen(b.dataset.pen==='1'); return }
  if(b.dataset.pc){ color=b.dataset.pc; erase=false; setPen(true); toast(b.textContent+' 펜'); return }
  if(b.dataset.er){ erase=!erase; b.classList.toggle('on',erase); setPen(true); return }
  if(b.dataset.undo){ var hh=hist.pop(); if(hh) hh.cv.getContext('2d').putImageData(hh.img,0,0); return }
  if(b.id==='asgSubmit'||b.id==='asgReview'){ if(C.pv){ toast('미리보기에서는 보내지 않습니다'); return } b.disabled=true; b.textContent='보내는 중…';
   var cvs=[].slice.call(v.querySelectorAll('canvas[data-cv]')), kind=b.id==='asgSubmit'?'s':'r';
   var start=kind==='s'?rpc('assign_begin',{p_assignment:o.id,p_student:o.student}):Promise.resolve(sub.id);
   start.then(function(sid){ var p=Promise.resolve();
     cvs.forEach(function(c){ p=p.then(function(){ return new Promise(function(ok){ c.toBlob(function(bl){ ok(bl) },'image/png') }).then(function(bl){
       return C.sb.storage.from('assign').upload(kind+'/'+sid+'/'+c.dataset.cv+'.png',bl,{contentType:'image/png',upsert:true}).then(function(r){ if(r.error) throw r.error }) }) }) });
     return p.then(function(){ return kind==='s'?rpc('assign_submit',{p_sub:sid,p_pages:cvs.length,p_answer:($('#asgAns')||{}).value||''}):rpc('assign_review',{p_sub:sid,p_note:($('#asgNote')||{}).value||'',p_pages:cvs.length}) }) })
   .then(function(){ toast(kind==='s'?'선생님께 보냈습니다':'확인을 보냈습니다'); S.asgOpen=null; return loadAsg() }).then(function(){ render() })
   .catch(function(x){ b.disabled=false; b.textContent='다시 보내기'; toast((x&&x.message)||'보내지 못했습니다') }) }
 };
}
/* 캡처 경고: 학습지가 열려 있을 때 화면 캡처·인쇄·저장 시도를 막고 기록 */
function capWarn(what){ if(!S||!S.asgOpen) return; var o=S.asgOpen;
 function show(r){ var old=document.getElementById('capWarn'); if(old) old.remove();
  var el=document.createElement('div'), bl=!!(r&&r.blocked); el.id='capWarn'; el.className='star-bg';
  el.innerHTML=bl?'<div class="star-box"><b>🔒 학습지가 잠겼습니다</b><p>캡처·저장 시도가 여러 번 기록되어 학습지를 열 수 없습니다. 다시 열려면 학원(02-794-8123)으로 연락해 주세요.</p><button type="button" class="btn">확인</button></div>'
   :'<div class="star-box"><b>⚠️ 캡처·저장은 금지되어 있습니다</b><p>이 학습지는 주니어솔로몬의 저작물입니다. 화면에 학생 이름이 새겨져 있어 밖으로 퍼지면 누가 찍었는지 알 수 있습니다. 이 시도는 학원에 기록됩니다.'+(r&&r.left>0?'<span style="display:block;margin-top:10px;color:#A3402A;font-weight:800;font-size:15px">'+r.left+'번 더 시도하면 학습지가 잠깁니다.</span>':'')+'</p><button type="button" class="btn">확인</button></div>';
  el.addEventListener('click',function(e){ if(e.target.tagName==='BUTTON'){ el.remove(); if(bl) asgClose() } });
  (document.getElementById('app')||document.body).appendChild(el); if(bl) S.capBlocked=true }
 if(C.pv){ show(null); return }
 rpc('capture_report',{p_assignment:o.id,p_what:what}).then(show).catch(function(){ show(null) });
}
document.addEventListener('keyup',function(e){ if(e.key==='PrintScreen'){ try{ navigator.clipboard&&navigator.clipboard.writeText('') }catch(x){} capWarn('PrintScreen') } });
document.addEventListener('keydown',function(e){ var k=(e.key||'').toLowerCase();
 if((e.metaKey&&e.shiftKey&&/[345s]/.test(k))||((e.ctrlKey||e.metaKey)&&(k==='p'||k==='s'))){ if(S&&S.asgOpen){ e.preventDefault(); capWarn('단축키 '+k) } } });
document.addEventListener('contextmenu',function(e){ if(S&&S.asgOpen&&e.target.closest&&e.target.closest('.asgpg')){ e.preventDefault(); capWarn('길게 누르기·오른쪽 클릭') } });
window.addEventListener('beforeprint',function(){ capWarn('인쇄') });

/* ── 화면 그리기 ── */
var VIEWS={special:vSpecial,today:vToday,notice:vNotice,time:vTime,req:vReq,att:vAtt,mine:vMine,sreq:vSreq,over:vOver,set:vSet,mk:vMk,wait:vWait,stat:vStat,ops:vOps,asg:vAsg,fb:vFb,fbw:vFbw,
 tboard:function(){return '<h2>내 반 출결</h2><div class="legacy"><div id="tboard"></div></div>'+tip('학생 정보는 캡처하거나 학원 밖으로 옮기지 않습니다.')},
 approve:function(){return '<h2>가입 승인</h2><div id="bulkSlot"></div><div class="legacy"><div id="admin"></div></div>'},
 board:function(){return '<h2>반별 정원</h2><div class="legacy"><div id="board"></div></div>'},
 me:function(){return '<h2>반별·출석부</h2><div class="legacy"><div id="me"></div></div>'}};

function render(){
 var v=$('#aView'), back=$('#aBack');
 if(C.role==='parent'&&S.tab&&S.tab!=='special'&&tilesFor0('parent').map(function(t){return t[0]}).indexOf(S.tab)<0) S.tab=null;
 $('#aRole').textContent=S.tab?TITLE[S.tab]:LABEL[C.role]; $('#aRole').className=S.tab?'ko':'';
 back.hidden=!S.tab&&history.length<2;
 v.innerHTML=pvBanner()+(S.tab?(VIEWS[S.tab]||home)():home());
 after();
}
function after(){
 var t=S.tab, L=C.L;
 if(!t){ if(C.role!=='parent') L.bindInstall(); bindLogout();
   if(C.role==='teacher'&&!C.pv){ teacherGate(); return }
   pushState().then(function(st){ var sl=$('#pushSlot'); if(!sl) return; sl.innerHTML=pushCard(st); var b=$('#pushOn'); if(b) b.onclick=function(){ pushOn(b) }; var i=$('#pushIos'); if(i) i.onclick=function(){ window.JSInstall&&JSInstall.open('ios') } });
   return }
 if(t==='notice'){ evMarkSeen(); var un=(S.notices||[]).filter(function(n){return !n.read}).map(function(n){return n.id}); if(un.length) rpc('mark_notices_read',{p_ids:un}).then(function(){ (S.notices||[]).forEach(function(n){n.read=true}) }).catch(function(){}) }
 if(t==='sreq'&&C.role!=='teacher') L.consults();
 if(t==='tboard') L.teacherBoard(C.pv&&C.pv.kind==='teacher'?C.pv.name:undefined);
 if(t==='approve'){ L.admin(C.role==='admin'); bulkLoad() }
 if(t==='board') L.classBoard();
 if(t==='me') L.meBoard();
 if(t==='fb'&&C.role==='parent') fbSeen();
 if(t==='fb'&&C.role!=='parent'&&!S.fbFresh){ S.fbFresh=1; Promise.all([loadFbw(0),rpc('feedback_log',{p_days:35}).then(function(d){S.fblog=d||[]}).catch(function(){S.fblog=S.fblog||[]})]).then(function(){ if(S.tab==='fb') render() }) }
 if(t==='fbw'&&!S.fbwFresh){ S.fbwFresh=1; loadFbw(S.fbwk||0).then(function(){ if(S.tab==='fbw') render() }) }
 if(t==='fb'&&C.role!=='parent'){ var sel=$('#fbClass'); if(sel) sel.onchange=function(){ var o=sel.options[sel.selectedIndex]; if(o&&o.dataset.day) $('#fbDay').value=o.dataset.day } }
 if(t==='mk'&&!S.mbFresh){ S.mbFresh=1; loadMb().then(function(){ if(S.tab==='mk') render() }) }
 if(t==='asg'){ var ac2=$('#asgCls'); if(ac2) ac2.onchange=function(){ var c=(S.asgCls||[]).filter(function(x){return x.class_id===ac2.value})[0]; $('#asgStu').innerHTML=asgStu(c||{}) } }
 if(t==='ops'&&!S.opsFresh){ S.opsFresh=1; rpc('admin_ops_stats').then(function(d){ S.ops=d; if(S.tab==='ops') render() }).catch(function(){ toast('숫자를 불러오지 못했습니다') }) }
 if(t==='stat'&&!S.stFresh){ S.stFresh=1; rpc('admin_daily_stats',{p_days:14}).then(function(d){ S.st=d; if(S.tab==='stat') render() }).catch(function(){ toast('숫자를 불러오지 못했습니다') }) }
 if(t==='wait'&&!S.wlFresh){ S.wlFresh=1; rpc('waitlist_board').then(function(d){ S.wl=d; if(S.tab==='wait') render() }).catch(function(){ toast('대기 명단을 불러오지 못했습니다') }) }
 if(t==='set'){ L.inviteBtn('tinv','tinvm','new_teacher_invite','t','강사'); L.inviteBtn('dinv','dinvm','new_desk_invite','d','관리자'); L.kakaoSetup(); L.betaList(); L.usage();
   $('#pv').onclick=function(){ L.openForm(null,true) } }
 if(t==='mine'){ L.bindInstall(); bindLogout();
   C.sb.from('children').select('*').eq('parent_id',C.p.id).order('created_at').then(function(r){ var kids=r.data||[], KST={pending:'승인 대기',approved:'승인',rejected:'확인 필요'};
     var el=$('#kidsList'); if(el) el.innerHTML=kids.map(function(k){return '<div><span>'+esc(k.name)+'<br><span class="sub">'+esc(k.grade||'')+' · '+esc(k.school||'')+'</span></span><span class="tag '+(k.status==='approved'?'ok':'y')+'">'+KST[k.status]+'</span></div>'}).join('')||'<div><span class="sub">등록된 자녀가 없습니다.</span></div>';
     $('#editKids').onclick=function(){ L.openForm(kids) } }) }
}
function bindLogout(){ C.L.bindLogout() }
function loadMb(){ if(C.pv) { S.mb={staff:C.role!=='teacher',slots:[],tickets:[],students:[],classes:[]}; return Promise.resolve() } return rpc('makeup_board').then(function(d){ S.mb=d }).catch(function(){ S.mb=S.mb||null }) }
function go(t){ S.asgOpen=null; S.asgNew=0; S.mbFresh=0; S.wlFresh=0; S.stFresh=0; S.fbFresh=0; S.fbwFresh=0; S.tab=t; history.pushState({jsTab:t},'',''); render(); window.scrollTo(0,0) }

function load(){
 var r=C.role, pv=C.pv, jobs=[rpc('my_notices').then(function(d){ d=d||[];
   if(pv&&r==='parent') d=d.filter(function(n){return n.audience!=='staff'}); if(pv&&r==='teacher') d=d.filter(function(n){return n.audience!=='parents'});
   S.notices=d }).catch(function(){S.notices=[]})];
 if(r==='parent'){ jobs.push(rpc(pv?'admin_preview_children':'my_children',pv?{p_parent:pv.id}:{}).then(function(d){S.kids=d||[]}).catch(function(){S.kids=[]}));
                   jobs.push(rpc(pv?'admin_preview_requests':'my_requests',pv?{p_parent:pv.id}:{}).then(function(d){S.myreq=d||[]}).catch(function(){S.myreq=[]}));
                   if(pv) S.mk=[]; else jobs.push(rpc('my_makeup').then(function(d){S.mk=d||[]}).catch(function(){S.mk=[]})) }
 else { jobs.push(rpc('staff_requests').then(function(d){ d=d||[];
   if(pv&&r==='teacher') d=d.filter(function(x){return x.to==='담임'&&String(x.teacher||'').replace(/\s/g,'')===pv.name}).map(function(x){ return Object.assign({},x,{parent:null,phone:null}) });
   S.sreq=d }).catch(function(){S.sreq=[]})) }
 if(r==='parent'&&!pv) jobs.push(rpc('my_feedback',{p_limit:40}).then(function(d){S.myfb=d||[]}).catch(function(){S.myfb=[]}));
 if(r==='parent'&&pv) S.myfb=[];
 if((r==='teacher'||r==='admin')&&!pv) jobs.push(loadFbw(0));
 if((r==='parent'||r==='teacher'||r==='admin')&&!pv) jobs.push(loadAsg()); else S.asg=S.asg||[];
 if(r!=='parent') jobs.push(loadMb());
 if(r==='admin'||r==='manager'||r==='desk') jobs.push(rpc('branch_overview').then(function(d){S.over=d||[]}).catch(function(){S.over=[]}));
 return Promise.all(jobs);
}

function onClick(e){
 ac();
 var el=e.target.closest('[data-go],[data-kid],[data-br],[data-mon],[data-rk],[data-rf],[data-rs],[data-delnotice],[data-snd],[data-snd-on],[data-pv],[data-pvexit],[data-mkb],[data-mkc],[data-mkm],[data-mks],[data-mkt],[data-mki],[data-wls],[data-fbwk],[data-fbskip],[data-asgo],[data-asgr],[data-asgnew],[data-cunb],#aBack,#aRefresh'); if(!el) return;
 if(el.id==='aBack'){ history.back(); return }
 if(el.id==='aRefresh'){ el.classList.add('spin'); try{ sessionStorage.setItem('js_tab',S.tab||'') }catch(x){} setTimeout(function(){ location.replace('/member.html?r='+Date.now()) },350); return }
 var d=el.dataset;
 if(d.go){ go(d.go); return }
 if(d.asgo){ var q=d.asgo.split('|'); history.pushState({jsTab:'asg',asg:1},'',''); asgOpen({mode:'do',id:+q[0],student:q[1]}); return }
 if(d.asgr){ var q2=d.asgr.split('|'); history.pushState({jsTab:'asg',asg:1},'',''); asgOpen({mode:'review',id:+q2[0],sub:+q2[1]}); return }
 if(d.asgnew){ S.asgNew=!S.asgNew; render(); return }
 if(d.cunb){ if(C.pv){ toast('미리보기에서는 바꾸지 않습니다'); return } el.disabled=true; rpc('capture_unblock',{p_user:d.cunb}).then(function(){ toast('잠금을 풀었습니다'); S.opsFresh=0; render() }).catch(function(x){ el.disabled=false; toast(x.message||'풀지 못했습니다') }); return }
 if(d.fbwk!=null){ S.fbwk=(+d.fbwk===0)?0:(S.fbwk||0)+(+d.fbwk); S.fbw2=null; loadFbw(S.fbwk).then(render); return }
 if(d.fbskip){ var ff=$('#fFb'); if(!ff) return; if(C.pv){ toast('미리보기에서는 저장하지 않습니다'); return } if(!confirmSoft(el)) return; rpc('feedback_post',{p_class:ff.cls.value,p_day:ff.day.value,p_body:ff.body.value||'',p_kind:'휴강'}).then(function(){ toast('휴강으로 표시했습니다'); S.fbFresh=0; render() }).catch(function(x){ toast(x.message||'저장하지 못했습니다') }); return }
 if(d.pv){ pvPick(d.pv); return }
 if(d.pvexit){ endPv(); return }
 if(d.snd){ var p=sndPref(); p.s=d.snd; p.on=true; p.v2=1; sndSave(p); playSnd(p.s); render(); return }
 if(d.sndOn){ var q=sndPref(); q.on=!q.on; sndSave(q); if(q.on) playSnd(q.s); render(); toast(q.on?'알림음을 켰습니다':'알림음을 껐습니다'); return }
 if(d.kid!=null){ S.kid=+d.kid; S.mon=null; render(); return }
 if(d.br){ S.branch=d.br; render(); return }
 if(d.mon){ S.mon=d.mon; render(); return }
 if(d.rk){ S.rkind=d.rk; render(); return }
 if(d.rf){ S.rf=d.rf; render(); return }
 if(d.rs){ var a=d.rs.split('|'); el.disabled=true;
   rpc('set_request_status',{p_id:+a[0],p_status:a[1]}).then(function(){ return rpc('staff_requests') }).then(function(x){ S.sreq=x||[]; render(); toast(a[1]==='완료'?'처리 완료로 표시했습니다':'확인으로 표시했습니다') })
   .catch(function(){ el.disabled=false; toast('처리하지 못했습니다. 다시 눌러 주세요.') }); return }
 if(d.mkb||d.mkc||d.mkm||d.mks||d.mkt||d.mki||d.wls){ if(C.pv){ toast('미리보기에서는 바꾸지 않습니다'); return } act(el,d); return }
 if(d.delnotice){ if(!confirm('이 공지를 지울까요?')) return; el.disabled=true;
   rpc('delete_notice',{p_id:+d.delnotice}).then(function(){ return rpc('my_notices') }).then(function(x){ S.notices=x||[]; render(); toast('지웠습니다') })
   .catch(function(){ el.disabled=false; toast('지우지 못했습니다.') }); return }
}
function act(el,d){
 var job, ok, after1;
 if(d.mkb){ var a=d.mkb.split('|'); if(!confirm('이 시간으로 보강을 신청할까요?')) return; job=rpc('makeup_book',{p_ticket:+a[0],p_slot:+a[1]}); ok='보강을 신청했습니다. 담임 선생님과 원장님께 전달됩니다.' }
 if(d.mkc){ if(!confirm('보강 신청을 취소할까요? 보강권은 다시 쓸 수 있습니다.')) return; job=rpc('makeup_cancel',{p_booking:+d.mkc}); ok='취소했습니다' }
 if(d.mkm){ var m=d.mkm.split('|'); job=rpc('makeup_mark',{p_booking:+m[0],p_status:m[1]}); ok=m[1]+'으로 체크했습니다' }
 if(d.mks){ var q=d.mks.split('|'); if(q[1]==='닫힘'&&!confirm('이 보강 시간을 닫을까요? 신청한 학생의 보강권은 다시 쓸 수 있게 됩니다.')) return; job=rpc('makeup_slot_set',{p_slot:+q[0],p_status:q[1]}); ok=q[1]==='열림'?'열었습니다. 학부모 화면에 보입니다.':'닫았습니다' }
 if(d.mkt){ if(!confirm('이 보강권을 취소할까요?')) return; job=rpc('makeup_ticket_cancel',{p_ticket:+d.mkt}); ok='보강권을 취소했습니다' }
 if(d.mki){ job=rpc('makeup_issue_from_request',{p_request:+d.mki}); ok='보강권을 발급했습니다. 학부모 화면에서 날짜를 고를 수 있습니다.'; after1=function(){ return rpc('staff_requests').then(function(x){S.sreq=x||[]}) } }
 if(d.wls){ var w=d.wls.split('|'); if(w[1]!=='연락함'&&!confirm(w[1]==='등록'?'등록으로 옮길까요? 대기에서 빠집니다.':'대기 명단에서 뺄까요?')) return; job=rpc('waitlist_set',{p_id:+w[0],p_status:w[1]}); ok=w[1]==='등록'?'등록으로 옮겼습니다':w[1]==='취소'?'대기에서 뺐습니다':'연락함으로 표시했습니다' }
 el.disabled=true;
 job.then(function(){ return Promise.all([after1?after1():null, C.role==='parent'?rpc('my_makeup').then(function(x){S.mk=x||[]}):(d.wls?rpc('waitlist_board').then(function(x){S.wl=x}):loadMb())]) })
  .then(function(){ render(); toast(ok) })
  .catch(function(er){ el.disabled=false; toast(er&&er.message?er.message.replace(/^.*?: /,''):'처리하지 못했습니다. 다시 눌러 주세요.') });
}
function onSubmit(e){
 var f=e.target;
 if(f.id==='fSlot'||f.id==='fTicket'||f.id==='fClassOff'||f.id==='fWait'){ e.preventDefault(); if(C.pv){ toast('미리보기에서는 저장하지 않습니다'); return } return sub2(f) }
 if(f.id==='fAsg'){ e.preventDefault(); if(C.pv){ toast('미리보기에서는 보내지 않습니다'); return } asgSend(f); return }
 if(f.id==='fFb'){ e.preventDefault(); if(C.pv){ toast('미리보기에서는 보내지 않습니다'); return } var bb=f.querySelector('button.btn'); bb.disabled=true;
   rpc('feedback_post',{p_class:f.cls.value,p_day:f.day.value,p_body:f.body.value,p_kind:'피드백'}).then(function(r){ toast(r&&r.new?(r.sent?'학부모 '+r.sent+'분께 보냈습니다':'저장했습니다 (앱에 가입한 학부모가 아직 없습니다)'):'고쳐 썼습니다'); S.fbFresh=0; render() }).catch(function(x){ bb.disabled=false; toast(x.message||'보내지 못했습니다') }); return }
 if(f.id!=='fReq'&&f.id!=='fNotice') return; e.preventDefault();
 var b=f.querySelector('button.btn');
 if(f.id==='fReq'&&C.pv){ toast('미리보기에서는 보내지 않습니다'); return }
 if(f.id==='fReq'){
  var k=S.rkind||'결석 알림', day=f.day.value||null, memo=f.memo.value.trim();
  if(k==='결석 알림'){ if(!day) return toast('결석하는 날을 골라 주세요.'); memo='[사유: '+f.why.value+'] '+memo }
  else if(!memo) return toast('내용을 적어 주세요.');
  b.disabled=true;
  rpc('parent_request',{p_child:f.child.value,p_kind:k,p_to:f.to.value,p_method:f.method?f.method.value:null,p_day:day,p_memo:memo.trim()})
   .then(function(){ return rpc('my_requests') }).then(function(x){ S.myreq=x||[]; render(); toast('보냈습니다. 원장님께도 함께 전달됩니다.') })
   .catch(function(er){ b.disabled=false; toast((er&&er.message&&/오늘|자녀|승인/.test(er.message))?er.message:'보내지 못했습니다. 다시 눌러 주세요.') });
 } else {
  var t=f.t.value.trim(); if(!t) return toast('제목을 적어 주세요.');
  b.disabled=true;
  rpc('post_notice',{p_title:t,p_body:f.b.value,p_audience:f.aud.value,p_branch:f.br&&f.br.value?f.br.value:null,p_pinned:f.pin.checked})
   .then(function(){ return rpc('my_notices') }).then(function(x){ S.notices=x||[]; render(); toast('공지를 올렸습니다') })
   .catch(function(){ b.disabled=false; toast('올리지 못했습니다. 다시 눌러 주세요.') });
 }
}

window.JSApp={mount:function(ctx){
 C=ctx; C.real=ctx.role; C.pv=null; S={tab:null,kid:0,branch:'all',rf:'open'};
 var old=document.getElementById('app'); if(old) old.remove(); var rf=document.getElementById('jsRf'); if(rf) rf.remove();
 var root=document.createElement('div'); root.id='app';
 root.innerHTML='<div class="app"><header class="top"><button class="back" id="aBack" hidden>'+I.back+'<span>뒤로</span></button>'+
  '<button class="refresh" id="aRefresh" type="button" aria-label="새로고침" title="새로고침">'+I.refresh+'</button>'+
  '<a class="refresh" id="aHome" href="/?app=1" aria-label="학원 둘러보기" title="학원 둘러보기">'+I.home2+'</a>'+
  '<div class="brand">주니어솔로몬<small id="aRole"></small></div></header><main class="v" id="aView"><p class="sub" style="padding:40px 0;text-align:center">불러오는 중…</p></main><div class="toast" id="aToast"></div></div>';
 document.body.appendChild(root); document.body.classList.add('app-on');
 root.addEventListener('click',onClick); root.addEventListener('submit',onSubmit);
 history.replaceState({jsTab:null},'','');
 window.onpopstate=function(e){ if(!document.getElementById('app')) return; S.asgOpen=null; S.tab=(e.state&&e.state.jsTab)||null; render() };
 clearInterval(window.__jsPoll); window.__jsPoll=setInterval(poll,120000);
 if(!window.__jsVis){ window.__jsVis=1; document.addEventListener('visibilitychange',function(){ if(!document.hidden) poll() }) }
 var keep=''; try{ keep=sessionStorage.getItem('js_tab')||''; sessionStorage.removeItem('js_tab') }catch(x){}
 if(!keep&&location.hash) keep=location.hash.slice(1).replace(/[^a-z]/g,'');
 return load().then(function(){ S.sig=sigOf(); if(keep&&VIEWS[keep]){ S.tab=keep; history.pushState({jsTab:keep},'','') } render(); setTimeout(welcome,400) });
},
 unmount:function(){ clearInterval(window.__jsPoll); var a=document.getElementById('app'); if(a) a.remove(); document.body.classList.remove('app-on') }
};
})();
