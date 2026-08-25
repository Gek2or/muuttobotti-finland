import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../i18n';
import { secureStorage } from '../storage';
import { colors, radius, shadow } from '../theme';

type Mode = 'moving' | 'cleaning' | 'transport';
type Load = 'light' | 'normal' | 'full';
type CleanType = 'regular' | 'moveout' | 'deep';

const copy = {
  fi: { title: 'Älykäs hinta-arvio', sub: 'Säädä tiedot. Arvio päivittyy heti ja voidaan liittää suoraan varaukseen.', moving: 'Muutto', cleaning: 'Siivous', transport: 'Kuljetus', movers: 'Muuttajat', size: 'Asunnon koko', floor: 'Kerros', distance: 'Etäisyys', load: 'Tavaramäärä', elevator: 'Hissi', area: 'Pinta-ala', windows: 'Ikkunat', type: 'Siivoustyyppi', weight: 'Arvioitu paino', express: 'Express +25%', estimate: 'ALUSTAVA ARVIO', book: 'Varaa tällä arviolla', note: 'Lopullinen hinta vahvistetaan aina ennen työn alkua.' },
  en: { title: 'Smart price estimate', sub: 'Adjust the details. The estimate updates instantly and can be attached to your booking.', moving: 'Moving', cleaning: 'Cleaning', transport: 'Transport', movers: 'Movers', size: 'Home size', floor: 'Floor', distance: 'Distance', load: 'Amount of belongings', elevator: 'Elevator', area: 'Area', windows: 'Windows', type: 'Cleaning type', weight: 'Estimated weight', express: 'Express +25%', estimate: 'PRELIMINARY ESTIMATE', book: 'Book with this estimate', note: 'Final price is always confirmed before the job starts.' },
  uk: { title: 'Розумна оцінка ціни', sub: 'Змініть параметри. Оцінка оновиться одразу та буде додана до замовлення.', moving: 'Переїзд', cleaning: 'Прибирання', transport: 'Перевезення', movers: 'Вантажники', size: 'Площа житла', floor: 'Поверх', distance: 'Відстань', load: 'Кількість речей', elevator: 'Ліфт', area: 'Площа', windows: 'Вікна', type: 'Тип прибирання', weight: 'Орієнтовна вага', express: 'Експрес +25%', estimate: 'ПОПЕРЕДНЯ ОЦІНКА', book: 'Замовити з цією оцінкою', note: 'Фінальна ціна завжди підтверджується до початку роботи.' },
  ru: { title: 'Умная оценка цены', sub: 'Меняйте параметры. Расчёт обновляется сразу и прикрепляется к заказу.', moving: 'Переезд', cleaning: 'Уборка', transport: 'Перевозка', movers: 'Грузчики', size: 'Площадь жилья', floor: 'Этаж', distance: 'Расстояние', load: 'Количество вещей', elevator: 'Лифт', area: 'Площадь', windows: 'Окна', type: 'Тип уборки', weight: 'Примерный вес', express: 'Экспресс +25%', estimate: 'ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА', book: 'Заказать с этим расчётом', note: 'Финальная цена всегда подтверждается до начала работы.' },
} as const;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function ClientCalculatorScreen() {
  const { locale } = useLanguage();
  const t = copy[locale];
  const [mode, setMode] = useState<Mode>('moving');
  const [movers, setMovers] = useState<1 | 2>(2);
  const [size, setSize] = useState(55);
  const [floor, setFloor] = useState(1);
  const [distance, setDistance] = useState(15);
  const [load, setLoad] = useState<Load>('normal');
  const [elevator, setElevator] = useState(true);
  const [cleanSize, setCleanSize] = useState(55);
  const [windows, setWindows] = useState(4);
  const [cleanType, setCleanType] = useState<CleanType>('regular');
  const [transportDistance, setTransportDistance] = useState(20);
  const [weight, setWeight] = useState(80);
  const [express, setExpress] = useState(false);

  const result = useMemo(() => {
    if (mode === 'moving') {
      const hourly = movers === 1 ? 59 : 75;
      const extra = Math.max(0, size - 20);
      const sizeHours = extra * (movers === 1 ? .018 : .012);
      const loadHours = load === 'full' ? (movers === 1 ? 1.0 : .65) : load === 'normal' ? (movers === 1 ? .45 : .3) : 0;
      const stairs = floor * (elevator ? .03 : movers === 1 ? .16 : .1);
      const hours = Math.max(2, 1.6 + sizeHours + loadHours + stairs + Math.max(0, distance - 10) / 50);
      return { hours, price: Math.round(hours * hourly + Math.max(0, distance - 10) * .85) };
    }
    if (mode === 'cleaning') {
      const divisor = cleanType === 'deep' ? 16 : cleanType === 'moveout' ? 19 : 24;
      const perWindow = cleanType === 'deep' ? .22 : cleanType === 'moveout' ? .18 : .14;
      const hours = Math.max(2, cleanSize / divisor + windows * perWindow);
      return { hours, price: Math.round(hours * 32.9) };
    }
    const hours = Math.max(1, 1 + Math.max(0, transportDistance - 10) / 50 + Math.max(0, weight - 50) / 320);
    const base = Math.max(79, hours * 49 + Math.max(0, transportDistance - 10) * .85 + (weight > 120 ? 30 + (weight - 120) * .06 : 0));
    return { hours, price: Math.round(base * (express ? 1.25 : 1)) };
  }, [cleanSize, cleanType, distance, elevator, express, floor, load, mode, movers, size, transportDistance, weight, windows]);

  const buildSnapshot = () => {
    const base = { quotedPrice: result.price, quotedDuration: `${result.hours.toFixed(1)}–${(result.hours + .5).toFixed(1)} h` };
    if (mode === 'moving') return { ...base, moving: { movers, sizeM2: size, floor, distanceKm: distance, elevator, load } };
    if (mode === 'cleaning') return { ...base, cleaning: { sizeM2: cleanSize, windows, cleanType } };
    return { ...base, transport: { distanceKm: transportDistance, weightKg: weight, express } };
  };

  const book = async () => {
    await secureStorage.setPendingEstimate({ service: mode, snapshot: buildSnapshot() });
    router.push('/(client)/booking');
  };

  return <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
    <View style={styles.hero}><View style={styles.heroGlow} /><Text style={styles.kicker}>MUUTTOBOTTI ESTIMATE ENGINE</Text><Text style={styles.title}>{t.title}</Text><Text style={styles.copy}>{t.sub}</Text></View>
    <View style={styles.tabs}>{(['moving', 'cleaning', 'transport'] as Mode[]).map(item => <TouchableOpacity key={item} onPress={() => setMode(item)} style={[styles.tab, mode === item && styles.tabActive]}><Text style={[styles.tabText, mode === item && styles.tabTextActive]}>{item === 'moving' ? t.moving : item === 'cleaning' ? t.cleaning : t.transport}</Text></TouchableOpacity>)}</View>

    {mode === 'moving' && <>
      <Panel label={t.movers}><View style={styles.chips}><Chip text="1 · 59 €/h" active={movers === 1} onPress={() => setMovers(1)} /><Chip text="2 · 75 €/h + Crafter" active={movers === 2} onPress={() => setMovers(2)} /></View></Panel>
      <Stepper label={t.size} value={size} unit="m²" step={5} min={15} max={220} onChange={setSize} />
      <Stepper label={t.floor} value={floor} step={1} min={0} max={12} onChange={setFloor} />
      <Stepper label={t.distance} value={distance} unit="km" step={5} min={0} max={600} onChange={setDistance} />
      <Panel label={t.load}><View style={styles.chips}>{(['light', 'normal', 'full'] as Load[]).map(item => <Chip key={item} text={item} active={load === item} onPress={() => setLoad(item)} />)}</View></Panel>
      <TouchableOpacity onPress={() => setElevator(value => !value)} style={[styles.toggle, elevator && styles.toggleActive]}><View style={[styles.toggleDot, elevator && styles.toggleDotActive]} /><Text style={styles.toggleText}>{t.elevator}</Text></TouchableOpacity>
    </>}

    {mode === 'cleaning' && <>
      <Stepper label={t.area} value={cleanSize} unit="m²" step={5} min={20} max={300} onChange={setCleanSize} />
      <Stepper label={t.windows} value={windows} step={1} min={0} max={40} onChange={setWindows} />
      <Panel label={t.type}><View style={styles.chips}>{(['regular', 'moveout', 'deep'] as CleanType[]).map(item => <Chip key={item} text={item} active={cleanType === item} onPress={() => setCleanType(item)} />)}</View></Panel>
    </>}

    {mode === 'transport' && <>
      <Stepper label={t.distance} value={transportDistance} unit="km" step={5} min={0} max={800} onChange={setTransportDistance} />
      <Stepper label={t.weight} value={weight} unit="kg" step={25} min={0} max={1500} onChange={setWeight} />
      <TouchableOpacity onPress={() => setExpress(value => !value)} style={[styles.toggle, express && styles.toggleActive]}><View style={[styles.toggleDot, express && styles.toggleDotActive]} /><Text style={styles.toggleText}>{t.express}</Text></TouchableOpacity>
    </>}

    <View style={styles.result}><View style={styles.resultGlow} /><Text style={styles.resultLabel}>{t.estimate}</Text><Text style={styles.price}>{result.price} €</Text><Text style={styles.duration}>{result.hours.toFixed(1)}–{(result.hours + .5).toFixed(1)} h</Text><Text style={styles.note}>{t.note}</Text></View>
    <TouchableOpacity style={styles.primary} onPress={book}><Text style={styles.primaryText}>{t.book}</Text><Text style={styles.arrow}>→</Text></TouchableOpacity>
  </ScrollView>;
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) { return <View style={styles.panel}><Text style={styles.label}>{label}</Text>{children}</View>; }
function Chip({ text, active, onPress }: { text: string; active?: boolean; onPress: () => void }) { return <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}><Text style={[styles.chipText, active && styles.chipTextActive]}>{text}</Text></TouchableOpacity>; }
function Stepper({ label, value, unit = '', step, min, max, onChange }: { label: string; value: number; unit?: string; step: number; min: number; max: number; onChange: (value: number) => void }) { return <View style={styles.panel}><Text style={styles.label}>{label}</Text><View style={styles.stepper}><TouchableOpacity style={styles.stepButton} onPress={() => onChange(clamp(value - step, min, max))}><Text style={styles.stepText}>−</Text></TouchableOpacity><View style={styles.valueBox}><Text style={styles.value}>{value}</Text><Text style={styles.unit}>{unit}</Text></View><TouchableOpacity style={styles.stepButton} onPress={() => onChange(clamp(value + step, min, max))}><Text style={styles.stepText}>+</Text></TouchableOpacity></View></View>; }

const styles = StyleSheet.create({
  wrap: { padding: 15, paddingBottom: 42, gap: 10, backgroundColor: colors.paper },
  hero: { position: 'relative', overflow: 'hidden', backgroundColor: '#06191F', borderRadius: radius.xl, padding: 20, minHeight: 170, justifyContent: 'flex-end', borderWidth: 1, borderColor: '#214650' }, heroGlow: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: '#315E66', opacity: .55, right: -80, top: -85 }, kicker: { color: colors.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 }, title: { color: '#fff', fontSize: 29, lineHeight: 32, fontWeight: '900', letterSpacing: -1, marginTop: 6 }, copy: { color: '#ADC0BC', fontSize: 13, lineHeight: 20, marginTop: 7, maxWidth: '90%' },
  tabs: { flexDirection: 'row', gap: 4, padding: 4, backgroundColor: '#E5ECE5', borderRadius: 15 }, tab: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, tabActive: { backgroundColor: colors.ink }, tabText: { color: '#687A75', fontSize: 11, fontWeight: '900' }, tabTextActive: { color: '#fff' },
  panel: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 15, borderWidth: 1, borderColor: colors.line, ...shadow }, label: { color: '#6C7F7A', fontSize: 9, fontWeight: '900', letterSpacing: .85, textTransform: 'uppercase', marginBottom: 9 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, chip: { minHeight: 43, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#DDE5DE', backgroundColor: '#F0F4F0', alignItems: 'center', justifyContent: 'center' }, chipActive: { backgroundColor: colors.ink, borderColor: colors.ink }, chipText: { color: '#5E716C', fontSize: 11, fontWeight: '900' }, chipTextActive: { color: colors.lime },
  stepper: { flexDirection: 'row', gap: 6, backgroundColor: '#EDF2ED', borderRadius: 15, padding: 5 }, stepButton: { width: 52, height: 54, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, stepText: { color: colors.ink, fontSize: 23, fontWeight: '900' }, valueBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }, value: { color: colors.ink, fontSize: 22, fontWeight: '900' }, unit: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  toggle: { minHeight: 50, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9 }, toggleActive: { backgroundColor: '#F2FFE2', borderColor: '#D2F292' }, toggleDot: { width: 10, height: 10, borderRadius: 99, backgroundColor: '#B9C5C0' }, toggleDotActive: { backgroundColor: colors.limeStrong, shadowColor: colors.limeStrong, shadowOpacity: 1, shadowRadius: 8 }, toggleText: { color: colors.ink, fontSize: 12, fontWeight: '900' },
  result: { position: 'relative', overflow: 'hidden', backgroundColor: '#06191F', borderRadius: radius.xl, padding: 20, borderWidth: 1, borderColor: '#214650' }, resultGlow: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: colors.lime, opacity: .11, right: -75, bottom: -90 }, resultLabel: { color: colors.lime, fontSize: 9, fontWeight: '900', letterSpacing: 1 }, price: { color: '#fff', fontSize: 43, fontWeight: '900', letterSpacing: -1.8, marginTop: 4 }, duration: { color: '#AFC3BE', fontSize: 13, fontWeight: '800' }, note: { color: '#8EA7A1', fontSize: 11, lineHeight: 17, marginTop: 10, maxWidth: '85%' },
  primary: { minHeight: 58, borderRadius: 16, backgroundColor: colors.lime, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...shadow }, primaryText: { color: colors.ink, fontSize: 14, fontWeight: '900' }, arrow: { color: colors.ink, fontSize: 22, fontWeight: '900' },
});