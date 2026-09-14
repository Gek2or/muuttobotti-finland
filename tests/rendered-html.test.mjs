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

async function request(path = "/") {
  const worker = await loadWorker();
  return worker.fetch(
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
}

async function render(path = "/") {
  const response = await request(path);
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

test("server-renders tracking in the requested locale", async () => {
  const en = await render("/track?lang=en");
  assert.match(en, /Track your booking\./);
  assert.match(en, /Booking number/);
  assert.doesNotMatch(en, /Seuraa varaustasi\./);

  const uk = await render("/track?lang=uk");
  assert.match(uk, /Відстежуйте бронювання\./);
  assert.match(uk, /Номер бронювання/);
  assert.doesNotMatch(uk, /Seuraa varaustasi\./);

  const ru = await render("/track?lang=ru");
  assert.match(ru, /Отслеживайте заказ\./);
  assert.match(ru, /Номер бронирования/);
  assert.doesNotMatch(ru, /Seuraa varaustasi\./);
});

test("server-renders localized blog and legal pages", async () => {
  const blog = await render("/blog?lang=ru");
  assert.match(blog, /Продуманный переезд начинается с хорошего плана\./);
  assert.match(blog, /Рассчитать цену/);

  const privacy = await render("/privacy?lang=en");
  assert.match(privacy, /Privacy notice/);
  assert.match(privacy, /How booking and technical data are handled/);

  const terms = await render("/terms?lang=uk");
  assert.match(terms, /Умови послуг і cookie/);
  assert.match(terms, /Що варто знати перед замовленням/);
});

test("does not server-render legacy calculator controls", async () => {
  const html = await render("/?lang=en");
  assert.match(html, /id=["']calculator["']/i);
  assert.doesNotMatch(html, /type=["']range["']/i);
  assert.doesNotMatch(html, /legacy-calculator-disabled/i);
});
