type NotifyEnv = {
  DB?: any;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
};

type NoticeKind = 'confirmed' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled' | 'quote' | 'change_requested';

const copy: Record<string, Record<NoticeKind, { title: string; body: string }>> = {
  fi: {
    confirmed: { title: 'Varaus vahvistettu', body: 'Muuttobotti on vahvistanut varauksesi.' },
    assigned: { title: 'Tekijä on määritetty', body: 'Tilauksellesi on määritetty tekijä.' },
    on_the_way: { title: 'Matkalla luoksesi', body: 'Muuttobotti on matkalla nouto- tai palveluosoitteeseen.' },
    in_progress: { title: 'Työ on alkanut', body: 'Tilauksesi on nyt käynnissä.' },
    completed: { title: 'Tilaus valmis', body: 'Tilauksesi on merkitty valmiiksi. Kiitos!' },
    cancelled: { title: 'Tilaus peruttu', body: 'Tilauksesi on merkitty perutuksi.' },
    quote: { title: 'Uusi hintatarjous', body: 'Muuttobotti on lähettänyt sinulle vahvistettavan hinnan.' },
    change_requested: { title: 'Muutos vastaanotettu', body: 'Muutospyyntösi on vastaanotettu.' },
  },
  en: {
    confirmed: { title: 'Booking confirmed', body: 'Muuttobotti has confirmed your booking.' },
    assigned: { title: 'Crew assigned', body: 'A worker has been assigned to your booking.' },
    on_the_way: { title: 'On the way', body: 'Muuttobotti is heading to your pickup or service address.' },
    in_progress: { title: 'Job started', body: 'Your booking is now in progress.' },
    completed: { title: 'Job completed', body: 'Your booking has been marked completed. Thank you!' },
    cancelled: { title: 'Booking cancelled', body: 'Your booking has been marked cancelled.' },
    quote: { title: 'New price offer', body: 'Muuttobotti sent you a price to approve.' },
    change_requested: { title: 'Change received', body: 'Your change request has been received.' },
  },
  ru: {
    confirmed: { title: 'Заказ подтверждён', body: 'Muuttobotti подтвердил ваш заказ.' },
    assigned: { title: 'Исполнитель назначен', body: 'Для вашего заказа назначен исполнитель.' },
    on_the_way: { title: 'Мы выехали', body: 'Muuttobotti уже направляется к адресу заказа.' },
    in_progress: { title: 'Работа началась', body: 'Ваш заказ сейчас выполняется.' },
    completed: { title: 'Заказ завершён', body: 'Заказ отмечен как завершён. Спасибо!' },
    cancelled: { title: 'Заказ отменён', body: 'Заказ отмечен как отменён.' },
    quote: { title: 'Новое предложение цены', body: 'Muuttobotti отправил цену на подтверждение.' },
    change_requested: { title: 'Изменение получено', body: 'Ваш запрос на изменение заказа получен.' },
  },
  uk: {
    confirmed: { title: 'Замовлення підтверджено', body: 'Muuttobotti підтвердив ваше замовлення.' },
    assigned: { title: 'Виконавця призначено', body: 'Для вашого замовлення призначено виконавця.' },
    on_the_way: { title: 'Ми вже в дорозі', body: 'Muuttobotti прямує до адреси замовлення.' },
    in_progress: { title: 'Роботу розпочато', body: 'Ваше замовлення зараз виконується.' },
    completed: { title: 'Замовлення завершено', body: 'Замовлення позначено як завершене. Дякуємо!' },
    cancelled: { title: 'Замовлення скасовано', body: 'Замовлення позначено як скасоване.' },
    quote: { title: 'Нова пропозиція ціни', body: 'Muuttobotti надіслав ціну для підтвердження.' },
    change_requested: { title: 'Зміну отримано', body: 'Ваш запит на зміну замовлення отримано.' },
  },
};

function localeKey(locale: unknown) {
  const value = String(locale || 'fi').toLowerCase();
  return value === 'ua' ? 'uk' : (copy[value] ? value : 'fi');
}

async function sendExpo(tokens: string[], title: string, body: string, bookingId: string, accessKey?: string) {
  const valid = tokens.filter(token => /^(ExponentPushToken|ExpoPushToken)\[.+\]$/.test(token));
  if (!valid.length) return false;
  const payload = valid.map(to => ({
    to,
    sound: 'default',
    title,
    body,
    data: { bookingId, ...(accessKey ? { accessKey } : {}) },
    channelId: 'bookings',
  }));
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

async function sendEmail(env: NotifyEnv, to: string, title: string, body: string, bookingId: string) {
  if (!env.RESEND_API_KEY || !to) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.RESEND_FROM || 'Muuttobotti <noreply@muuttobotti.fi>',
      to: [to],
      subject: `${title} · ${bookingId}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>${title}</h2><p>${body}</p><p><strong>${bookingId}</strong></p><p><a href="https://muuttobotti.fi/mobile-preview.html">Avaa Muuttobotti</a></p></div>`,
    }),
  });
  return response.ok;
}

export async function notifyBooking(env: NotifyEnv, booking: { id: string; email?: string; locale?: string }, kind: NoticeKind) {
  if (!env.DB) return { push: false, email: false };
  const l = localeKey(booking.locale);
  const message = copy[l][kind] || copy.fi[kind];
  const rows = await env.DB.prepare('SELECT token FROM push_tokens WHERE booking_id = ? AND active = 1 LIMIT 20').bind(booking.id).all();
  const tokens = (rows.results ?? []).map((row: any) => String(row.token || '')).filter(Boolean);
  let push = false;
  let email = false;
  try { push = await sendExpo(tokens, message.title, message.body, booking.id); } catch (error) { console.error('Push delivery failed', error); }
  try { email = await sendEmail(env, String(booking.email || ''), message.title, message.body, booking.id); } catch (error) { console.error('Email delivery failed', error); }
  return { push, email };
}
