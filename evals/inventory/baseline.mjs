// Frozen algorithm from main 87d69f147f5d65de0bff43d8987dc9014e12e410.
// Mechanical TypeScript stripping only. Tests check parity with the original source.
const clamp = (v        , min        , max        ) => Math.max(min, Math.min(max, v));
const itemRules                                                          = [
  { words: ['sofa', 'couch', 'диван', 'sohva'], m3: 1.8 }, { words: ['bed', 'кровать', 'ліжко', 'sänky'], m3: 1.7 }, { words: ['mattress', 'матрас', 'матрац', 'patja'], m3: .8 },
  { words: ['washing machine', 'washer', 'стирал', 'пральн', 'pesukone'], m3: .55, heavy: true }, { words: ['dishwasher', 'посудом', 'astianpesukone'], m3: .5, heavy: true },
  { words: ['fridge', 'refrigerator', 'холодиль', 'jääkaappi'], m3: .8, heavy: true }, { words: ['freezer', 'морозил', 'pakastin'], m3: .7, heavy: true },
  { words: ['wardrobe', 'шкаф', 'шафа', 'vaatekaappi'], m3: 1.2 }, { words: ['dresser', 'комод', 'lipasto'], m3: .7 }, { words: ['table', 'стол', 'стіл', 'pöytä'], m3: .65 },
  { words: ['chair', 'стул', 'стілець', 'tuoli'], m3: .25 }, { words: ['armchair', 'кресло', 'nojatuoli'], m3: .75 }, { words: ['tv', 'телевиз', 'телевіз', 'televisio'], m3: .25 },
  { words: ['piano', 'пианино', 'піаніно'], m3: 1.5, heavy: true }, { words: ['safe', 'сейф', 'kassakaappi'], m3: .5, heavy: true }, { words: ['bike', 'bicycle', 'велосип', 'pyörä'], m3: .7 },
];

function analyseMove(text        )           {
  const normalized = text.toLowerCase().replace(/,/g, ' '); let volume = .8; let matched = 0; let heavy = false;
  for (const rule of itemRules) if (rule.words.some(word => normalized.includes(word))) { volume += rule.m3; matched += 1; heavy = heavy || Boolean(rule.heavy); }
  const boxMatch = normalized.match(/(\d{1,3})\s*(?:boxes|box|короб|ящик|laatik|laatikk)/i); if (boxMatch) { volume += clamp(Number(boxMatch[1]) || 0, 0, 150) * .09; matched += 1; }
  const sizeMatch = normalized.match(/(\d{2,3})\s*(?:m²|m2|м²|кв\.?\s?м)/i); const homeSize = sizeMatch ? clamp(Number(sizeMatch[1]), 15, 220) : 0; if (homeSize) { volume += Math.max(0, homeSize - 25) * .075; matched += 1; }
  const roomMatch = normalized.match(/(\d)\s*(?:room|rooms|комнат|huone|кімнат)/i); if (roomMatch && !homeSize) { volume += Number(roomMatch[1]) * 1.6; matched += 1; }
  if (/full|много вещей|paljon tavaraa|багато речей|полная квартира/.test(normalized)) volume += 3; if (/few|light|мало вещей|vähän tavaraa|мало речей/.test(normalized)) volume = Math.max(2, volume - 1.5);
  volume = Math.round(clamp(volume, 2, 35) * 10) / 10; const vehicle                      = volume <= 13.5 ? 'crafter' : volume <= 20 ? 'trailer' : 'multi'; const load       = volume < 7 ? 'light' : volume < 14 ? 'normal' : 'full'; const movers        = heavy || volume >= 6 ? 2 : 1; const confidence = clamp(50 + matched * 8 + (homeSize ? 8 : 0), 55, 95);
  return { volumeM3: volume, movers, load, vehicle, confidence, heavy, summary: text.trim() };
}

export { analyseMove, itemRules };
const categoryOrder=['sofa','bed','mattress','washing_machine','dishwasher','fridge','freezer','wardrobe','dresser','table','chair','armchair','tv','piano','safe','bike'];
// Diagnostic trace, NOT an inventory output in the original UI. Its volume loop
// counts each category once. Expose that assumption for quantity evaluation.
export function baselineTrace(text) {
  const normalized=text.toLowerCase().replace(/,/g,' ');
  const quantities={};
  itemRules.forEach((rule,index)=>{if(rule.words.some(word=>normalized.includes(word))) quantities[categoryOrder[index]]=1;});
  const box=normalized.match(/(\d{1,3})\s*(?:boxes|box|короб|ящик|laatik|laatikk)/i);
  if(box && Number(box[1])>0) quantities.box=clamp(Number(box[1]),0,150);
  return { quantities, recommendation:analyseMove(text) };
}

