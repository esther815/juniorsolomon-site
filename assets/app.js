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
 info:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
 back:'<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>'
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
function nb(n,big){ return n>0?'<span class="nb'+(big?' big':'')+'">'+(n>99?'99+':n)+'</span>':'' }

/* 반 이름 다듬기: 「3학년 하브루타 독서토론_장화연원장 (화4:30)」 → 「3학년 하브루타 독서토론」 */
function cname(n){ var s=String(n||'').replace(/\s*\([^)]*\)\s*$/,''); if(s.indexOf('_')>0) s=s.replace(/_[^_]*$/,''); s=s.trim(); if(/^(\d학년|\d세|[1-6]학년)$/.test(s)) s+=' 반'; return s||String(n||'') }
function who(c){ if(/원장/.test(c.name||'')) return '원장 직강'; return c.teacher?c.teacher+' 선생님':'' }
function when(c){ return c.weekday==null?'':DAYS[c.weekday]+'요일 '+hm12(c.starts) }
function stCls(s){ return s==='출석'?'ok':s==='지각'?'late':s==='결석'?'abs':'etc' }
function stTag(s){ return '<span class="tag '+({'출석':'ok','지각':'y','결석':'warn'}[s]||'g')+'">'+esc(s)+'</span>' }

/* ── 역할별 첫 화면 버튼 ── */
function tilesFor(role){
 var T={
  parent:[['today','오늘 우리 아이','출결·다음 수업',I.home],['notice','공지','학원 소식',I.bell],['time','시간표','수업 요일·예약',I.cal],
          ['req','보강·상담','결석 알림·상담 신청',I.chat],['att','출결 기록','달력으로 한눈에',I.check],['mine','내 정보','자녀 추가·로그아웃',I.me]],
  teacher:[['tboard','내 반 출결','반별 학생·최근 출결',I.users],['sreq','받은 상담','학부모가 보낸 신청',I.chat],['notice','공지','학원 소식',I.bell]],
  desk:[['approve','가입 승인','학부모 가입 확인',I.check],['sreq','상담·요청','앱 요청·홈페이지 상담',I.chat],['board','반별 정원','마감·모집',I.users],['notice','공지','올리기·보기',I.send]],
  manager:[['over','한눈에 현황','우리 지점',I.chart],['approve','가입 승인','학부모 가입 확인',I.check],['sreq','상담·요청','앱 요청·홈페이지 상담',I.chat],
           ['board','반별 정원','마감·모집',I.users],['notice','공지','올리기·보기',I.send]],
  admin:[['over','한눈에 현황','지점별 비교',I.chart],['approve','가입 승인','학부모·직원 확인',I.check],['sreq','상담·요청','앱 요청·홈페이지 상담',I.chat],
         ['me','반별·출석부','정원·자료 올리기',I.users],['notice','공지','올리기·보기',I.send],['set','직원·설정','초대·알림·테스터',I.gear]]
 };
 return T[role]||[];
}
var LABEL={parent:'For Parents',teacher:'Teacher',desk:'Office',manager:'Branch',admin:'Director'};
var TITLE={today:'오늘 우리 아이',notice:'공지',time:'시간표',req:'보강·상담',att:'출결 기록',mine:'내 정보',tboard:'내 반 출결',sreq:'상담·요청',
           approve:'가입 승인',board:'반별 정원',over:'한눈에 현황',me:'반별·출석부',set:'직원·설정'};

function badge(k){
 if(k==='notice') return (S.notices||[]).filter(function(n){return !n.read}).length;
 if(k==='sreq') return (S.sreq||[]).filter(function(r){return r.status==='접수'}).length+(C.role==='teacher'?0:sum('consults'));
 if(k==='approve') return sum('pending');
 if(k==='req') return 0;
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
    '<button class="bell" data-go="notice" aria-label="공지 '+un+'건">'+I.bell+nb(un,true)+'</button></div>';
 h+='<div id="pushSlot"></div>'+summary();
 h+='<div class="tiles">'+tilesFor(r).map(function(t,i){ return '<button class="tile t'+i+'" data-go="'+t[0]+'">'+nb(badge(t[0]))+'<div class="ti">'+t[3]+'</div><div><b>'+t[1]+'</b><span class="s">'+t[2]+'</span></div></button>' }).join('')+'</div>';
 if(r!=='parent') h+='<div style="margin-top:18px">'+C.L.installBox()+'</div>';
 h+=foot(r!=='parent');
 return h;
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
 var minMon=addDays(t.day,-118).slice(0,7);
 var list=Object.keys(A).filter(function(d){return d.slice(0,7)===mon}).sort().reverse();
 var cnt=function(s){return list.filter(function(d){return A[d]===s}).length};
 h+='<div class="card hl"><p class="sub">'+esc(k.name)+' · '+y+'년 '+m+'월</p><div class="row" style="margin-top:4px"><b class="big" style="font-size:26px">'+(cnt('출석')+cnt('지각'))+'/'+list.length+'회 출석</b><span class="sub">지각 포함</span></div></div>';
 h+='<div class="card"><div class="row"><button class="sm" data-mon="'+addDays(first,-1).slice(0,7)+'"'+(mon<=minMon?' disabled':'')+'>‹ 이전 달</button><b style="font-family:\'Noto Serif KR\',serif">'+m+'월</b><button class="sm" data-mon="'+addDays(first,days).slice(0,7)+'"'+(mon>=t.day.slice(0,7)?' disabled':'')+'>다음 달 ›</button></div>';
 h+='<div class="cal">'+'일월화수목금토'.split('').map(function(d){return '<div class="h">'+d+'</div>'}).join('');
 for(var i=0;i<lead;i++) h+='<div class="d x">.</div>';
 for(var d=1;d<=days;d++){ var ds=mon+'-'+(d<10?'0':'')+d, s=A[ds], cls='d';
  if(s) cls+=' s-'+stCls(s); else if(wds.indexOf(wd(ds))>=0&&ds>=t.day) cls+=' sch';
  if(ds===t.day) cls+=' today';
  h+='<div class="'+cls+'" title="'+esc(s||'')+'">'+d+(s?'<i></i>':'')+'</div>' }
 h+='</div><div class="legend"><span><i style="background:#3E8A62"></i>출석</span><span><i style="background:#C9A227"></i>지각</span><span><i style="background:#B9573A"></i>결석</span><span><i style="background:#9C94A0"></i>기타</span><span><i style="background:#fff;outline:1px dashed #CDBBD6"></i>수업 예정</span></div></div>';
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
 var k=S.rkind||'결석 알림';
 h+='<div class="card"><h3>보내기</h3><form id="fReq">'+
   (kids.length>1?'<label class="l">자녀</label><select name="child">'+kids.map(function(x,i){return '<option value="'+esc(x.id)+'"'+(i===S.kid?' selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select>':'<input type="hidden" name="child" value="'+esc(kids[0].id)+'">')+
   '<label class="l">무엇을 보낼까요?</label><div class="seg" style="margin:0">'+['결석 알림','보강 문의','상담 신청'].map(function(x){return '<button type="button" class="sm'+(x===k?' on':'')+'" data-rk="'+x+'">'+x+'</button>'}).join('')+'</div>'+
   '<label class="l">누구에게 보낼까요?</label><select name="to"><option value="담임">담임 선생님</option><option value="원장">원장님</option><option value="관리자">관리자 (행정·교습비)</option></select>'+
   '<label class="l">'+(k==='결석 알림'?'결석하는 날':'희망 날짜')+'</label><input name="day" type="date" min="'+kst().day+'">'+
   (k==='결석 알림'?'<label class="l">사유</label><select name="why"><option>병결</option><option>학교 행사</option><option>개인 사정</option><option>기타</option></select>':'<label class="l">편한 연락 방법</label><select name="method"><option>전화</option><option>카톡</option><option>방문</option></select>')+
   '<label class="l">내용</label><textarea name="memo" placeholder="'+(k==='결석 알림'?'선생님께 전할 말씀이 있으면 적어 주세요.':'궁금하신 점을 적어 주세요.')+'"></textarea>'+
   '<div style="margin-top:16px"><button class="btn">보내기</button></div></form></div>';
 var mine=S.myreq||[];
 h+='<div class="card"><h3>보낸 신청</h3>'+(mine.length?'<div class="list">'+mine.map(function(r){return '<div><span>'+esc(r.kind)+' · '+esc(r.child)+'<br><span class="sub">'+tName(r)+(r.day?' · '+md(r.day):'')+' · '+ago(r.created_at)+'</span></span>'+reqTag(r.status)+'</div>'}).join('')+'</div>':'<p class="sub">아직 보낸 신청이 없습니다.</p>')+'</div>';
 return h+tip('보낸 신청은 받는 분과 원장님께 함께 전달됩니다. 보강 날짜를 앱에서 바로 고르는 기능은 다음 단계에서 열립니다.');
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
 var L=S.notices||[];
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
   (r.status==='완료'?'':'<div class="row" style="justify-content:flex-start;gap:8px;margin-top:14px">'+(r.status==='접수'?'<button class="sm" data-rs="'+r.id+'|확인">확인했어요</button>':'')+'<button class="sm on" data-rs="'+r.id+'|완료">처리 완료</button></div>')+'</div>' }).join('')
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
function vSet(){
 return '<h2>직원·설정</h2><div class="card"><h3>초대 링크</h3><p class="sub" style="margin-bottom:12px">링크를 받은 사람이 카카오로 가입하면 원장님 승인 뒤 화면이 열립니다.</p>'+
  '<button class="btn ghost" id="tinv" type="button">강사 초대 링크 만들기</button><div id="tinvm"></div>'+
  '<div style="height:10px"></div><button class="btn ghost" id="dinv" type="button">관리자(데스크) 초대 링크 만들기</button><div id="dinvm"></div></div>'+
  '<div class="card"><h3>알림</h3><button class="btn ghost" id="kak" type="button">카톡 알림 연결 (승인·상담 알림)</button><div id="kakm"></div></div>'+
  '<div class="card"><h3>미리보기</h3><button class="btn ghost" id="pv" type="button">학부모 가입 화면 미리보기</button></div>'+
  '<div class="legacy"><div id="beta"></div><div id="usage"></div></div>';
}

/* ── 알림음 (앱이 열려 있을 때) ── */
var SND={ding:'띵동',twinkle:'반짝',bell:'종소리',pop:'톡'}, AC=null;
function sndPref(){ try{ var v=JSON.parse(localStorage.getItem('js_snd')||'null'); if(v&&SND[v.s]) return v }catch(e){} return {on:true,s:'ding'} }
function sndSave(v){ try{ localStorage.setItem('js_snd',JSON.stringify(v)) }catch(e){} }
function ac(){ try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume(); }catch(e){ AC=null } return AC }
function tone(c,f,t0,dur,vol,type){ var o=c.createOscillator(), g=c.createGain(); o.type=type||'sine'; o.frequency.value=f;
 g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(vol,t0+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
 o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0+dur+0.05) }
function playSnd(name){ var c=ac(); if(!c) return; var t=c.currentTime+0.02;
 if(name==='ding'){ tone(c,1318.5,t,0.9,0.28); tone(c,2637,t,0.5,0.05); tone(c,1046.5,t+0.32,1.3,0.26); tone(c,2093,t+0.32,0.7,0.05) }
 else if(name==='twinkle'){ [1568,1976,2349,3136].forEach(function(f,i){ tone(c,f,t+i*0.09,0.6,0.16,'triangle') }) }
 else if(name==='bell'){ [[880,1.6,.22],[1760,1.1,.08],[2640,.8,.05],[1318.5,1.4,.07]].forEach(function(x){ tone(c,x[0],t,x[1],x[2]) }) }
 else { tone(c,660,t,0.18,0.3); tone(c,990,t+0.07,0.22,0.18) } }
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
  var typing=document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName); if(!typing) render() }).catch(function(){}) }
function sndCard(){ var p=sndPref();
 return '<div class="card"><div class="row"><div><h3 style="margin:0">알림음</h3><p class="sub">앱을 열어 두면 새 소식에 울립니다</p></div>'+
  '<button class="sm'+(p.on?' on':'')+'" data-snd-on="1">'+(p.on?'켜짐':'꺼짐')+'</button></div>'+
  '<div class="seg" style="margin:14px 0 0;flex-wrap:wrap;overflow:visible">'+Object.keys(SND).map(function(k){return '<button class="sm'+(p.s===k?' on':'')+'" data-snd="'+k+'">♪ '+SND[k]+'</button>'}).join('')+'</div></div>' }

/* ── 큰 별 알림 (앱이 열려 있을 때) ── */
var STAR='<svg viewBox="-120 -120 240 240" width="150" height="150"><defs><radialGradient id="sg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFF6D6"/><stop offset=".55" stop-color="#E8C980"/><stop offset="1" stop-color="#B8975A"/></radialGradient></defs><path d="M0,-118 C11,-28 28,-11 118,0 C28,11 11,28 0,118 C-11,28 -28,11 -118,0 C-28,-11 -11,-28 0,-118 Z" fill="url(#sg)"/></svg>';
function starAlert(title, body){
 var old=document.getElementById('jsStar'); if(old) old.remove();
 var el=document.createElement('div'); el.id='jsStar'; el.className='star-bg';
 el.innerHTML='<div class="star-box"><div class="star-big">'+STAR+'</div><span class="sp s1"></span><span class="sp s2"></span><span class="sp s3"></span>'+
  '<b>'+esc(title)+'</b>'+(body?'<p>'+esc(body)+'</p>':'')+'<button type="button" class="btn">확인</button></div>';
 el.addEventListener('click',function(e){ if(e.target===el||e.target.tagName==='BUTTON') el.remove() });
 (document.getElementById('app')||document.body).appendChild(el);
 var p=sndPref(); if(p.on) playSnd(p.s);
 try{ navigator.vibrate&&navigator.vibrate([80,60,80,60,220]) }catch(e){}
}
navigator.serviceWorker&&navigator.serviceWorker.addEventListener('message',function(e){
 if(e.data&&e.data.jsPush&&!document.hidden){ starAlert(e.data.title,e.data.body); if(window.JSApp&&C) load().then(function(){ S.sig=sigOf(); render() }) }
});

/* ── 휴대폰 푸시 알림 받기 (원장) ── */
function pushSupported(){ return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window }
function iosNotInstalled(){ var ios=/iphone|ipad|ipod/i.test(navigator.userAgent); return ios&&!(navigator.standalone||matchMedia('(display-mode: standalone)').matches) }
function b64(u){ var p='='.repeat((4-u.length%4)%4), s=atob((u+p).replace(/-/g,'+').replace(/_/g,'/')), a=new Uint8Array(s.length); for(var i=0;i<s.length;i++) a[i]=s.charCodeAt(i); return a }
function pushState(){
 if(C.role!=='admin') return Promise.resolve('none');
 if(iosNotInstalled()) return Promise.resolve('ios');
 if(!pushSupported()) return Promise.resolve('unsupported');
 if(Notification.permission==='denied') return Promise.resolve('denied');
 return navigator.serviceWorker.getRegistration('/').then(function(r){ return r?r.pushManager.getSubscription():null }).then(function(s){ return s&&Notification.permission==='granted'?'on':'off' }).catch(function(){ return 'off' });
}
function pushCard(st){
 if(st==='none'||st==='on') return '';
 var msg={off:'승인 대기·상담 신청이 오면 휴대폰 잠금 화면에 별 알림이 뜹니다.',
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
  return C.sb.functions.invoke('kakao-alert',{body:{action:'push_test'}});
 }).then(function(){ toast('연결했습니다. 시험 알림을 보냈습니다'); render() })
 .catch(function(e){ btn.disabled=false; btn.textContent='휴대폰 알림 받기'; toast(String(e&&e.message)==='denied'?'알림을 허용해야 받을 수 있습니다':'연결하지 못했습니다. 다시 눌러 주세요') });
}

/* ── 화면 그리기 ── */
var VIEWS={today:vToday,notice:vNotice,time:vTime,req:vReq,att:vAtt,mine:vMine,sreq:vSreq,over:vOver,set:vSet,
 tboard:function(){return '<h2>내 반 출결</h2><div class="legacy"><div id="tboard"></div></div>'+tip('학생 정보는 캡처하거나 학원 밖으로 옮기지 않습니다.')},
 approve:function(){return '<h2>가입 승인</h2><div class="legacy"><div id="admin"></div></div>'},
 board:function(){return '<h2>반별 정원</h2><div class="legacy"><div id="board"></div></div>'},
 me:function(){return '<h2>반별·출석부</h2><div class="legacy"><div id="me"></div></div>'}};

function render(){
 var v=$('#aView'), back=$('#aBack');
 $('#aRole').textContent=S.tab?TITLE[S.tab]:LABEL[C.role]; $('#aRole').className=S.tab?'ko':'';
 back.hidden=!S.tab;
 v.innerHTML=S.tab?(VIEWS[S.tab]||home)():home();
 after();
}
function after(){
 var t=S.tab, L=C.L;
 if(!t){ if(C.role!=='parent') L.bindInstall(); bindLogout();
   pushState().then(function(st){ var sl=$('#pushSlot'); if(!sl) return; sl.innerHTML=pushCard(st); var b=$('#pushOn'); if(b) b.onclick=function(){ pushOn(b) }; var i=$('#pushIos'); if(i) i.onclick=function(){ window.JSInstall&&JSInstall.open('ios') } });
   return }
 if(t==='notice'){ var un=(S.notices||[]).filter(function(n){return !n.read}).map(function(n){return n.id}); if(un.length) rpc('mark_notices_read',{p_ids:un}).then(function(){ (S.notices||[]).forEach(function(n){n.read=true}) }).catch(function(){}) }
 if(t==='sreq'&&C.role!=='teacher') L.consults();
 if(t==='tboard') L.teacherBoard();
 if(t==='approve') L.admin(C.role==='admin');
 if(t==='board') L.classBoard();
 if(t==='me') L.meBoard();
 if(t==='set'){ L.inviteBtn('tinv','tinvm','new_teacher_invite','t','강사'); L.inviteBtn('dinv','dinvm','new_desk_invite','d','관리자'); L.kakaoSetup(); L.betaList(); L.usage();
   $('#pv').onclick=function(){ L.openForm(null,true) } }
 if(t==='mine'){ L.bindInstall(); bindLogout();
   C.sb.from('children').select('*').eq('parent_id',C.p.id).order('created_at').then(function(r){ var kids=r.data||[], KST={pending:'승인 대기',approved:'승인',rejected:'확인 필요'};
     var el=$('#kidsList'); if(el) el.innerHTML=kids.map(function(k){return '<div><span>'+esc(k.name)+'<br><span class="sub">'+esc(k.grade||'')+' · '+esc(k.school||'')+'</span></span><span class="tag '+(k.status==='approved'?'ok':'y')+'">'+KST[k.status]+'</span></div>'}).join('')||'<div><span class="sub">등록된 자녀가 없습니다.</span></div>';
     $('#editKids').onclick=function(){ L.openForm(kids) } }) }
}
function bindLogout(){ C.L.bindLogout() }
function go(t){ S.tab=t; history.pushState({jsTab:t},'',''); render(); window.scrollTo(0,0) }

function load(){
 var r=C.role, jobs=[rpc('my_notices').then(function(d){S.notices=d||[]}).catch(function(){S.notices=[]})];
 if(r==='parent'){ jobs.push(rpc('my_children').then(function(d){S.kids=d||[]}).catch(function(){S.kids=[]}));
                   jobs.push(rpc('my_requests').then(function(d){S.myreq=d||[]}).catch(function(){S.myreq=[]})) }
 else { jobs.push(rpc('staff_requests').then(function(d){S.sreq=d||[]}).catch(function(){S.sreq=[]})) }
 if(r==='admin'||r==='manager'||r==='desk') jobs.push(rpc('branch_overview').then(function(d){S.over=d||[]}).catch(function(){S.over=[]}));
 return Promise.all(jobs);
}

function onClick(e){
 ac();
 var el=e.target.closest('[data-go],[data-kid],[data-br],[data-mon],[data-rk],[data-rf],[data-rs],[data-delnotice],[data-snd],[data-snd-on],#aBack'); if(!el) return;
 if(el.id==='aBack'){ history.back(); return }
 var d=el.dataset;
 if(d.go){ go(d.go); return }
 if(d.snd){ var p=sndPref(); p.s=d.snd; p.on=true; sndSave(p); playSnd(p.s); render(); return }
 if(d.sndOn){ var q=sndPref(); q.on=!q.on; sndSave(q); if(q.on) playSnd(q.s); render(); toast(q.on?'알림음을 켰습니다':'알림음을 껐습니다'); return }
 if(d.kid!=null){ S.kid=+d.kid; S.mon=null; render(); return }
 if(d.br){ S.branch=d.br; render(); return }
 if(d.mon){ S.mon=d.mon; render(); return }
 if(d.rk){ S.rkind=d.rk; render(); return }
 if(d.rf){ S.rf=d.rf; render(); return }
 if(d.rs){ var a=d.rs.split('|'); el.disabled=true;
   rpc('set_request_status',{p_id:+a[0],p_status:a[1]}).then(function(){ return rpc('staff_requests') }).then(function(x){ S.sreq=x||[]; render(); toast(a[1]==='완료'?'처리 완료로 표시했습니다':'확인으로 표시했습니다') })
   .catch(function(){ el.disabled=false; toast('처리하지 못했습니다. 다시 눌러 주세요.') }); return }
 if(d.delnotice){ if(!confirm('이 공지를 지울까요?')) return; el.disabled=true;
   rpc('delete_notice',{p_id:+d.delnotice}).then(function(){ return rpc('my_notices') }).then(function(x){ S.notices=x||[]; render(); toast('지웠습니다') })
   .catch(function(){ el.disabled=false; toast('지우지 못했습니다.') }); return }
}
function onSubmit(e){
 var f=e.target; if(f.id!=='fReq'&&f.id!=='fNotice') return; e.preventDefault();
 var b=f.querySelector('button.btn');
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
 C=ctx; S={tab:null,kid:0,branch:'all',rf:'open'};
 var old=document.getElementById('app'); if(old) old.remove();
 var root=document.createElement('div'); root.id='app';
 root.innerHTML='<div class="app"><header class="top"><button class="back" id="aBack" hidden>'+I.back+'<span>뒤로</span></button>'+
  '<div class="brand">주니어솔로몬<small id="aRole"></small></div></header><main class="v" id="aView"><p class="sub" style="padding:40px 0;text-align:center">불러오는 중…</p></main><div class="toast" id="aToast"></div></div>';
 document.body.appendChild(root); document.body.classList.add('app-on');
 root.addEventListener('click',onClick); root.addEventListener('submit',onSubmit);
 history.replaceState({jsTab:null},'','');
 window.onpopstate=function(e){ if(!document.getElementById('app')) return; S.tab=(e.state&&e.state.jsTab)||null; render() };
 clearInterval(window.__jsPoll); window.__jsPoll=setInterval(poll,60000);
 if(!window.__jsVis){ window.__jsVis=1; document.addEventListener('visibilitychange',function(){ if(!document.hidden) poll() }) }
 return load().then(function(){ S.sig=sigOf(); render() });
},
 unmount:function(){ clearInterval(window.__jsPoll); var a=document.getElementById('app'); if(a) a.remove(); document.body.classList.remove('app-on') }
};
})();
