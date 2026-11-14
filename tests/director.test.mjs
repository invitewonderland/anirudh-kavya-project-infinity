import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {InfinityDirector} from '../src/infinity/director.mjs';
import {ParticleLedger} from '../src/infinity/particle-ledger.mjs';

function backgroundHarness(){
  const d=Object.create(InfinityDirector.prototype),uniform=value=>({value});
  Object.assign(d,{sceneIndex:1,time:8,motion:{matches:false},camera:{aspect:.56},textures:new Map([['a',{texture:'photo-a',aspect:.8}],['b',{texture:'photo-b',aspect:.8}],['c',{texture:'photo-c',aspect:.8}]]),wake(){},bg:{uniforms:{uFrom:uniform('before'),uTo:uniform('current'),uFromAspect:uniform(.8),uToAspect:uniform(.8),uFromScene:uniform(0),uScene:uniform(1),uProgress:uniform(1)}}});
  return d;
}
test('interrupted GPU transitions start from the rendered mixture, never the abandoned destination',()=>{
  const d=backgroundHarness();let captures=0;d.captureBackground=()=>`frozen-frame-${++captures}`;
  d.setBackground('a');assert.equal(d.bg.uniforms.uFrom.value,'current');
  d.bg.uniforms.uProgress.value=.3;d.sceneIndex=2;d.setBackground('b');assert.equal(d.bg.uniforms.uFrom.value,'frozen-frame-1');assert.equal(d.bg.uniforms.uFromScene.value,-1);assert.equal(d.bg.uniforms.uTo.value,'photo-b');
  d.bg.uniforms.uProgress.value=.15;d.sceneIndex=3;d.setBackground('c');assert.equal(d.bg.uniforms.uFrom.value,'frozen-frame-2');assert.equal(captures,2);
  d.setBackground('c');assert.equal(captures,2,'reselecting the same world does not restart the dissolve');
});
test('background snapshots ping-pong targets and always restore the render target',()=>{
  const d=backgroundHarness(),targets=[{texture:'snapshot-a'},{texture:'snapshot-b'}];let active='screen',rendered=[];
  Object.assign(d,{captureTargets:targets,captureIndex:0,backgroundPlane:{scale:new T.Vector3(4,8,1)},capturePlane:{scale:new T.Vector3()},captureScene:{},renderer:{getRenderTarget:()=>active,setRenderTarget:t=>{active=t},render:()=>rendered.push(active)}});
  assert.equal(d.captureBackground(),'snapshot-b');assert.equal(active,'screen');assert.equal(d.captureBackground(),'snapshot-a');assert.equal(active,'screen');assert.notEqual(rendered[0],rendered[1]);
  d.renderer.render=()=>{throw new Error('lost context')};assert.throws(()=>d.captureBackground());assert.equal(active,'screen');
});
test('scene retirement hides all old GPU spans without a capacity-sized upload',()=>{
  const d=Object.create(InfinityDirector.prototype),ledger=new ParticleLedger(8),geometry=new T.BufferGeometry();ledger.add(3,5,20);geometry.setDrawRange(3,5);
  Object.assign(d,{particleLedger:ledger,burstGeometry:geometry,touchLight:{intensity:10}});d.retireParticles();assert.equal(ledger.count,0);assert.equal(geometry.drawRange.count,0);assert.equal(d.touchLight.intensity,0);ledger.add(0,2,30);assert.equal(ledger.count,2);assert.equal(ledger.start,0);
});
test('celebration selection outside its room cannot replace another scene background',()=>{
  const d=Object.create(InfinityDirector.prototype);let changed=0;Object.assign(d,{sceneIndex:0,setBackground(){changed++},retireParticles(){},wake(){}});
  d.selectAct(2);assert.equal(changed,0);assert.equal(d.act,2);d.sceneIndex=3;d.selectAct(1);assert.equal(changed,1);
});
