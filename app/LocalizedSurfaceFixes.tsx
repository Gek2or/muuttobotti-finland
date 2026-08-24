"use client";

import { useEffect } from "react";

type Locale = "fi" | "en" | "uk" | "ru";

type SurfaceCopy = {
  cleaning: [string, string];
  tracking: {
    preview: string;
    privateBooking: string;
    example: string;
    booked: string;
    inProgress: string;
    completed: string;
    privateLink: string;
    secure: string;
    date: string;
    confirmed: string;
    team: string;
    assigned: string;
  };
  bookingBenefits: [string, string, string];
  fileHint: string;
  formError: string;
  area: string;
  hoursLabel: string;
  hoursText: string;
  footerRating: string;
  footerHeadings: [string, string, string];
  serviceLinks: [string, string, string, string, string];
  companyLinks: [string, string, string, string, string];
  tagline: string;
  bookingLabel: string;
  trackingLink: string;
  reviewScore: string;
  ratingNumber: string;
};

const copy: Record<Locale, SurfaceCopy> = {
  fi: {
    cleaning: ["Ammattivälineet ja -aineet", "Laatutakuu"],
    tracking: {
      preview: "Seurannan esikatselu",
      privateBooking: "Yksityinen seurantalinkki",
      example: "Esimerkki",
      booked: "Varattu",
      inProgress: "Käynnissä",
      completed: "Valmis",
      privateLink: "Yksityinen linkki",
      secure: "Suojattu",
      date: "Päivä",
      confirmed: "Vahvistettu",
      team: "Tiimi",
      assigned: "Määritetty",
    },
    bookingBenefits: ["Varausnumero heti", "Yksityinen seurantalinkki", "Kuvien liittäminen"],
    fileHint: "JPG, PNG tai WebP · enintään 5 kuvaa · 8 Mt / kuva",
    formError: "Varausta ei voitu lähettää. Soita tai lähetä WhatsApp-viesti.",
    area: "HELSINKI · UUSIMAA · SUOMI",
    hoursLabel: "Aukioloajat",
    hoursText: "Ma–Pe 08.00–22.30 · La 08.00–23.00 · Su 12.00–18.00",
    footerRating: "4,9 / 5 · 34 Google-arvostelua",
    footerHeadings: ["Palvelut", "Kaupungit", "Yritys"],
    serviceLinks: ["Muutot", "Kuljetukset", "Siivous", "Ikkunanpesu", "Kalusteasennus"],
    companyLinks: ["Varaa verkossa", "Seuranta", "Google-arvostelut", "Tietosuoja", "Ehdot"],
    tagline: "Kohti sujuvampaa muuttoa.",
    bookingLabel: "Varaus",
    trackingLink: "Seuranta",
    reviewScore: "4,9 / 5",
    ratingNumber: "4,9",
  },
  en: {
    cleaning: ["Professional supplies", "Quality guarantee"],
    tracking: {
      preview: "Tracking preview",
      privateBooking: "Private booking link",
      example: "Example",
      booked: "Booked",
      inProgress: "In progress",
      completed: "Completed",
      privateLink: "Private link",
      secure: "Secure",
      date: "Date",
      confirmed: "Confirmed",
      team: "Team",
      assigned: "Assigned",
    },
    bookingBenefits: ["Booking number immediately", "Private tracking link", "Photo attachments"],
    fileHint: "JPG, PNG or WebP · up to 5 images · 8 MB each",
    formError: "Could not send the booking. Please call or message us on WhatsApp.",
    area: "HELSINKI · UUSIMAA · FINLAND",
    hoursLabel: "Opening hours",
    hoursText: "Mon–Fri 08:00–22:30 · Sat 08:00–23:00 · Sun 12:00–18:00",
    footerRating: "4.9 / 5 · 34 Google reviews",
    footerHeadings: ["Services", "Cities", "Company"],
    serviceLinks: ["Moving", "Transport", "Cleaning", "Window cleaning", "Assembly"],
    companyLinks: ["Book online", "Tracking", "Google reviews", "Privacy", "Terms"],
    tagline: "Made for moving forward.",
    bookingLabel: "Booking",
    trackingLink: "Tracking",
    reviewScore: "4.9 / 5",
    ratingNumber: "4.9",
  },
  uk: {
    cleaning: ["Професійні засоби та інвентар", "Гарантія якості"],
    tracking: {
      preview: "Попередній перегляд відстеження",
      privateBooking: "Приватне посилання на бронювання",
      example: "Приклад",
      booked: "Заброньовано",
      inProgress: "Виконується",
      completed: "Завершено",
      privateLink: "Приватне посилання",
      secure: "Захищено",
      date: "Дата",
      confirmed: "Підтверджено",
      team: "Команда",
      assigned: "Призначено",
    },
    bookingBenefits: ["Номер бронювання одразу", "Приватне посилання для відстеження", "Можна додати фото"],
    fileHint: "JPG, PNG або WebP · до 5 фото · 8 МБ кожне",
    formError: "Не вдалося надіслати заявку. Зателефонуйте або напишіть у WhatsApp.",
    area: "ГЕЛЬСІНКІ · УУСІМАА · ФІНЛЯНДІЯ",
    hoursLabel: "Години роботи",
    hoursText: "Пн–Пт 08:00–22:30 · Сб 08:00–23:00 · Нд 12:00–18:00",
    footerRating: "4,9 / 5 · 34 відгуки Google",
    footerHeadings: ["Послуги", "Міста", "Компанія"],
    serviceLinks: ["Переїзди", "Перевезення", "Прибирання", "Миття вікон", "Збирання меблів"],
    companyLinks: ["Забронювати", "Відстеження", "Відгуки Google", "Конфіденційність", "Умови"],
    tagline: "Рухаємося вперед разом.",
    bookingLabel: "Бронювання",
    trackingLink: "Відстеження",
    reviewScore: "4,9 / 5",
    ratingNumber: "4,9",
  },
  ru: {
    cleaning: ["Профессиональные средства и инвентарь", "Гарантия качества"],
    tracking: {
      preview: "Предпросмотр отслеживания",
      privateBooking: "Приватная ссылка на бронирование",
      example: "Пример",
      booked: "Забронировано",
      inProgress: "В процессе",
      completed: "Завершено",
      privateLink: "Приватная ссылка",
      secure: "Защищено",
      date: "Дата",
      confirmed: "Подтверждено",
      team: "Команда",
      assigned: "Назначена",
    },
    bookingBenefits: ["Номер бронирования сразу", "Приватная ссылка для отслеживания", "Можно добавить фото"],
    fileHint: "JPG, PNG или WebP · до 5 фото · 8 МБ каждое",
    formError: "Не удалось отправить заявку. Позвоните или напишите в WhatsApp.",
    area: "ХЕЛЬСИНКИ · УУСИМАА · ФИНЛЯНДИЯ",
    hoursLabel: "Часы работы",
    hoursText: "Пн–Пт 08:00–22:30 · Сб 08:00–23:00 · Вс 12:00–18:00",
    footerRating: "4,9 / 5 · 34 отзыва Google",
    footerHeadings: ["Услуги", "Города", "Компания"],
    serviceLinks: ["Переезды", "Перевозки", "Уборка", "Мойка окон", "Сборка мебели"],
    companyLinks: ["Забронировать", "Отслеживание", "Отзывы Google", "Конфиденциальность", "Условия"],
    tagline: "Двигаемся вперёд вместе.",
    bookingLabel: "Бронирование",
    trackingLink: "Отслеживание",
    reviewScore: "4,9 / 5",
    ratingNumber: "4,9",
  },
};

function currentLocale(): Locale {
  const lang = document.documentElement.lang;
  if (lang === "en" || lang === "uk" || lang === "ru") return lang;
  return "fi";
}

function replaceDirectText(node: HTMLElement, value: string) {
  const textNode = Array.from(node.childNodes).find(
    (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
  );

  if (textNode) {
    if (textNode.textContent?.trim() !== value) textNode.textContent = value;
    return;
  }

  node.appendChild(document.createTextNode(value));
}

function setText(selector: string, value: string, index = 0) {
  const node = document.querySelectorAll<HTMLElement>(selector)[index];
  if (node) replaceDirectText(node, value);
}

function setTexts(selector: string, values: readonly string[]) {
  const nodes = document.querySelectorAll<HTMLElement>(selector);
  values.forEach((value, index) => {
    const node = nodes[index];
    if (node) replaceDirectText(node, value);
  });
}

function applyTranslations() {
  const t = copy[currentLocale()];

  setTexts(".feature-list span", t.cleaning);

  setText(".art-tracking .dash-top small", t.tracking.preview);
  setText(".art-tracking .dash-top h3", t.tracking.privateBooking);
  setText(".art-tracking .track-head b", t.tracking.example);
  setTexts(".art-tracking .tracking-labels span", [t.tracking.booked, t.tracking.inProgress, t.tracking.completed]);

  const cardLabels = [t.tracking.privateLink, t.tracking.date, t.tracking.team];
  const cardValues = [t.tracking.secure, t.tracking.confirmed, t.tracking.assigned];
  setTexts(".art-tracking .dash-cards > div > span", cardLabels);
  setTexts(".art-tracking .dash-cards > div > strong", cardValues);

  setTexts(".booking-benefits span", t.bookingBenefits);
  setText(".upload-field small", t.fileHint);
  setText(".form-error", t.formError);

  setText(".contact-copy > .kicker", t.area);
  setText(".contact-copy .hours strong", t.hoursLabel);
  setText(".contact-copy .hours span", t.hoursText);

  setText(".verified-review-panel strong", t.reviewScore);
  setText(".google-rating > strong", t.ratingNumber);
  setText(".footer-rating", t.footerRating);

  setTexts("footer > div:nth-of-type(2) > strong, footer > div:nth-of-type(3) > strong, footer > div:nth-of-type(4) > strong", t.footerHeadings);
  setTexts("footer > div:nth-of-type(2) > a", t.serviceLinks);
  setTexts("footer > div:nth-of-type(4) > a", t.companyLinks);
  setText("footer .footer-bottom span", "© 2026 Muuttobotti · Autochemix Oy", 0);
  setText("footer .footer-bottom span", t.tagline, 1);

  setText(".booking-reference span", t.bookingLabel);
  setText(".success-actions a", t.trackingLink);
}

export default function LocalizedSurfaceFixes() {
  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => applyTranslations());
    };

    applyTranslations();

    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return null;
}
