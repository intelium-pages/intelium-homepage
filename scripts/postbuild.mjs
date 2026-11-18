// Runs automatically after `npm run build` (npm "postbuild" hook).
//
// The repository always holds the PRODUCTION version of the site. When the
// build runs for the test environment (GitHub Pages, SITE_ENV=dsv) this step
// blocks search engines in out/ (robots.txt becomes Disallow and every page
// gets a noindex meta tag) and points the forms at the test database. In production (Hostinger, SITE_ENV unset) indexing
// is left as exported.
//
// In both environments it also adds what belongs to this repository and not to
// the Claude Design export (sources in scripts/site/): the measurement script
// (Google Analytics 4 behind a consent notice), referenced by every page, and,
// in production only, the Google Search Console verification file.

import { copyFileSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { transformSite } from "./site-transform.mjs";

const OUT = fileURLToPath(new URL("../out/", import.meta.url));
const env = (process.env.SITE_ENV || "prd").toLowerCase();
const NOINDEX = '<meta name="robots" content="noindex, nofollow">';

// The contact and newsletter forms post to the Neon project "intelium-home-page".
// In the test build they are pointed at its "dsv" branch, an isolated copy of
// the database, so a form sent from the test site never reaches production.
const LEADS_PRD_ENDPOINT = "ep-fragrant-wind-b4p39gso"; // branch "production"
const LEADS_DSV_ENDPOINT = "ep-delicate-morning-b4z5k1rn"; // branch "dsv"

// Fallback, prepended to out/lead-api.js when the production endpoint is not
// found there (for example after it changes in a new export): every request to
// the database is answered locally, the forms behave as if the lead was saved
// and nothing is written.
const TEST_LEADS_MARK = "intelium:test-leads";
const TEST_LEADS_SHIM = `/* ${TEST_LEADS_MARK} - ambiente de teste: os formularios nao gravam no banco de producao. */
(function () {
  var real = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    var cfg = window.INTELIUM_LEADS || {};
    var isLead = /\\.neon\\.tech\\//.test(url) || (cfg.workerUrl && url.indexOf(cfg.workerUrl) === 0);
    if (!isLead) return real.apply(this, arguments);
    console.info("[teste] envio simulado, nada foi gravado:", url, (init && init.body) || "");
    var body = /\\/token\\/anonymous/.test(url)
      ? { token: "teste", expires_at: Math.floor(Date.now() / 1000) + 1800 }
      : { ok: true };
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } }));
  };
})();
`;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const pages = walk(OUT).filter((f) => f.endsWith(".html"));

// Publication transforms (links, titles, structured data, head, React, prerender).
const seo = transformSite(OUT);
console.log(
  `postbuild: ${seo.pages} pages transformed, ${seo.prerendered} prerendered` +
    (seo.stale.length ? `, ${seo.stale.length} WITHOUT an up-to-date snapshot (run: npm run prerender)` : "") +
    `, React ${seo.vendor ? "served from /vendor/" : "still loaded from the CDN"}.`,
);

// Measurement: out/analytics.js, loaded by every page. Site pages use a relative
// path (they must work under the test sub-folder); Next's own pages (404) are
// served from any depth, so they use the absolute path.
const SITE_SRC = fileURLToPath(new URL("./site/", import.meta.url));
const BASE_PATH = (process.env.BASE_PATH || "").replace(/\/$/, "");
const ANALYTICS = "analytics.js";
const SEARCH_CONSOLE_FILE = "google7123c91c7fc011d3.html";
const analyticsSrc = readFileSync(join(SITE_SRC, ANALYTICS), "utf8");
if (!analyticsSrc.includes('"__SITE_ENV__"')) throw new Error("postbuild: __SITE_ENV__ marker missing in scripts/site/analytics.js");
writeFileSync(join(OUT, ANALYTICS), analyticsSrc.replace('"__SITE_ENV__"', JSON.stringify(env === "dsv" ? "dsv" : "prd")));
let measured = 0;
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  if (html.includes(`${ANALYTICS}"`)) continue;
  if (!/<\/head>/i.test(html)) throw new Error(`postbuild: no </head> in ${file}`);
  const rel = relative(OUT, file).split("\\").join("/");
  const nextPage = /^(404\.html$|404\/|_not-found\/|_next\/)/.test(rel);
  const src = nextPage ? `${BASE_PATH}/${ANALYTICS}` : `${"../".repeat(rel.split("/").length - 1) || "./"}${ANALYTICS}`;
  writeFileSync(file, html.replace(/<\/head>/i, `<script src="${src}" defer></script>\n</head>`));
  measured += 1;
}
if (env !== "dsv") copyFileSync(join(SITE_SRC, SEARCH_CONSOLE_FILE), join(OUT, SEARCH_CONSOLE_FILE));
console.log(`postbuild: measurement script added to ${measured} pages.`);

if (env !== "dsv") {
  console.log(`postbuild: production build, ${pages.length} HTML files, indexing left as exported.`);
} else {
  let changed = 0;
  for (const file of pages) {
    const html = readFileSync(file, "utf8");
    if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html)) continue;
    if (!/<head[^>]*>/i.test(html)) throw new Error(`postbuild: no <head> in ${file}`);
    writeFileSync(file, html.replace(/<head[^>]*>/i, (m) => `${m}\n${NOINDEX}`));
    changed += 1;
  }
  writeFileSync(
    join(OUT, "robots.txt"),
    "User-agent: *\nDisallow: /\n\n# Test environment (GitHub Pages). Production serves Allow + Sitemap.\n",
  );
  const leadApi = join(OUT, "lead-api.js");
  let leadSrc = readFileSync(leadApi, "utf8");
  let forms = "already prepared";
  if (!leadSrc.includes(TEST_LEADS_MARK) && !leadSrc.includes(LEADS_DSV_ENDPOINT)) {
    const pointed = leadSrc.split(LEADS_PRD_ENDPOINT).join(LEADS_DSV_ENDPOINT);
    const otherHosts = (pointed.match(/[a-z0-9-]+\.(?:apirest|neonauth)\.[a-z0-9.-]+\.neon\.tech/g) || []).filter(
      (h) => !h.startsWith(`${LEADS_DSV_ENDPOINT}.`),
    );
    if (pointed !== leadSrc && otherHosts.length === 0) {
      leadSrc = pointed;
      forms = 'forms pointed at the Neon branch "dsv"';
    } else {
      leadSrc = TEST_LEADS_SHIM + leadSrc;
      forms = "production endpoint not recognised in lead-api.js, forms SIMULATED";
    }
    writeFileSync(leadApi, leadSrc);
  }
  console.log(
    `postbuild: test build (SITE_ENV=dsv), noindex added to ${changed} pages, robots.txt set to Disallow, ${forms}.`,
  );
}
