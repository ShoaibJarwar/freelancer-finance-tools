import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import sitemap from "../app/sitemap.ts";

const ROOT = join(import.meta.dirname, "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const appFiles = walk(join(ROOT, "app"));
const pageFiles = appFiles.filter((f) => f.endsWith("/page.tsx"));
const sourceFiles = [...appFiles, ...walk(join(ROOT, "components"))].filter(
  (f) => f.endsWith(".tsx") || f.endsWith(".ts")
);

function routeExists(path: string): boolean {
  if (path === "/" || path === "") return existsSync(join(ROOT, "app", "page.tsx"));
  return existsSync(join(ROOT, "app", path, "page.tsx"));
}

test("every internal link literal in app/ and components/ points at a real page", () => {
  const broken: string[] = [];
  for (const file of sourceFiles) {
    const text = readFileSync(file, "utf8");
    const re = /href(?:=|:\s*)\{?"(\/[^"#?]*)"/g;
    for (const m of text.matchAll(re)) {
      const path = m[1];
      if (path.startsWith("/_next") || path.startsWith("/favicon")) continue;
      if (!routeExists(path)) broken.push(`${relative(ROOT, file)} -> ${path}`);
    }
  }
  assert.deepEqual(broken, []);
});

test("footer links include all five trust/legal pages", () => {
  const footer = readFileSync(join(ROOT, "components/layout/Footer.tsx"), "utf8");
  for (const path of ["/about", "/contact", "/privacy", "/terms", "/affiliate-disclosure"]) {
    assert.ok(footer.includes(`"${path}"`), `footer missing ${path}`);
  }
});

test("sitemap lists each public page exactly once, with no query strings, and every entry is a real route", () => {
  const entries = sitemap();
  const paths = entries.map((e) => new URL(e.url).pathname);
  assert.equal(new Set(paths).size, paths.length, "duplicate sitemap entry");
  for (const e of entries) assert.ok(!e.url.includes("?"), `query string in ${e.url}`);
  for (const p of paths) assert.ok(routeExists(p), `sitemap entry has no page: ${p}`);
  for (const p of ["/about", "/contact", "/privacy", "/terms", "/affiliate-disclosure"]) {
    assert.ok(paths.includes(p), `sitemap missing ${p}`);
  }
});

test("every real page appears in the sitemap", () => {
  const paths = new Set(sitemap().map((e) => new URL(e.url).pathname));
  for (const file of pageFiles) {
    const dir = relative(join(ROOT, "app"), file).replace(/\/?page\.tsx$/, "");
    const route = dir === "" ? "/" : `/${dir}`;
    assert.ok(paths.has(route), `page ${route} is not in the sitemap`);
  }
});

test("every page renders exactly one H1 (literal or via GuideLayout)", () => {
  for (const file of pageFiles) {
    const text = readFileSync(file, "utf8");
    const literal = (text.match(/<h1[\s>]/g) ?? []).length;
    const viaLayout = text.includes("<GuideLayout") ? 1 : 0;
    assert.equal(literal + viaLayout, 1, `${relative(ROOT, file)} has ${literal + viaLayout} H1s`);
  }
});

test("every page has a unique, non-empty title and description", () => {
  const titles: string[] = [];
  for (const file of pageFiles) {
    const text = readFileSync(file, "utf8");
    const t = text.match(/title:\s*(?:\{\s*absolute:\s*)?"([^"]+)"/);
    const d = text.match(/description:\s*\n?\s*"([^"]+)"/);
    assert.ok(t, `${relative(ROOT, file)} has no static title`);
    assert.ok(d && d[1].length > 40, `${relative(ROOT, file)} has no real description`);
    titles.push(t![1]);
  }
  assert.equal(new Set(titles).size, titles.length, "duplicate page title");
});

test("no user-visible placeholder language remains in app/ or components/", () => {
  const banned = /lorem ipsum|coming soon|working title|under construction|your@email|example\.com|Placeholder metadata/i;
  const hits: string[] = [];
  for (const file of sourceFiles) {
    const text = readFileSync(file, "utf8");
    if (banned.test(text)) hits.push(relative(ROOT, file));
  }
  assert.deepEqual(hits, []);
});

test("the app code uses no browser storage, cookies, or network calls (the Privacy Policy depends on this)", () => {
  const banned = /localStorage|sessionStorage|document\.cookie|\bfetch\(|XMLHttpRequest|sendBeacon|googletagmanager|adsbygoogle|gtag\(/;
  const hits: string[] = [];
  for (const file of sourceFiles) {
    if (banned.test(readFileSync(file, "utf8"))) hits.push(relative(ROOT, file));
  }
  assert.deepEqual(hits, []);
});
