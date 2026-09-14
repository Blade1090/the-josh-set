import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const source=fs.readFileSync(new URL('../shelf-roulette-v001.js',import.meta.url),'utf8');
const noop=()=>{};
const document={
  head:{appendChild:noop},
  createElement:()=>({style:{},textContent:''}),
  getElementById:()=>null,
  addEventListener:noop,
  querySelectorAll:()=>[],
  readyState:'complete'
};
const context={
  console,document,
  stateCache:{played:[2],beaten:[3]},
  items:[
    {id:1,set:'INCLUDED',title:'Quick'},
    {id:2,set:'INCLUDED',title:'Played'},
    {id:3,set:'INCLUDED',title:'Beaten'},
    {id:4,set:'INCLUDED',title:'Deep'},
    {id:5,set:'INCLUDED',title:'Unknown'}
  ],
  effectiveStatus:()=> 'OWNED',
  saveState:()=>{throw new Error('saveState should not be called in pure pick/role checks')},
  hltbFor:x=>x.id===1?{a:5}:x.id===4?{a:35}:null,
  matchMedia:()=>({matches:true}),
  setTimeout,requestAnimationFrame:fn=>fn(),
  dlg:{showModal:noop,scrollTop:0},
  $:()=>null,
  esc:String,
  fmtHours:v=>v?`${v}h`:'',
  dossierFor:()=>null,
  usefulText:String
};
context.window=context;
vm.createContext(context);
vm.runInContext(source,context,{filename:'shelf-roulette-v001.js'});
const api=context.SHELFCHECK_ROULETTE;
assert.equal(api.version,5);

// Context roles use only known HLTB main-story hours.
assert.equal(api.roleFor(context.items[0]).label,'⚡ QUICK HIT');
assert.equal(api.roleFor(context.items[3]).label,'🏔️ DEEP DIVE');
assert.equal(api.roleFor(context.items[4]).label,'🎲 WILDCARD');

// Picker can return only a member of the current hand.
const hand=[context.items[0],context.items[3],context.items[4]];
assert.equal(api.chooseFromHand(hand,()=>0).id,1);
assert.equal(api.chooseFromHand(hand,()=>0.4).id,4);
assert.equal(api.chooseFromHand(hand,()=>0.999).id,5);
for(let i=0;i<100;i++)assert.ok(hand.includes(api.chooseFromHand(hand,Math.random)));

// Played/beaten remain excluded by default, preserving existing Roulette semantics.
assert.deepEqual(Array.from(api.eligiblePool(),x=>x.id),[1,4,5]);

// Reduced-motion path is explicitly honored.
assert.equal(api.reducedMotion(),true);
context.matchMedia=()=>({matches:false});
assert.equal(api.reducedMotion(),false);

// Guard the interaction invariants without coupling to visual timing.
assert.match(source,/winnerId=null;return\{hand,poolSize:pool\.length\}/,'new hand must clear winner');
assert.match(source,/NOPE — PICK AGAIN/,'same-hand repick control must exist');
assert.match(source,/const snapshot=currentHand\.slice\(\)/,'pick must snapshot only the current hand');
const pickBody=source.slice(source.indexOf('async function pickForMe'),source.indexOf('function scrollRouletteTop'));
assert.ok(!pickBody.includes('saveState('),'selecting a winner must not persist state');
assert.ok(!pickBody.includes('setStatus('),'selecting a winner must not alter played/beaten state');

// Existing census determinism test remains the source of truth for the fresh-main count.
const census=spawnSync(process.execPath,['tools/census-determinism-test.mjs'],{encoding:'utf8'});
assert.equal(census.status,0,`census determinism failed:\n${census.stdout}\n${census.stderr}`);
assert.match(census.stdout+census.stderr,/2477/,'fresh-main census must remain exactly 2477');

console.log('PASS Shelf Roulette Pick What I Play V1');
