import test from 'node:test';
import assert from 'node:assert/strict';
import {portraitOpacity} from '../src/infinity/portrait.mjs';

test('portrait reveal is continuous and monotonic, with gentle arrival and completion',()=>{
  assert.equal(portraitOpacity(9,10,1.45),0);
  assert.equal(portraitOpacity(10,10,1.45),0);
  assert.ok(portraitOpacity(10.1,10,1.45)<.01,'the first frame cannot pop to full opacity');
  assert.ok(Math.abs(portraitOpacity(10.725,10,1.45)-.5)<1e-12);
  let last=0;for(let n=0;n<=145;n++){const alpha=portraitOpacity(10+n/100,10,1.45);assert.ok(alpha>=last-1e-12&&alpha<=1);last=alpha;}
  assert.equal(portraitOpacity(12,10,1.45),1);
  assert.ok(portraitOpacity(11.4,10,1.45)>.999,'the final frame settles without a jump');
});
test('each portrait entry has its own clock and reduced motion is immediate',()=>{
  assert.equal(portraitOpacity(25,25,.75),0);
  assert.equal(portraitOpacity(25,25,1.45,true),1);
  assert.equal(portraitOpacity(0,10,1.45,true),1);
});
