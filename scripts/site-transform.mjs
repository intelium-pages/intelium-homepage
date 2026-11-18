// Publication transforms for the exported site, applied to out/ by
// scripts/postbuild.mjs in every environment. Pure Node, no dependencies, so
// it also runs on Hostinger's build.
//
// The pages in public/ come from Claude Design: a template inside <x-dc> that
// a small runtime (support.js) renders in the browser. Left as exported, the
// raw HTML has the title and meta tags inside <body>, unresolved {{ }}
// placeholders, links to /folder/index.html and React loaded from a CDN.
// transformSite() fixes that without touching public/:
//
//   1. internal links   ./folder/index.html -> ./folder/
//   2. titles and descriptions from seo/meta.json
//   3. structured data  BreadcrumbList, Service, AboutPage, ContactPage (seo/schema.json)
//   4. head             title, meta, link, style and JSON-LD move from <helmet> to <head>
//   5. React            served from /vendor/ instead of unpkg.com
//   6. prerender        the rendered page (prerender/, made by scripts/prerender.mjs)
//                       becomes the page's real HTML; the template is kept in a
//                       <template> for the runtime, which takes over on load.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SITE = "https://intelium.ai";
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

export const PRERENDER_DIR = join(ROOT, "prerender");
export const PRERENDER_MARK = "dc-prerendered";
const TRANSFORM_MARK = "<!-- site-transform -->";
const VENDOR = [
  ["https://unpkg.com/react@18.3.1/umd/react.production.min.js", "vendor/react-18.3.1.production.min.js"],
  ["https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js", "vendor/react-dom-18.3.1.production.min.js"],
];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

// Site pages: every index.html outside the folders Next generates.
export function sitePages(outDir) {
  return walk(outDir)
    .map((f) => relative(outDir, f).split("\\").join("/"))
    .filter((f) => f.endsWith("index.html") && !/^(_next|404|_not-found)\//.test(f))
    .sort();
}

export const routeOf = (page) => `/${page.replace(/index\.html$/, "")}`;
export const sha = (text) => createHash("sha256").update(text).digest("hex");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&#39;/g, "'").replace(/&amp;/g, "&");

// 1. ./folder/index.html -> ./folder/ in attributes and in the page's own data.
function cleanLinks(html) {
  return html.replace(
    /(["'])((?:\.\.?\/)*(?:[a-z0-9-]+\/)*)index\.html(#[^"']*)?\1/g,
    (_m, q, path, hash = "") => `${q}${path || "./"}${hash}${q}`,
  );
}

// 2. Title and description overrides.
function applyMeta(html, meta) {
  if (!meta) return html;
  const setMeta = (h, key, value) =>
    h.replace(new RegExp(`(<meta (?:name|property)="${key}" content=")[^"]*(")`), `$1${esc(value)}$2`);
  if (meta.title) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);
    html = setMeta(setMeta(html, "og:title", meta.title), "twitter:title", meta.title);
  }
  if (meta.description) {
    for (const key of ["description", "og:description", "twitter:description"]) html = setMeta(html, key, meta.description);
  }
  return html;
}

// 3. Structured data built from the route and the page's own title.
function structuredData(html, route, schema) {
  const title = unesc((/<title>([^<]*)<\/title>/.exec(html) || [])[1] || "");
  const description = unesc((/<meta name="description" content="([^"]*)"/.exec(html) || [])[1] || "");
  const en = route.startsWith("/en/");
  const home = en ? "/en/" : "/";
  const url = (r) => `${SITE}${r}`;
  const graph = [];

  if (route !== home) {
    const trail = [home];
    const parts = route.slice(home.length).split("/").filter(Boolean);
    for (let i = 1; i <= parts.length; i += 1) trail.push(`${home}${parts.slice(0, i).join("/")}/`);
    const name = (r) => schema.sections[r] || (r === route ? title.split(/ · |: /)[0] : r);
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: trail.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: name(r), item: url(r) })),
    });
  }
  const pageType = schema.pageTypes[route];
  if (pageType) {
    graph.push({ "@type": pageType, "@id": `${url(route)}#page`, url: url(route), name: title, description, inLanguage: en ? "en" : "pt-BR", about: { "@id": schema.organization["@id"] } });
    graph.push(schema.organization);
  }
  const services = schema.services[route];
  if (services) {
    graph.push(schema.organization);
    for (const name of services) {
      graph.push({ "@type": "Service", name, serviceType: "Data Streaming", provider: { "@id": schema.organization["@id"] }, areaServed: "Latin America", url: url(route) });
    }
  }
  if (!graph.length) return html;
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return html.replace("</helmet>", `<script type="application/ld+json" data-seo="1">${json}</script>\n</helmet>`);
}

// 4. Everything a crawler needs in <head> moves there; scripts stay in <helmet>
//    for the runtime (it mounts them itself).
function hoistHead(html) {
  const open = html.indexOf("<helmet>");
  const close = html.indexOf("</helmet>");
  if (open === -1 || close === -1) return html;
  const moved = [];
  const take = (m) => {
    moved.push(m.trim());
    return "";
  };
  const helmet = html
    .slice(open + 8, close)
    .replace(/<title>[\s\S]*?<\/title>\s*/g, take)
    .replace(/<meta name="viewport"[^>]*>\s*/g, "")
    .replace(/<meta [^>]*>\s*/g, take)
    .replace(/<link [^>]*>\s*/g, take)
    .replace(/<style>[\s\S]*?<\/style>\s*/g, take)
    .replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/g, take);
  const rest = `${html.slice(0, open)}<helmet>${helmet}${html.slice(close)}`;
  return rest.replace("</head>", `${TRANSFORM_MARK}\n${moved.join("\n")}\n</head>`);
}

export function transformPage(html, route, cfg) {
  let out = cleanLinks(html);
  out = applyMeta(out, cfg.meta[route]);
  out = structuredData(out, route, cfg.schema);
  return hoistHead(out);
}

// 6. The rendered page becomes the real HTML. The template moves into an inert
//    <template>; a tiny script puts it back for the runtime and removes the
//    prerendered copy as soon as the live render is in place.
const BOOT = `(function(){var t=document.getElementById("dc-src");if(!t)return;var x=t.content.querySelector("x-dc");t.parentNode.insertBefore(x,t);t.remove();function done(){var r=document.getElementById("dc-root");if(!r||!r.firstChild)return false;var p=document.getElementById("dc-pre");if(p)p.remove();Array.prototype.forEach.call(document.querySelectorAll("style[data-dc-pre]"),function(s){s.remove()});return true}var o=new MutationObserver(function(){if(done())o.disconnect()});o.observe(document.documentElement,{childList:true,subtree:true})})();`;

export function injectSnapshot(html, snap) {
  const open = html.indexOf("<x-dc>");
  const close = html.lastIndexOf("</x-dc>");
  if (open === -1 || close === -1) return html;
  const template = html.slice(open, close + 7);
  const styles = snap.styles.map((css) => `<style data-dc-pre>${css}</style>`).join("\n");
  const body =
    `<div id="dc-pre" data-${PRERENDER_MARK}="${snap.hash.slice(0, 12)}">${snap.body}</div>\n` +
    `<template id="dc-src">${template}</template>\n<script>${BOOT}</script>`;
  return `${html.slice(0, open)}${body}${html.slice(close + 7)}`.replace("</head>", `${styles}\n</head>`);
}

export const snapshotPath = (page) => join(PRERENDER_DIR, page.replace(/index\.html$/, "page.json"));

// Applies everything to out/. With inject:false the pages are left ready to be
// rendered by scripts/prerender.mjs.
export function transformSite(outDir, { inject = true } = {}) {
  const cfg = { meta: readJson("seo/meta.json"), schema: readJson("seo/schema.json") };
  const stats = { pages: 0, prerendered: 0, stale: [], vendor: false };

  const support = join(outDir, "support.js");
  let js = readFileSync(support, "utf8");
  if (VENDOR.every(([cdn, local]) => js.includes(`"${cdn}"`) && existsSync(join(outDir, local)))) {
    for (const [cdn, local] of VENDOR) js = js.replace(`"${cdn}"`, `new URL("${local}", document.currentScript.src).href`);
    writeFileSync(support, js);
  }
  stats.vendor = !VENDOR.some(([cdn]) => js.includes(cdn));
  const runtime = sha(js);

  for (const page of sitePages(outDir)) {
    const file = join(outDir, page);
    const raw = readFileSync(file, "utf8");
    if (raw.includes(TRANSFORM_MARK)) continue; // already transformed
    let html = transformPage(raw, routeOf(page), cfg);
    const hash = sha(html + runtime);
    stats.pages += 1;
    if (inject) {
      const snapFile = snapshotPath(page);
      const snap = existsSync(snapFile) ? JSON.parse(readFileSync(snapFile, "utf8")) : null;
      if (snap && snap.hash === hash) {
        html = injectSnapshot(html, snap);
        stats.prerendered += 1;
      } else stats.stale.push(routeOf(page));
    }
    writeFileSync(file, html);
  }
  return stats;
}

export function pageHashes(outDir) {
  const runtime = sha(readFileSync(join(outDir, "support.js"), "utf8"));
  return Object.fromEntries(sitePages(outDir).map((p) => [p, sha(readFileSync(join(outDir, p), "utf8") + runtime)]));
}
