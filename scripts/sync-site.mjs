// Replaces the site content in public/ with a new export from Claude Design.
//
//   npm run sync-site -- /path/to/export/docs
//
// Keeps what belongs to this repository (public/.htaccess and the two images
// used by the 404 page) and never copies files that only made sense for the
// old GitHub Pages setup (CNAME, README.md, .nojekyll, 404.html).

import { cpSync, existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, resolve } from "node:path";

const PUBLIC = fileURLToPath(new URL("../public/", import.meta.url));
const KEEP = new Set([
  ".htaccess",
  "assets/isotipo.png",
  "assets/logo.png",
  "vendor/react-18.3.1.production.min.js",
  "vendor/react-dom-18.3.1.production.min.js",
]);
const SKIP = new Set(["CNAME", "README.md", ".nojekyll", "404.html", ".DS_Store"]);

const src = process.argv[2] && resolve(process.argv[2]);
if (!src || !existsSync(join(src, "index.html")) || !existsSync(join(src, "sitemap.xml"))) {
  console.error("Usage: npm run sync-site -- <export folder containing index.html and sitemap.xml>");
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

let removed = 0;
for (const file of walk(PUBLIC)) {
  const rel = relative(PUBLIC, file).split("\\").join("/");
  if (KEEP.has(rel)) continue;
  if (!existsSync(join(src, rel)) || SKIP.has(rel)) {
    rmSync(file);
    removed += 1;
  }
}

let copied = 0;
for (const file of walk(src)) {
  const rel = relative(src, file).split("\\").join("/");
  if (SKIP.has(rel.split("/").pop()) && !rel.includes("/")) continue;
  if (rel.endsWith(".DS_Store") || KEEP.has(rel)) continue;
  cpSync(file, join(PUBLIC, rel), { recursive: false });
  copied += 1;
}

// Drop folders left empty by removed pages.
function prune(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()) prune(join(dir, e.name));
  if (dir !== PUBLIC.replace(/\/$/, "") && readdirSync(dir).length === 0 && statSync(dir).isDirectory()) rmSync(dir, { recursive: true });
}
prune(PUBLIC.replace(/\/$/, ""));

console.log(`sync-site: ${copied} files copied, ${removed} stale files removed. Now run: npm run prerender && npm run build && npm test`);
