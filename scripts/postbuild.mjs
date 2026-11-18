// Runs automatically after `npm run build` (npm "postbuild" hook).
//
// The repository always holds the PRODUCTION version of the site. When the
// build runs for the test environment (GitHub Pages, SITE_ENV=dsv) this step
// blocks search engines in out/: robots.txt becomes Disallow and every page
// gets a noindex meta tag. In production (Hostinger, SITE_ENV unset) it only
// reports what was built.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const OUT = fileURLToPath(new URL("../out/", import.meta.url));
const env = (process.env.SITE_ENV || "prd").toLowerCase();
const NOINDEX = '<meta name="robots" content="noindex, nofollow">';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const pages = walk(OUT).filter((f) => f.endsWith(".html"));

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
  console.log(`postbuild: test build (SITE_ENV=dsv), noindex added to ${changed} pages, robots.txt set to Disallow.`);
}
