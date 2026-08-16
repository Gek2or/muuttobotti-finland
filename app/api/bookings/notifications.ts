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

async function fingerprint(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("").slice(0, 24);
}

async function sendNotification(
  env: NotificationEnv,
  subject: string,
  text: string,
  idempotencyKey: string,
) {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey) return "skipped" as const;

  const to = env.BOOKING_NOTIFY_TO?.trim() || "autochemixfin@gmail.com";
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
      body: JSON.stringify({ from, to: [to], subject, text }),
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
    `Pickup: ${payload.pickup}`,
    `Destination: ${payload.destination}`,
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
    `Pickup: ${payload.pickup}`,
    `Destination: ${payload.destination}`,
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
