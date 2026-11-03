// Checks the static export in out/ that Hostinger publishes to public_html.
// Run `npm run build` first; in CI the `build` job hands out/ to this job.

import { before, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const OUT = fileURLToPath(new URL("../out/", import.meta.url));
const read = (p) => readFileSync(join(OUT, p), "utf8");

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
}

before(() => {
  assert.ok(existsSync(OUT), "out/ not found: run `npm run build` first");
});

test("index.html is the under-construction page", () => {
  const html = read("index.html");
  assert.match(html, /<title>Intelium · Novo site em construção<\/title>/);
  assert.match(html, /Estamos construindo/);
  assert.match(html, /aria-label="Fluxos de eventos/, "data flow diagram missing");
});

test("404.html is the branded not-found page", () => {
  assert.match(read("404.html"), /Página não encontrada/);
});

test(".htaccess ships with the export", () => {
  assert.match(read(".htaccess"), /ErrorDocument 404 \/404\.html/);
});

test("every local asset referenced by index.html exists", () => {
  const refs = [...read("index.html").matchAll(/(?:src|href)="(\/[^"/][^"]*)"/g)].map((m) => m[1].split(/[?#]/)[0]);
  assert.ok(refs.length > 0, "no local assets found in index.html");
  const missing = [...new Set(refs)].filter((p) => !existsSync(join(OUT, p)));
  assert.deepEqual(missing, []);
});

test("no source files leak into the export", () => {
  const leaked = walk(OUT)
    .map((f) => relative(OUT, f))
    .filter((f) => /\.(tsx?|mjs)$/.test(f) || /^(package(-lock)?\.json|next\.config\.\w+|tsconfig\.json|app\/|components\/)/.test(f));
  assert.deepEqual(leaked, []);
});
