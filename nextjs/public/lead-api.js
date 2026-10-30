/* Intelium · envio de formulários para o Neon Data API (insert-only, papel anonymous).
   Preencha as duas URLs abaixo com os valores do console Neon:
   Data API → "API URL"  ·  Auth → "Auth URL". Nenhuma senha vai aqui. */
(function () {
  var CFG = window.INTELIUM_LEADS = window.INTELIUM_LEADS || {
    // Quando preenchido, o site envia pelo Cloudflare Worker (recomendado) e ignora o Data API.
    workerUrl: '',
    dataApi: 'https://ep-fragrant-wind-b4p39gso.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1',
    authUrl: 'https://ep-fragrant-wind-b4p39gso.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth'
  };
  var PERSONAL = ["gmail.com","googlemail.com","gmail.com.br","hotmail.com","hotmail.com.br","outlook.com","outlook.com.br","live.com","live.com.br","msn.com","yahoo.com","yahoo.com.br","ymail.com","rocketmail.com","icloud.com","me.com","mac.com","aol.com","uol.com.br","bol.com.br","terra.com.br","ig.com.br","globo.com","globomail.com","r7.com","zipmail.com.br","oi.com.br","protonmail.com","proton.me","pm.me","tutanota.com","tuta.io","gmx.com","gmx.net","mail.com","zoho.com","yandex.com","yandex.ru","mail.ru","hey.com","qq.com","163.com","126.com","yopmail.com","mailinator.com","guerrillamail.com","temp-mail.org","10minutemail.com","sharklasers.com","trashmail.com"];
  var PERSONAL_MSG = {
    'pt-BR': 'Use seu e-mail corporativo. Endereços pessoais (Gmail, Hotmail, Outlook, Yahoo…) não são aceitos.',
    'en': 'Please use your work email. Personal addresses (Gmail, Hotmail, Outlook, Yahoo…) are not accepted.'
  };
  function isPersonal(email) {
    var d = String(email || '').trim().toLowerCase().split('@')[1] || '';
    return PERSONAL.some(function (p) { return d === p || d.slice(-(p.length + 1)) === '.' + p; });
  }
  function personalMsg() { return PERSONAL_MSG[context().idioma]; }
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var ss = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
             set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  // Atribuição: guarda UTMs e referrer da primeira página da sessão.
  (function () {
    var q = new URLSearchParams(location.search), a = {}, has = false;
    UTM.forEach(function (k) { var v = q.get(k); if (v) { a[k] = v.slice(0, 200); has = true; } });
    if (has || !ss.get('il_attr')) {
      a.referrer = (document.referrer && document.referrer.indexOf(location.host) < 0) ? document.referrer.slice(0, 500) : null;
      ss.set('il_attr', JSON.stringify(a));
    }
  })();

  function context() {
    var a = {}; try { a = JSON.parse(ss.get('il_attr') || '{}'); } catch (e) {}
    var lang = (document.documentElement.lang || 'pt-BR').toLowerCase().indexOf('en') === 0 ? 'en' : 'pt-BR';
    var out = { idioma: lang, pagina: (location.pathname + location.hash).slice(0, 300), referrer: a.referrer || null };
    UTM.forEach(function (k) { out[k] = a[k] || null; });
    return out;
  }

  var tokenP = null;
  function token(force) {
    var c = null; try { c = JSON.parse(ss.get('il_tok') || 'null'); } catch (e) {}
    if (!force && c && c.exp > Date.now() + 60000) return Promise.resolve(c.token);
    if (!tokenP) tokenP = fetch(CFG.authUrl.replace(/\/$/, '') + '/token/anonymous', { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('auth ' + r.status); return r.json(); })
      .then(function (j) {
        var exp = j.expires_at ? (typeof j.expires_at === 'number' ? j.expires_at * (j.expires_at < 1e12 ? 1000 : 1) : Date.parse(j.expires_at)) : Date.now() + 30 * 60000;
        ss.set('il_tok', JSON.stringify({ token: j.token, exp: exp })); return j.token;
      })
      .finally(function () { tokenP = null; });
    return tokenP;
  }

  function insert(table, row, retried) {
    return token(retried).then(function (t) {
      return fetch(CFG.dataApi.replace(/\/$/, '') + '/' + table, {
        method: 'POST', credentials: 'omit',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t, 'Prefer': 'return=minimal' },
        body: JSON.stringify(row)
      });
    }).then(function (r) {
      if (r.ok) return { ok: true };
      if (r.status === 409) return { ok: true, duplicate: true };
      if (r.status === 401 && !retried) return insert(table, row, true);
      return r.json().catch(function () { return {}; }).then(function (j) {
        return { ok: false, status: r.status, rateLimited: /rate_limited/.test(j.message || ''), personal: /personal_email/.test(j.message || '') };
      });
    }).catch(function () { return { ok: false, status: 0 }; });
  }

  function viaWorker(table, row) {
    var path = table === 'contatos' ? '/contato' : '/newsletter';
    return fetch(CFG.workerUrl.replace(/\/$/, '') + path, {
      method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok && j.ok) return { ok: true, duplicate: !!j.duplicate };
        return { ok: false, status: r.status, rateLimited: j.error === 'rate_limited', personal: j.error === 'personal_email' };
      });
    }).catch(function () { return { ok: false, status: 0 }; });
  }

  function submitLead(table, fields) {
    if (isPersonal(fields.email)) return Promise.resolve({ ok: false, personal: true });
    var row = context(); for (var k in fields) row[k] = fields[k];
    return CFG.workerUrl ? viaWorker(table, row) : insert(table, row);
  }
  window.InteliumLeads = { submit: submitLead, context: context, isPersonal: isPersonal, personalMsg: personalMsg };

  // Newsletter In Motion: todas as páginas (.nl-form[data-newsletter]).
  var NL_CONSENT = {
    'pt-BR': 'Assinatura da newsletter Intelium In Motion. Uso do e-mail apenas para envio da newsletter, com descadastro a qualquer momento (LGPD).',
    'en': 'Subscription to the Intelium In Motion newsletter. Email used only to send the newsletter; unsubscribe at any time (LGPD).'
  };
  function nlSend(form) {
    var input = form.querySelector('input[type="email"]'), check = form.querySelector('.nl-check');
    if (!input || form.dataset.busy) return;
    input.setCustomValidity('');
    input.setCustomValidity(isPersonal(input.value) ? personalMsg() : '');
    if (!input.value.trim() || !input.checkValidity()) { input.reportValidity(); return; }
    var lang = context().idioma;
    form.dataset.busy = '1'; input.disabled = true;
    submitLead('newsletter', { email: input.value.trim().toLowerCase(), consentimento_texto: NL_CONSENT[lang] }).then(function (r) {
      delete form.dataset.busy; input.disabled = false;
      if (r.ok) { check.checked = true; return; }
      input.setCustomValidity(r.personal ? personalMsg() : r.rateLimited
        ? (lang === 'en' ? 'Too many attempts. Try again in a few minutes.' : 'Muitas tentativas. Tente de novo em alguns minutos.')
        : (lang === 'en' ? 'Could not subscribe now. Please try again.' : 'Não foi possível assinar agora. Tente novamente.'));
      input.reportValidity();
    });
  }
  document.addEventListener('change', function (e) {
    var c = e.target; if (!c.classList || !c.classList.contains('nl-check')) return;
    var f = c.closest('.nl-form'); if (!f) return;
    if (c.checked) { c.checked = false; nlSend(f); }
  }, true);
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f.matches || !f.matches('.nl-form[data-newsletter]')) return;
    e.preventDefault(); nlSend(f);
  }, true);
  // Validação ao vivo: e-mail pessoal fica inválido já no preenchimento (newsletter e [data-corporate]).
  document.addEventListener('input', function (e) {
    var t = e.target; if (!t.setCustomValidity || !t.closest) return;
    var corp = t.type === 'email' && (t.closest('.nl-form') || t.hasAttribute('data-corporate'));
    if (corp) t.setCustomValidity(isPersonal(t.value) ? personalMsg() : '');
    else if (t.closest('.nl-form')) t.setCustomValidity('');
  }, true);
})();
