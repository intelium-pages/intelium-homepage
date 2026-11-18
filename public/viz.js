// Performance compartilhada: pausa animações fora da tela (por bloco e por SVG), pausa com a aba oculta,
// respeita prefers-reduced-motion e pré-carrega páginas internas ao passar o mouse/tocar no link.
(function () {
  if (window.__vizInit) return; window.__vizInit = true;
  // View transitions entre páginas: silencia a rejeição quando o navegador pula a transição (reload, iframe, navegação inelegível).
  function quiet(e) {
    var vt = e && e.viewTransition; if (!vt) return;
    if (window.top !== window) { try { vt.skipTransition(); } catch (_) {} }
    ['finished', 'ready', 'updateCallbackDone'].forEach(function (k) { if (vt[k] && vt[k].catch) vt[k].catch(function () {}); });
  }
  window.addEventListener('pagereveal', quiet);
  window.addEventListener('pageswap', quiet);
  // Só no site publicado (janela de topo): ativa a transição suave entre páginas.
  if (window.top === window && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var vt = document.createElement('style');
    vt.textContent = '@view-transition{navigation:auto}::view-transition-old(root),::view-transition-new(root){animation-duration:.2s;animation-timing-function:cubic-bezier(.2,.7,.2,1)}nav.nav{view-transition-name:site-nav}::view-transition-group(site-nav),::view-transition-new(site-nav){animation:none}::view-transition-old(site-nav){display:none}';
    (document.head || document.documentElement).appendChild(vt);
  }
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SEL = 'header, section, article, footer, [data-viz]';
  function setSvg(s, on) { try { on && !RM && !document.hidden ? s.unpauseAnimations() : s.pauseAnimations(); } catch (_) {} }
  function mark(el, off) { if (off) el.setAttribute('data-offscreen', ''); else el.removeAttribute('data-offscreen'); }
  var vis = new WeakMap();
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var el = e.target, on = e.isIntersecting; vis.set(el, on);
      if (el.tagName === 'svg') { setSvg(el, on); mark(el, !on); }
      else mark(el, !on);
    });
  }, { rootMargin: '600px 0px' });
  var seen = new WeakSet();
  function scan() {
    document.querySelectorAll(SEL).forEach(function (el) {
      if (seen.has(el) || el.closest('nav')) return;
      if (el.parentElement && el.parentElement.closest(SEL)) return;
      seen.add(el); io.observe(el);
    });
    document.querySelectorAll('svg').forEach(function (s) {
      if (seen.has(s) || s.closest('nav')) return;
      if (!s.querySelector('animate,animateMotion,animateTransform,[style*="animation"]')) return;
      seen.add(s); io.observe(s); if (RM) setSvg(s, false);
    });
  }
  var t; var mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(scan, 100); });
  function start() { scan(); mo.observe(document.body, { childList: true, subtree: true }); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  document.addEventListener('visibilitychange', function () {
    document.querySelectorAll('svg').forEach(function (s) { if (seen.has(s)) setSvg(s, vis.get(s) !== false); });
  });
  var st = document.createElement('style');
  st.textContent = '[data-offscreen],[data-offscreen] *{animation-play-state:paused!important}';
  document.head.appendChild(st);

  // Pré-carregamento de páginas internas (fallback para navegadores sem Speculation Rules).
  var supportsSR = HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules');
  if (!supportsSR) {
    var done = new Set();
    var pre = function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var u; try { u = new URL(a.href, location.href); } catch (_) { return; }
      if (u.origin !== location.origin || u.pathname === location.pathname || done.has(u.pathname)) return;
      done.add(u.pathname);
      var l = document.createElement('link'); l.rel = 'prefetch'; l.href = u.pathname + u.search; document.head.appendChild(l);
    };
    document.addEventListener('pointerenter', pre, { capture: true, passive: true });
    document.addEventListener('touchstart', pre, { capture: true, passive: true });
  }
})();
