import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import vm from 'node:vm';
import * as T from 'three';
import {InfinityDirector} from '../src/infinity/director.mjs';
import {ParticleLedger} from '../src/infinity/particle-ledger.mjs';
const baseline=execFileSync('git',['show','88eebba:src/infinity/director.mjs'],{encoding:'utf8'});
const method=baseline.slice(baseline.indexOf('  emit('),baseline.indexOf('  retireParticles('));
const Before=Function('T','TAU',`return class {${method}}`)(T,Math.PI*2);
let bank;const context={Math,Float32Array,self:{postMessage(buffer){bank=new Float32Array(buffer)},close(){}}};
vm.runInNewContext(fs.readFileSync('js/particle-random.worker.js','utf8'),context);context.self.onmessage({data:{count:131072}});
function harness(proto,prepared){const d=Object.create(proto),capacity=131072;Object.assign(d,{capacity,motion:{matches:false},time:1,writeIndex:0,spawned:0,point:()=>new T.Vector3(),host:{dataset:{}},touchLight:{position:new T.Vector3()},wake(){},randomCursor:0,randomBank:prepared?bank:null,particleLedger:new ParticleLedger(capacity),burstGeometry:new T.BufferGeometry(),burstArrays:{position:new Float32Array(capacity*3),aVelocity:new Float32Array(capacity*3),aLife:new Float32Array(capacity*4),aTint:new Float32Array(capacity*3)}});for(const [name,array] of Object.entries(d.burstArrays))d.burstGeometry.setAttribute(name,new T.BufferAttribute(array,name==='aLife'?4:3));return d;}
const old=harness(Before.prototype,false),now=harness(InfinityDirector.prototype,true),result={environment:'Node CPU microbenchmark; not a physical phone or GPU benchmark',samples:15,results:[]};
for(const count of [1100,8200,11500,36000]){
 const times=[[],[]];for(let i=0;i<18;i++)for(const [n,d] of [old,now].entries()){Object.values(d.burstGeometry.attributes).forEach(a=>a.clearUpdateRanges());const start=performance.now();d.emit(100,100,count,'gold',{speed:2.4,life:4});const elapsed=performance.now()-start;if(i>=3)times[n].push(elapsed);}
 const summary=x=>({medianMs:[...x].sort((a,b)=>a-b)[Math.floor(x.length/2)],meanMs:x.reduce((a,b)=>a+b,0)/x.length});result.results.push({count,before:summary(times[0]),after:summary(times[1])});
}
fs.writeFileSync('qa/performance/emission-benchmark.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
