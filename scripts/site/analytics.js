/* Intelium · medição do site (Google Analytics 4) com consentimento (LGPD).
   Fonte: scripts/site/analytics.js. O build (scripts/postbuild.mjs) copia este
   arquivo para out/analytics.js e o referencia em todas as páginas.

   - Nada do Google é carregado antes de o visitante aceitar o aviso de cookies.
   - A escolha fica guardada por 12 meses (localStorage, chave il_consent).
   - Eventos enviados, sem nenhum dado pessoal:
       generate_lead  form_type=contato     formulário de contato gravado
       sign_up        method=newsletter     assinatura da newsletter gravada
       contact_click  method=telefone|email clique em telefone ou e-mail
   - window.InteliumConsent.open() reabre o aviso para o visitante mudar a escolha. */
(function () {
  "use strict";

  const TAG_ID = "GTM-W48G224G"; // tag do Google do fluxo "Site intelium.ai" (GA4 G-ZTHPL4J2MH)
  const SITE_ENV = "__SITE_ENV__"; // trocado no build: "prd" ou "dsv"
  const KEY = "il_consent";
  const MAX_AGE = 365 * 24 * 60 * 60 * 1000;
  const lang = (document.documentElement.lang || "pt-BR").toLowerCase().indexOf("en") === 0 ? "en" : "pt-BR";
  const TEXT = {
    "pt-BR": {
      label: "Aviso de cookies",
      body: "Usamos cookies de medição (Google Analytics) para entender como o site é usado e melhorar o conteúdo. Nenhum dado é usado para publicidade.",
      accept: "Aceitar",
      refuse: "Recusar",
    },
    en: {
      label: "Cookie notice",
      body: "We use measurement cookies (Google Analytics) to understand how the site is used and improve its content. No data is used for advertising.",
      accept: "Accept",
      refuse: "Decline",
    },
  }[lang];

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  // O site de teste marca o próprio tráfego como interno, para poder ser filtrado no GA4.
  if (SITE_ENV === "dsv") gtag("set", { traffic_type: "internal" });

  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && (saved.v === "granted" || saved.v === "denied") && Date.now() - saved.t < MAX_AGE) return saved.v;
    } catch {
      /* armazenamento indisponível: o aviso aparece de novo */
    }
    return null;
  }
  function saveChoice(value) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: value, t: Date.now() }));
    } catch {
      /* sem armazenamento, a escolha vale só para esta página */
    }
  }

  let loaded = false;
  function loadTag() {
    if (loaded) return;
    loaded = true;
    gtag("consent", "update", { analytics_storage: "granted" });
    gtag("js", new Date());
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + TAG_ID;
    document.head.appendChild(s);
  }

  function track(name, params) {
    gtag("event", name, params || {});
  }

  // Aviso de consentimento.
  let banner = null;
  function closeBanner() {
    if (banner) banner.remove();
    banner = null;
  }
  function decide(value) {
    saveChoice(value);
    closeBanner();
    if (value === "granted") loadTag();
    else gtag("consent", "update", { analytics_storage: "denied" });
  }
  function openBanner() {
    if (banner || !document.body) return;
    banner = document.createElement("div");
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", TEXT.label);
    banner.style.cssText =
      "position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:720px;margin:0 auto;" +
      "display:flex;flex-wrap:wrap;gap:12px 16px;align-items:center;padding:16px 18px;" +
      "background:#232532;color:#e9e9ed;border-radius:14px;box-shadow:0 0 0 1px #595d6c,0 6px 18px rgba(0,0,0,.55);" +
      'font:14px/1.45 "Inter",system-ui,sans-serif';
    const p = document.createElement("p");
    p.textContent = TEXT.body;
    p.style.cssText = "margin:0;flex:1 1 320px";
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:8px;margin-left:auto";
    const btn = function (label, value, primary) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.style.cssText =
        "cursor:pointer;padding:9px 16px;border-radius:8px;font:inherit;font-weight:500;" +
        (primary
          ? "background:#9184d9;color:#161826;border:1px solid #9184d9"
          : "background:transparent;color:#e9e9ed;border:1px solid #75798c");
      b.addEventListener("click", function () {
        decide(value);
      });
      return b;
    };
    actions.append(btn(TEXT.refuse, "denied", false), btn(TEXT.accept, "granted", true));
    banner.append(p, actions);
    document.body.appendChild(banner);
  }
  window.InteliumConsent = { open: openBanner, choice: readChoice };

  function start() {
    const choice = readChoice();
    if (choice === "granted") loadTag();
    else if (choice === null) openBanner();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  // Conversões dos formulários: observa a resposta dos envios feitos por lead-api.js
  // (Neon Data API ou Worker). Só o nome do evento é enviado, nunca o conteúdo do formulário.
  const realFetch = window.fetch;
  if (typeof realFetch === "function") {
    window.fetch = function (input, init) {
      const result = realFetch.apply(this, arguments);
      try {
        const url = String(typeof input === "string" ? input : (input && input.url) || "").split("?")[0];
        const method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
        const form = /\/(contatos|contato)$/.test(url) ? "contato" : /\/newsletter$/.test(url) ? "newsletter" : null;
        if (form && method === "POST") {
          Promise.resolve(result)
            .then(function (r) {
              if (!r || !r.ok) return; // 409 (já cadastrado) não conta como nova conversão
              if (form === "contato") track("generate_lead", { form_type: "contato" });
              else track("sign_up", { method: "newsletter" });
            })
            .catch(function () {});
        }
      } catch {
        /* a medição nunca pode atrapalhar o envio do formulário */
      }
      return result;
    };
  }

  // Cliques em telefone e e-mail (o e-mail pode estar protegido pela Cloudflare).
  document.addEventListener(
    "click",
    function (e) {
      const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.indexOf("tel:") === 0) track("contact_click", { method: "telefone" });
      else if (href.indexOf("mailto:") === 0 || href.indexOf("/cdn-cgi/l/email-protection") >= 0)
        track("contact_click", { method: "email" });
    },
    true,
  );
})();
