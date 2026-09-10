import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { baselineTrace } from '../evals/inventory/baseline.mjs';
import { extractInventory, PROMPT_VERSION } from '../lib/inventory/extract.mjs';
import { quantitiesFromInventory, scorePrediction, aggregate } from '../evals/inventory/metrics.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
if(args.some(a=>!['--live'].includes(a))) throw Error('Usage: node scripts/eval-inventory.mjs [--live]');
const live=args.includes('--live');
if(live && (!process.env.OPENAI_API_KEY || !process.env.OPENAI_INVENTORY_MODEL)) {
  console.error('Live evaluation NOT RUN: configure OPENAI_API_KEY and OPENAI_INVENTORY_MODEL. Existing reports were not overwritten.');
  process.exit(2);
}
const bytes=await fs.readFile(path.join(root,'evals/inventory/cases.json'));
const dataset=JSON.parse(bytes);
const rows=[];
for(const entry of dataset.cases) {
  const baseline=baselineTrace(entry.text);
  const baselineScore=scorePrediction(entry.expected,baseline.quantities,baseline.recommendation.heavy);
  const model=live?await extractInventory(entry.text,{apiKey:process.env.OPENAI_API_KEY,model:process.env.OPENAI_INVENTORY_MODEL}):null;
  const heavy=model?.ok&&model.inventory.items.some(i=>i.status!=='excluded'&&['piano','safe','washing_machine','dishwasher','fridge','freezer'].includes(i.category));
  const modelScore=model?.ok?scorePrediction(entry.expected,quantitiesFromInventory(model.inventory),Boolean(heavy)):null;
  rows.push({id:entry.id,locale:entry.locale,expected:entry.expected,baseline,baselineScore,model,modelScore});
  if(live) console.error(`${entry.id}: ${model.ok?'validated':model.reason}`);
}
const modelScores=rows.flatMap(r=>r.modelScore?[r.modelScore]:[]);
const report={
  generatedAt:new Date().toISOString(), sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
  sourceDirty:Boolean(execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim()),
  baselineCommit:'87d69f147f5d65de0bff43d8987dc9014e12e410', datasetVersion:dataset.version,
  datasetSha256:createHash('sha256').update(bytes).digest('hex'), promptVersion:PROMPT_VERSION,
  liveModelStatus:live?'completed':'not_run', notes:dataset.notes,
  baseline:aggregate(rows.map(r=>r.baselineScore)),
  model:live?{attempted:rows.length,validated:modelScores.length,failed:rows.length-modelScores.length,
    exactRateAllAttempts:modelScores.filter(s=>s.exact).length/rows.length,
    validatedSubset:aggregate(modelScores),inputTokens:rows.reduce((n,r)=>n+(r.model?.trace.usage?.inputTokens||0),0),
    outputTokens:rows.reduce((n,r)=>n+(r.model?.trace.usage?.outputTokens||0),0)}:null,
  rows,
};
const dest=path.join(root,'evals/inventory/results'); await fs.mkdir(dest,{recursive:true});
const stem=live?'live':'baseline';
await fs.writeFile(path.join(dest,`${stem}.json`),JSON.stringify(report,null,2)+'\n');
const md=[`# Inventory comparison — ${live?'live provider run':'baseline only'}`,'',
  `Baseline commit: ${report.baselineCommit}. Dataset: ${report.datasetSha256}.`,
  '','32 synthetic development/challenge examples, not a representative customer benchmark. Labels require owner review.',
  'The baseline quantity view is an instrumented trace of one match per furniture category, not an inventory exposed by the original UI.',
  '',`Baseline exact category+quantity maps: **${report.baseline.exact}/${rows.length}**. Heavy-review decisions correct: **${report.baseline.heavyCorrect}/${rows.length}**.`,
  live?`Model validated: ${modelScores.length}/${rows.length}. Exact maps over ALL attempts: ${modelScores.filter(s=>s.exact).length}/${rows.length}. Failures stay in the denominator.`:'**Model not run. No claim of improvement, accuracy, latency or cost can be made.**',
  '', '| Case | Baseline exact | Baseline heavy review correct | Model |','| --- | --- | --- | --- |',
  ...rows.map(r=>`| ${r.id} | ${r.baselineScore.exact?'yes':'no'} | ${r.baselineScore.heavyCorrect?'yes':'no'} | ${!live?'not run':!r.model.ok?r.model.reason:r.modelScore.exact?'exact':'different'} |`),
  '', 'Exact evidence matching validates quotations, not the semantic truth of quantity/category/status. No prices are generated or modified.', ''].join('\n');
await fs.writeFile(path.join(dest,`${stem}.md`),md);
console.log(JSON.stringify({baseline:report.baseline,model:report.model,liveModelStatus:report.liveModelStatus}));
if(live && report.model.failed) process.exitCode=1;
