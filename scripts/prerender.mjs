// Renders every site page in a headless browser and saves the result in
// prerender/, one page.json per route. scripts/postbuild.mjs then puts that
// rendered HTML into the published page (see scripts/site-transform.mjs).
//
//   npm run prerender
//
// Needs Playwright with Chromium (`npx playwright install chromium`). It is
// only needed here, at publication time: the snapshots are committed, so the
// builds on GitHub, GitLab and Hostinger never start a browser.
// Run it again whenever public/, seo/ or the transforms change; the tests fail
// while a snapshot is out of date.

import { createServer } from "node:http";
import { createRequire } from "node:module";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, normalize } from "node:path";
import { PRERENDER_DIR, pageHashes, routeOf, sitePages, snapshotPath, transformSite } from "./site-transform.mjs";

const PUBLIC = fileURLToPath(new URL("../public/", import.meta.url));
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain" };

async function loadChromium() {
  for (const name of ["playwright", "playwright-core"]) {
    try {
      return (await import(name)).chromium;
    } catch {
      try {
        return createRequire(import.meta.url)(name).chromium; // global install (NODE_PATH)
      } catch {
        // try the next one
      }
    }
  }
  console.error("prerender: Playwright não encontrado. Instale com: npm i -g playwright && npx playwright install chromium");
  process.exit(1);
}

function serve(dir) {
  const server = createServer((req, res) => {
    let file = normalize(join(dir, decodeURIComponent(new URL(req.url, "http://x").pathname)));
    if (!file.startsWith(dir)) return res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" }).end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

// Runs in the page: waits for the runtime to finish and returns the snapshot.
async function capture(staticStyles) {
  const root = () => document.getElementById("dc-root");
  const start = Date.now();
  while (!(root() && root().innerText.length > 200 && !/\{\{/.test(root().innerText))) {
    if (Date.now() - start > 30000) throw new Error("the page did not render");
    await new Promise((r) => setTimeout(r, 100));
  }
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  // Entrance animations and counters are driven by the page's own script: wait
  // until the rendered HTML stops changing, so the snapshot is the final state.
  let last = "";
  let stableSince = Date.now();
  while (Date.now() - stableSince < 2500 && Date.now() - start < 40000) {
    await new Promise((r) => setTimeout(r, 250));
    const now = root().innerHTML;
    if (now !== last) {
      last = now;
      stableSince = Date.now();
    }
  }
  const clone = root().cloneNode(true);
  clone.querySelectorAll("[data-offscreen]").forEach((el) => el.removeAttribute("data-offscreen"));
  const styles = [...document.head.querySelectorAll("style")]
    .map((s) => s.textContent || [...s.sheet.cssRules].map((r) => r.cssText).join("\n"))
    .filter((css) => css && !staticStyles.includes(css) && !/^(x-dc\{display|@view-transition|\[data-offscreen\])/.test(css.trim()));
  return { body: clone.innerHTML, styles };
}

const chromium = await loadChromium();
const stage = mkdtempSync(join(tmpdir(), "intelium-prerender-"));
cpSync(PUBLIC, stage, { recursive: true });
transformSite(stage, { inject: false });
const hashes = pageHashes(stage);
const pages = sitePages(stage);
const server = await serve(stage);
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
// Nothing leaves the machine: the forms and any other third party stay out.
await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());

const failed = [];
let done = 0;
async function render(page) {
  const tab = await context.newPage();
  const errors = [];
  tab.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  try {
    const html = readFileSync(join(stage, page), "utf8");
    const staticStyles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
    await tab.goto(base + page.replace(/index\.html$/, ""), { waitUntil: "load" });
    const snap = await tab.evaluate(capture, staticStyles);
    if (errors.length) throw new Error(errors.join(" | "));
    if (snap.body.length < 500 || snap.body.includes("{{")) throw new Error("rendered HTML looks incomplete");
    const file = snapshotPath(page);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify({ route: routeOf(page), hash: hashes[page], styles: snap.styles, body: snap.body })}\n`);
    done += 1;
  } catch (e) {
    failed.push(`${routeOf(page)}: ${e.message}`);
  } finally {
    await tab.close();
  }
}
const queue = [...pages];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) await render(queue.shift());
}));

await browser.close();
server.close();
rmSync(stage, { recursive: true, force: true });
console.log(`prerender: ${done} of ${pages.length} pages saved in ${PRERENDER_DIR}`);
if (failed.length) {
  console.error(`prerender: FAILED\n  ${failed.join("\n  ")}`);
  process.exit(1);
}
