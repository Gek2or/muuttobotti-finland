import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Animated, Easing, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Booking, getBooking, getClientAccount } from '../api';
import { useLanguage } from '../i18n';
import { secureStorage } from '../storage';
import { colors, radius, shadow } from '../theme';

const statusCopy: Record<string, Record<string, string>> = {
  fi: { new:'Vastaanotettu', confirmed:'Vahvistettu', assigned:'Tekijä määritetty', on_the_way:'Matkalla', in_progress:'Käynnissä', completed:'Valmis', cancelled:'Peruttu', change_requested:'Muutos käsittelyssä', active:'AKTIIVINEN TILAUS', open:'Avaa live-seuranta', loading:'Päivitetään…', offer:'HINTATARJOUS' },
  en: { new:'Received', confirmed:'Confirmed', assigned:'Crew assigned', on_the_way:'On the way', in_progress:'In progress', completed:'Completed', cancelled:'Cancelled', change_requested:'Change requested', active:'ACTIVE ORDER', open:'Open live tracking', loading:'Refreshing…', offer:'PRICE OFFER' },
  ru: { new:'Получен', confirmed:'Подтверждён', assigned:'Исполнитель назначен', on_the_way:'В пути', in_progress:'В работе', completed:'Завершён', cancelled:'Отменён', change_requested:'Изменение рассматривается', active:'АКТИВНЫЙ ЗАКАЗ', open:'Открыть live-отслеживание', loading:'Обновляем…', offer:'ПРЕДЛОЖЕНИЕ ЦЕНЫ' },
  uk: { new:'Отримано', confirmed:'Підтверджено', assigned:'Виконавця призначено', on_the_way:'В дорозі', in_progress:'В роботі', completed:'Завершено', cancelled:'Скасовано', change_requested:'Зміна розглядається', active:'АКТИВНЕ ЗАМОВЛЕННЯ', open:'Відкрити live-відстеження', loading:'Оновлюємо…', offer:'ПРОПОЗИЦІЯ ЦІНИ' },
};

export default function ClientHomeScreen() {
  const { tr, locale } = useLanguage();
  const insets = useSafeAreaInsets();
  const glow = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [credentials, setCredentials] = useState<{ id: string; key: string } | null>(null);
  const [accountOrder, setAccountOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = statusCopy[locale] ?? statusCopy.fi;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    loop.start();
    Animated.timing(enter, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    return () => loop.stop();
  }, [enter, glow]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [saved, session] = await Promise.all([secureStorage.getClientCredentials(), secureStorage.getClientSession()]);
      if (saved.id && saved.key) {
        setCredentials(saved);
        setAccountOrder(false);
        const result = await getBooking(saved.id, saved.key);
        setBooking(result.booking);
        return;
      }
      setCredentials(null);
      if (session.token) {
        const result = await getClientAccount(session.token);
        const orders = (result.bookings || []) as Booking[];
        const active = orders.find(item => !['completed', 'cancelled'].includes(item.status)) || orders[0];
        setBooking(active || null);
        setAccountOrder(Boolean(active));
        return;
      }
      setBooking(null);
      setAccountOrder(false);
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const open = () => {
    if (!booking) {
      router.push('/(client)/track');
      return;
    }
    if (accountOrder) {
      router.push({ pathname: '/account-order', params: { id: booking.id } });
      return;
    }
    if (credentials) {
      router.push({ pathname: '/(client)/track', params: { id: credentials.id, key: credentials.key } });
      return;
    }
    router.push('/(client)/track');
  };

  const cards = [
    { icon:'€', title:tr('calculatePrice'), text:tr('calculateText'), route:'/(client)/calculator' as const, accent:true },
    { icon:'+', title:tr('makeBooking'), text:tr('bookingText'), route:'/(client)/booking' as const, accent:false },
    { icon:'◎', title:tr('trackBooking'), text:tr('trackText'), route:'/(client)/track' as const, accent:false },
  ];
  const currentStatus = booking ? (t[booking.status] || booking.status) : '';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.wrap} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
        <Animated.View style={[styles.glowA, { transform: [
          { translateX: glow.interpolate({ inputRange:[0,1], outputRange:[0,-18] }) },
          { translateY: glow.interpolate({ inputRange:[0,1], outputRange:[0,25] }) },
          { scale: glow.interpolate({ inputRange:[0,1], outputRange:[1,1.08] }) },
        ] }]} />
        <Animated.View style={[styles.glowB, { opacity: glow.interpolate({ inputRange:[0,1], outputRange:[0.06,0.17] }) }]} />
        <Animated.View style={{ opacity: enter, transform:[{ translateY: enter.interpolate({ inputRange:[0,1], outputRange:[16,0] }) }] }}>
          <View style={styles.liveRow}><View style={styles.liveDot}/><Text style={styles.kicker}>MUUTTOBOTTI LIVE · V2.0</Text></View>
          <Text style={styles.title}>{tr('homeTitle')}</Text>
          <Text style={styles.copy}>{tr('homeCopy')}</Text>
          <View style={styles.rateRow}><Rate label="1 mover" value="59 €/h"/><Rate label="2 + Crafter" value="75 €/h"/><Rate label="Cleaning" value="32,90 €/h"/></View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.body, { opacity: enter, transform:[{ translateY: enter.interpolate({ inputRange:[0,1], outputRange:[20,0] }) }] }]}>
        {(booking || loading) && (
          <TouchableOpacity style={styles.active} activeOpacity={0.86} onPress={open}>
            <View style={styles.activeTop}>
              <View><Text style={styles.activeKicker}>{t.active}</Text><Text style={styles.activeId}>{booking?.id || '…'}</Text></View>
              <View style={styles.status}><View style={styles.statusDot}/><Text style={styles.statusText}>{loading ? t.loading : currentStatus}</Text></View>
            </View>
            {booking && <>
              <Text style={styles.activeRoute}>{booking.pickup} → {booking.destination}</Text>
              <Text style={styles.meta}>{booking.preferred_date} · {booking.preferred_time} · {booking.service}</Text>
              {booking.quote_status === 'pending' && Number(booking.quoted_price || 0) > 0 && <View style={styles.offer}><Text style={styles.offerLabel}>{t.offer}</Text><Text style={styles.offerPrice}>{Number(booking.quoted_price).toFixed(2)} €</Text></View>}
              {!!booking.assigned_worker && <Text style={styles.crew}>◉ {booking.assigned_worker}</Text>}
            </>}
            <View style={styles.openRow}><Text style={styles.openText}>{t.open}</Text><Text style={styles.arrow}>→</Text></View>
          </TouchableOpacity>
        )}

        <View style={styles.grid}>{cards.map((card, index) => (
          <TouchableOpacity key={card.title} style={[styles.card, card.accent && styles.cardAccent]} onPress={() => router.push(card.route)}>
            <View style={[styles.icon, card.accent && styles.iconAccent]}><Text style={styles.iconText}>{card.icon}</Text></View>
            <Text style={styles.cardTitle}>{card.title}</Text><Text style={styles.cardText}>{card.text}</Text><Text style={styles.cardIndex}>0{index + 1}</Text><Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>
        ))}</View>

        <View style={styles.contact}><View><Text style={styles.contactKicker}>HUMAN SUPPORT</Text><Text style={styles.contactTitle}>{tr('help')}</Text></View><View style={styles.contactRow}><TouchableOpacity style={styles.contactBtn} onPress={() => void Linking.openURL('tel:+3584578767567')}><Text style={styles.contactText}>Call</Text></TouchableOpacity><TouchableOpacity style={styles.contactBtn} onPress={() => void Linking.openURL('https://wa.me/3584578767567')}><Text style={styles.contactText}>WhatsApp</Text></TouchableOpacity></View></View>
      </Animated.View>
    </ScrollView>
  );
}

function Rate({ label, value }: { label: string; value: string }) {
  return <View style={styles.rate}><Text style={styles.rateValue}>{value}</Text><Text style={styles.rateLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  screen:{backgroundColor:'#EEF3EE'}, wrap:{paddingBottom:36,backgroundColor:'#EEF3EE'}, hero:{position:'relative',overflow:'hidden',backgroundColor:'#06191F',borderBottomLeftRadius:36,borderBottomRightRadius:36,paddingHorizontal:22,paddingBottom:24,minHeight:310,justifyContent:'flex-end'}, glowA:{position:'absolute',width:240,height:240,borderRadius:120,backgroundColor:'#285660',opacity:.55,right:-85,top:-70}, glowB:{position:'absolute',width:190,height:190,borderRadius:95,backgroundColor:'#C8FF36',left:-85,bottom:-55}, liveRow:{flexDirection:'row',alignItems:'center',gap:7}, liveDot:{width:7,height:7,borderRadius:7,backgroundColor:'#C8FF36',shadowColor:'#C8FF36',shadowOpacity:1,shadowRadius:9}, kicker:{color:'#C8FF36',fontSize:10,fontWeight:'900',letterSpacing:1.2}, title:{color:'#fff',fontSize:36,lineHeight:39,fontWeight:'900',letterSpacing:-1.5,marginTop:9}, copy:{color:'#ADC0BC',fontSize:15,lineHeight:23,marginTop:9}, rateRow:{flexDirection:'row',gap:7,marginTop:17}, rate:{flex:1,backgroundColor:'rgba(16,48,56,.82)',borderWidth:1,borderColor:'#20434B',borderRadius:13,padding:10}, rateValue:{color:'#fff',fontSize:14,fontWeight:'900'}, rateLabel:{color:'#8FA6A1',fontSize:9,marginTop:3,fontWeight:'800'}, body:{paddingHorizontal:15,paddingTop:13,gap:11}, active:{backgroundColor:'#09272F',borderRadius:radius.lg,padding:17,borderWidth:1,borderColor:'#28505A',...shadow}, activeTop:{flexDirection:'row',justifyContent:'space-between',gap:10}, activeKicker:{color:'#C8FF36',fontSize:9,fontWeight:'900',letterSpacing:1}, activeId:{color:'#fff',fontSize:19,fontWeight:'900',marginTop:3}, status:{flexDirection:'row',gap:6,alignItems:'center',backgroundColor:'#15373F',borderRadius:999,paddingHorizontal:9,paddingVertical:6,maxWidth:170}, statusDot:{width:7,height:7,borderRadius:7,backgroundColor:'#C8FF36'}, statusText:{color:'#DCE9E6',fontSize:9,fontWeight:'900',flexShrink:1}, activeRoute:{color:'#fff',fontSize:13,fontWeight:'800',lineHeight:20,marginTop:13}, meta:{color:'#8EA7A2',fontSize:10,marginTop:4}, offer:{marginTop:11,backgroundColor:'#133A3F',borderRadius:13,padding:10}, offerLabel:{color:'#8CA6A0',fontSize:8,fontWeight:'900'}, offerPrice:{color:'#C8FF36',fontSize:24,fontWeight:'900',marginTop:2}, crew:{color:'#DDEAE7',fontSize:11,fontWeight:'800',marginTop:9}, openRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:13,paddingTop:11,borderTopWidth:1,borderTopColor:'#21444C'}, openText:{color:'#C8FF36',fontSize:11,fontWeight:'900'}, arrow:{color:'#C8FF36',fontSize:20}, grid:{gap:9}, card:{backgroundColor:'#fff',borderRadius:radius.lg,padding:17,minHeight:143,borderWidth:1,borderColor:colors.line,...shadow}, cardAccent:{backgroundColor:'#F3FFE2',borderColor:'#D2F293'}, icon:{width:39,height:39,borderRadius:12,backgroundColor:'#EDF2ED',alignItems:'center',justifyContent:'center',marginBottom:13}, iconAccent:{backgroundColor:'#C8FF36'}, iconText:{color:colors.ink,fontSize:17,fontWeight:'900'}, cardTitle:{color:colors.ink,fontSize:20,fontWeight:'900'}, cardText:{color:colors.muted,fontSize:13,lineHeight:19,marginTop:5,maxWidth:'84%'}, cardIndex:{position:'absolute',right:16,top:15,color:'#C3CECA',fontSize:9,fontWeight:'900'}, cardArrow:{position:'absolute',right:18,bottom:17,color:colors.ink,fontSize:22,fontWeight:'900'}, contact:{backgroundColor:'#0C2A32',borderRadius:radius.lg,padding:18,gap:12,borderWidth:1,borderColor:'#234B54'}, contactKicker:{color:'#7F9B96',fontSize:9,fontWeight:'900',letterSpacing:1}, contactTitle:{color:'#fff',fontSize:20,fontWeight:'900',marginTop:3}, contactRow:{flexDirection:'row',gap:8}, contactBtn:{flex:1,minHeight:48,borderRadius:13,backgroundColor:'#173B44',alignItems:'center',justifyContent:'center'}, contactText:{color:'#fff',fontSize:13,fontWeight:'900'},
});
