// Checks the static export in out/, which is what both environments publish:
// GitHub Pages (test, SITE_ENV=dsv) and Hostinger (production).
// Run `npm run build` first; in CI the build job hands out/ to this job.

import { before, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, relative } from "node:path";

const OUT = fileURLToPath(new URL("../out/", import.meta.url));
const ENV = (process.env.SITE_ENV || "prd").toLowerCase();
const SITE = "https://intelium.ai/";
const read = (p) => readFileSync(join(OUT, p), "utf8");
const rel = (f) => relative(OUT, f).split("\\").join("/");

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

// Site pages: every index.html outside Next's own folders.
const sitePages = () =>
  walk(OUT)
    .map(rel)
    .filter((f) => f.endsWith("index.html") && !f.startsWith("_next/") && !f.startsWith("404/") && !f.startsWith("_not-found/"));

const sitemapPaths = () => [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

// Local references of a page, skipping external URLs and runtime templates.
function localRefs(html) {
  const refs = new Set();
  for (const m of html.matchAll(/(?:href|src|poster)\s*=\s*["']([^"']+)["']/g)) refs.add(m[1].trim());
  for (const m of html.matchAll(/srcset\s*=\s*["']([^"']+)["']/g))
    for (const part of m[1].split(",")) refs.add(part.trim().split(/\s+/)[0]);
  return [...refs].filter(
    (r) =>
      r &&
      !/^(#|mailto:|tel:|data:|javascript:|blob:|https?:|\/\/)/.test(r) &&
      !r.includes("{{") &&
      !r.includes("${") &&
      !r.includes(" + "),
  );
}

before(() => {
  assert.ok(existsSync(OUT), "out/ not found: run `npm run build` first");
});

test("index.html is the site home page", () => {
  const html = read("index.html");
  assert.match(html, /<title>Intelium · Centro de excelência em Data Streaming/);
  assert.doesNotMatch(html, /Novo site em construção/);
});

test("every sitemap URL has a page, and every page is in the sitemap", () => {
  const locs = sitemapPaths();
  assert.ok(locs.length > 0, "sitemap.xml has no <loc>");
  const expected = locs.map((l) => {
    assert.ok(l.startsWith(SITE) && l.endsWith("/"), `sitemap URL must be ${SITE}…/ : ${l}`);
    return `${l.slice(SITE.length)}index.html`;
  });
  assert.deepEqual(expected.filter((p) => !existsSync(join(OUT, p))), [], "sitemap URLs without a page");
  assert.deepEqual(sitePages().filter((p) => !expected.includes(p)), [], "pages missing from sitemap.xml");
});

test("every local link, image, script and style referenced by a page exists", () => {
  const missing = [];
  let checked = 0;
  for (const page of sitePages()) {
    for (const ref of localRefs(read(page))) {
      const path = decodeURIComponent(ref.split("#")[0].split("?")[0]);
      let target = normalize(join(OUT, dirname(page), path));
      if (existsSync(target) && statSync(target).isDirectory()) target = join(target, "index.html");
      checked += 1;
      if (!target.startsWith(OUT) || !existsSync(target)) missing.push(`${page} -> ${ref}`);
    }
  }
  assert.ok(checked > 100, `too few references checked (${checked})`);
  assert.deepEqual(missing, []);
});

test("site pages only use relative paths (they must work under a sub-folder)", () => {
  const absolute = [];
  for (const page of sitePages())
    for (const ref of localRefs(read(page))) if (ref.startsWith("/")) absolute.push(`${page} -> ${ref}`);
  assert.deepEqual(absolute, []);
});

test("hreflang alternates point to pages that exist", () => {
  const broken = [];
  for (const page of sitePages()) {
    for (const m of read(page).matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g)) {
      const url = m[1];
      if (!url.startsWith(SITE) || !existsSync(join(OUT, url.slice(SITE.length), "index.html")))
        broken.push(`${page} -> ${url}`);
    }
  }
  assert.deepEqual(broken, []);
});

test("404.html is the branded not-found page and is never indexed", () => {
  const html = read("404.html");
  assert.match(html, /Página não encontrada/);
  assert.match(html, /noindex/);
  assert.doesNotMatch(html, /em construção/);
});

test(".htaccess ships with the export", () => {
  assert.match(read(".htaccess"), /ErrorDocument 404 \/404\.html/);
});

test(`indexing matches the environment (${ENV})`, () => {
  const robots = read("robots.txt");
  const noindex = (p) => /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(read(p));
  if (ENV === "dsv") {
    assert.match(robots, /^Disallow: \/$/m, "test environment must block crawlers");
    assert.deepEqual(sitePages().filter((p) => !noindex(p)), [], "pages without noindex in the test build");
  } else {
    assert.match(robots, /^Allow: \/$/m);
    assert.doesNotMatch(robots, /^Disallow: \/$/m);
    assert.match(robots, /^Sitemap: https:\/\/intelium\.ai\/sitemap\.xml$/m);
    assert.deepEqual(sitePages().filter(noindex), [], "pages with noindex in the production build");
  }
});

test("nothing that does not belong to the site leaks into the export", () => {
  const leaked = walk(OUT)
    .map(rel)
    .filter(
      (f) =>
        /\.(tsx?|mjs)$/.test(f) ||
        /\.dc\.html$/.test(f) ||
        /(^|\/)(CNAME|README\.md|middleware\.js|\.nojekyll|\.DS_Store)$/.test(f) ||
        /^(package(-lock)?\.json|next\.config\.\w+|tsconfig\.json|app\/|components\/|scripts\/|tests\/)/.test(f),
    );
  assert.deepEqual(leaked, []);
});
