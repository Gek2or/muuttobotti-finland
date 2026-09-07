import assert from "node:assert/strict";
import test from "node:test";

const productionTitle = /<title>[^<]*Muuttobotti[^<]*<\/title>/i;
const canonicalLink =
  /<link(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']https:\/\/muuttobotti\.fi\/["'])[^>]*>/i;
const manifestLink =
  /<link(?=[^>]*\brel=["']manifest["'])(?=[^>]*\bhref=["']https:\/\/muuttobotti\.fi\/manifest\.webmanifest["'])[^>]*>/i;

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

async function render(path = "/") {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
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

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

test("renders production release metadata", async () => {
  const html = await render("/");
  assert.match(html, productionTitle);
  assert.match(html, canonicalLink);
  assert.match(html, manifestLink);
});

test("server-renders the requested homepage locale", async () => {
  const en = await render("/?lang=en");
  assert.match(en, /Consider it done\./);
  assert.match(en, /One trusted team\. Every service\./);
  assert.doesNotMatch(en, /Kaikki hoituu\./);

  const uk = await render("/?lang=uk");
  assert.match(uk, /Усе буде зроблено\./);
  assert.match(uk, /Одна команда\. Усі послуги\./);
  assert.doesNotMatch(uk, /Kaikki hoituu\./);

  const ru = await render("/?lang=ru");
  assert.match(ru, /Всё будет сделано\./);
  assert.match(ru, /Одна команда\. Все услуги\./);
  assert.doesNotMatch(ru, /Kaikki hoituu\./);
});

test("does not server-render legacy calculator controls", async () => {
  const html = await render("/?lang=en");
  assert.match(html, /id=["']calculator["']/i);
  assert.doesNotMatch(html, /type=["']range["']/i);
  assert.doesNotMatch(html, /legacy-calculator-disabled/i);
});
