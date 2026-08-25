import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { localeOptions, useLanguage } from '../../src/i18n';
import { ClientProfile, SavedBookingCredential, secureStorage } from '../../src/storage';
import { colors, radius, shadow } from '../../src/theme';

const copy = {
  fi:{profile:'Omat tiedot',profileSub:'Tallennetaan vain tälle laitteelle nopeampaa seuraavaa varausta varten.',save:'Tallenna tiedot',saved:'Tallennettu',history:'Tallennetut varaukset',empty:'Ei vielä tallennettuja varauksia.',share:'Jaa Muuttobotti',logout:'Kirjaudu ulos',logoutSub:'Poistaa aktiivisen varauksen kirjautumistiedot tältä laitteelta, mutta säilyttää historian.'},
  en:{profile:'Your details',profileSub:'Stored only on this device to make the next booking faster.',save:'Save details',saved:'Saved',history:'Saved bookings',empty:'No saved bookings yet.',share:'Share Muuttobotti',logout:'Sign out',logoutSub:'Removes active booking credentials from this device but keeps booking history.'},
  uk:{profile:'Ваші дані',profileSub:'Зберігаються лише на цьому пристрої для швидшого наступного бронювання.',save:'Зберегти дані',saved:'Збережено',history:'Збережені замовлення',empty:'Ще немає збережених замовлень.',share:'Поділитися Muuttobotti',logout:'Вийти',logoutSub:'Видаляє активні дані входу, але зберігає історію.'},
  ru:{profile:'Ваши данные',profileSub:'Сохраняются только на этом устройстве для более быстрого следующего заказа.',save:'Сохранить данные',saved:'Сохранено',history:'Сохранённые заказы',empty:'Сохранённых заказов пока нет.',share:'Поделиться Muuttobotti',logout:'Выйти',logoutSub:'Удаляет активные данные входа с устройства, но сохраняет историю заказов.'},
} as const;

export default function ProfileScreen() {
  const { locale, setLocale, tr } = useLanguage(); const t=copy[locale];
  const [history,setHistory]=useState<SavedBookingCredential[]>([]);
  const [profile,setProfile]=useState<ClientProfile>({name:'',phone:'',email:''});
  const [saved,setSaved]=useState(false);

  useFocusEffect(useCallback(() => { Promise.all([secureStorage.getClientHistory(),secureStorage.getClientProfile()]).then(([items,p])=>{setHistory(items);setProfile(p);}); }, []));
  const setField=(key:keyof ClientProfile,value:string)=>{setSaved(false);setProfile(p=>({...p,[key]:value}));};
  const save=async()=>{await secureStorage.setClientProfile(profile);setSaved(true);};
  const logout=async()=>{await secureStorage.clearClientCredentials();router.replace('/');};

  return <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View style={styles.hero}><Text style={styles.kicker}>MUUTTOBOTTI · V1</Text><Text style={styles.title}>{tr('profile')}</Text><Text style={styles.copy}>{tr('privacyCopy')}</Text></View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{tr('language')}</Text><View style={styles.langRow}>{localeOptions.map(item=><TouchableOpacity key={item.value} style={[styles.lang,locale===item.value&&styles.langActive]} onPress={()=>setLocale(item.value)}><Text style={[styles.langText,locale===item.value&&styles.langTextActive]}>{item.label}</Text></TouchableOpacity>)}</View></View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{t.profile}</Text><Text style={styles.muted}>{t.profileSub}</Text><Field label={tr('name')} value={profile.name} onChangeText={(v:string)=>setField('name',v)}/><Field label={tr('phone')} value={profile.phone} onChangeText={(v:string)=>setField('phone',v)} keyboardType="phone-pad"/><Field label={tr('email')} value={profile.email} onChangeText={(v:string)=>setField('email',v)} keyboardType="email-address" autoCapitalize="none"/><TouchableOpacity style={styles.primary} onPress={save}><Text style={styles.primaryText}>{saved?'✓ '+t.saved:t.save}</Text></TouchableOpacity></View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{t.history}</Text>{history.length===0?<Text style={styles.muted}>{t.empty}</Text>:history.map(item=><TouchableOpacity key={item.id} style={styles.booking} onPress={()=>router.push({pathname:'/(client)/track',params:{id:item.id,key:item.key}})}><View><Text style={styles.bookingId}>{item.id}</Text><Text style={styles.bookingMeta}>{new Date(item.savedAt).toLocaleDateString()}</Text></View><Text style={styles.arrow}>→</Text></TouchableOpacity>)}</View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{tr('help')}</Text><TouchableOpacity style={styles.action} onPress={()=>Linking.openURL('tel:+3584578767567')}><Text style={styles.actionText}>☎ 045 787 67567</Text></TouchableOpacity><TouchableOpacity style={styles.action} onPress={()=>Linking.openURL('https://wa.me/3584578767567')}><Text style={styles.actionText}>WhatsApp</Text></TouchableOpacity><TouchableOpacity style={styles.action} onPress={()=>Linking.openURL('mailto:autochemixfin@gmail.com')}><Text style={styles.actionText}>autochemixfin@gmail.com</Text></TouchableOpacity><TouchableOpacity style={styles.action} onPress={()=>Share.share({message:'Muuttobotti — muutot, kuljetukset ja siivous: https://muuttobotti.fi'})}><Text style={styles.actionText}>↗ {t.share}</Text></TouchableOpacity></View>

    <View style={styles.section}><Text style={styles.sectionTitle}>{t.logout}</Text><Text style={styles.muted}>{t.logoutSub}</Text><TouchableOpacity style={styles.logout} onPress={logout}><Text style={styles.logoutText}>{t.logout}</Text></TouchableOpacity></View>
  </ScrollView>;
}

function Field(props:any){return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput {...props} style={styles.input} placeholderTextColor="#8A9895"/></View>}

const styles=StyleSheet.create({
  wrap:{padding:16,paddingBottom:38,gap:13},hero:{backgroundColor:colors.ink,borderRadius:24,padding:21},kicker:{color:colors.lime,fontSize:10,fontWeight:'900',letterSpacing:1.1},title:{color:'#fff',fontSize:32,fontWeight:'900',marginTop:6},copy:{color:'#AFC1BD',fontSize:13,lineHeight:20,marginTop:7},
  section:{backgroundColor:'#fff',borderRadius:20,padding:16,borderWidth:1,borderColor:colors.line,gap:9,...shadow},sectionTitle:{color:colors.ink,fontSize:18,fontWeight:'900'},muted:{color:colors.muted,fontSize:13,lineHeight:20},langRow:{flexDirection:'row',gap:7},lang:{flex:1,minHeight:44,borderRadius:12,backgroundColor:'#EEF2ED',alignItems:'center',justifyContent:'center'},langActive:{backgroundColor:colors.ink},langText:{color:'#667773',fontSize:12,fontWeight:'900'},langTextActive:{color:'#fff'},
  field:{backgroundColor:'#F7F8F5',borderRadius:13,padding:12,borderWidth:1,borderColor:'#E3E8E1'},label:{color:'#60706D',fontSize:9,fontWeight:'900',letterSpacing:.7,textTransform:'uppercase',marginBottom:5},input:{minHeight:36,color:colors.ink,fontSize:15,fontWeight:'600',padding:0},primary:{minHeight:50,borderRadius:13,backgroundColor:colors.lime,alignItems:'center',justifyContent:'center'},primaryText:{color:colors.ink,fontWeight:'900'},
  booking:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:10,borderTopWidth:1,borderTopColor:'#EDF0EC'},bookingId:{color:colors.ink,fontSize:15,fontWeight:'900'},bookingMeta:{color:colors.muted,fontSize:11,marginTop:2},arrow:{color:colors.ink,fontSize:21},action:{minHeight:46,borderRadius:12,backgroundColor:'#F0F3EE',paddingHorizontal:14,justifyContent:'center'},actionText:{color:colors.ink,fontSize:13,fontWeight:'800'},logout:{minHeight:48,borderRadius:12,backgroundColor:'#F7E7E7',alignItems:'center',justifyContent:'center'},logoutText:{color:colors.danger,fontSize:14,fontWeight:'900'},
});
