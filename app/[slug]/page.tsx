/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Mail, MessageCircle, PackageCheck, Phone, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import VisualMotionEnhancer from "../VisualMotionEnhancer";
import { servicePages, type ServicePage } from "./service-pages";
import "../experience-v5.css";

type Locale = "fi" | "en" | "uk" | "ru";

const ui = {
  fi: { quote:"Pyydä tarjous", home:"Etusivulle", trust1:"Selkeä vahvistus ennen työtä", trust2:"Työaika alkaa sovitusta nouto-osoitteesta", calculate:"Laske hinta", book:"Varaa verkossa", backBooking:"Takaisin varaukseen", know:"Hyvä tietää", faq:"Usein kysyttyä tästä palvelusta", help:"Tarvitsetko apua heti?", helpText:"Voit lähettää osoitteet ja lyhyen kuvauksen WhatsAppissa, niin arvioimme työn nopeasti.", support:"Muuttobotti asiakaspalvelu", privacy:"Tietosuoja", terms:"Ehdot", legalPrivacyKicker:"Varausten tietosuoja", legalPrivacyTitle:"Miten varaus- ja teknisiä tietoja käsitellään", legalTermsKicker:"Palvelun ehdot", legalTermsTitle:"Mitä on hyvä tietää ennen tilausta" },
  en: { quote:"Get a quote", home:"Back to home", trust1:"Clear confirmation before the job", trust2:"Working time starts at the agreed pickup address", calculate:"Calculate price", book:"Book online", backBooking:"Back to booking", know:"Good to know", faq:"Frequently asked questions", help:"Need help now?", helpText:"Send the addresses and a short description on WhatsApp and we will assess the job quickly.", support:"Muuttobotti customer service", privacy:"Privacy", terms:"Terms", legalPrivacyKicker:"Booking privacy", legalPrivacyTitle:"How booking and technical data are handled", legalTermsKicker:"Service terms", legalTermsTitle:"What to know before ordering" },
  uk: { quote:"Отримати розрахунок", home:"На головну", trust1:"Чітке підтвердження до початку роботи", trust2:"Робочий час починається з погодженої адреси завантаження", calculate:"Розрахувати ціну", book:"Забронювати", backBooking:"Повернутися до бронювання", know:"Варто знати", faq:"Поширені запитання", help:"Потрібна допомога зараз?", helpText:"Надішліть адреси та короткий опис у WhatsApp — ми швидко оцінимо роботу.", support:"Підтримка Muuttobotti", privacy:"Конфіденційність", terms:"Умови", legalPrivacyKicker:"Конфіденційність бронювання", legalPrivacyTitle:"Як обробляються дані бронювання та технічні дані", legalTermsKicker:"Умови послуги", legalTermsTitle:"Що варто знати перед замовленням" },
  ru: { quote:"Получить расчёт", home:"На главную", trust1:"Чёткое подтверждение до начала работы", trust2:"Рабочее время начинается с согласованного адреса загрузки", calculate:"Рассчитать цену", book:"Забронировать", backBooking:"Вернуться к бронированию", know:"Полезно знать", faq:"Частые вопросы", help:"Нужна помощь сейчас?", helpText:"Пришлите адреса и короткое описание в WhatsApp — мы быстро оценим работу.", support:"Поддержка Muuttobotti", privacy:"Конфиденциальность", terms:"Условия", legalPrivacyKicker:"Конфиденциальность бронирования", legalPrivacyTitle:"Как обрабатываются данные бронирования и технические данные", legalTermsKicker:"Условия услуги", legalTermsTitle:"Что важно знать перед заказом" },
} as const;

const legalPages: Record<"privacy"|"terms", Record<Locale, ServicePage>> = {
  privacy: {
    fi: servicePages.privacy,
    en: { title:"Privacy notice", eyebrow:"Your data is protected", description:"Muuttobotti processes contact and booking data only to provide the service, communicate with you, handle billing and meet legal obligations.", bullets:["Data minimisation","Protected processing","Right to access and correct your data"], legal:true },
    uk: { title:"Політика конфіденційності", eyebrow:"Ваші дані захищені", description:"Muuttobotti обробляє контактні дані та дані бронювання лише для надання послуги, зв’язку, оплати та виконання законних обов’язків.", bullets:["Мінімізація даних","Захищена обробка","Право переглянути й виправити дані"], legal:true },
    ru: { title:"Политика конфиденциальности", eyebrow:"Ваши данные защищены", description:"Muuttobotti обрабатывает контактные данные и данные бронирования только для оказания услуги, связи, оплаты и выполнения законных обязанностей.", bullets:["Минимизация данных","Защищённая обработка","Право просмотреть и исправить данные"], legal:true },
  },
  terms: {
    fi: servicePages.terms,
    en: { title:"Service terms and cookies", eyebrow:"Clear terms", description:"The confirmed offer states the service scope, price, schedule and possible additional charges. Cookie choices can be managed through the site notice.", bullets:["Transparent pricing","Cancellation terms in the confirmation","Essential and optional cookies"], legal:true },
    uk: { title:"Умови послуг і cookie", eyebrow:"Зрозумілі умови", description:"У підтвердженій пропозиції зазначаються обсяг послуги, ціна, час і можливі доплати. Налаштування cookie можна змінити через повідомлення на сайті.", bullets:["Прозоре ціноутворення","Умови скасування в підтвердженні","Необхідні та додаткові cookie"], legal:true },
    ru: { title:"Условия услуг и cookie", eyebrow:"Понятные условия", description:"В подтверждённом предложении указываются объём услуги, цена, время и возможные доплаты. Настройки cookie можно изменить через уведомление на сайте.", bullets:["Прозрачное ценообразование","Условия отмены в подтверждении","Необходимые и дополнительные cookie"], legal:true },
  },
};

const privacyDetails: Record<Locale, [string,string][]> = {
  fi: [
    ["Mitä tietoja varauksesta tallennetaan?", "Tallennamme asiakkaan antamat yhteystiedot, palvelu- ja osoitetiedot, toivotun ajan, lisätiedot sekä mahdollisen laskurin arvion ja liitettyjen kuvien määrän."],
    ["Tallennetaanko IP-osoite ja teknisiä tietoja?", "Verkkovarauksen yhteydessä voidaan tallentaa IP-osoite, selaimen User-Agent, likimääräinen maa tai alue Cloudflaren välittämänä, sivun lähde, kieli, aikavyöhyke ja näytön koko. Tietoja käytetään varauksen käsittelyyn, tietoturvaan ja teknisten ongelmien selvittämiseen."],
    ["Miten tietoja käytetään?", "Tietoja käytetään palvelun tuottamiseen, yhteydenpitoon, tarjouksen ja työmäärän arviointiin, asiakaspalveluun, laskutukseen sekä lakisääteisten velvoitteiden hoitamiseen."],
    ["Kenellä on pääsy tietoihin?", "Varaustiedot ja tekniset tiedot ovat vain Muuttobotin / Autochemix Oy:n valtuutetun henkilöstön ja palvelun toteuttamiseen tarvittavien järjestelmien käytettävissä."],
    ["Mitä oikeuksia asiakkaalla on?", "Asiakas voi pyytää itseään koskevien tietojen tarkastamista, korjaamista tai lain sallimissa rajoissa poistamista osoitteesta autochemixfin@gmail.com."],
  ],
  en: [
    ["What booking data is stored?", "We store the contact details you provide, service and address information, requested date and time, notes, any attached calculator estimate and the number of uploaded images."],
    ["Are IP address and technical data stored?", "A web booking may include the IP address, browser User-Agent, approximate country or region provided by Cloudflare, referral source, language, time zone and screen size. These data are used for booking processing, security and technical troubleshooting."],
    ["How is the information used?", "Information is used to provide the service, communicate with you, estimate the work, provide customer service, handle billing and meet legal obligations."],
    ["Who can access the information?", "Booking and technical information is available only to authorised Muuttobotti / Autochemix Oy personnel and systems required to provide the service."],
    ["What rights do customers have?", "You may request access to, correction of, or where permitted by law deletion of your personal data by contacting autochemixfin@gmail.com."],
  ],
  uk: [
    ["Які дані бронювання зберігаються?", "Ми зберігаємо надані контактні дані, інформацію про послугу й адреси, бажані дату та час, примітки, прикріплений розрахунок калькулятора та кількість завантажених фото."],
    ["Чи зберігаються IP-адреса й технічні дані?", "Під час онлайн-бронювання можуть зберігатися IP-адреса, User-Agent браузера, приблизна країна або регіон від Cloudflare, джерело переходу, мова, часовий пояс і розмір екрана. Дані використовуються для обробки бронювання, безпеки та технічної діагностики."],
    ["Як використовуються дані?", "Дані використовуються для надання послуги, зв’язку, оцінки обсягу роботи, підтримки клієнта, виставлення рахунків і виконання законних обов’язків."],
    ["Хто має доступ?", "Доступ мають лише уповноважені працівники Muuttobotti / Autochemix Oy та системи, необхідні для виконання послуги."],
    ["Які права має клієнт?", "Ви можете запросити перегляд, виправлення або, якщо це дозволено законом, видалення своїх даних, написавши на autochemixfin@gmail.com."],
  ],
  ru: [
    ["Какие данные бронирования сохраняются?", "Мы сохраняем предоставленные контактные данные, сведения об услуге и адресах, желаемые дату и время, примечания, прикреплённый расчёт калькулятора и количество загруженных фотографий."],
    ["Сохраняются ли IP-адрес и технические данные?", "При онлайн-бронировании могут сохраняться IP-адрес, User-Agent браузера, примерная страна или регион от Cloudflare, источник перехода, язык, часовой пояс и размер экрана. Эти данные используются для обработки бронирования, безопасности и технической диагностики."],
    ["Как используются данные?", "Данные используются для оказания услуги, связи, оценки объёма работ, поддержки клиента, выставления счетов и выполнения законных обязанностей."],
    ["Кто имеет доступ?", "Доступ имеют только уполномоченные сотрудники Muuttobotti / Autochemix Oy и системы, необходимые для выполнения услуги."],
    ["Какие права есть у клиента?", "Вы можете запросить просмотр, исправление или, если это допускается законом, удаление своих данных, написав на autochemixfin@gmail.com."],
  ],
};

const termsDetails: Record<Locale, [string,string][]> = {
  fi: [
    ["Miten hinta vahvistetaan?", "Laskurin tulos on alustava arvio. Lopullinen hinta tai hinnoitteluperuste vahvistetaan asiakkaalle ennen työn alkua."],
    ["Milloin työaika alkaa?", "Ellei kirjallisesti toisin sovita, työaika alkaa tiimin saapuessa sovittuun nouto- tai palveluosoitteeseen."],
    ["Miten lisätyöt vaikuttavat hintaan?", "Asiakkaan pyytämät lisätyöt, odotus, muuttunut tavaramäärä tai poikkeava pääsy kohteeseen voivat vaikuttaa työaikaan ja hintaan. Muutoksista pyritään sopimaan ennen lisätyötä."],
    ["Miten peruutus hoidetaan?", "Peruutuksen tai ajan muutoksen ehdot ilmoitetaan varausvahvistuksessa tai sovitaan asiakkaan kanssa erikseen."],
  ],
  en: [
    ["How is the price confirmed?", "The calculator result is a preliminary estimate. The final price or pricing basis is confirmed with the customer before work begins."],
    ["When does working time start?", "Unless otherwise agreed in writing, working time starts when the team arrives at the agreed pickup or service address."],
    ["How do extra tasks affect the price?", "Extra work requested by the customer, waiting time, a changed amount of belongings or unusual access may affect working time and price. We aim to agree changes before extra work is performed."],
    ["How are cancellations handled?", "Cancellation or rescheduling terms are stated in the booking confirmation or agreed separately with the customer."],
  ],
  uk: [
    ["Як підтверджується ціна?", "Результат калькулятора є попередньою оцінкою. Остаточна ціна або принцип розрахунку підтверджуються з клієнтом до початку роботи."],
    ["Коли починається робочий час?", "Якщо письмово не погоджено інше, робочий час починається з моменту прибуття команди на погоджену адресу завантаження або надання послуги."],
    ["Як додаткові роботи впливають на ціну?", "Додаткові роботи, очікування, зміна кількості речей або складний доступ можуть вплинути на час і ціну. Ми намагаємося погоджувати зміни до виконання додаткової роботи."],
    ["Як працює скасування?", "Умови скасування або перенесення зазначаються в підтвердженні бронювання або погоджуються з клієнтом окремо."],
  ],
  ru: [
    ["Как подтверждается цена?", "Результат калькулятора является предварительной оценкой. Итоговая цена или принцип расчёта подтверждаются с клиентом до начала работы."],
    ["Когда начинается рабочее время?", "Если письменно не согласовано иное, рабочее время начинается с момента прибытия команды на согласованный адрес загрузки или оказания услуги."],
    ["Как дополнительные работы влияют на цену?", "Дополнительные работы, ожидание, изменение количества вещей или сложный доступ могут повлиять на время и цену. Мы стараемся согласовывать изменения до выполнения дополнительной работы."],
    ["Как работает отмена?", "Условия отмены или переноса указываются в подтверждении бронирования либо согласовываются с клиентом отдельно."],
  ],
};

function normalizeLocale(value: string | string[] | undefined): Locale {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "en" || raw === "uk" || raw === "ru" ? raw : "fi";
}

function localizedArea(area: string | undefined, locale: Locale) {
  if (!area) return "";
  if (area !== "Suomi") return area;
  return locale === "en" ? "Finland" : locale === "uk" ? "Фінляндія" : locale === "ru" ? "Финляндия" : "Suomi";
}

function localizedService(page: ServicePage, slug: string, locale: Locale): ServicePage {
  if (locale === "fi") return page;
  if (slug === "privacy" || slug === "terms") return legalPages[slug][locale];
  const area = localizedArea(page.area, locale);

  if (slug.startsWith("moving-")) {
    if (locale === "en") return { ...page, title:`Moving service ${area}`, eyebrow:`Reliable moving in ${area}`, description:`Reliable home and business moving service in ${area}. High-roof 13–15 m³ Crafter, flexible crew and clear pricing.`, bullets:["Home and business moves","High-roof 13–15 m³ Crafter","Online booking and private tracking link"], serviceName:"Moving service", faq:[["How is the moving price calculated?","The price is based on working time, number of movers, distance and selected extras. You receive an estimate before booking and confirmation before work starts."],["When does working time start?","Working time starts when the team arrives at the agreed pickup address."],["Can I book for the same day?","Yes, same-day moving is possible when capacity is available."]] };
    if (locale === "uk") return { ...page, title:`Переїзди — ${area}`, eyebrow:`Надійний переїзд у ${area}`, description:`Переїзди квартир і компаній у ${area}. Високий Crafter 13–15 м³, гнучка команда та зрозуміла ціна.`, bullets:["Квартирні та офісні переїзди","Високий Crafter 13–15 м³","Онлайн-бронювання та приватне відстеження"], serviceName:"Переїзди", faq:[["Як розраховується ціна?","Ціна залежить від робочого часу, кількості вантажників, відстані та додаткових послуг. До бронювання ви бачите оцінку, а до початку роботи отримуєте підтвердження."],["Коли починається робочий час?","Робочий час починається, коли команда прибуває на погоджену адресу завантаження."],["Чи можна замовити переїзд на сьогодні?","Так, якщо є вільна машина та команда."]] };
    return { ...page, title:`Переезды — ${area}`, eyebrow:`Надёжный переезд в ${area}`, description:`Переезды квартир и компаний в ${area}. Высокий Crafter 13–15 м³, гибкая команда и понятная цена.`, bullets:["Квартирные и офисные переезды","Высокий Crafter 13–15 м³","Онлайн-бронирование и приватное отслеживание"], serviceName:"Переезды", faq:[["Как рассчитывается цена?","Цена зависит от рабочего времени, количества грузчиков, расстояния и дополнительных услуг. До бронирования вы видите оценку, а до начала работы получаете подтверждение."],["Когда начинается рабочее время?","Рабочее время начинается, когда команда прибывает на согласованный адрес загрузки."],["Можно ли заказать переезд на сегодня?","Да, если есть свободная машина и команда."]] };
  }

  if (slug.startsWith("cleaning-")) {
    if (locale === "en") return { ...page, title:`Cleaning service ${area}`, eyebrow:`Professional cleaning in ${area}`, description:`Home, office and move-out cleaning in ${area} with professional equipment and a clear scope of work.`, bullets:["Move-out cleaning","Home and office cleaning","Window cleaning available as an extra"], serviceName:"Cleaning service", faq:[["Do you bring cleaning supplies?","Yes, standard professional tools and cleaning products can be included."],["Can cleaning be combined with moving?","Yes. Moving and move-out cleaning can be arranged in one booking."],["How long does cleaning take?","Duration depends on the size and condition of the property. The calculator provides an estimate before booking."]] };
    if (locale === "uk") return { ...page, title:`Прибирання — ${area}`, eyebrow:`Професійне прибирання у ${area}`, description:`Прибирання квартир, офісів і після переїзду у ${area} з професійним інвентарем та зрозумілим обсягом робіт.`, bullets:["Прибирання після переїзду","Квартири та офіси","Миття вікон як додаткова послуга"], serviceName:"Прибирання", faq:[["Чи привозите ви засоби?","Так, стандартний професійний інвентар і засоби можуть входити в послугу."],["Чи можна поєднати прибирання з переїздом?","Так, переїзд і фінальне прибирання можна оформити одним бронюванням."],["Скільки триває прибирання?","Час залежить від площі та стану приміщення. Калькулятор дає попередню оцінку."]] };
    return { ...page, title:`Уборка — ${area}`, eyebrow:`Профессиональная уборка в ${area}`, description:`Уборка квартир, офисов и после переезда в ${area} с профессиональным инвентарём и понятным объёмом работ.`, bullets:["Уборка после переезда","Квартиры и офисы","Мойка окон как дополнительная услуга"], serviceName:"Уборка", faq:[["Вы привозите средства?","Да, стандартный профессиональный инвентарь и средства могут входить в услугу."],["Можно совместить уборку с переездом?","Да, переезд и финальную уборку можно оформить одним бронированием."],["Сколько длится уборка?","Время зависит от площади и состояния помещения. Калькулятор даёт предварительную оценку."]] };
  }

  if (slug.startsWith("window-cleaning")) {
    if (locale === "en") return { ...page, title:`Window cleaning ${area}`, eyebrow:"Clear windows without streaks", description:`Professional window, frame and balcony-glass cleaning in ${area}.`, bullets:["Homes and offices","Balcony glazing","Frame cleaning"], serviceName:"Window cleaning", faq:[["Do you clean balcony glazing?","Yes, balcony glazing can be added to the same booking."],["Do you bring the equipment?","Yes, the agreed cleaning tools and products are brought to the job."],["Can window cleaning be combined with other cleaning?","Yes, the services can be combined in one booking."]] };
    if (locale === "uk") return { ...page, title:`Миття вікон — ${area}`, eyebrow:"Чисті вікна без розводів", description:`Професійне миття вікон, рам і балконного скління у ${area}.`, bullets:["Квартири та офіси","Балконне скління","Очищення рам"], serviceName:"Миття вікон" };
    return { ...page, title:`Мойка окон — ${area}`, eyebrow:"Чистые окна без разводов", description:`Профессиональная мойка окон, рам и балконного остекления в ${area}.`, bullets:["Квартиры и офисы","Балконное остекление","Очистка рам"], serviceName:"Мойка окон" };
  }

  if (slug.startsWith("express-delivery")) {
    if (locale === "en") return { ...page, title:"Express delivery in Finland", eyebrow:"When the shipment is urgent", description:"Fast item, furniture and business deliveries across Uusimaa and Finland with direct pickup and delivery.", bullets:["Same-day when available","Direct pickup and delivery","Booking number and tracking link"], serviceName:"Express delivery" };
    if (locale === "uk") return { ...page, title:"Термінові перевезення у Фінляндії", eyebrow:"Коли доставка термінова", description:"Швидкі перевезення речей, меблів і вантажів компаній по Уусімаа та Фінляндії.", bullets:["У день замовлення за наявності","Пряме завантаження й доставка","Номер бронювання та відстеження"], serviceName:"Термінові перевезення" };
    return { ...page, title:"Срочные перевозки по Финляндии", eyebrow:"Когда доставка срочная", description:"Быстрые перевозки вещей, мебели и грузов компаний по Уусимаа и Финляндии.", bullets:["В день заказа при наличии","Прямая загрузка и доставка","Номер бронирования и отслеживание"], serviceName:"Срочные перевозки" };
  }

  if (slug.startsWith("furniture-assembly")) {
    if (locale === "en") return { ...page, title:"Furniture assembly in Finland", eyebrow:"Furniture ready to use", description:"Assembly, disassembly and moving of IKEA and other furniture as part of a move or as a separate job.", bullets:["Wardrobes, beds and tables","Disassembly before moving","Packing-material removal by agreement"], serviceName:"Furniture assembly" };
    if (locale === "uk") return { ...page, title:"Збирання меблів у Фінляндії", eyebrow:"Меблі готові до використання", description:"Збирання, розбирання та перенесення IKEA й інших меблів під час переїзду або окремим замовленням.", bullets:["Шафи, ліжка та столи","Розбирання перед переїздом","Вивіз пакування за домовленістю"], serviceName:"Збирання меблів" };
    return { ...page, title:"Сборка мебели в Финляндии", eyebrow:"Мебель готова к использованию", description:"Сборка, разборка и перенос IKEA и другой мебели во время переезда или отдельным заказом.", bullets:["Шкафы, кровати и столы","Разборка перед переездом","Вывоз упаковки по договорённости"], serviceName:"Сборка мебели" };
  }

  return page;
}

function localeQuery(locale: Locale) { return locale === "fi" ? "" : `?lang=${locale}`; }
function homeHref(locale: Locale, hash = "") { return `/${localeQuery(locale)}${hash}`; }
function pageHref(slug: string, locale: Locale) { return `/${slug}${localeQuery(locale)}`; }

export function generateStaticParams() {
  return Object.keys(servicePages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{lang?:string|string[]}> }): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const locale = normalizeLocale(query.lang);
  const raw = servicePages[slug];
  if (!raw) return {};
  const page = localizedService(raw, slug, locale);
  const canonical = pageHref(slug, locale);
  const url = `https://muuttobotti.fi${canonical}`;
  const ogLocale = locale === "en" ? "en_FI" : locale === "uk" ? "uk_UA" : locale === "ru" ? "ru_RU" : "fi_FI";

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical,
      languages: {
        "fi-FI": `/${slug}`,
        "en-FI": `/${slug}?lang=en`,
        "uk-FI": `/${slug}?lang=uk`,
        "ru-FI": `/${slug}?lang=ru`,
      },
    },
    openGraph: { title: `${page.title} | Muuttobotti`, description: page.description, url, siteName:"Muuttobotti", locale:ogLocale, type:"website", images:[{url:"/muuttobotti-hero.png",alt:`${page.title} – Muuttobotti`}] },
    twitter: { card:"summary_large_image", title:`${page.title} | Muuttobotti`, description:page.description, images:["/muuttobotti-hero.png"] },
  };
}

export default async function ServicePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{lang?:string|string[]}> }) {
  const { slug } = await params;
  const query = await searchParams;
  const locale = normalizeLocale(query.lang);
  const raw = servicePages[slug];
  if (!raw) notFound();
  const page = localizedService(raw, slug, locale);
  const t = ui[locale];

  const visualTheme = page.legal ? "legal" : slug.includes("cleaning") ? "cleaning" : slug.includes("window") ? "window" : slug.includes("assembly") ? "assembly" : slug.includes("delivery") || slug.includes("transport") ? "transport" : "moving";

  const breadcrumbSchema = { "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:[{ "@type":"ListItem", position:1, name:"Muuttobotti", item:"https://muuttobotti.fi" },{ "@type":"ListItem", position:2, name:page.title, item:`https://muuttobotti.fi${pageHref(slug,locale)}` }] };
  const serviceSchema = page.legal || !page.serviceName ? null : { "@context":"https://schema.org", "@type":"Service", name:page.title, serviceType:page.serviceName, description:page.description, areaServed:page.area ? { "@type":raw.area === "Suomi" ? "Country" : "City", name:localizedArea(page.area,locale) } : undefined, provider:{ "@id":"https://muuttobotti.fi/#business" }, url:`https://muuttobotti.fi${pageHref(slug,locale)}` };
  const faqSchema = page.faq?.length ? { "@context":"https://schema.org", "@type":"FAQPage", mainEntity:page.faq.map(([question,answer])=>({ "@type":"Question", name:question, acceptedAnswer:{ "@type":"Answer", text:answer } })) } : null;
  const legalDetails = slug === "privacy" ? privacyDetails[locale] : slug === "terms" ? termsDetails[locale] : null;

  return (
    <main className={`seo-page seo-theme-${visualTheme}`} lang={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {serviceSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />}
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <header>
        <a href={homeHref(locale)} className="brand" aria-label={t.home}><span className="brand-mark"><PackageCheck/></span><span>muutto<span>botti</span></span></a>
        <a href={homeHref(locale,"#booking")} className="quote-button">{t.quote}</a>
      </header>

      <section className="seo-hero-section">
        <div className="seo-main-column">
          <a href={homeHref(locale)} className="back-link"><ArrowLeft/> {t.home}</a>
          <div className="seo-copy">
            <span className="kicker light">{page.eyebrow}</span>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
            <div className="seo-bullets">{page.bullets.map((item) => <span key={item}><CheckCircle2/>{item}</span>)}</div>
            {!page.legal && <div className="seo-trust-row"><span><ShieldCheck/> {t.trust1}</span><span><Clock3/> {t.trust2}</span></div>}
            <div className="seo-actions">
              {!page.legal && <a href={homeHref(locale,"#calculator")}>{t.calculate} <ArrowRight/></a>}
              <a href={homeHref(locale,"#booking")}>{page.legal ? t.backBooking : t.book}</a>
            </div>
          </div>

          {!page.legal && page.faq?.length ? <div className="seo-faq-block"><span className="kicker">{t.know}</span><h2>{t.faq}</h2><div className="seo-faq-grid">{page.faq.map(([question,answer])=><article key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div></div> : null}

          {legalDetails ? <div className="seo-faq-block"><span className="kicker">{slug === "privacy" ? t.legalPrivacyKicker : t.legalTermsKicker}</span><h2>{slug === "privacy" ? t.legalPrivacyTitle : t.legalTermsTitle}</h2><div className="seo-faq-grid">{legalDetails.map(([question,answer])=><article key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div></div> : null}
        </div>

        <aside className="seo-contact">
          <strong>{t.help}</strong>
          <p>{t.helpText}</p>
          <span><PackageCheck/> {t.support}</span>
          <a href="tel:+3584578767567"><Phone/> 045 787 67567</a>
          <a href="mailto:autochemixfin@gmail.com"><Mail/> autochemixfin@gmail.com</a>
          <a href="https://wa.me/3584578767567" target="_blank" rel="noreferrer"><MessageCircle/> WhatsApp</a>
          <small>Autochemix Oy · Y-tunnus 3543357-8</small>
        </aside>
      </section>

      <footer>
        <span>© 2026 Muuttobotti · Autochemix Oy · Y-tunnus 3543357-8</span>
        <a href={pageHref("privacy",locale)}>{t.privacy}</a>
        <a href={pageHref("terms",locale)}>{t.terms}</a>
      </footer>
      <VisualMotionEnhancer />
    </main>
  );
}
