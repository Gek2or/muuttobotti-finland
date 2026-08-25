import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../src/i18n';
import { colors } from '../../src/theme';

const icon = (value:string,focused:boolean) => <View style={[styles.icon,focused&&styles.iconActive]}><Text style={[styles.iconText,focused&&styles.iconTextActive]}>{value}</Text></View>;

export default function ClientTabsLayout(){
const {tr}=useLanguage();
return <Tabs screenOptions={{
  headerStyle:{backgroundColor:colors.ink},headerTintColor:'#fff',headerTitleStyle:{fontWeight:'900'},
  tabBarHideOnKeyboard:true,
  tabBarStyle:{height:76,paddingTop:7,paddingBottom:8,backgroundColor:'#FFFFFF',borderTopColor:'#E3E8E1',borderTopWidth:1,elevation:12},
  tabBarActiveTintColor:colors.ink,tabBarInactiveTintColor:'#748681',tabBarLabelStyle:{fontSize:10,fontWeight:'800',marginTop:2},
}}>
<Tabs.Screen name="index" options={{title:tr('home'),headerShown:false,tabBarIcon:({focused})=>icon('⌂',focused)}}/>
<Tabs.Screen name="calculator" options={{title:tr('calculator'),tabBarIcon:({focused})=>icon('€',focused)}}/>
<Tabs.Screen name="booking" options={{title:tr('booking'),tabBarIcon:({focused})=>icon('+',focused)}}/>
<Tabs.Screen name="track" options={{title:tr('tracking'),tabBarIcon:({focused})=>icon('◎',focused)}}/>
<Tabs.Screen name="profile" options={{title:tr('profile'),tabBarIcon:({focused})=>icon('≡',focused)}}/>
</Tabs>}
const styles=StyleSheet.create({icon:{minWidth:35,height:28,borderRadius:10,alignItems:'center',justifyContent:'center'},iconActive:{backgroundColor:colors.lime},iconText:{fontSize:17,color:'#748681',fontWeight:'900'},iconTextActive:{color:colors.ink}});
