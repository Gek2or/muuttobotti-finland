export type HomeLocale = "fi" | "en" | "uk" | "ru";

export const homeSurfaceCopy: Record<HomeLocale, {
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
  trackingLabel: string;
  heroAlt: string;
}> = {
  fi: {
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
    trackingLabel: "Seuranta",
    heroAlt: "Muuttobotti muuttopalvelun tiimi ja pakettiauto",
  },
  en: {
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
    trackingLabel: "Tracking",
    heroAlt: "Muuttobotti moving service team and van",
  },
  uk: {
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
    trackingLabel: "Відстеження",
    heroAlt: "Команда та фургон служби переїздів Muuttobotti",
  },
  ru: {
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
    trackingLabel: "Отслеживание",
    heroAlt: "Команда и фургон службы переездов Muuttobotti",
  },
};

export const footerCities = [
  { label: "Helsinki", slug: "helsinki" },
  { label: "Espoo", slug: "espoo" },
  { label: "Vantaa", slug: "vantaa" },
  { label: "Tuusula", slug: "tuusula" },
  { label: "Kerava", slug: "kerava" },
  { label: "Järvenpää", slug: "jarvenpaa" },
  { label: "Porvoo", slug: "porvoo" },
] as const;
