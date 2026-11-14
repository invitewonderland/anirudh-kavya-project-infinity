import test from 'node:test';
import assert from 'node:assert/strict';
import {ribbonVertex} from '../src/infinity/shaders.mjs';

test('promise heart remains finite and mirrored through both halves under strict GLSL pow rules',()=>{
  // Evaluate the actual shader coordinate; GLSL pow(negative, 3) is undefined even for an odd integer exponent.
  const branch=ribbonVertex.split('else if(uScene>5.5){')[1];
  const expression=branch.match(/p=vec3\((.*?),13\.\*cos/)[1];
  const coordinate=Function('h','sin','pow',`const sh=sin(h);return ${expression};`);
  const glslPow=(x,y)=>x<0?NaN:Math.pow(x,y),tau=Math.PI*2;
  let left=0,right=0;
  for(let i=0;i<=256;i++){
    const h=i/256*tau,x=coordinate(h,Math.sin,glslPow),mirror=coordinate(tau-h,Math.sin,glslPow);
    assert.ok(Number.isFinite(x),'a mobile GPU must never receive an undefined left-side coordinate');
    assert.ok(Math.abs(x+mirror)<1e-10,'both halves retain the original mirrored heart shape');
    if(x<-.01)left++;if(x>.01)right++;
  }
  assert.equal(left,right);assert.ok(left>100,'the complete left lobe is present');
});
