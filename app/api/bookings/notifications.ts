export type NotificationEnv = {
  RESEND_API_KEY?: string;
  BOOKING_NOTIFY_TO?: string;
  BOOKING_NOTIFY_FROM?: string;
};

export type BookingNotificationPayload = {
  service: string;
  name: string;
  phone: string;
  email: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  notes: string;
};

export type BookingLocale = "fi" | "en" | "uk" | "ru";

const customerCopy = {
  fi: {
    subject: "Muuttobotti vastaanotti varauspyyntösi",
    hello: "Hei",
    received: "Olemme vastaanottaneet varauspyyntösi.",
    pending: "Vahvistamme lopullisen hinnan ja ajankohdan ennen työn suorittamista.",
    booking: "Varausnumero",
    service: "Palvelu",
    address: "Osoite",
    pickup: "Nouto",
    destination: "Kohde",
    schedule: "Ajankohta",
    plan: "Arvio / suunnitelma",
    track: "Yksityinen seurantalinkki",
    private: "Säilytä linkki yksityisenä. Sen kautta voit seurata, muuttaa tai perua varaustasi.",
    help: "Tarvitsetko apua? Soita 045 787 67567 tai vastaa tähän viestiin.",
  },
  en: {
    subject: "Muuttobotti received your booking request",
    hello: "Hello",
    received: "We have received your booking request.",
    pending: "We will confirm the final price and time before the job.",
    booking: "Booking number",
    service: "Service",
    address: "Address",
    pickup: "Pickup",
    destination: "Destination",
    schedule: "Schedule",
    plan: "Estimate / plan",
    track: "Private tracking link",
    private: "Keep this link private. You can use it to track, change or cancel your booking.",
    help: "Need help? Call 045 787 67567 or reply to this email.",
  },
  uk: {
    subject: "Muuttobotti отримав вашу заявку",
    hello: "Вітаємо",
    received: "Ми отримали вашу заявку на бронювання.",
    pending: "Остаточну ціну та час ми підтвердимо до виконання роботи.",
    booking: "Номер бронювання",
    service: "Послуга",
    address: "Адреса",
    pickup: "Завантаження",
    destination: "Доставка",
    schedule: "Дата й час",
    plan: "Оцінка / план",
    track: "Приватне посилання для відстеження",
    private: "Зберігайте це посилання приватним. Через нього можна відстежити, змінити або скасувати бронювання.",
    help: "Потрібна допомога? Телефонуйте 045 787 67567 або відповідайте на цей лист.",
  },
  ru: {
    subject: "Muuttobotti получил вашу заявку",
    hello: "Здравствуйте",
    received: "Мы получили вашу заявку на бронирование.",
    pending: "Финальную цену и время мы подтвердим до выполнения работы.",
    booking: "Номер бронирования",
    service: "Услуга",
    address: "Адрес",
    pickup: "Загрузка",
    destination: "Доставка",
    schedule: "Дата и время",
    plan: "Расчёт / план",
    track: "Приватная ссылка для отслеживания",
    private: "Храните эту ссылку в приватном доступе. Через неё можно отслеживать, изменять или отменять бронирование.",
    help: "Нужна помощь? Позвоните 045 787 67567 или ответьте на это письмо.",
  },
} as const;

const serviceNames: Record<string, Record<BookingLocale, string>> = {
  moving: { fi: "Muutto", en: "Moving", uk: "Переїзд", ru: "Переезд" },
  transport: { fi: "Kuljetus", en: "Transport", uk: "Перевезення", ru: "Перевозка" },
  cleaning: { fi: "Siivous", en: "Cleaning", uk: "Прибирання", ru: "Уборка" },
  windows: { fi: "Ikkunanpesu", en: "Window cleaning", uk: "Миття вікон", ru: "Мойка окон" },
  assembly: { fi: "Kalusteasennus", en: "Furniture assembly", uk: "Складання меблів", ru: "Сборка мебели" },
  junk: { fi: "Poisvienti", en: "Junk removal", uk: "Вивіз речей", ru: "Вывоз вещей" },
};

async function fingerprint(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("").slice(0, 24);
}

function locationLines(payload: BookingNotificationPayload) {
  return payload.pickup === payload.destination
    ? [`Address: ${payload.pickup}`]
    : [`Pickup: ${payload.pickup}`, `Destination: ${payload.destination}`];
}

async function sendNotification(
  env: NotificationEnv,
  subject: string,
  text: string,
  idempotencyKey: string,
  recipient?: string,
) {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) return "skipped" as const;

  const to = recipient?.trim() || env.BOOKING_NOTIFY_TO?.trim() || "autochemixfin@gmail.com";
  const from = env.BOOKING_NOTIFY_FROM?.trim() || "Muuttobotti <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "muuttobotti-finland/1.0",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({ from, to: [to], subject, text, reply_to: "autochemixfin@gmail.com" }),
    });
    return response.ok ? "sent" as const : "failed" as const;
  } catch {
    return "failed" as const;
  }
}

export async function sendBookingCreatedNotification(
  env: NotificationEnv,
  id: string,
  payload: BookingNotificationPayload,
  photoCount: number,
) {
  const text = [
    `New Muuttobotti booking: ${id}`,
    "",
    `Service: ${payload.service}`,
    `Customer: ${payload.name}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    ...locationLines(payload),
    `Date: ${payload.date}`,
    `Time: ${payload.time}`,
    `Photos: ${photoCount}`,
    "",
    "Estimate / notes:",
    payload.notes || "—",
  ].join("\n");

  return sendNotification(
    env,
    `New Muuttobotti booking ${id} · ${payload.name}`,
    text,
    `booking-created-${id}`,
  );
}

export async function sendCustomerBookingConfirmation(
  env: NotificationEnv,
  id: string,
  payload: BookingNotificationPayload,
  locale: BookingLocale,
  trackingUrl: string,
) {
  const c = customerCopy[locale];
  const locations = payload.pickup === payload.destination
    ? [`${c.address}: ${payload.pickup}`]
    : [`${c.pickup}: ${payload.pickup}`, `${c.destination}: ${payload.destination}`];
  const text = [
    `${c.hello}, ${payload.name}!`,
    "",
    c.received,
    c.pending,
    "",
    `${c.booking}: ${id}`,
    `${c.service}: ${serviceNames[payload.service]?.[locale] ?? payload.service}`,
    ...locations,
    `${c.schedule}: ${payload.date} ${payload.time}`,
    "",
    `${c.plan}:`,
    payload.notes || "—",
    "",
    `${c.track}:`,
    trackingUrl,
    c.private,
    "",
    c.help,
    "",
    "Muuttobotti / Autochemix Oy",
  ].join("\n");

  return sendNotification(
    env,
    `${c.subject} · ${id}`,
    text,
    `booking-customer-${id}`,
    payload.email,
  );
}

export async function sendBookingStatusNotification(
  env: NotificationEnv,
  id: string,
  action: "modify" | "cancel",
  payload: BookingNotificationPayload,
) {
  const actionLabel = action === "cancel" ? "CANCELLED" : "CHANGE REQUESTED";
  const text = [
    `Muuttobotti booking ${actionLabel}: ${id}`,
    "",
    `Customer: ${payload.name}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Service: ${payload.service}`,
    ...locationLines(payload),
    `Date: ${payload.date}`,
    `Time: ${payload.time}`,
    "",
    "Notes:",
    payload.notes || "—",
  ].join("\n");
  const contentFingerprint = await fingerprint(JSON.stringify({ action, payload }));

  return sendNotification(
    env,
    `${actionLabel}: ${id} · ${payload.name}`,
    text,
    `booking-${action}-${id}-${contentFingerprint}`,
  );
}
