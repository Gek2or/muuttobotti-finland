import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, shadow } from '../src/theme';

type Mode = 'moving' | 'cleaning' | 'transport';
type Load = 'light' | 'normal' | 'full';
type CleanType = 'regular' | 'moveout' | 'deep';

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }

function Stepper({ label, value, step, min, max, unit = '', onChange }: { label: string; value: number; step: number; min: number; max: number; unit?: string; onChange: (value: number) => void }) {
  return (
    <View style={styles.control}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity style={[styles.stepButton, value <= min && styles.stepDisabled]} disabled={value <= min} onPress={() => onChange(clamp(value - step, min, max))}><Text style={styles.stepText}>−</Text></TouchableOpacity>
        <View style={styles.valueBox}>
          <TextInput keyboardType="number-pad" value={String(value)} onChangeText={v => onChange(clamp(Number(v) || min, min, max))} style={styles.valueInput} />
          {!!unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
        <TouchableOpacity style={[styles.stepButton, value >= max && styles.stepDisabled]} disabled={value >= max} onPress={() => onChange(clamp(value + step, min, max))}><Text style={styles.stepText}>+</Text></TouchableOpacity>
      </View>
    </View>
  );
}

export default function CalculatorScreen() {
  const [mode, setMode] = useState<Mode>('moving');
  const [movers, setMovers] = useState<1 | 2>(2);
  const [size, setSize] = useState(15);
  const [load, setLoad] = useState<Load>('normal');
  const [floor, setFloor] = useState(0);
  const [distance, setDistance] = useState(0);
  const [elevator, setElevator] = useState(true);
  const [packing, setPacking] = useState(false);
  const [heavy, setHeavy] = useState(false);
  const [cleanSize, setCleanSize] = useState(20);
  const [windows, setWindows] = useState(0);
  const [cleanType, setCleanType] = useState<CleanType>('regular');
  const [transportDistance, setTransportDistance] = useState(0);
  const [weight, setWeight] = useState(0);
  const [express, setExpress] = useState(false);

  const calcMove = (count: 1 | 2) => {
    const hourly = count === 1 ? 59 : 75;
    const extraM2 = Math.max(0, size - 20);
    const first = Math.min(extraM2, 30);
    const second = Math.max(0, Math.min(extraM2 - 30, 40));
    const third = Math.max(0, extraM2 - 70);
    const sizeHours = count === 1 ? first * .012 + second * .018 + third * .025 : first * .008 + second * .012 + third * .017;
    const baseHours = count === 1 ? 1.55 : 1.70;
    const loadHours = count === 1 ? ({ light: 0, normal: .45, full: 1.10 } as const)[load] : ({ light: 0, normal: .30, full: .70 } as const)[load];
    const stairs = floor <= 0 ? 0 : elevator ? floor * (count === 1 ? .04 : .025) : floor * (count === 1 ? .16 : .10);
    const driveHours = Math.max(0, distance - 10) / 50;
    const packHours = packing ? (count === 1 ? 1.1 : .7) : 0;
    const heavyHours = heavy ? (count === 1 ? .6 : .35) : 0;
    const hours = Math.max(2, baseHours + sizeHours + loadHours + stairs + driveHours + packHours + heavyHours);
    const km = Math.max(0, distance - 10) * .85;
    return { hours, price: Math.round(hours * hourly + km), hourly, km };
  };

  const moveOne = useMemo(() => calcMove(1), [size, load, floor, distance, elevator, packing, heavy]);
  const moveTwo = useMemo(() => calcMove(2), [size, load, floor, distance, elevator, packing, heavy]);
  const selectedMove = movers === 1 ? moveOne : moveTwo;
  const recommendTwo = heavy || (load === 'full' && size >= 45) || size >= 85 || (!elevator && floor >= 2 && size >= 35) || moveOne.price >= moveTwo.price;

  const cleaning = useMemo(() => {
    const divisor = cleanType === 'deep' ? 16 : cleanType === 'moveout' ? 19 : 24;
    const perWindow = cleanType === 'deep' ? .22 : cleanType === 'moveout' ? .18 : .14;
    const hours = Math.max(2, cleanSize / divisor + windows * perWindow);
    return { hours, price: Math.round(hours * 32.9) };
  }, [cleanSize, windows, cleanType]);

  const transport = useMemo(() => {
    const driveHours = Math.max(0, transportDistance - 10) / 50;
    const handling = Math.max(0, weight - 50) / 320;
    const hours = Math.max(1, 1 + driveHours + handling);
    const km = Math.max(0, transportDistance - 10) * .85;
    const heavyCharge = weight > 120 ? 30 + (weight - 120) * .06 : 0;
    const base = Math.max(79, hours * 49 + km + heavyCharge);
    return { hours, price: Math.round(base * (express ? 1.25 : 1)) };
  }, [transportDistance, weight, express]);

  const result = mode === 'moving' ? selectedMove : mode === 'cleaning' ? cleaning : transport;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.tabs}>{(['moving', 'cleaning', 'transport'] as Mode[]).map((item, i) => <TouchableOpacity key={item} onPress={() => setMode(item)} style={[styles.tab, mode === item && styles.tabActive]}><Text style={[styles.tabText, mode === item && styles.tabTextActive]}>{['Muutto', 'Siivous', 'Kuljetus'][i]}</Text></TouchableOpacity>)}</View>

      {mode === 'moving' && <>
        <View style={styles.section}><Text style={styles.label}>Muuttajien määrä</Text><View style={styles.choiceRow}><TouchableOpacity style={[styles.choice, movers === 1 && styles.choiceActive]} onPress={() => setMovers(1)}><Text style={styles.choiceTitle}>1 muuttaja</Text><Text style={styles.choiceSub}>59 €/h</Text></TouchableOpacity><TouchableOpacity style={[styles.choice, movers === 2 && styles.choiceActive]} onPress={() => setMovers(2)}><Text style={styles.choiceTitle}>2 muuttajaa</Text><Text style={styles.choiceSub}>75 €/h · Crafter</Text></TouchableOpacity></View></View>
        <Stepper label="Asunnon koko" value={size} step={5} min={15} max={220} unit="m²" onChange={setSize} />
        <Stepper label="Kerros" value={floor} step={1} min={0} max={12} onChange={setFloor} />
        <View style={styles.section}><Text style={styles.label}>Tavaramäärä</Text><View style={styles.choiceRow}>{(['light', 'normal', 'full'] as Load[]).map((v, i) => <TouchableOpacity key={v} onPress={() => setLoad(v)} style={[styles.chip, load === v && styles.chipActive]}><Text style={[styles.chipText, load === v && styles.chipTextActive]}>{['Vähän', 'Normaali', 'Paljon'][i]}</Text></TouchableOpacity>)}</View></View>
        <Stepper label="Etäisyys" value={distance} step={5} min={0} max={500} unit="km" onChange={setDistance} />
        <View style={styles.toggles}>{[[elevator, setElevator, 'Hissi'], [packing, setPacking, 'Pakkausapua'], [heavy, setHeavy, 'Raskaita esineitä']] .map(([on, setter, label]) => <TouchableOpacity key={label as string} style={[styles.toggle, on && styles.toggleActive]} onPress={() => (setter as any)(!(on as boolean))}><Text style={styles.toggleText}>{label as string}</Text></TouchableOpacity>)}</View>
        {recommendTwo && <View style={styles.recommend}><Text style={styles.recommendTitle}>Suosittelemme 2 muuttajaa</Text><Text style={styles.recommendText}>Kahdella muuttajalla työ valmistuu nopeammin ja kokonaisuus pysyy usein järkevämpänä.</Text></View>}
        <View style={styles.compare}><Text style={styles.compareTitle}>Vertailu</Text><Text style={styles.compareLine}>1 muuttaja · {moveOne.price} € · {moveOne.hours.toFixed(1)} h</Text><Text style={styles.compareLine}>2 muuttajaa · {moveTwo.price} € · {moveTwo.hours.toFixed(1)} h</Text></View>
      </>}

      {mode === 'cleaning' && <>
        <Stepper label="Pinta-ala" value={cleanSize} step={5} min={20} max={300} unit="m²" onChange={setCleanSize} />
        <Stepper label="Ikkunoita" value={windows} step={1} min={0} max={30} onChange={setWindows} />
        <View style={styles.section}><Text style={styles.label}>Siivoustyyppi</Text><View style={styles.choiceRow}>{(['regular', 'moveout', 'deep'] as CleanType[]).map((v, i) => <TouchableOpacity key={v} onPress={() => setCleanType(v)} style={[styles.chip, cleanType === v && styles.chipActive]}><Text style={[styles.chipText, cleanType === v && styles.chipTextActive]}>{['Perus', 'Muuttosiivous', 'Suursiivous'][i]}</Text></TouchableOpacity>)}</View></View>
      </>}

      {mode === 'transport' && <>
        <Stepper label="Etäisyys" value={transportDistance} step={5} min={0} max={600} unit="km" onChange={setTransportDistance} />
        <Stepper label="Arvioitu paino" value={weight} step={25} min={0} max={1200} unit="kg" onChange={setWeight} />
        <TouchableOpacity style={[styles.toggle, express && styles.toggleActive]} onPress={() => setExpress(!express)}><Text style={styles.toggleText}>Pikakuljetus +25%</Text></TouchableOpacity>
      </>}

      <View style={styles.summary}><Text style={styles.summaryLabel}>ALUSTAVA ARVIO</Text><Text style={styles.price}>{result.price} €</Text><Text style={styles.duration}>{result.hours.toFixed(1)}–{(result.hours + .5).toFixed(1)} h</Text><Text style={styles.note}>{mode === 'moving' ? 'Minimi 2 h. Ensimmäiset 10 km sisältyvät, sen jälkeen 0,85 €/km.' : mode === 'cleaning' ? '32,90 €/h · minimiveloitus 2 h.' : 'Crafter-kuljetuksen minimiveloitus 79 €. Ensimmäiset 10 km sisältyvät.'}</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40, gap: 14 },
  tabs: { flexDirection: 'row', backgroundColor: '#E8ECE6', padding: 5, borderRadius: radius.md },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  tabActive: { backgroundColor: colors.ink },
  tabText: { color: '#61706D', fontSize: 13, fontWeight: '850' },
  tabTextActive: { color: '#fff' },
  section: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line },
  label: { color: '#60706D', fontSize: 12, fontWeight: '900', letterSpacing: .8, textTransform: 'uppercase', marginBottom: 10 },
  control: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line },
  stepper: { flexDirection: 'row', gap: 7, backgroundColor: '#EDF1EC', padding: 6, borderRadius: 17 },
  stepButton: { width: 58, height: 58, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow },
  stepDisabled: { opacity: .3 },
  stepText: { fontSize: 27, fontWeight: '600', color: colors.ink },
  valueBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  valueInput: { minWidth: 70, textAlign: 'center', fontSize: 24, fontWeight: '950', color: colors.ink },
  unit: { color: colors.muted, fontWeight: '800', marginLeft: 2 },
  choiceRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  choice: { flex: 1, minWidth: 135, padding: 14, borderRadius: 15, backgroundColor: '#EEF2ED', borderWidth: 1, borderColor: '#E0E6DF' },
  choiceActive: { backgroundColor: colors.lime, borderColor: colors.limeStrong },
  choiceTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  choiceSub: { color: '#60716B', fontSize: 12, marginTop: 4 },
  chip: { flexGrow: 1, minHeight: 44, paddingHorizontal: 12, borderRadius: 13, backgroundColor: '#EDF1EC', alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.ink },
  chipText: { color: '#5C6E69', fontWeight: '850', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  toggles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toggle: { minHeight: 48, paddingHorizontal: 15, borderRadius: 14, backgroundColor: '#EDF1EC', justifyContent: 'center' },
  toggleActive: { backgroundColor: colors.lime },
  toggleText: { color: colors.ink, fontWeight: '850' },
  recommend: { backgroundColor: '#EDF6E3', borderRadius: radius.lg, padding: 17 },
  recommendTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  recommendText: { color: '#5B6E62', fontSize: 14, lineHeight: 21, marginTop: 5 },
  compare: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 17, borderWidth: 1, borderColor: colors.line },
  compareTitle: { color: colors.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  compareLine: { color: colors.ink, fontSize: 15, lineHeight: 25, fontWeight: '800' },
  summary: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 23, marginTop: 4 },
  summaryLabel: { color: colors.lime, fontWeight: '900', fontSize: 11, letterSpacing: 1.2 },
  price: { color: '#fff', fontSize: 46, fontWeight: '950', letterSpacing: -2, marginTop: 5 },
  duration: { color: '#D7E2DF', fontSize: 18, fontWeight: '800', marginTop: 2 },
  note: { color: '#9DB0AD', fontSize: 13, lineHeight: 20, marginTop: 13 },
});
