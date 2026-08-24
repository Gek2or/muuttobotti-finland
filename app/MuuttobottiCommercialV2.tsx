"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Hammer,
  Languages,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Navigation,
  PackageCheck,
  Phone,
  Recycle,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Truck,
  UploadCloud,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

type Locale = "fi" | "en" | "uk" | "ru";
type CalcMode = "moving" | "cleaning" | "transport";
type BookingState = "idle" | "sending" | "done" | "error";

const localeNames: Record<Locale, string> = { fi: "FI", en: "EN", uk: "UA", ru: "RU" };

const text = {
  fi: {
    nav: ["Palvelut", "Hinnat", "Näin se toimii", "Varaa"],
    quote: "Pyydä tarjous",
    eyebrow: "Muutot · Kuljetukset · Siivous",
    title: "Muutto ilman turhaa säätöä.",
    subtitle: "Iso pakettiauto, 1–2 muuttajaa ja selkeä arvio ennen työn alkua. Uusimaa ja tarvittaessa koko Suomi.",
    calculate: "Laske hinta",
    book: "Varaa verkossa",
    heroFacts: ["13–15 m³ Crafter", "1 tai 2 muuttajaa", "Uusimaa + koko Suomi"],
    priceStrip: [
      ["1 muuttaja", "59 € / h"],
      ["2 muuttajaa + auto", "75 € / h"],
      ["Siivous", "32,90 € / h"],
    ],
    servicesKicker: "Yksi tiimi, monta palvelua",
    servicesTitle: "Tilaa juuri se, mitä tarvitset.",
    servicesBody: "Muutosta siivoukseen ja yksittäisiin kuljetuksiin. Palvelun sisältö ja hinta vahvistetaan ennen työtä.",
    from: "alkaen",
    serviceCta: "Laske arvio",
    calculatorKicker: "Nopea arvio",
    calculatorTitle: "Laske suuntaa-antava hinta.",
    calculatorBody: "Laskuri auttaa arvioimaan työmäärää. Lopullinen hinta vahvistetaan aina ennen tilausta.",
    modes: ["Muutto", "Siivous", "Kuljetus"],
    movers: "Muuttajien määrä",
    oneMover: "1 muuttaja",
    twoMovers: "2 muuttajaa",
    size: "Kohteen koko",
    floor: "Kerros",
    distance: "Etäisyys",
    elevator: "Hissi käytössä",
    packing: "Pakkausapua",
    afterClean: "Muuttosiivous",
    windows: "Ikkunoita",
    cleaningType: "Siivoustyyppi",
    regular: "Perussiivous",
    moveout: "Muuttosiivous",
    deep: "Suursiivous",
    weight: "Arvioitu paino",
    delivery: "Toimitus",
    normal: "Normaali",
    express: "Pikakuljetus",
    estimate: "Arvio",
    duration: "Arvioitu kesto",
    included: "Sis. ALV:n laskurin oletuksilla. Lopullinen sisältö vahvistetaan ennen työtä.",
    continue: "Jatka varaukseen",
    disclaimer: "Arvio voi muuttua todellisen työmäärän, kulkureitin, tavaramäärän ja lisäpalvelujen mukaan.",
    processKicker: "Selkeä alusta loppuun",
    processTitle: "Kolme vaihetta. Ei turhaa viestittelyä.",
    steps: [
      ["Kerro mitä tarvitset", "Täytä osoitteet, päivä ja tärkeimmät tiedot. Voit liittää myös kuvia."],
      ["Saat vahvistuksen", "Käymme työmäärän läpi ja vahvistamme hinnan sekä ajan ennen työn alkua."],
      ["Seuraa tilausta", "Jokaisesta verkkovarauksesta syntyy yksityinen seurantalinkki, jonka kautta tietoja voi tarkistaa."],
    ],
    whyKicker: "Rakennettu oikeaa arkea varten",
    whyTitle: "Verkkosivu, joka helpottaa myös itse muuttoa.",
    whyItems: [
      ["Suora yhteys", "Puhelin ja WhatsApp ilman välikäsiä."],
      ["Kuvat mukaan", "Liitä jopa viisi kuvaa tavaroista tai kulkureitistä."],
      ["Yksityinen seuranta", "Saat varausnumeron ja henkilökohtaisen seurantalinkin."],
      ["Selkeä arvio", "Näet laskurin arvion ennen yhteydenottoa."],
    ],
    bookingKicker: "Varaa verkossa",
    bookingTitle: "Lähetä tiedot. Me vahvistamme loput.",
    bookingBody: "Verkkovaraus tallentuu suoraan järjestelmään. Saat varausnumeron ja yksityisen seurantalinkin heti lähetyksen jälkeen.",
    service: "Palvelu",
    name: "Nimi",
    phone: "Puhelin",
    email: "Sähköposti",
    pickup: "Nouto- tai palveluosoite",
    destination: "Kohdeosoite",
    destinationOptional: "Kohdeosoite (tarvittaessa)",
    date: "Toivottu päivä",
    time: "Toivottu aika",
    notes: "Lisätiedot",
    photos: "Lisää kuvia",
    photoHelp: "JPG, PNG tai WebP · enintään 5 kuvaa · 8 MB / kuva",
    submit: "Lähetä varaus",
    sending: "Lähetetään…",
    error: "Varausta ei voitu lähettää. Soita tai lähetä WhatsApp-viesti.",
    success: "Varaus vastaanotettu",
    successBody: "Tallenna yksityinen seurantalinkki. Sen kautta voit tarkistaa varauksen tiedot.",
    bookingNumber: "Varausnumero",
    openTracking: "Avaa seuranta",
    close: "Sulje",
    faqKicker: "Hyvä tietää",
    faqTitle: "Usein kysyttyä ennen tilausta.",
    contactTitle: "Tarvitsetko nopean arvion?",
    contactBody: "Lähetä WhatsAppissa osoitteet, kuvat ja lyhyt kuvaus tavaroista. Kiireellisissä kuljetuksissa soita suoraan.",
    hours: "Ma–Su 07:00–22:00",
    cookies: "Käytämme välttämättömiä evästeitä sivuston toimintaan. Valinnaisen analytiikan voi hyväksyä erikseen.",
    essential: "Vain välttämättömät",
    accept: "Hyväksy kaikki",
    calculatorSummary: "Laskurin tiedot",
  },
  en: {
    nav: ["Services", "Pricing", "How it works", "Book"],
    quote: "Get a quote",
    eyebrow: "Moving · Transport · Cleaning",
    title: "Moving without the hassle.",
    subtitle: "A large van, 1–2 movers and a clear estimate before the job starts. Uusimaa and, when needed, all of Finland.",
    calculate: "Calculate price",
    book: "Book online",
    heroFacts: ["13–15 m³ Crafter", "1 or 2 movers", "Uusimaa + Finland"],
    priceStrip: [["1 mover", "59 € / h"], ["2 movers + van", "75 € / h"], ["Cleaning", "32.90 € / h"]],
    servicesKicker: "One team, multiple services",
    servicesTitle: "Book exactly what you need.",
    servicesBody: "From full moves to cleaning and one-off transport. Scope and final price are confirmed before the job.",
    from: "from",
    serviceCta: "Calculate estimate",
    calculatorKicker: "Quick estimate",
    calculatorTitle: "Estimate the price in seconds.",
    calculatorBody: "The calculator helps estimate workload. We always confirm the final price before the booking is accepted.",
    modes: ["Moving", "Cleaning", "Transport"],
    movers: "Number of movers",
    oneMover: "1 mover",
    twoMovers: "2 movers",
    size: "Property size",
    floor: "Floor",
    distance: "Distance",
    elevator: "Elevator available",
    packing: "Packing help",
    afterClean: "Move-out cleaning",
    windows: "Windows",
    cleaningType: "Cleaning type",
    regular: "Regular clean",
    moveout: "Move-out clean",
    deep: "Deep clean",
    weight: "Estimated weight",
    delivery: "Delivery",
    normal: "Normal",
    express: "Express",
    estimate: "Estimate",
    duration: "Estimated duration",
    included: "VAT included under calculator assumptions. Final scope is confirmed before the job.",
    continue: "Continue to booking",
    disclaimer: "The estimate may change based on actual workload, access, volume and selected extras.",
    processKicker: "Clear from start to finish",
    processTitle: "Three steps. Less back-and-forth.",
    steps: [["Tell us what you need", "Add addresses, date and key details. You can attach photos too."], ["Get confirmation", "We review the workload and confirm the price and time before the job."], ["Track your booking", "Every online booking gets a private tracking link for checking the order details."]],
    whyKicker: "Built for real moving days",
    whyTitle: "A website that makes the actual move easier.",
    whyItems: [["Direct contact", "Phone and WhatsApp without middlemen."], ["Attach photos", "Add up to five photos of items or access conditions."], ["Private tracking", "Receive a booking number and personal tracking link."], ["Clear estimate", "See an estimate before sending a request."]],
    bookingKicker: "Book online",
    bookingTitle: "Send the details. We confirm the rest.",
    bookingBody: "Your request is stored directly in our booking system. You receive a booking number and private tracking link immediately after submission.",
    service: "Service", name: "Name", phone: "Phone", email: "Email", pickup: "Pickup or service address", destination: "Destination", destinationOptional: "Destination (if needed)", date: "Preferred date", time: "Preferred time", notes: "Notes", photos: "Add photos", photoHelp: "JPG, PNG or WebP · up to 5 photos · 8 MB each", submit: "Send booking", sending: "Sending…", error: "Could not send the booking. Please call or message us on WhatsApp.", success: "Booking received", successBody: "Save the private tracking link. You can use it to check your booking details.", bookingNumber: "Booking number", openTracking: "Open tracking", close: "Close",
    faqKicker: "Good to know", faqTitle: "Common questions before booking.",
    contactTitle: "Need a quick estimate?", contactBody: "Send the addresses, photos and a short item list on WhatsApp. For urgent transport, call us directly.", hours: "Mon–Sun 07:00–22:00",
    cookies: "We use essential cookies for site functionality. Optional analytics can be accepted separately.", essential: "Essential only", accept: "Accept all", calculatorSummary: "Calculator details",
  },
  uk: {
    nav: ["Послуги", "Ціни", "Як це працює", "Бронювання"], quote: "Отримати розрахунок", eyebrow: "Переїзди · Перевезення · Прибирання", title: "Переїзд без зайвого клопоту.", subtitle: "Великий фургон, 1–2 вантажники та зрозуміла оцінка до початку роботи. Уусімаа та за потреби вся Фінляндія.", calculate: "Розрахувати ціну", book: "Забронювати", heroFacts: ["Crafter 13–15 м³", "1 або 2 вантажники", "Уусімаа + вся Фінляндія"], priceStrip: [["1 вантажник", "59 € / год"], ["2 вантажники + авто", "75 € / год"], ["Прибирання", "32,90 € / год"]], servicesKicker: "Одна команда, багато послуг", servicesTitle: "Замовляйте саме те, що потрібно.", servicesBody: "Від повного переїзду до прибирання та окремих перевезень. Обсяг і остаточну ціну підтверджуємо до початку роботи.", from: "від", serviceCta: "Розрахувати", calculatorKicker: "Швидка оцінка", calculatorTitle: "Оцініть вартість за кілька секунд.", calculatorBody: "Калькулятор допомагає оцінити обсяг роботи. Остаточну ціну завжди підтверджуємо перед замовленням.", modes: ["Переїзд", "Прибирання", "Перевезення"], movers: "Кількість вантажників", oneMover: "1 вантажник", twoMovers: "2 вантажники", size: "Площа", floor: "Поверх", distance: "Відстань", elevator: "Є ліфт", packing: "Допомога з пакуванням", afterClean: "Прибирання після переїзду", windows: "Вікна", cleaningType: "Тип прибирання", regular: "Звичайне", moveout: "Після переїзду", deep: "Генеральне", weight: "Приблизна вага", delivery: "Доставка", normal: "Звичайна", express: "Експрес", estimate: "Оцінка", duration: "Орієнтовний час", included: "ПДВ включено за умовами калькулятора. Остаточний обсяг підтверджується до роботи.", continue: "До бронювання", disclaimer: "Оцінка може змінитися залежно від фактичного обсягу, доступу, кількості речей та додаткових послуг.", processKicker: "Зрозуміло від початку до кінця", processTitle: "Три кроки. Менше листування.", steps: [["Розкажіть, що потрібно", "Вкажіть адреси, дату та основні деталі. Можна додати фото."], ["Отримайте підтвердження", "Ми перевіримо обсяг і підтвердимо ціну та час до початку роботи."], ["Відстежуйте замовлення", "Кожне онлайн-бронювання отримує приватне посилання для перевірки деталей."]], whyKicker: "Для реального дня переїзду", whyTitle: "Сайт, який спрощує не лише бронювання.", whyItems: [["Прямий контакт", "Телефон і WhatsApp без посередників."], ["Фото до заявки", "Додайте до п’яти фото речей або доступу."], ["Приватне відстеження", "Отримайте номер замовлення та особисте посилання."], ["Зрозуміла оцінка", "Побачте приблизну вартість до відправлення заявки."]], bookingKicker: "Онлайн-бронювання", bookingTitle: "Надішліть деталі. Решту підтвердимо ми.", bookingBody: "Заявка зберігається безпосередньо в системі бронювань. Після відправлення ви одразу отримаєте номер і приватне посилання.", service: "Послуга", name: "Ім’я", phone: "Телефон", email: "Email", pickup: "Адреса завантаження або послуги", destination: "Адреса доставки", destinationOptional: "Адреса доставки (за потреби)", date: "Бажана дата", time: "Бажаний час", notes: "Примітки", photos: "Додати фото", photoHelp: "JPG, PNG або WebP · до 5 фото · 8 МБ кожне", submit: "Надіслати заявку", sending: "Надсилаємо…", error: "Не вдалося надіслати заявку. Зателефонуйте або напишіть у WhatsApp.", success: "Заявку отримано", successBody: "Збережіть приватне посилання для перевірки деталей замовлення.", bookingNumber: "Номер бронювання", openTracking: "Відкрити відстеження", close: "Закрити", faqKicker: "Корисно знати", faqTitle: "Часті питання перед замовленням.", contactTitle: "Потрібна швидка оцінка?", contactBody: "Надішліть у WhatsApp адреси, фото та короткий список речей. Для термінових перевезень телефонуйте напряму.", hours: "Пн–Нд 07:00–22:00", cookies: "Ми використовуємо необхідні cookie для роботи сайту. Додаткову аналітику можна дозволити окремо.", essential: "Лише необхідні", accept: "Прийняти все", calculatorSummary: "Дані калькулятора",
  },
  ru: {
    nav: ["Услуги", "Цены", "Как это работает", "Бронирование"], quote: "Получить расчёт", eyebrow: "Переезды · Перевозки · Уборка", title: "Переезд без лишней суеты.", subtitle: "Большой фургон, 1–2 грузчика и понятная оценка до начала работы. Уусимаа и при необходимости вся Финляндия.", calculate: "Рассчитать цену", book: "Забронировать", heroFacts: ["Crafter 13–15 м³", "1 или 2 грузчика", "Уусимаа + вся Финляндия"], priceStrip: [["1 грузчик", "59 € / ч"], ["2 грузчика + авто", "75 € / ч"], ["Уборка", "32,90 € / ч"]], servicesKicker: "Одна команда, много услуг", servicesTitle: "Закажите именно то, что нужно.", servicesBody: "От полного переезда до уборки и отдельных перевозок. Объём и итоговую цену подтверждаем до начала работы.", from: "от", serviceCta: "Рассчитать", calculatorKicker: "Быстрая оценка", calculatorTitle: "Оцените стоимость за несколько секунд.", calculatorBody: "Калькулятор помогает оценить объём работы. Итоговую цену мы всегда подтверждаем до принятия заказа.", modes: ["Переезд", "Уборка", "Перевозка"], movers: "Количество грузчиков", oneMover: "1 грузчик", twoMovers: "2 грузчика", size: "Площадь", floor: "Этаж", distance: "Расстояние", elevator: "Есть лифт", packing: "Помощь с упаковкой", afterClean: "Уборка после переезда", windows: "Окна", cleaningType: "Тип уборки", regular: "Обычная", moveout: "После переезда", deep: "Генеральная", weight: "Примерный вес", delivery: "Доставка", normal: "Обычная", express: "Экспресс", estimate: "Оценка", duration: "Примерное время", included: "НДС включён по условиям калькулятора. Итоговый объём подтверждается до работы.", continue: "Перейти к бронированию", disclaimer: "Оценка может измениться в зависимости от фактического объёма, доступа, количества вещей и дополнительных услуг.", processKicker: "Понятно от начала до конца", processTitle: "Три шага. Меньше переписки.", steps: [["Расскажите, что нужно", "Укажите адреса, дату и основные детали. Можно приложить фотографии."], ["Получите подтверждение", "Мы проверим объём и подтвердим цену и время до начала работы."], ["Следите за заказом", "Каждое онлайн-бронирование получает приватную ссылку для проверки деталей."]], whyKicker: "Для реального дня переезда", whyTitle: "Сайт, который упрощает не только бронирование.", whyItems: [["Прямой контакт", "Телефон и WhatsApp без посредников."], ["Фото к заявке", "Добавьте до пяти фото вещей или подъезда."], ["Приватное отслеживание", "Получите номер заказа и личную ссылку."], ["Понятная оценка", "Увидьте примерную стоимость до отправки заявки."]], bookingKicker: "Онлайн-бронирование", bookingTitle: "Отправьте детали. Остальное подтвердим мы.", bookingBody: "Заявка сохраняется напрямую в системе бронирований. После отправки вы сразу получите номер и приватную ссылку.", service: "Услуга", name: "Имя", phone: "Телефон", email: "Email", pickup: "Адрес загрузки или услуги", destination: "Адрес доставки", destinationOptional: "Адрес доставки (при необходимости)", date: "Желаемая дата", time: "Желаемое время", notes: "Примечания", photos: "Добавить фото", photoHelp: "JPG, PNG или WebP · до 5 фото · 8 МБ каждое", submit: "Отправить заявку", sending: "Отправляем…", error: "Не удалось отправить заявку. Позвоните или напишите в WhatsApp.", success: "Заявка получена", successBody: "Сохраните приватную ссылку для проверки деталей заказа.", bookingNumber: "Номер бронирования", openTracking: "Открыть отслеживание", close: "Закрыть", faqKicker: "Полезно знать", faqTitle: "Частые вопросы перед заказом.", contactTitle: "Нужна быстрая оценка?", contactBody: "Отправьте в WhatsApp адреса, фото и короткий список вещей. Для срочных перевозок звоните напрямую.", hours: "Пн–Вс 07:00–22:00", cookies: "Мы используем необходимые cookie для работы сайта. Дополнительную аналитику можно разрешить отдельно.", essential: "Только необходимые", accept: "Принять все", calculatorSummary: "Данные калькулятора",
  },
} as const;

const serviceList = [
  { key: "moving", icon: Boxes, price: "59 € / h", fi: ["Muuttopalvelu", "Koti- ja yritysmuutot, kantoapu, pakkaus ja kalusteiden purku."], en: ["Moving service", "Home and office moves, carrying, packing and furniture disassembly."], uk: ["Переїзди", "Переїзди дому й офісу, перенесення, пакування та розбирання меблів."], ru: ["Переезды", "Переезды дома и офиса, перенос, упаковка и разборка мебели."] },
  { key: "transport", icon: Truck, price: "49 €", fi: ["Kuljetukset", "Huonekalut, kodinkoneet, kauppanoudot ja pienet pikakuljetukset."], en: ["Transport", "Furniture, appliances, store pickups and small express deliveries."], uk: ["Перевезення", "Меблі, техніка, забір із магазинів та невеликі термінові доставки."], ru: ["Перевозки", "Мебель, техника, забор из магазинов и небольшие срочные доставки."] },
  { key: "cleaning", icon: Sparkles, price: "32,90 € / h", fi: ["Siivous", "Koti-, toimisto- ja muuttosiivous sekä ikkunanpesu."], en: ["Cleaning", "Home, office and move-out cleaning plus window cleaning."], uk: ["Прибирання", "Прибирання дому, офісу, після переїзду та миття вікон."], ru: ["Уборка", "Уборка дома, офиса, после переезда и мойка окон."] },
  { key: "assembly", icon: Hammer, price: "45 € / h", fi: ["Kalusteasennus", "IKEA- ja muiden kalusteiden purku, kokoaminen ja siirto."], en: ["Furniture assembly", "Disassembly, assembly and moving of IKEA and other furniture."], uk: ["Збирання меблів", "Розбирання, складання та переміщення IKEA й інших меблів."], ru: ["Сборка мебели", "Разборка, сборка и перенос IKEA и другой мебели."] },
  { key: "junk", icon: Recycle, price: "60 €", fi: ["Poisvienti", "Nouto, lajittelu ja kuljetus kierrätysasemalle sovitusti."], en: ["Junk removal", "Pickup, sorting and transport to a recycling station as agreed."], uk: ["Вивіз речей", "Забір, сортування та доставка на станцію переробки за домовленістю."], ru: ["Вывоз вещей", "Забор, сортировка и доставка на станцию переработки по договорённости."] },
  { key: "windows", icon: Building2, price: "45 €", fi: ["Ikkunanpesu", "Ikkunat, karmit ja parvekelasit ammattivälineillä."], en: ["Window cleaning", "Windows, frames and balcony glass with professional tools."], uk: ["Миття вікон", "Вікна, рами та балконне скло професійними засобами."], ru: ["Мойка окон", "Окна, рамы и балконное остекление профессиональными средствами."] },
] as const;

const faq: Record<Locale, [string, string][]> = {
  fi: [
    ["Milloin työaika alkaa?", "Muuttopalvelussa työaika alkaa, kun tiimi saapuu sovittuun nouto-osoitteeseen."],
    ["Onko minimiveloitusta?", "Useimmissa muuttopalveluissa minimiveloitus on kaksi tuntia. Mahdolliset poikkeukset vahvistetaan tarjouksessa."],
    ["Sisältyykö auto ja polttoaine?", "Vahvistetussa tarjouksessa kerrotaan aina selkeästi, mitä hinta sisältää. Laskurin muuttoarvio olettaa auton olevan mukana."],
    ["Voinko lähettää kuvia etukäteen?", "Kyllä. Verkkovaraukseen voi liittää enintään viisi JPG-, PNG- tai WebP-kuvaa."],
    ["Voinko muuttaa varausta?", "Saat verkkovarauksesta yksityisen seurantalinkin. Sen kautta voit tarkistaa varauksen ja käytössä olevista toiminnoista riippuen päivittää tietoja."],
    ["Palveletteko Helsingin ulkopuolella?", "Kyllä. Palvelemme Uudellamaalla ja sovittaessa koko Suomessa."],
  ],
  en: [
    ["When does billable time start?", "For moving services, billable time starts when the team arrives at the agreed pickup address."],
    ["Is there a minimum charge?", "Most moving services have a two-hour minimum. Any exception is confirmed in the quote."],
    ["Are the van and fuel included?", "The confirmed quote always states what is included. The moving calculator assumes the van is included."],
    ["Can I send photos in advance?", "Yes. You can attach up to five JPG, PNG or WebP images to the online booking."],
    ["Can I modify the booking?", "Online bookings receive a private tracking link where you can check the booking and use the available self-service options."],
    ["Do you work outside Helsinki?", "Yes. We serve Uusimaa and, by agreement, all of Finland."],
  ],
  uk: [
    ["Коли починається оплачуваний час?", "Для переїзду час починається, коли команда прибуває на узгоджену адресу завантаження."],
    ["Чи є мінімальна оплата?", "Для більшості переїздів мінімум становить дві години. Винятки підтверджуються у пропозиції."],
    ["Чи входять авто та паливо?", "У підтвердженій пропозиції завжди чітко зазначено, що входить у ціну. Калькулятор переїзду передбачає автомобіль."],
    ["Чи можна додати фото?", "Так. До онлайн-заявки можна додати до п’яти JPG, PNG або WebP фото."],
    ["Чи можна змінити бронювання?", "Після онлайн-заявки ви отримаєте приватне посилання для перевірки замовлення та доступних функцій самообслуговування."],
    ["Чи працюєте ви за межами Гельсінкі?", "Так. Ми працюємо в Уусімаа та за домовленістю по всій Фінляндії."],
  ],
  ru: [
    ["Когда начинается оплачиваемое время?", "Для переезда время начинается, когда команда приезжает на согласованный адрес загрузки."],
    ["Есть ли минимальная оплата?", "Для большинства переездов минимум составляет два часа. Исключения подтверждаются в предложении."],
    ["Входят ли машина и топливо?", "В подтверждённом предложении всегда указано, что входит в цену. Калькулятор переезда предполагает наличие автомобиля."],
    ["Можно ли приложить фотографии?", "Да. К онлайн-заявке можно добавить до пяти JPG, PNG или WebP изображений."],
    ["Можно ли изменить бронирование?", "После онлайн-заявки вы получите приватную ссылку для проверки заказа и доступных функций самообслуживания."],
    ["Работаете ли вы за пределами Хельсинки?", "Да. Мы работаем по Уусимаа и по договорённости по всей Финляндии."],
  ],
};

export default function MuuttobottiCommercialV2() {
  const [locale, setLocale] = useState<Locale>("fi");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [calcMode, setCalcMode] = useState<CalcMode>("moving");
  const [size, setSize] = useState(55);
  const [floor, setFloor] = useState(2);
  const [distance, setDistance] = useState(18);
  const [movers, setMovers] = useState<1 | 2>(2);
  const [elevator, setElevator] = useState(true);
  const [packing, setPacking] = useState(false);
  const [afterClean, setAfterClean] = useState(false);
  const [windows, setWindows] = useState(6);
  const [cleanType, setCleanType] = useState("regular");
  const [weight, setWeight] = useState(80);
  const [express, setExpress] = useState(false);
  const [bookingService, setBookingService] = useState<string>("moving");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingState, setBookingState] = useState<BookingState>("idle");
  const [bookingResult, setBookingResult] = useState<{ bookingId: string; trackingPath: string } | null>(null);
  const [cookieChoice, setCookieChoice] = useState<string | null>(null);
  const t = text[locale];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("lang") as Locale | null;
    if (requested && requested in localeNames) setLocale(requested);
    const savedTheme = window.localStorage.getItem("muuttobotti-theme");
    if (savedTheme === "dark") setTheme("dark");
    setCookieChoice(window.localStorage.getItem("muuttobotti-cookie"));
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "uk" ? "uk" : locale;
  }, [locale]);

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const estimate = useMemo(() => {
    if (calcMode === "moving") {
      const workload = 1.4 + size / 28 + Math.max(0, floor - (elevator ? 2 : 0)) * 0.22 + (packing ? 1.5 : 0);
      const hours = Math.max(2, movers === 1 ? workload * 1.45 : workload);
      const rate = movers === 1 ? 59 : 75;
      return { price: Math.round(hours * rate + distance * 0.65 + (afterClean ? size * 1.1 : 0)), hours: `${hours.toFixed(1)}–${(hours + 0.8).toFixed(1)} h` };
    }
    if (calcMode === "cleaning") {
      const multiplier = cleanType === "deep" ? 1.45 : cleanType === "moveout" ? 1.25 : 1;
      const hours = Math.max(2, (size / 24) * multiplier + windows * 0.12);
      return { price: Math.round(hours * 32.9), hours: `${hours.toFixed(1)}–${(hours + 0.7).toFixed(1)} h` };
    }
    const hours = Math.max(1, 1 + distance / 48 + weight / 500);
    return { price: Math.round(42 + distance * 1.05 + weight * 0.05 + (express ? 35 : 0)), hours: `${hours.toFixed(1)}–${(hours + 0.5).toFixed(1)} h` };
  }, [calcMode, size, floor, distance, movers, elevator, packing, afterClean, windows, cleanType, weight, express]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }

  function chooseLocale(next: Locale) {
    setLocale(next);
    setLangOpen(false);
    const url = new URL(window.location.href);
    if (next === "fi") url.searchParams.delete("lang"); else url.searchParams.set("lang", next);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      window.localStorage.setItem("muuttobotti-theme", next);
      return next;
    });
  }

  function calculatorToBooking() {
    setBookingService(calcMode);
    const details = calcMode === "moving"
      ? `${t.calculatorSummary}: ${movers} mover(s), ${size} m², floor ${floor}, ${distance} km, elevator ${elevator ? "yes" : "no"}, packing ${packing ? "yes" : "no"}, move-out cleaning ${afterClean ? "yes" : "no"}. Estimate ${estimate.price} €, ${estimate.hours}.`
      : calcMode === "cleaning"
        ? `${t.calculatorSummary}: ${size} m², ${windows} windows, ${cleanType}. Estimate ${estimate.price} €, ${estimate.hours}.`
        : `${t.calculatorSummary}: ${distance} km, ${weight} kg, ${express ? "express" : "normal"}. Estimate ${estimate.price} €, ${estimate.hours}.`;
    setBookingNotes(details);
    scrollTo("booking");
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingState("sending");
    try {
      const data = new FormData(event.currentTarget);
      const pickup = String(data.get("pickup") ?? "").trim();
      if (!String(data.get("destination") ?? "").trim()) data.set("destination", pickup);
      const response = await fetch("/api/bookings", { method: "POST", body: data });
      if (!response.ok) throw new Error("booking failed");
      const result = await response.json() as { bookingId: string; trackingPath: string };
      setBookingResult(result);
      setBookingState("done");
      event.currentTarget.reset();
      setBookingNotes("");
    } catch {
      setBookingState("error");
    }
  }

  function acceptCookies(value: "essential" | "all") {
    window.localStorage.setItem("muuttobotti-cookie", value);
    setCookieChoice(value);
  }

  return (
    <main className={`commercial-v2 ${theme === "dark" ? "is-dark" : ""}`}>
      <header className="v2-header">
        <button className="v2-brand" onClick={() => scrollTo("home")} aria-label="Muuttobotti home">
          <span><PackageCheck /></span><b>muutto<i>botti</i></b>
        </button>
        <nav className="v2-nav" aria-label="Primary navigation">
          {t.nav.map((item, index) => <button key={item} onClick={() => scrollTo(["services", "calculator", "process", "booking"][index])}>{item}</button>)}
        </nav>
        <div className="v2-header-actions">
          <button className="v2-icon-button" onClick={toggleTheme} aria-label="Toggle theme">{theme === "light" ? <Moon /> : <Sun />}</button>
          <div className="v2-language">
            <button className="v2-lang-button" onClick={() => setLangOpen(!langOpen)}><Languages />{localeNames[locale]}<ChevronDown /></button>
            {langOpen && <div className="v2-lang-menu">{(["fi", "en", "uk", "ru"] as Locale[]).map((lang) => <button key={lang} onClick={() => chooseLocale(lang)} className={locale === lang ? "active" : ""}>{localeNames[lang]}{locale === lang && <Check />}</button>)}</div>}
          </div>
          <button className="v2-quote" onClick={() => scrollTo("calculator")}>{t.quote}<ArrowRight /></button>
          <button className="v2-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <nav className="v2-mobile-nav">{t.nav.map((item, index) => <button key={item} onClick={() => scrollTo(["services", "calculator", "process", "booking"][index])}>{item}</button>)}</nav>}
      </header>

      <section className="v2-hero" id="home">
        <Image src="/muuttobotti-hero.png" alt="Muuttobotti moving team with a large van in Finland" fill priority sizes="100vw" className="v2-hero-image" />
        <div className="v2-hero-overlay" />
        <div className="v2-hero-content">
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="v2-eyebrow">{t.eyebrow}</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>{t.title}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>{t.subtitle}</motion.p>
          <motion.div className="v2-hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <button onClick={() => scrollTo("calculator")}>{t.calculate}<ArrowRight /></button>
            <button onClick={() => scrollTo("booking")}>{t.book}</button>
          </motion.div>
          <div className="v2-facts">{t.heroFacts.map((fact, index) => <span key={fact}>{index === 0 ? <Truck /> : index === 1 ? <UsersRound /> : <MapPin />}{fact}</span>)}</div>
        </div>
      </section>

      <section className="v2-price-strip" aria-label="Example prices">{t.priceStrip.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}<small>Muuttobotti / Autochemix Oy · Y-tunnus 3543357-8</small></section>

      <section className="v2-section" id="services">
        <div className="v2-section-head"><div><span>{t.servicesKicker}</span><h2>{t.servicesTitle}</h2></div><p>{t.servicesBody}</p></div>
        <div className="v2-service-grid">
          {serviceList.map((service, index) => {
            const Icon = service.icon;
            const [title, description] = service[locale];
            return <motion.article key={service.key} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
              <span className="v2-service-icon"><Icon /></span><h3>{title}</h3><p>{description}</p><div><small>{t.from}</small><strong>{service.price}</strong></div><button onClick={() => { setCalcMode(service.key === "cleaning" ? "cleaning" : service.key === "transport" ? "transport" : "moving"); scrollTo("calculator"); }}>{t.serviceCta}<ArrowRight /></button>
            </motion.article>;
          })}
        </div>
      </section>

      <section className="v2-calculator" id="calculator">
        <div className="v2-calc-intro"><span>{t.calculatorKicker}</span><h2>{t.calculatorTitle}</h2><p>{t.calculatorBody}</p><div className="v2-calc-trust"><ShieldCheck /><span>{t.disclaimer}</span></div></div>
        <div className="v2-calc-card">
          <div className="v2-tabs">{(["moving", "cleaning", "transport"] as CalcMode[]).map((mode, index) => <button key={mode} className={calcMode === mode ? "active" : ""} onClick={() => setCalcMode(mode)}>{mode === "moving" ? <Boxes /> : mode === "cleaning" ? <Sparkles /> : <Truck />}{t.modes[index]}</button>)}</div>
          <div className="v2-calc-fields">
            {calcMode === "moving" && <>
              <label className="v2-full">{t.movers}<div className="v2-mover-options"><button type="button" className={movers === 1 ? "active" : ""} onClick={() => setMovers(1)}><UserRound />{t.oneMover}<small>59 € / h</small></button><button type="button" className={movers === 2 ? "active" : ""} onClick={() => setMovers(2)}><UsersRound />{t.twoMovers}<small>75 € / h</small></button></div></label>
              <label>{t.size}<strong>{size} m²</strong><input type="range" min="15" max="220" value={size} onChange={(e) => setSize(+e.target.value)} /></label>
              <label>{t.floor}<strong>{floor}</strong><input type="range" min="0" max="12" value={floor} onChange={(e) => setFloor(+e.target.value)} /></label>
              <label>{t.distance}<strong>{distance} km</strong><input type="range" min="1" max="500" value={distance} onChange={(e) => setDistance(+e.target.value)} /></label>
              <div className="v2-switches v2-full"><button type="button" className={elevator ? "active" : ""} onClick={() => setElevator(!elevator)}><CheckCircle2 />{t.elevator}</button><button type="button" className={packing ? "active" : ""} onClick={() => setPacking(!packing)}><Boxes />{t.packing}</button><button type="button" className={afterClean ? "active" : ""} onClick={() => setAfterClean(!afterClean)}><Sparkles />{t.afterClean}</button></div>
            </>}
            {calcMode === "cleaning" && <>
              <label>{t.size}<strong>{size} m²</strong><input type="range" min="20" max="300" value={size} onChange={(e) => setSize(+e.target.value)} /></label>
              <label>{t.windows}<strong>{windows}</strong><input type="range" min="0" max="30" value={windows} onChange={(e) => setWindows(+e.target.value)} /></label>
              <label>{t.cleaningType}<select value={cleanType} onChange={(e) => setCleanType(e.target.value)}><option value="regular">{t.regular}</option><option value="moveout">{t.moveout}</option><option value="deep">{t.deep}</option></select></label>
            </>}
            {calcMode === "transport" && <>
              <label>{t.distance}<strong>{distance} km</strong><input type="range" min="1" max="600" value={distance} onChange={(e) => setDistance(+e.target.value)} /></label>
              <label>{t.weight}<strong>{weight} kg</strong><input type="range" min="5" max="1200" step="5" value={weight} onChange={(e) => setWeight(+e.target.value)} /></label>
              <label>{t.delivery}<select value={express ? "express" : "normal"} onChange={(e) => setExpress(e.target.value === "express")}><option value="normal">{t.normal}</option><option value="express">{t.express}</option></select></label>
            </>}
          </div>
          <div className="v2-estimate"><div><span>{t.estimate}</span><strong>{estimate.price} €</strong><small>{t.included}</small></div><div><span>{t.duration}</span><b>{estimate.hours}</b></div><button onClick={calculatorToBooking}>{t.continue}<ArrowRight /></button></div>
        </div>
      </section>

      <section className="v2-section" id="process">
        <div className="v2-center-head"><span>{t.processKicker}</span><h2>{t.processTitle}</h2></div>
        <div className="v2-steps">{t.steps.map(([title, description], index) => <article key={title}><i>0{index + 1}</i><span>{index === 0 ? <Send /> : index === 1 ? <CheckCircle2 /> : <Navigation />}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className="v2-why">
        <div className="v2-center-head light"><span>{t.whyKicker}</span><h2>{t.whyTitle}</h2></div>
        <div className="v2-why-grid">{t.whyItems.map(([title, description], index) => <article key={title}><span>{index === 0 ? <MessageCircle /> : index === 1 ? <UploadCloud /> : index === 2 ? <ShieldCheck /> : <CheckCircle2 />}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className="v2-booking" id="booking">
        <div className="v2-booking-copy"><span>{t.bookingKicker}</span><h2>{t.bookingTitle}</h2><p>{t.bookingBody}</p><div className="v2-booking-points"><span><CheckCircle2 />D1 booking storage</span><span><CheckCircle2 />Private tracking link</span><span><CheckCircle2 />Photo attachments</span></div></div>
        <form className="v2-form" onSubmit={submitBooking}>
          <input type="text" name="website" className="v2-honeypot" tabIndex={-1} autoComplete="off" />
          <label>{t.service}<select name="service" value={bookingService} onChange={(e) => setBookingService(e.target.value)}>{serviceList.map((service) => <option key={service.key} value={service.key}>{service[locale][0]}</option>)}</select></label>
          <div className="v2-form-row"><label>{t.name}<input name="name" required autoComplete="name" /></label><label>{t.phone}<input name="phone" required autoComplete="tel" placeholder="+358 40 123 4567" /></label></div>
          <label>{t.email}<input name="email" required type="email" autoComplete="email" /></label>
          <div className="v2-form-row"><label>{t.pickup}<input name="pickup" required placeholder="Helsinki" /></label><label>{bookingService === "cleaning" || bookingService === "windows" ? t.destinationOptional : t.destination}<input name="destination" required={bookingService !== "cleaning" && bookingService !== "windows"} placeholder="Espoo" /></label></div>
          <div className="v2-form-row"><label>{t.date}<input name="date" type="date" min={minDate} required /></label><label>{t.time}<input name="time" type="time" required /></label></div>
          <label>{t.notes}<textarea name="notes" rows={4} value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} /></label>
          <label className="v2-upload"><UploadCloud /><span>{t.photos}<small>{t.photoHelp}</small></span><input name="photos" type="file" accept="image/png,image/jpeg,image/webp" multiple /></label>
          <button className="v2-submit" disabled={bookingState === "sending"}>{bookingState === "sending" ? t.sending : t.submit}<Send /></button>
          {bookingState === "error" && <p className="v2-form-error">{t.error}</p>}
        </form>
      </section>

      <section className="v2-section v2-faq" id="faq">
        <div className="v2-section-head"><div><span>{t.faqKicker}</span><h2>{t.faqTitle}</h2></div></div>
        <div className="v2-faq-grid">{faq[locale].map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown /></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="v2-contact">
        <div><span>HELSINKI · UUSIMAA · FINLAND</span><h2>{t.contactTitle}</h2><p>{t.contactBody}</p><div className="v2-contact-person"><UserRound /><div><strong>Stanislav Kosytskyy</strong><small>Toimitusjohtaja · Muuttobotti / Autochemix Oy</small></div></div></div>
        <div className="v2-contact-actions"><a href="tel:+3584578767567"><Phone />045 787 67567</a><a href="https://wa.me/3584578767567"><MessageCircle />WhatsApp</a><a href="mailto:autochemixfin@gmail.com"><Mail />autochemixfin@gmail.com</a><span><Clock3 />{t.hours}</span></div>
      </section>

      <footer className="v2-footer"><div className="v2-brand"><span><PackageCheck /></span><b>muutto<i>botti</i></b></div><p>Muuttobotti / Autochemix Oy · Y-tunnus 3543357-8</p><nav><a href="/track">Tracking</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><small>© 2026 Muuttobotti</small></footer>

      <a className="v2-whatsapp" href="https://wa.me/3584578767567" aria-label="WhatsApp"><MessageCircle /><span>WhatsApp</span></a>

      {!cookieChoice && <div className="v2-cookie"><ShieldCheck /><p>{t.cookies}</p><button onClick={() => acceptCookies("essential")}>{t.essential}</button><button onClick={() => acceptCookies("all")}>{t.accept}</button></div>}

      {bookingState === "done" && bookingResult && <div className="v2-success"><div><CheckCircle2 /><h3>{t.success}</h3><p>{t.successBody}</p><span>{t.bookingNumber}</span><strong>{bookingResult.bookingId}</strong><a href={bookingResult.trackingPath}>{t.openTracking}<ArrowRight /></a><button onClick={() => setBookingState("idle")}>{t.close}</button></div></div>}
    </main>
  );
}
