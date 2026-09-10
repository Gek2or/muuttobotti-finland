import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
import { analyseMove } from '../evals/inventory/baseline.mjs';
import { extractInventory, validateInventory, reviewReasons } from '../lib/inventory/extract.mjs';
import { handleInventory } from '../lib/inventory/handler.mjs';
import { quantitiesFromInventory,scorePrediction } from '../evals/inventory/metrics.mjs';

const text='2 sofas and 10 boxes. No piano.';
const inventory={items:[{category:'sofa',label:'sofas',quantity:2,status:'included',evidence:'2 sofas'},{category:'box',label:'boxes',quantity:10,status:'included',evidence:'10 boxes'},{category:'piano',label:'piano',quantity:null,status:'excluded',evidence:'No piano'}],uncertainties:[]};
const success=(value=inventory,patch={})=>new Response(JSON.stringify({status:'completed',model:'test-model',usage:{input_tokens:10,output_tokens:20,total_tokens:30},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}],...patch}));
const run=fetchImpl=>extractInventory(text,{apiKey:'synthetic',model:'test-model',fetchImpl});

test('frozen baseline parity with current original for all 32 cases',()=>{
  const source=fs.readFileSync(new URL('../mobile/src/screens/ClientCalculatorScreen.tsx',import.meta.url),'utf8');
  const snippet=source.slice(source.indexOf('const clamp ='),source.indexOf('export default function'));
  const context=vm.createContext({}); vm.runInContext(stripTypeScriptTypes(snippet)+'\nthis.run=analyseMove;',context);
  const dataset=JSON.parse(fs.readFileSync(new URL('../evals/inventory/cases.json',import.meta.url),'utf8'));
  for(const entry of dataset.cases) assert.deepEqual(analyseMove(entry.text),JSON.parse(JSON.stringify(context.run(entry.text))));
});
test('valid output preserves counts and exclusion',async()=>{
  const result=await run(async()=>success()); assert.equal(result.ok,true);
  assert.deepEqual(quantitiesFromInventory(result.inventory),{sofa:2,box:10});
  assert.ok(!result.reviewReasons.includes('specialist_item')); assert.equal(result.trace.usage.totalTokens,30);
});
test('wire request is strict, bounded and has no tool or pricing capability',async()=>{
  await run(async(url,options)=>{
    assert.equal(url,'https://api.openai.com/v1/responses'); const body=JSON.parse(options.body);
    assert.equal(body.store,false); assert.equal(body.text.format.strict,true); assert.equal(body.tools,undefined);
    assert.equal(body.input[1].content,text); assert.ok(options.signal); return success();
  });
});
test('no key or model never calls provider',async()=>{
  for(const config of [{},{apiKey:'synthetic'},{model:'test-model'}]) {
    const r=await extractInventory(text,{...config,fetchImpl:()=>{throw Error('must not call');}});
    assert.equal(r.reason,'not_configured');
  }
});
test('empty/oversized input never calls provider',async()=>{
  for(const input of ['',null,'x'.repeat(6001)]) assert.equal((await extractInventory(input)).reason,'invalid_input');
});
for(const [name,edit] of [
  ['unknown keys',v=>({...v,price:1})],
  ['made-up evidence',v=>({...v,items:[{...v.items[0],evidence:'a fridge'}]})],
  ['negative count',v=>({...v,items:[{...v.items[0],quantity:-1}]})],
  ['fractional count',v=>({...v,items:[{...v.items[0],quantity:1.5}]})],
  ['string count',v=>({...v,items:[{...v.items[0],quantity:'2'}]})],
  ['unknown category',v=>({...v,items:[{...v.items[0],category:'money'}]})],
  ['duplicate mention',v=>({...v,items:[v.items[0],v.items[0]]})],
  ['oversized label',v=>({...v,items:[{...v.items[0],label:'x'.repeat(121)}]})],
]) test(`rejects ${name}`,async()=>assert.equal((await run(async()=>success(edit(inventory)))).reason,'invalid_output'));
for(const [name,fn,reason] of [
  ['rate limit',()=>new Response('',{status:429}),'rate_limited'],
  ['provider error',()=>new Response('',{status:500}),'provider_error'],
  ['incomplete',()=>success(inventory,{status:'incomplete'}),'incomplete'],
  ['refusal',()=>success(inventory,{output:[{type:'message',content:[{type:'refusal',refusal:'test'}]}]}),'refusal'],
  ['bad JSON',()=>new Response('{broken'),'invalid_response_or_network'],
  ['timeout',()=>{throw new DOMException('timeout','TimeoutError');},'timeout'],
  ['network failure',()=>{throw Error('synthetic failure');},'invalid_response_or_network'],
]) test(`reports ${name} without pretending to be model output`,async()=>{
  const result=await run(async()=>fn()); assert.equal(result.ok,false); assert.equal(result.reason,reason); assert.equal(result.engine,'unavailable'); assert.equal(result.inventory,undefined);
});
test('unknown count and uncertain specialist require review',()=>{
  const i={items:[{category:'piano',label:'piano',quantity:null,status:'uncertain',evidence:'piano'}],uncertainties:['unsure']};
  assert.equal(validateInventory(i,'maybe piano'),true);
  for(const reason of ['quantity_unknown','item_uncertain','specialist_item','clarification_required']) assert.ok(reviewReasons(i).includes(reason));
});
test('metrics do not silently convert missing counts to zero or one',()=>{
  const q=quantitiesFromInventory({items:[{category:'chair',quantity:null,status:'included'}]});
  assert.deepEqual(q,{chair:null}); assert.equal(scorePrediction({quantities:{chair:2},heavyReview:false},q,false).exact,false);
});
const request=(body=JSON.stringify({text}),extra={})=>new Request('https://example.test/api/admin/inventory',{method:'POST',headers:{'content-type':'application/json',...extra},body});
test('API auth rejects before reading body or provider call',async()=>{
  const r=await handleInventory(request(),{authorize:async()=>false,env:{AI_INVENTORY_ENABLED:'true'},extract:()=>{throw Error('must not call');}});
  assert.equal(r.status,401);
});
test('API disabled by default',async()=>assert.equal((await handleInventory(request(),{authorize:async()=>true,env:{}})).status,503));
test('API rejects foreign origin',async()=>assert.equal((await handleInventory(request(undefined,{origin:'https://evil.test'}),{authorize:async()=>true,env:{AI_INVENTORY_ENABLED:'true'}})).status,403));
test('API bounds body without content-length header',async()=>assert.equal((await handleInventory(request(' '.repeat(24001)),{authorize:async()=>true,env:{AI_INVENTORY_ENABLED:'true'}})).status,413));
test('API rejects extra customer identity fields',async()=>assert.equal((await handleInventory(request(JSON.stringify({text,email:'test@example.invalid'})),{authorize:async()=>true,env:{AI_INVENTORY_ENABLED:'true'}})).status,400));
test('API passes only description and server configuration; no booking mutations',async()=>{
  let calls=0;
  const r=await handleInventory(request(),{authorize:async()=>true,env:{AI_INVENTORY_ENABLED:'true',OPENAI_API_KEY:'synthetic',OPENAI_INVENTORY_MODEL:'test-model'},extract:async(t,c)=>{calls++;assert.equal(t,text);assert.equal(c.model,'test-model');return {ok:true,inventory};}});
  assert.equal(r.status,200);assert.equal(calls,1);assert.equal(r.headers.get('cache-control'),'no-store');
});
