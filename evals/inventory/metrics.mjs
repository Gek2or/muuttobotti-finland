export function quantitiesFromInventory(inventory) {
  const quantities={};
  for(const item of inventory.items) {
    if(item.status!=='included') continue;
    const old=quantities[item.category];
    quantities[item.category]=old===null || item.quantity===null ? null : (old||0)+item.quantity;
  }
  return quantities;
}
export function scorePrediction(expected, quantities, heavyReview) {
  const keys=Object.keys(expected.quantities), predicted=Object.keys(quantities);
  const tp=predicted.filter(k=>keys.includes(k)).length;
  const correct=keys.filter(k=>Object.hasOwn(quantities,k)&&quantities[k]===expected.quantities[k]).length;
  return {
    exact:keys.length===predicted.length&&correct===keys.length,
    truePositive:tp,falsePositive:predicted.length-tp,falseNegative:keys.length-tp,
    quantityCorrect:correct,quantityTotal:keys.length,
    heavyCorrect:heavyReview===expected.heavyReview,
    heavyMiss:expected.heavyReview&&!heavyReview,
  };
}
export function aggregate(scores) {
  const sum=key=>scores.reduce((n,s)=>n+Number(s[key]||0),0);
  const tp=sum('truePositive'),fp=sum('falsePositive'),fn=sum('falseNegative');
  return { cases:scores.length, exact:sum('exact'), exactRate:scores.length?sum('exact')/scores.length:null,
    categoryPrecision:tp+fp?tp/(tp+fp):null, categoryRecall:tp+fn?tp/(tp+fn):null,
    quantityCorrect:sum('quantityCorrect'), quantityTotal:sum('quantityTotal'),
    heavyCorrect:sum('heavyCorrect'), heavyMiss:sum('heavyMiss') };
}
