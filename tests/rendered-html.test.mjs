import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function createWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

async function requestPath(path) {
  const worker = await createWorker();
  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: path.endsWith(".txt") ? "text/plain" : "text/html,application/json" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders development preview metadata", async () => {
  const response = await requestPath("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(await response.text(), developmentPreviewMeta);
});

test("keeps private tracking out of search indexes", async () => {
  const response = await requestPath("/track");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<meta(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*noindex[^"']*["'])[^>]*>/i);
});

test("robots excludes APIs and private tracking", async () => {
  const response = await requestPath("/robots.txt");
  assert.equal(response.status, 200);
  const text = await response.text();
  assert.match(text, /Disallow:\s*\/api\//i);
  assert.match(text, /Disallow:\s*\/track/i);
  assert.match(text, /Sitemap:\s*https:\/\/muuttobotti\.fi\/sitemap\.xml/i);
});

test("manifest exposes V11 install metadata", async () => {
  const response = await requestPath("/manifest.webmanifest");
  assert.equal(response.status, 200);
  const manifest = JSON.parse(await response.text());
  assert.equal(manifest.short_name, "Muuttobotti");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.theme_color, "#061411");
});
