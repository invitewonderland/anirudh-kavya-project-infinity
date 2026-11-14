import test from 'node:test';
import assert from 'node:assert/strict';
import {openingState,OPENING_DURATION,shapeEmission} from '../src/infinity/choreography.mjs';
import {ParticleLedger} from '../src/infinity/particle-ledger.mjs';

test('curtain timing stays bounded and finishes before the wall-clock handoff even after skipped frames',()=>{
  let previous=0;
  for(const offset of [-10,0,16,90,480,970,1499,1500,9000]){
    const state=openingState(100+offset,100);
    assert.ok(state.progress>=previous&&state.progress<=1);assert.ok(state.seamWidth>=1&&state.seamWidth<=2.8);assert.ok(state.seamOpacity>=0&&state.seamOpacity<=1);previous=state.progress;
  }
  assert.equal(openingState(OPENING_DURATION+100,100).progress,1);assert.equal(openingState(9000,100).seamOpacity,0);assert.equal(openingState(100,100,true).progress,1);
});

test('formations preserve every emitted slot and keep staggered births inside the ledger lifetime',()=>{
  const capacity=64,start=51,count=46,time=100;
  for(const formation of ['portal','orbit','garden','sky','petalfall','arrival','memory']){
    const arrays={position:new Float32Array(capacity*3).fill(-999),aVelocity:new Float32Array(capacity*3),aLife:new Float32Array(capacity*4)};
    for(let i=0;i<count;i++){const j=(start+i)%capacity,k=j*3,l=j*4;arrays.position[k]=0;arrays.position[k+1]=0;arrays.position[k+2]=2;arrays.aVelocity[k]=Math.cos(i)*2;arrays.aVelocity[k+1]=Math.sin(i)*2;arrays.aVelocity[k+2]=.2;arrays.aLife[l]=time+i/count*.16;arrays.aLife[l+1]=4;arrays.aLife[l+2]=i;arrays.aLife[l+3]=3;}
    shapeEmission(arrays,{capacity,start,count,x:0,y:0,z:2,width:3,height:4,formation,birthWindow:1.25,time});
    const touched=new Set();for(let i=0;i<count;i++){const j=(start+i)%capacity,k=j*3,l=j*4;touched.add(j);assert.ok(arrays.position.slice(k,k+3).every(Number.isFinite));assert.ok(arrays.aLife[l]>=time&&arrays.aLife[l]<=time+1.25);assert.equal(arrays.aLife[l+1],4);if(formation==='orbit')assert.ok(Math.hypot(arrays.position[k]/3,arrays.position[k+1]/4)>=.8999);}
    for(let j=0;j<capacity;j++)if(!touched.has(j))assert.equal(arrays.position[j*3],-999,'untouched slots stay unchanged');
    const ledger=new ParticleLedger(capacity);ledger.add(start,count,time+1.25+4);ledger.expire(time+4.5);assert.equal(ledger.count,count,'late births remain drawable');ledger.expire(time+5.26);assert.equal(ledger.count,0);
  }
});
