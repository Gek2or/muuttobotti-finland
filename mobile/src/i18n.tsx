import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export type Locale = 'fi' | 'en' | 'uk' | 'ru';
const LOCALE_KEY = 'muuttobotti_locale';

const copy = {
  fi: {
    roleKicker: 'MUUTTO · KULJETUS · SIIVOUS', roleTitle: 'Kaikki muuttoon liittyvä samassa sovelluksessa.', roleCopy: 'Laske hinta, tee varaus, seuraa tilausta ja pidä yhteys Muuttobottiin.', clientRole: 'Jatka asiakkaana', adminRole: 'Avaa admin',
    home: 'Koti', calculator: 'Laskuri', booking: 'Varaus', tracking: 'Seuranta', profile: 'Profiili',
    homeTitle: 'Muutto ilman turhaa säätöä.', homeCopy: 'Hintalaskuri, varaus, seuranta ja yhteydenpito samassa paikassa.', calculatePrice: 'Laske hinta', calculateText: 'Muutto, siivous tai Crafter-kuljetus.', makeBooking: 'Tee varaus', bookingText: 'Lähetä osoitteet, aika, yhteystiedot ja kuvat.', trackBooking: 'Seuraa varausta', trackText: 'Avaa tilaus varausnumerolla ja pääsykoodilla.', help: 'Tarvitsetko apua?', services: 'Muutot · kuljetukset · siivous · ikkunanpesu · kalusteasennus · poiskuljetus.', coverage: 'Uusimaa + koko Suomi sopimuksesta.',
    language: 'Kieli', savedBookings: 'Tallennetut varaukset', noBookings: 'Ei vielä tallennettuja varauksia.', notifications: 'Ilmoitukset', enableNotifications: 'Ota ilmoitukset käyttöön', notificationReady: 'Ilmoitukset ovat käytössä tällä laitteella.', notificationUnavailable: 'Push-ilmoitukset vaativat development/production buildin ja palvelinrekisteröinnin.', privacy: 'Yksityisyys ja turvallisuus', privacyCopy: 'Pääsykoodit ja admin-token tallennetaan laitteen SecureStoreen.',
    moving: 'Muutto', cleaning: 'Siivous', transport: 'Kuljetus', name: 'Nimi', phone: 'Puhelin', email: 'Sähköposti', pickup: 'Nouto-osoite', serviceAddress: 'Palveluosoite', destination: 'Kohdeosoite', date: 'Päivä', time: 'Aika', notes: 'Lisätiedot', addPhotos: 'Lisää kuvia', sendBooking: 'Lähetä varaus', required: 'Täytä kaikki pakolliset kentät.', destinationRequired: 'Lisää kohdeosoite.', saved: 'Varaus tallennettu onnistuneesti.', bookingSaved: 'VARAUS TALLENNETTU', accessCode: 'PÄÄSYKOODI', openTracking: 'Avaa seuranta', selectDate: 'Valitse päivä', selectTime: 'Valitse aika', photosSelected: 'kuvaa valittu', photoLimit: 'Enintään 5 kuvaa · 8 MB / kuva',
    bookingNumber: 'Varausnumero', openBooking: 'Avaa varaus', enterTracking: 'Syötä varausnumero ja yksityinen pääsykoodi.', modifyBooking: 'Muuta varausta', sendChange: 'Lähetä muutospyyntö', cancelBooking: 'Peru varaus', anotherBooking: 'Avaa toinen varaus', accessKey: 'Pääsykoodi',
  },
  en: {
    roleKicker: 'MOVING · TRANSPORT · CLEANING', roleTitle: 'Everything for your move in one app.', roleCopy: 'Estimate the price, book, track your order and contact Muuttobotti.', clientRole: 'Continue as customer', adminRole: 'Open admin',
    home: 'Home', calculator: 'Calculator', booking: 'Booking', tracking: 'Tracking', profile: 'Profile',
    homeTitle: 'Moving without the hassle.', homeCopy: 'Price estimate, booking, tracking and contact in one place.', calculatePrice: 'Estimate price', calculateText: 'Moving, cleaning or Crafter transport.', makeBooking: 'Book service', bookingText: 'Send addresses, time, contact details and photos.', trackBooking: 'Track booking', trackText: 'Open your booking with its number and private key.', help: 'Need help?', services: 'Moving · transport · cleaning · window cleaning · assembly · removal.', coverage: 'Uusimaa + all Finland by agreement.',
    language: 'Language', savedBookings: 'Saved bookings', noBookings: 'No saved bookings yet.', notifications: 'Notifications', enableNotifications: 'Enable notifications', notificationReady: 'Notifications are enabled on this device.', notificationUnavailable: 'Remote push requires a development/production build and server registration.', privacy: 'Privacy & security', privacyCopy: 'Access keys and the admin token are stored in the device SecureStore.',
    moving: 'Moving', cleaning: 'Cleaning', transport: 'Transport', name: 'Name', phone: 'Phone', email: 'Email', pickup: 'Pickup address', serviceAddress: 'Service address', destination: 'Destination', date: 'Date', time: 'Time', notes: 'Notes', addPhotos: 'Add photos', sendBooking: 'Send booking', required: 'Fill in all required fields.', destinationRequired: 'Add a destination address.', saved: 'Booking saved successfully.', bookingSaved: 'BOOKING SAVED', accessCode: 'ACCESS CODE', openTracking: 'Open tracking', selectDate: 'Select date', selectTime: 'Select time', photosSelected: 'photos selected', photoLimit: 'Up to 5 photos · 8 MB / photo',
    bookingNumber: 'Booking number', openBooking: 'Open booking', enterTracking: 'Enter booking number and private access code.', modifyBooking: 'Modify booking', sendChange: 'Send change request', cancelBooking: 'Cancel booking', anotherBooking: 'Open another booking', accessKey: 'Access code',
  },
  uk: {
    roleKicker: 'ПЕРЕЇЗД · ПЕРЕВЕЗЕННЯ · ПРИБИРАННЯ', roleTitle: 'Усе для переїзду в одному застосунку.', roleCopy: 'Розрахуйте ціну, створіть замовлення, стежте за ним і зв’язуйтеся з Muuttobotti.', clientRole: 'Продовжити як клієнт', adminRole: 'Відкрити admin',
    home: 'Головна', calculator: 'Калькулятор', booking: 'Замовлення', tracking: 'Відстеження', profile: 'Профіль',
    homeTitle: 'Переїзд без зайвої метушні.', homeCopy: 'Розрахунок, бронювання, відстеження та зв’язок в одному місці.', calculatePrice: 'Розрахувати ціну', calculateText: 'Переїзд, прибирання або перевезення Crafter.', makeBooking: 'Створити замовлення', bookingText: 'Надішліть адреси, час, контакти та фото.', trackBooking: 'Відстежити замовлення', trackText: 'Відкрийте замовлення за номером і приватним кодом.', help: 'Потрібна допомога?', services: 'Переїзди · перевезення · прибирання · миття вікон · складання меблів · вивіз.', coverage: 'Уусімаа + вся Фінляндія за домовленістю.',
    language: 'Мова', savedBookings: 'Збережені замовлення', noBookings: 'Збережених замовлень ще немає.', notifications: 'Сповіщення', enableNotifications: 'Увімкнути сповіщення', notificationReady: 'Сповіщення увімкнено на цьому пристрої.', notificationUnavailable: 'Push потребує development/production build та реєстрації на сервері.', privacy: 'Конфіденційність і безпека', privacyCopy: 'Коди доступу й admin-token зберігаються у SecureStore пристрою.',
    moving: 'Переїзд', cleaning: 'Прибирання', transport: 'Перевезення', name: 'Ім’я', phone: 'Телефон', email: 'Email', pickup: 'Адреса завантаження', serviceAddress: 'Адреса послуги', destination: 'Адреса призначення', date: 'Дата', time: 'Час', notes: 'Додаткова інформація', addPhotos: 'Додати фото', sendBooking: 'Надіслати замовлення', required: 'Заповніть усі обов’язкові поля.', destinationRequired: 'Додайте адресу призначення.', saved: 'Замовлення успішно збережено.', bookingSaved: 'ЗАМОВЛЕННЯ ЗБЕРЕЖЕНО', accessCode: 'КОД ДОСТУПУ', openTracking: 'Відкрити відстеження', selectDate: 'Обрати дату', selectTime: 'Обрати час', photosSelected: 'фото вибрано', photoLimit: 'До 5 фото · 8 МБ / фото',
    bookingNumber: 'Номер замовлення', openBooking: 'Відкрити замовлення', enterTracking: 'Введіть номер замовлення та приватний код доступу.', modifyBooking: 'Змінити замовлення', sendChange: 'Надіслати запит на зміну', cancelBooking: 'Скасувати замовлення', anotherBooking: 'Відкрити інше замовлення', accessKey: 'Код доступу',
  },
  ru: {
    roleKicker: 'ПЕРЕЕЗД · ПЕРЕВОЗКА · УБОРКА', roleTitle: 'Всё для переезда в одном приложении.', roleCopy: 'Рассчитайте цену, оформите заказ, отслеживайте его и связывайтесь с Muuttobotti.', clientRole: 'Продолжить как клиент', adminRole: 'Открыть admin',
    home: 'Главная', calculator: 'Калькулятор', booking: 'Заказ', tracking: 'Отслеживание', profile: 'Профиль',
    homeTitle: 'Переезд без лишней суеты.', homeCopy: 'Расчёт цены, бронирование, отслеживание и связь в одном месте.', calculatePrice: 'Рассчитать цену', calculateText: 'Переезд, уборка или перевозка Crafter.', makeBooking: 'Оформить заказ', bookingText: 'Отправьте адреса, время, контакты и фотографии.', trackBooking: 'Отследить заказ', trackText: 'Откройте заказ по номеру и приватному коду.', help: 'Нужна помощь?', services: 'Переезды · перевозки · уборка · мойка окон · сборка мебели · вывоз.', coverage: 'Уусимаа + вся Финляндия по договорённости.',
    language: 'Язык', savedBookings: 'Сохранённые заказы', noBookings: 'Сохранённых заказов пока нет.', notifications: 'Уведомления', enableNotifications: 'Включить уведомления', notificationReady: 'Уведомления включены на этом устройстве.', notificationUnavailable: 'Push требует development/production build и регистрации на сервере.', privacy: 'Приватность и безопасность', privacyCopy: 'Коды доступа и admin-token хранятся в SecureStore устройства.',
    moving: 'Переезд', cleaning: 'Уборка', transport: 'Перевозка', name: 'Имя', phone: 'Телефон', email: 'Email', pickup: 'Адрес погрузки', serviceAddress: 'Адрес услуги', destination: 'Адрес назначения', date: 'Дата', time: 'Время', notes: 'Дополнительная информация', addPhotos: 'Добавить фото', sendBooking: 'Отправить заказ', required: 'Заполните все обязательные поля.', destinationRequired: 'Добавьте адрес назначения.', saved: 'Заказ успешно сохранён.', bookingSaved: 'ЗАКАЗ СОХРАНЁН', accessCode: 'КОД ДОСТУПА', openTracking: 'Открыть отслеживание', selectDate: 'Выбрать дату', selectTime: 'Выбрать время', photosSelected: 'фото выбрано', photoLimit: 'До 5 фото · 8 МБ / фото',
    bookingNumber: 'Номер заказа', openBooking: 'Открыть заказ', enterTracking: 'Введите номер заказа и приватный код доступа.', modifyBooking: 'Изменить заказ', sendChange: 'Отправить запрос на изменение', cancelBooking: 'Отменить заказ', anotherBooking: 'Открыть другой заказ', accessKey: 'Код доступа',
  },
} as const;

export type CopyKey = keyof typeof copy.fi;

type LanguageContextValue = { locale: Locale; setLocale: (locale: Locale) => Promise<void>; tr: (key: CopyKey) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>('fi');
  useEffect(() => { SecureStore.getItemAsync(LOCALE_KEY).then(saved => { if (saved === 'fi' || saved === 'en' || saved === 'uk' || saved === 'ru') setLocaleState(saved); }); }, []);
  const setLocale = async (next: Locale) => { setLocaleState(next); await SecureStore.setItemAsync(LOCALE_KEY, next); };
  const value = useMemo(() => ({ locale, setLocale, tr: (key: CopyKey) => copy[locale][key] || copy.fi[key] }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}

export const localeOptions: { value: Locale; label: string }[] = [
  { value: 'fi', label: 'FI' }, { value: 'en', label: 'EN' }, { value: 'uk', label: 'UA' }, { value: 'ru', label: 'RU' },
];