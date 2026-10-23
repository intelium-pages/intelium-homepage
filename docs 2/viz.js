// Pausa animações (CSS e SMIL) fora da viewport e retoma ao entrar. Carregado no <helmet> de cada página.
(function () {
  if (window.__vizInit) return; window.__vizInit = true;
  var SEL = 'header, section, article, footer, [data-viz]';
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var el = e.target, off = !e.isIntersecting;
      if (off) el.setAttribute('data-offscreen', ''); else el.removeAttribute('data-offscreen');
      el.querySelectorAll('svg').forEach(function (s) { try { off ? s.pauseAnimations() : s.unpauseAnimations(); } catch (_) {} });
    });
  }, { rootMargin: '160px 0px' });
  var seen = new WeakSet();
  function scan() {
    document.querySelectorAll(SEL).forEach(function (el) {
      if (seen.has(el) || el.closest('nav')) return;
      if (el.parentElement && el.parentElement.closest(SEL)) return; // só blocos de topo
      seen.add(el); io.observe(el);
    });
  }
  var t; var mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(scan, 120); });
  function start() { scan(); mo.observe(document.body, { childList: true, subtree: true }); }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  var st = document.createElement('style');
  st.textContent = '[data-offscreen],[data-offscreen] *{animation-play-state:paused!important}';
  document.head.appendChild(st);
})();
