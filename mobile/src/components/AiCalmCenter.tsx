import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Booking } from '../api';
import { colors, radius } from '../theme';

type Locale = 'fi' | 'en' | 'ru' | 'uk' | string;

type Props = {
  booking: Booking;
  locale: Locale;
  accountOrder?: boolean;
  credentials?: { id: string; key: string } | null;
};

const copy: Record<string, Record<string, string>> = {
  fi: {
    label: 'MUUTTOBOTTI AI · TILANNEKUVA', calm: 'Kaikki on hallinnassa', next: 'Seuraavaksi', readiness: 'Valmius', ready: 'Hyvin valmisteltu', needs: 'Tarkista vielä', countdown: 'Muuttoon', today: 'tänään', tomorrow: 'huomenna', days: 'päivää', open: 'Avaa tilaus', support: 'Ihminen on aina saatavilla',
    new: 'Tilauksesi on vastaanotettu turvallisesti. Tiimi tarkistaa tiedot ennen vahvistusta.',
    confirmed: 'Tilaus on vahvistettu. Sinun ei tarvitse tehdä juuri nyt mitään.',
    assigned: 'Tekijä on määritetty. Tilaus etenee suunnitelman mukaan.',
    on_the_way: 'Tekijä on matkalla. Pidä puhelin lähellä mahdollisia käytännön kysymyksiä varten.',
    in_progress: 'Muutto on käynnissä. Seuraa etenemistä tästä sovelluksesta.',
    completed: 'Työ on valmis. Kiitos kun valitsit Muuttobotin.',
    cancelled: 'Tilaus on peruttu. Voit tehdä uuden varauksen milloin tahansa.',
    change_requested: 'Muutospyyntösi on vastaanotettu ja odottaa käsittelyä.',
    quote: 'Hintatarjous odottaa hyväksyntääsi.',
    crew: 'Tekijä on nimetty', price: 'Hinta on tiedossa', route: 'Osoitteet ovat tallessa', time: 'Aika on tallessa', contact: 'Yhteystiedot ovat tallessa', notes: 'Lisätiedot auttavat tiimiä',
    step_new: 'Odotamme vahvistusta tiimiltä.', step_quote: 'Tarkista hintatarjous ja hyväksy se, jos kaikki näyttää hyvältä.', step_confirmed: 'Valmistele tavarat rauhassa. Ilmoitamme kun tekijä on määritetty.', step_assigned: 'Varmista esteetön pääsy nouto-osoitteeseen.', step_way: 'Tekijä saapuu pian — pidä kulkureitti vapaana.', step_progress: 'Anna tiimin hoitaa työ. Näet tilan päivittyvän täällä.', step_done: 'Kaikki valmista. Voit palata tilaukseen myöhemmin profiilista.',
  },
  en: {
    label: 'MUUTTOBOTTI AI · LIVE BRIEF', calm: 'Everything is under control', next: 'Next', readiness: 'Readiness', ready: 'Well prepared', needs: 'Check these', countdown: 'Move in', today: 'today', tomorrow: 'tomorrow', days: 'days', open: 'Open order', support: 'A human is always available',
    new: 'Your order has been received safely. The team is reviewing the details before confirmation.', confirmed: 'Your order is confirmed. You do not need to do anything right now.', assigned: 'Your crew has been assigned. The order is moving forward as planned.', on_the_way: 'Your crew is on the way. Keep your phone nearby for practical questions.', in_progress: 'Your move is in progress. Follow the live status in the app.', completed: 'The work is complete. Thank you for choosing Muuttobotti.', cancelled: 'The order was cancelled. You can create a new booking at any time.', change_requested: 'Your change request has been received and is waiting for review.', quote: 'A price offer is waiting for your approval.', crew: 'Crew assigned', price: 'Price is known', route: 'Addresses saved', time: 'Time saved', contact: 'Contact details saved', notes: 'Extra details help the crew', step_new: 'We are waiting for the team to confirm the order.', step_quote: 'Review the price offer and approve it if everything looks right.', step_confirmed: 'Prepare your items calmly. We will update you when a crew is assigned.', step_assigned: 'Make sure the pickup entrance and access route are clear.', step_way: 'The crew is arriving soon — keep the access route clear.', step_progress: 'Let the crew handle the work. You can follow progress here.', step_done: 'Everything is complete. You can revisit the order from your profile.',
  },
  ru: {
    label: 'MUUTTOBOTTI AI · СВОДКА', calm: 'Всё под контролем', next: 'Дальше', readiness: 'Готовность', ready: 'Хорошо подготовлено', needs: 'Проверьте ещё', countdown: 'До переезда', today: 'сегодня', tomorrow: 'завтра', days: 'дн.', open: 'Открыть заказ', support: 'Человек всегда на связи',
    new: 'Заказ надёжно получен. Команда проверяет данные перед подтверждением.', confirmed: 'Заказ подтверждён. Прямо сейчас от вас ничего не требуется.', assigned: 'Исполнитель назначен. Всё идёт по плану.', on_the_way: 'Исполнитель уже в пути. Держите телефон рядом на случай практических вопросов.', in_progress: 'Переезд уже идёт. Следите за статусом прямо в приложении.', completed: 'Работа завершена. Спасибо, что выбрали Muuttobotti.', cancelled: 'Заказ отменён. Новый заказ можно создать в любое время.', change_requested: 'Ваш запрос на изменение получен и ожидает обработки.', quote: 'Новое предложение цены ждёт вашего подтверждения.', crew: 'Исполнитель назначен', price: 'Цена известна', route: 'Адреса сохранены', time: 'Время сохранено', contact: 'Контакты сохранены', notes: 'Комментарий помогает команде', step_new: 'Ждём подтверждения заказа командой.', step_quote: 'Проверьте предложение цены и подтвердите, если всё устраивает.', step_confirmed: 'Спокойно подготовьте вещи. Мы сообщим, когда назначим исполнителя.', step_assigned: 'Убедитесь, что к месту погрузки есть свободный доступ.', step_way: 'Исполнитель скоро будет — освободите проход к вещам.', step_progress: 'Остальное делает команда. Статус будет обновляться здесь.', step_done: 'Всё готово. Заказ останется доступен в профиле.',
  },
  uk: {
    label: 'MUUTTOBOTTI AI · ЗВЕДЕННЯ', calm: 'Усе під контролем', next: 'Далі', readiness: 'Готовність', ready: 'Добре підготовлено', needs: 'Перевірте ще', countdown: 'До переїзду', today: 'сьогодні', tomorrow: 'завтра', days: 'дн.', open: 'Відкрити замовлення', support: 'Людина завжди на зв’язку',
    new: 'Замовлення надійно отримано. Команда перевіряє дані перед підтвердженням.', confirmed: 'Замовлення підтверджено. Зараз від вас нічого не потрібно.', assigned: 'Виконавця призначено. Усе йде за планом.', on_the_way: 'Виконавець уже в дорозі. Тримайте телефон поруч для практичних питань.', in_progress: 'Переїзд уже триває. Слідкуйте за статусом у застосунку.', completed: 'Роботу завершено. Дякуємо, що обрали Muuttobotti.', cancelled: 'Замовлення скасовано. Нове можна створити будь-коли.', change_requested: 'Ваш запит на зміну отримано й очікує обробки.', quote: 'Нова пропозиція ціни очікує вашого підтвердження.', crew: 'Виконавця призначено', price: 'Ціна відома', route: 'Адреси збережено', time: 'Час збережено', contact: 'Контакти збережено', notes: 'Коментар допомагає команді', step_new: 'Очікуємо підтвердження замовлення командою.', step_quote: 'Перевірте ціну та підтвердьте, якщо все підходить.', step_confirmed: 'Спокійно підготуйте речі. Ми повідомимо, коли призначимо виконавця.', step_assigned: 'Переконайтеся, що до місця завантаження є вільний доступ.', step_way: 'Виконавець скоро прибуде — звільніть прохід до речей.', step_progress: 'Решту робить команда. Статус оновлюватиметься тут.', step_done: 'Усе готово. Замовлення залишиться доступним у профілі.',
  },
};

function daysUntil(dateValue: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue || '')) return null;
  const target = new Date(`${dateValue}T12:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export default function AiCalmCenter({ booking, locale, accountOrder, credentials }: Props) {
  const t = copy[locale] || copy.fi;
  const quotePending = booking.quote_status === 'pending' && Number(booking.quoted_price || 0) > 0;

  const confidence = useMemo(() => {
    const checks = [Boolean(booking.pickup), Boolean(booking.destination), Boolean(booking.preferred_date), Boolean(booking.preferred_time), Boolean(booking.phone || booking.email), Boolean(booking.notes), Number(booking.quoted_price || 0) > 0, Boolean(booking.assigned_worker)];
    const base = checks.filter(Boolean).length;
    const statusBoost = ['confirmed','assigned','on_the_way','in_progress','completed'].includes(booking.status) ? 1 : 0;
    return Math.min(100, 45 + (base * 6) + (statusBoost * 7));
  }, [booking]);

  const brief = quotePending ? t.quote : (t[booking.status] || t.new);
  const nextStep = quotePending ? t.step_quote : booking.status === 'new' ? t.step_new : booking.status === 'confirmed' ? t.step_confirmed : booking.status === 'assigned' ? t.step_assigned : booking.status === 'on_the_way' ? t.step_way : booking.status === 'in_progress' ? t.step_progress : t.step_done;
  const delta = daysUntil(booking.preferred_date);
  const countdown = delta === null ? booking.preferred_date : delta <= 0 ? t.today : delta === 1 ? t.tomorrow : `${delta} ${t.days}`;

  const trust = [
    { ok: Boolean(booking.pickup && booking.destination), text: t.route },
    { ok: Boolean(booking.preferred_date && booking.preferred_time), text: t.time },
    { ok: Boolean(booking.phone || booking.email), text: t.contact },
    { ok: Number(booking.quoted_price || 0) > 0 || ['new','cancelled'].includes(booking.status), text: t.price },
    { ok: Boolean(booking.assigned_worker) || !['assigned','on_the_way','in_progress','completed'].includes(booking.status), text: t.crew },
    { ok: Boolean(booking.notes), text: t.notes },
  ];

  const openOrder = () => {
    if (accountOrder) {
      router.push({ pathname: '/account-order', params: { id: booking.id } });
      return;
    }
    if (credentials?.id && credentials?.key) {
      router.push({ pathname: '/(client)/track', params: { id: credentials.id, key: credentials.key } });
      return;
    }
    router.push('/(client)/track');
  };

  return <View style={s.card}>
    <View style={s.topRow}>
      <View style={s.aiBadge}><View style={s.pulse}/><Text style={s.aiText}>{t.label}</Text></View>
      <View style={s.score}><Text style={s.scoreNumber}>{confidence}%</Text><Text style={s.scoreLabel}>{t.readiness}</Text></View>
    </View>

    <Text style={s.title}>{t.calm}</Text>
    <Text style={s.brief}>{brief}</Text>

    <View style={s.nextBox}><Text style={s.nextLabel}>{t.next}</Text><Text style={s.nextText}>{nextStep}</Text></View>

    <View style={s.metaRow}>
      <View style={s.meta}><Text style={s.metaLabel}>{t.countdown}</Text><Text style={s.metaValue}>{countdown}</Text></View>
      <View style={s.meta}><Text style={s.metaLabel}>{t.readiness}</Text><Text style={s.metaValue}>{confidence >= 80 ? t.ready : t.needs}</Text></View>
    </View>

    <View style={s.trustGrid}>{trust.map((item,index)=><View key={`${item.text}-${index}`} style={[s.trust,item.ok&&s.trustOn]}><Text style={[s.trustIcon,item.ok&&s.trustIconOn]}>{item.ok?'✓':'·'}</Text><Text style={[s.trustText,item.ok&&s.trustTextOn]}>{item.text}</Text></View>)}</View>

    <TouchableOpacity style={s.open} onPress={openOrder} activeOpacity={0.86}><Text style={s.openText}>{t.open}</Text><Text style={s.openArrow}>→</Text></TouchableOpacity>
    <Text style={s.human}>{t.support}</Text>
  </View>;
}

const s = StyleSheet.create({
  card:{backgroundColor:'#071D24',borderRadius:radius.xl,padding:17,borderWidth:1,borderColor:'#31545C'},
  topRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},
  aiBadge:{flexDirection:'row',alignItems:'center',gap:7,flexShrink:1},pulse:{width:8,height:8,borderRadius:8,backgroundColor:'#C8FF36'},aiText:{color:'#C8FF36',fontSize:9,fontWeight:'900',letterSpacing:1,flexShrink:1},
  score:{alignItems:'flex-end'},scoreNumber:{color:'#fff',fontSize:18,fontWeight:'900'},scoreLabel:{color:'#718D88',fontSize:8,fontWeight:'900',textTransform:'uppercase'},
  title:{color:'#fff',fontSize:24,fontWeight:'900',letterSpacing:-.6,marginTop:14},brief:{color:'#B8CBC7',fontSize:13,lineHeight:20,marginTop:7},
  nextBox:{backgroundColor:'#0E3139',borderRadius:15,padding:13,marginTop:14,borderWidth:1,borderColor:'#1C4851'},nextLabel:{color:'#7F9B96',fontSize:8,fontWeight:'900',letterSpacing:1,textTransform:'uppercase'},nextText:{color:'#fff',fontSize:13,fontWeight:'800',lineHeight:19,marginTop:4},
  metaRow:{flexDirection:'row',gap:8,marginTop:9},meta:{flex:1,backgroundColor:'#0A252C',borderRadius:13,padding:11},metaLabel:{color:'#728F89',fontSize:8,fontWeight:'900',textTransform:'uppercase'},metaValue:{color:'#EAF4F1',fontSize:13,fontWeight:'900',marginTop:3},
  trustGrid:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:11},trust:{flexDirection:'row',alignItems:'center',gap:5,borderRadius:999,paddingHorizontal:9,paddingVertical:7,backgroundColor:'#172C31',borderWidth:1,borderColor:'#294147'},trustOn:{backgroundColor:'#16352D',borderColor:'#2E5A49'},trustIcon:{color:'#657C77',fontSize:10,fontWeight:'900'},trustIconOn:{color:'#C8FF36'},trustText:{color:'#7D918D',fontSize:9,fontWeight:'800'},trustTextOn:{color:'#DDEBE7'},
  open:{marginTop:13,minHeight:50,borderRadius:14,backgroundColor:'#C8FF36',paddingHorizontal:15,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},openText:{color:colors.ink,fontSize:13,fontWeight:'900'},openArrow:{color:colors.ink,fontSize:20,fontWeight:'900'},human:{color:'#6F8C86',fontSize:9,textAlign:'center',fontWeight:'800',marginTop:9},
});
