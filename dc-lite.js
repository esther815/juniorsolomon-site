/* 주니어솔로몬 홈페이지 — 경량 템플릿 렌더러 (sc-if / sc-for / {{ }} / onX) */
(function () {
  'use strict';
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  function lookup(scope, path) {
    var parts = path.trim().split('.');
    var v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function single(str) {
    var m = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(str || '');
    return m ? m[1] : null;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) {
      var v = lookup(scope, p);
      return v == null ? '' : String(v);
    });
  }
  function kebab(k) { return k.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); }); }
  function styleStr(o) {
    var out = [];
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k) && o[k] != null) out.push(kebab(k) + ':' + o[k]);
    return out.join(';');
  }
  function child(scope, name, val) {
    var s = Object.create(scope);
    s[name] = val;
    return s;
  }
  function processNodes(nodes, scope, out) {
    for (var i = 0; i < nodes.length; i++) processNode(nodes[i], scope, out);
  }
  function processNode(node, scope, out) {
    if (node.nodeType === 3) {
      out.appendChild(document.createTextNode(node.nodeValue.indexOf('{{') >= 0 ? interp(node.nodeValue, scope) : node.nodeValue));
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'sc-if') {
      var p = single(node.getAttribute('value'));
      var ok = p ? lookup(scope, p) : false;
      if (ok) processNodes(node.childNodes, scope, out);
      return;
    }
    if (tag === 'sc-for') {
      var lp = single(node.getAttribute('list'));
      var as = node.getAttribute('as') || 'item';
      var list = lp ? lookup(scope, lp) : null;
      if (list && list.length) {
        for (var j = 0; j < list.length; j++) processNodes(node.childNodes, child(scope, as, list[j]), out);
      }
      return;
    }
    var el = node.namespaceURI === 'http://www.w3.org/2000/svg'
      ? document.createElementNS(node.namespaceURI, node.localName)
      : document.createElement(node.localName);
    var attrs = node.attributes;
    for (var a = 0; a < attrs.length; a++) {
      var name = attrs[a].name, val = attrs[a].value;
      if (name.indexOf('hint-placeholder') === 0) continue;
      if (/^on[a-z]+$/.test(name)) {
        var fp = single(val);
        var fn = fp ? lookup(scope, fp) : null;
        if (typeof fn === 'function') el.addEventListener(name.slice(2), fn);
        continue;
      }
      if (val.indexOf('{{') >= 0) {
        var sp = single(val);
        if (sp) {
          var v = lookup(scope, sp);
          if (name === 'style' && v && typeof v === 'object') { el.setAttribute('style', styleStr(v)); continue; }
          if (v === false || v == null) continue;
          if (v === true) { el.setAttribute(name, ''); continue; }
          el.setAttribute(name, String(v));
          continue;
        }
        el.setAttribute(name, interp(val, scope));
        continue;
      }
      el.setAttribute(name, val);
    }
    var kids = node.localName === 'template' ? node.content.childNodes : node.childNodes;
    processNodes(kids, scope, el);
    out.appendChild(el);
  }

  function boot() {
    var tpl = document.getElementById('dc-tpl');
    var scriptEl = document.querySelector('script[data-dc-script]');
    if (!tpl || !scriptEl) return;
    var root = document.createElement('div');
    root.id = 'dc-root';
    tpl.parentNode.insertBefore(root, tpl);
    var defaults = {};
    try {
      var decl = JSON.parse(scriptEl.getAttribute('data-props') || '{}');
      for (var k in decl) if (k.charAt(0) !== '$' && decl[k] && 'default' in decl[k]) defaults[k] = decl[k]['default'];
    } catch (e) {}
    function DCLogic(props) { this.props = props || {}; this.state = {}; }
    DCLogic.prototype.setState = function (patch) {
      var next = typeof patch === 'function' ? patch(this.state) : patch;
      for (var k in next) this.state[k] = next[k];
      render();
    };
    var Component;
    try {
      Component = new Function('DCLogic', scriptEl.textContent + '\n;return Component;')(DCLogic);
    } catch (e) { console.error(e); return; }
    var inst = new Component(defaults);
    if (!inst.props) inst.props = defaults;
    if (!inst.state) inst.state = {};
    if (!inst.setState) inst.setState = DCLogic.prototype.setState;
    function render() {
      var keep = {};
      root.querySelectorAll('input[id], textarea[id], select[id]').forEach(function (i) {
        keep[i.id] = i.type === 'checkbox' || i.type === 'radio' ? { c: i.checked } : { v: i.value };
      });
      var openDetails = {};
      root.querySelectorAll('details').forEach(function (d, idx) { if (d.open) openDetails[idx] = true; });
      var focusId = document.activeElement && document.activeElement.id;
      var vals = {};
      try { vals = inst.renderVals() || {}; } catch (e) { console.error(e); }
      var frag = document.createDocumentFragment();
      processNodes(tpl.content.childNodes, vals, frag);
      var y = window.scrollY;
      root.textContent = '';
      root.appendChild(frag);
      for (var id in keep) {
        var el = document.getElementById(id);
        if (!el) continue;
        if ('c' in keep[id]) el.checked = keep[id].c; else el.value = keep[id].v;
      }
      root.querySelectorAll('details').forEach(function (d, idx) { if (openDetails[idx]) d.open = true; });
      if (focusId) { var f = document.getElementById(focusId); if (f && f.focus) f.focus({ preventScroll: true }); }
      window.scrollTo(0, y);
    }
    render();
    if (location.hash) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) t.scrollIntoView();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
