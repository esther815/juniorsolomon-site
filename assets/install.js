/* 홈 화면에 앱 두기 — 아이폰·안드로이드 버튼 (앱 안이나 이미 설치된 화면에서는 보이지 않음) */
(function(){
'use strict';
var deferred=null, ua=navigator.userAgent||'';
var isIOS=/iphone|ipad|ipod/i.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
var isAnd=/android/i.test(ua), isKakao=/KAKAOTALK/i.test(ua), isSamsung=/SamsungBrowser/i.test(ua), isIOSOther=isIOS&&/CriOS|FxiOS|EdgiOS|NAVER|Whale/i.test(ua);
function inApp(){
  try{
    if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone) return true;
    if(window.Capacitor) return true;
    if(new URLSearchParams(location.search).get('app')==='1'||sessionStorage.getItem('js_inapp')==='1') return true;
    if(document.referrer.indexOf('android-app://')===0) return true;
  }catch(e){}
  return false;
}
var APPLE='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/></svg>';
var ANDROID='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M17.6 9.5l1.6-2.8a.4.4 0 0 0-.7-.4l-1.6 2.8a9.9 9.9 0 0 0-8 0L7.3 6.3a.4.4 0 0 0-.7.4l1.6 2.8A9.4 9.4 0 0 0 3.5 17h17a9.4 9.4 0 0 0-2.9-7.5zM8.2 14.4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm7.6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>';
var SHARE='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style="vertical-align:-4px"><path fill="none" stroke="#2E6BD8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
var DOTS='<b style="font-size:18px;letter-spacing:1px">⋮</b>';

var css='.jsi{border:1px solid #EFEAF1;border-radius:22px;padding:20px;background:#fff;box-shadow:0 1px 2px rgba(62,40,67,.04),0 10px 30px rgba(62,40,67,.06);text-align:left;font-family:"Noto Sans KR",sans-serif;color:#231A26;word-break:keep-all;margin:16px 0}'+
'.jsi b.t{display:block;font-size:16px;font-weight:700}.jsi p{margin:4px 0 14px;font-size:14px;color:#8A7F8E;line-height:1.6}'+
'.jsi .r{display:grid;grid-template-columns:1fr 1fr;gap:10px}'+
'.jsi button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:54px;border-radius:999px;border:1px solid #E3DAE7;background:#fff;color:#3E2843;font:500 15.5px "Noto Sans KR",sans-serif;cursor:pointer;margin:0;width:100%}'+
'.jsi button.me{background:#3E2843;color:#fff;border-color:#3E2843}'+
'.jsi-bg{position:fixed;inset:0;z-index:9999;background:rgba(35,26,38,.4);display:flex;align-items:flex-end;justify-content:center}'+
'.jsi-sh{width:100%;max-width:480px;background:#fff;border-radius:26px 26px 0 0;padding:14px 22px calc(26px + env(safe-area-inset-bottom));font-family:"Noto Sans KR",sans-serif;color:#231A26;word-break:keep-all;animation:jsiup .3s cubic-bezier(.2,.8,.2,1)}'+
'.jsi-sh .g{width:40px;height:4px;border-radius:9px;background:#E3DCE6;margin:0 auto 16px}'+
'.jsi-sh h3{font-family:"Noto Serif KR",serif;font-weight:600;font-size:21px;margin:0 0 4px}.jsi-sh .s{color:#8A7F8E;font-size:14px;margin:0 0 14px}'+
'.jsi-sh ol{list-style:none;margin:0;padding:0;counter-reset:n}.jsi-sh li{counter-increment:n;display:flex;gap:12px;align-items:flex-start;padding:13px 0;border-top:1px solid #EFEAF1;font-size:15.5px;line-height:1.6}'+
'.jsi-sh li:first-child{border-top:0}.jsi-sh li::before{content:counter(n);flex:none;width:28px;height:28px;border-radius:50%;background:#F6F1F8;color:#5F3D66;font-weight:700;font-size:14px;display:grid;place-items:center;margin-top:1px}'+
'.jsi-sh .k{display:inline-block;padding:1px 9px;border:1px solid #E3DAE7;border-radius:8px;background:#FCFAF7;font-weight:700;font-size:14.5px}'+
'.jsi-sh .btn{display:flex;align-items:center;justify-content:center;width:100%;min-height:54px;border:0;border-radius:999px;background:#3E2843;color:#fff;font:500 16px "Noto Sans KR",sans-serif;margin-top:16px;cursor:pointer;text-decoration:none}'+
'.jsi-sh .btn.l{background:#F6F1F8;color:#5F3D66}'+
'.jsi-sh .arrow{display:block;text-align:center;color:#2E6BD8;font-size:13px;margin-top:10px}'+
'@keyframes jsiup{from{transform:translateY(40px);opacity:0}}';
function addCss(){ if(document.getElementById('jsi-css')) return; var s=document.createElement('style'); s.id='jsi-css'; s.textContent=css; document.head.appendChild(s) }

function memberUrl(){ return location.origin+'/member.html' }
function onMember(){ return /\/member\.html$/.test(location.pathname) }
function openExternal(url){ location.href='kakaotalk://web/openExternal?url='+encodeURIComponent(url) }

function sheet(html){
  var bg=document.createElement('div'); bg.className='jsi-bg';
  bg.innerHTML='<div class="jsi-sh" role="dialog" aria-modal="true"><div class="g"></div>'+html+'<button class="btn l" type="button" data-x>닫기</button></div>';
  bg.addEventListener('click',function(e){ if(e.target===bg||e.target.hasAttribute('data-x')) bg.remove() });
  document.body.appendChild(bg); return bg;
}
function iosSheet(){
  if(isKakao){
    return sheet('<h3>아이폰 홈 화면에 두기</h3><p class="s">카카오톡 안에서는 홈 화면에 추가할 수 없습니다. 먼저 사파리로 엽니다.</p>'+
      '<button class="btn" type="button" id="jsiExt">사파리로 열기</button><p class="s" style="margin-top:12px">사파리가 열리면 이 버튼을 다시 눌러 주세요.</p>')
      .querySelector('#jsiExt').addEventListener('click',function(){ openExternal(memberUrl()+'?add=ios') });
  }
  sheet('<h3>아이폰 홈 화면에 두기</h3><p class="s">'+(isIOSOther?'사파리에서 열면 가장 확실합니다. 지금 브라우저에서도 아래 순서로 됩니다.':'사파리에서 세 번만 누르면 왕관 아이콘이 생깁니다.')+'</p><ol>'+
    '<li><span>화면 아래(또는 위)의 <span class="k">'+SHARE+' 공유</span> 버튼을 누릅니다.</span></li>'+
    '<li><span>목록을 올려 <span class="k">홈 화면에 추가</span>를 누릅니다.</span></li>'+
    '<li><span>오른쪽 위 <span class="k">추가</span>를 누르면 끝입니다.</span></li></ol>'+
    '<span class="arrow">공유 버튼은 주소창 옆 네모에 위쪽 화살표 모양입니다</span>');
}
function androidSheet(){
  if(deferred){ deferred.prompt(); deferred.userChoice.then(function(){ deferred=null }); return }
  if(isKakao){
    return sheet('<h3>안드로이드 홈 화면에 두기</h3><p class="s">카카오톡 안에서는 홈 화면에 추가할 수 없습니다. 먼저 크롬으로 엽니다.</p>'+
      '<button class="btn" type="button" id="jsiExt">크롬으로 열기</button><p class="s" style="margin-top:12px">크롬이 열리면 이 버튼을 다시 눌러 주세요.</p>')
      .querySelector('#jsiExt').addEventListener('click',function(){ openExternal(memberUrl()+'?add=android') });
  }
  if(isSamsung) return sheet('<h3>안드로이드 홈 화면에 두기</h3><p class="s">삼성 인터넷에서는 이렇게 합니다.</p><ol>'+
    '<li><span>화면 아래 <span class="k">≡ 메뉴</span>를 누릅니다.</span></li>'+
    '<li><span><span class="k">현재 페이지 추가</span>를 누릅니다.</span></li>'+
    '<li><span><span class="k">홈 화면</span>을 고르면 왕관 아이콘이 생깁니다.</span></li></ol>');
  sheet('<h3>안드로이드 홈 화면에 두기</h3><p class="s">크롬에서는 이렇게 합니다.</p><ol>'+
    '<li><span>오른쪽 위 <span class="k">'+DOTS+'</span> 메뉴를 누릅니다.</span></li>'+
    '<li><span><span class="k">홈 화면에 추가</span> 또는 <span class="k">앱 설치</span>를 누릅니다.</span></li>'+
    '<li><span><span class="k">설치</span>(또는 <span class="k">추가</span>)를 누르면 왕관 아이콘이 생깁니다.</span></li></ol>');
}
function go(kind){
  // 아이폰은 지금 보는 페이지가 아이콘의 시작 화면이 되므로, 회원 화면에서 추가하게 합니다
  if(kind==='ios'&&!onMember()&&!isKakao){ location.href=memberUrl()+'?add=ios'; return }
  kind==='ios'?iosSheet():androidSheet();
}
function card(){
  return '<b class="t">휴대폰 홈 화면에 앱 두기</b><p>왕관 아이콘을 누르면 회원 화면이 바로 열립니다.</p>'+
    '<div class="r"><button type="button" data-k="ios" class="'+(isIOS?'me':'')+'">'+APPLE+'아이폰</button>'+
    '<button type="button" data-k="android" class="'+(isAnd?'me':'')+'">'+ANDROID+'안드로이드</button></div>';
}
function mount(){
  if(inApp()){ document.querySelectorAll('.js-install').forEach(function(el){ el.innerHTML='' }); return }
  addCss();
  document.querySelectorAll('.js-install').forEach(function(el){
    if(el.dataset.on) return; el.dataset.on='1'; el.className+=' jsi'; el.innerHTML=card();
    el.addEventListener('click',function(e){ var b=e.target.closest('[data-k]'); if(b) go(b.dataset.k) });
  });
}
window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); deferred=e });
if('serviceWorker' in navigator){ try{ navigator.serviceWorker.register('/sw.js').catch(function(){}) }catch(e){} }
window.JSInstall={mount:mount,open:go};
function loggedIn(){ try{ return !!localStorage.getItem('sb-gyuuimwalbxsocnamtqk-auth-token') }catch(e){ return false } }
function entryBar(){
  if(!inApp()||onMember()||document.getElementById('jsEntry')||document.getElementById('jsBottom')||/consult/.test(location.pathname)) return;
  var bar=document.createElement('div'); bar.id='jsEntry';
  bar.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:60;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid #EFEAF1;padding:10px 14px calc(10px + env(safe-area-inset-bottom));font-family:"Noto Sans KR",sans-serif';
  var btn='flex:1 1 0!important;min-height:50px!important;border-radius:999px!important;border:1px solid #E3DAE7!important;background:#fff!important;color:#3E2843!important;font:600 15px sans-serif!important;display:flex!important;align-items:center!important;justify-content:center!important;text-decoration:none!important;padding:0!important;margin:0!important;letter-spacing:0!important';
  var main=btn.replace('background:#fff!important;color:#3E2843!important','background:#3E2843!important;color:#fff!important').replace('border:1px solid #E3DAE7!important','border:1px solid #3E2843!important');
  bar.innerHTML=loggedIn()
    ? '<div style="display:flex;gap:8px;max-width:520px;margin:0 auto"><a href="/member.html?as=me" style="'+main+'">✦ 내 화면으로 들어가기</a></div>'
    : '<div style="text-align:center;font-size:12.5px;color:#8A7F8E;margin-bottom:8px">재원생 가족과 선생님은 여기서 들어갑니다</div>'+
      '<div style="display:flex;gap:8px;max-width:520px;margin:0 auto"><a href="/member.html?as=parent" style="'+main+'">학부모</a><a href="/member.html?as=teacher" style="'+btn+'">강사</a><a href="/member.html?as=student" style="'+btn+'">학생</a></div>';
  document.body.appendChild(bar);
  document.body.style.paddingBottom=(bar.offsetHeight+8)+'px';
}
function floatRefresh(){
  if(!inApp()||document.getElementById('app')||document.getElementById('jsRf')) return;
  var b=document.createElement('button'); b.id='jsRf'; b.type='button'; b.setAttribute('aria-label','새로고침');
  b.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22"><path d="M20 11a8 8 0 1 0-2.3 5.7" fill="none" stroke="#5F3D66" stroke-width="2" stroke-linecap="round"/><path d="M20 4.5V11h-6.5" fill="none" stroke="#5F3D66" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var eb=document.getElementById('jsEntry')||document.getElementById('jsBottom'); b.style.cssText='position:fixed;right:16px;bottom:'+(eb?(eb.offsetHeight+14)+'px':'calc(18px + env(safe-area-inset-bottom))')+';z-index:50;width:48px;height:48px;border-radius:50%;border:1px solid #EFEAF1;background:#fff;box-shadow:0 8px 20px rgba(62,40,67,.18);display:grid;place-items:center;cursor:pointer;padding:0';
  b.onclick=function(){ b.firstChild.style.transition='transform .5s'; b.firstChild.style.transform='rotate(360deg)'; setTimeout(function(){ location.reload() },300) };
  document.body.appendChild(b);
}
function floatBack(){
  var fromSite=false; try{ fromSite=!!document.referrer&&new URL(document.referrer).host===location.host }catch(e){}
  if(document.getElementById('app')||document.getElementById('jsBk')||history.length<2) return;
  if(!(inApp()||fromSite)) return;
  var b=document.createElement('button'); b.id='jsBk'; b.type='button'; b.setAttribute('aria-label','이전 화면');
  b.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24"><path d="M15 5l-7 7 7 7" fill="none" stroke="#5F3D66" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var eb=document.getElementById('jsEntry')||document.getElementById('jsBottom'); b.style.cssText='position:fixed;left:16px;bottom:'+(eb?(eb.offsetHeight+14)+'px':'calc(18px + env(safe-area-inset-bottom))')+';z-index:50;width:48px;height:48px;border-radius:50%;border:1px solid #EFEAF1;background:#fff;box-shadow:0 8px 20px rgba(62,40,67,.18);display:grid;place-items:center;cursor:pointer;padding:0';
  b.onclick=function(){ history.back() };
  document.body.appendChild(b);
}
function boot(){
  try{ if(new URLSearchParams(location.search).get('app')==='1') sessionStorage.setItem('js_inapp','1') }catch(e){}
  visit(); ga(); mount(); entryBar(); setTimeout(function(){ floatRefresh(); floatBack() },1500);
  try{ var a=new URLSearchParams(location.search).get('add'); if(a&&!inApp()) setTimeout(function(){ go(a==='android'?'android':'ios') },400) }catch(e){}
}
/* 방문 분석(구글 애널리틱스 GA4): 국내·해외, 지역, 검색엔진, 연령·성별(구글 추정 비율). 측정 ID를 넣으면 켜짐.
   회원 화면(member)·탈퇴 안내에서는 쓰지 않음 — 처음 오는 방문자만 봄. 이름·연락처 등 개인정보는 보내지 않음. */
var GA_ID='';
function ga(){
  try{
    if(!GA_ID||/bot|crawl|spider|slurp|preview|lighthouse|headless/i.test(ua)) return;
    var pg=(location.pathname.split('/').pop()||'index').toLowerCase();
    if(/^(member|account-delete)/.test(pg)) return;
    var s=document.createElement('script'); s.async=true; s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID; document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[]; window.gtag=function(){ dataLayer.push(arguments) };
    gtag('js',new Date()); gtag('config',GA_ID,{page_path:location.pathname,app_mode:inApp()?'app':'web'});
  }catch(e){}
}
function visit(){
  try{
    if(/bot|crawl|spider|slurp|preview|lighthouse|headless/i.test(ua)) return;
    var pg=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'').toLowerCase()||'index';
    var d=new Date(Date.now()+9*3600000).toISOString().slice(0,10), first=false;
    try{ if(localStorage.getItem('js_vday')!==d){ localStorage.setItem('js_vday',d); first=true } }catch(e){}
    var K='sb_publishable_Kj2bX4fe9CRSkhvGzBbaJw_y1ZqkjOz';
    fetch('https://gyuuimwalbxsocnamtqk.supabase.co/rest/v1/rpc/site_ping',{method:'POST',keepalive:true,
      headers:{'Content-Type':'application/json',apikey:K,Authorization:'Bearer '+K},
      body:JSON.stringify({p_page:pg,p_new:first,p_app:inApp()})}).catch(function(){});
  }catch(e){}
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
