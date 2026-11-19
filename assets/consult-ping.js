// 상담 요청 알림: 전화·문자/카톡·카카오톡 채널 버튼을 누르거나 상담을 신청하면 원장님 카톡으로 알림
(function () {
  var URL = 'https://gyuuimwalbxsocnamtqk.supabase.co/rest/v1/rpc/consult_ping';
  var KEY = 'sb_publishable_Kj2bX4fe9CRSkhvGzBbaJw_y1ZqkjOz';
  function send(kind, wish, name, phone) {
    return fetch(URL, { method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY },
      body: JSON.stringify({ p_kind: kind, p_wish: wish || null, p_name: name || null, p_phone: phone || null, p_page: location.pathname.replace(/^\//, '') || 'index' })
    }).then(function (r) { return r.ok ? r.json() : 'error'; }).catch(function () { return 'error'; });
  }
  function recent(k, min) { try { var t = +localStorage.getItem('jscp_' + k) || 0; return Date.now() - t < min * 60000; } catch (e) { return false; } }
  function mark(k) { try { localStorage.setItem('jscp_' + k, String(Date.now())); } catch (e) {} }
  window.jsConsult = function (kind, wish, name, phone) { mark('form'); return send(kind, wish, name, phone); };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    var kind = /^tel:/i.test(h) ? 'tel' : /^sms:/i.test(h) ? 'sms' : /pf\.kakao\.com/i.test(h) ? 'kakao' : '';
    if (!kind || recent(kind, 10) || (kind === 'kakao' && recent('form', 10))) return;
    mark(kind);
    send(kind, window.JS_CONSULT_WISH || '');
  }, true);
})();
