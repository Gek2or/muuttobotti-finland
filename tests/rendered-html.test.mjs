import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("server-renders localized homepage utility copy and links", async () => {
  const fi = await render("/");
  assert.match(fi, /Varausnumero heti/);
  assert.match(fi, /Aukioloajat/);
  assert.match(fi, /Palvelut/);
  assert.match(fi, /href=["']\/moving-jarvenpaa["']/i);
  assert.doesNotMatch(fi, /Booking number immediately/);
  assert.doesNotMatch(fi, />Services<\/strong>/);

  const en = await render("/?lang=en");
  assert.match(en, /Booking number immediately/);
  assert.match(en, /Opening hours/);
  assert.match(en, /href=["']\/track\?lang=en["']/i);
  assert.match(en, /href=["']\/moving-jarvenpaa\?lang=en["']/i);

  const uk = await render("/?lang=uk");
  assert.match(uk, /Номер бронювання одразу/);
  assert.match(uk, /Години роботи/);
  assert.match(uk, /Конфіденційність/);
  assert.match(uk, /href=["']\/track\?lang=uk["']/i);
  assert.match(uk, /href=["']\/moving-jarvenpaa\?lang=uk["']/i);
  assert.doesNotMatch(uk, /Booking number immediately/);

  const ru = await render("/?lang=ru");
  assert.match(ru, /Номер бронирования сразу/);
  assert.match(ru, /Часы работы/);
  assert.match(ru, /Конфиденциальность/);
  assert.match(ru, /href=["']\/privacy\?lang=ru["']/i);
  assert.match(ru, /href=["']\/moving-jarvenpaa\?lang=ru["']/i);
  assert.doesNotMatch(ru, /Booking number immediately/);
});

test("calculator bridge targets the current calculator and direct-booking services", () => {
  const bridge = readFileSync(new URL("../app/CalculatorBridgeV6.tsx", import.meta.url), "utf8");
  assert.match(bridge, /\.bc8-card \.bc8-tabs button\[role='tab'\]/);
  assert.doesNotMatch(bridge, /\.bc3-tabs/);
  assert.match(bridge, /\["windows", "assembly", "junk"\]/);
  assert.match(bridge, /document\.getElementById\("booking"\)/);
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
