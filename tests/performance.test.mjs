import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {ParticleLedger} from '../src/infinity/particle-ledger.mjs';
import {batchRepeatedMeshes,syncBatches} from '../src/infinity/batching.mjs';
import {mergeRigidMeshes} from '../src/infinity/static-geometry.mjs';
import {FilmOutputPass} from '../src/infinity/film-output.mjs';
import {filmShader} from '../src/infinity/shaders.mjs';
import fs from 'node:fs';
import vm from 'node:vm';

test('particle ring spans retain every live particle across wrap, overwrite, and expiration',()=>{
  const cap=127,ledger=new ParticleLedger(cap),life=new Float64Array(cap).fill(-1);let cursor=0,time=0;
  const covered=()=>new Set(Array.from({length:ledger.count},(_,i)=>(ledger.start+i)%cap));
  for(let step=0;step<1500;step++){
    time+=.013;const count=(step*17)%83+1,expires=time+.2+(step%9)*.08,start=cursor;
    for(let i=0;i<count;i++)life[(cursor+i)%cap]=expires;
    ledger.add(start,count,expires);cursor=(cursor+count)%cap;ledger.expire(time);const ids=covered();
    assert.ok(ledger.count<=cap);for(let i=0;i<cap;i++)if(life[i]>time)assert.ok(ids.has(i),'a live particle was omitted');
  }
  ledger.expire(time+10);assert.equal(ledger.count,0);ledger.clear();assert.equal(ledger.start,0);
});
test('instanced animated meshes preserve world transforms and mask unplanted wish roots',()=>{
  const root=new T.Group(),geometry=new T.BoxGeometry(),material=new T.MeshBasicMaterial(),groups=[];
  for(let i=0;i<3;i++){const group=new T.Group();group.position.set(i,2,-i);root.add(group);groups.push(group);for(let j=0;j<4;j++){const mesh=new T.Mesh(geometry,material);mesh.position.x=j*.2;group.add(mesh);}}
  const batches=batchRepeatedMeshes(root,true);assert.equal(batches.length,1);assert.equal(batches[0].mesh.count,12);
  root.position.set(4,-3,8);groups[1].rotation.z=.8;groups[2].visible=false;root.updateMatrixWorld(true);syncBatches(root,batches,new T.Matrix4(),new T.Matrix4());
  const m=new T.Matrix4(),expected=new T.Matrix4(),inverse=root.matrixWorld.clone().invert();
  batches[0].sources.forEach((source,i)=>{batches[0].mesh.getMatrixAt(i,m);if(batches[0].roots[i]===groups[2])assert.ok(m.elements[12]>1e5);else{expected.multiplyMatrices(inverse,source.matrixWorld);m.elements.forEach((v,n)=>assert.ok(Math.abs(v-expected.elements[n])<1e-5));}});
});
test('rigid batching retains the complete transformed vertex geometry',()=>{
  const root=new T.Group(),material=new T.MeshBasicMaterial(),expected=[];
  for(let i=0;i<3;i++){const m=new T.Mesh(new T.BoxGeometry(),material);m.position.set(i,2,i*.5);m.rotation.z=i*.3;m.scale.set(1,.7,1);root.add(m);}
  root.updateMatrixWorld(true);for(const mesh of root.children){const g=mesh.geometry.toNonIndexed();g.applyMatrix4(mesh.matrixWorld);expected.push(...g.attributes.position.array);}
  const merged=mergeRigidMeshes(root);assert.equal(merged.length,1);assert.deepEqual([...merged[0].geometry.attributes.position.array],expected);assert.equal(root.children.filter(o=>o.visible).length,1);
});
test('fused output keeps ACES, sRGB, all three chromatic samples, and full bloom input',()=>{
  const texture=new T.Texture(),pass=new FilmOutputPass(filmShader,texture),shader=pass.material.fragmentShader;
  assert.equal(pass.uniforms.uBloom.value,texture);assert.equal(pass.needsSwap,false);assert.match(shader,/ACESFilmicToneMapping/);assert.match(shader,/sRGBTransferOETF/);assert.match(shader,/filmInput\(vUv\+aberration\)/);assert.match(shader,/filmInput\(vUv-aberration\)/);assert.match(shader,/texture2D\(uBloom,uv\)/);pass.dispose();
});
test('worker prepares full-capacity bounded trajectories with an isotropic distribution',()=>{
  let buffer;const context={Float32Array,Math,self:{postMessage(value){buffer=value},close(){}}};vm.runInNewContext(fs.readFileSync(new URL('../js/particle-random.worker.js',import.meta.url),'utf8'),context);context.self.onmessage({data:{count:131072}});const values=new Float32Array(buffer);assert.equal(values.length,131072*9);let vx=0,vy=0,vz=0;
  for(let i=0;i<values.length;i+=9){assert.ok(values[i]>=-.5&&values[i]<=.5);assert.ok(values[i+6]>=0&&values[i+6]<=.16);assert.ok(values[i+7]>=1.3&&values[i+7]<=3.4);const speed=Math.hypot(values[i+3],values[i+4],values[i+5]);assert.ok(speed>=.24999&&speed<=1.25001);vx+=values[i+3];vy+=values[i+4];vz+=values[i+5];}
  assert.ok(Math.max(Math.abs(vx),Math.abs(vy),Math.abs(vz))/131072<.015);
});
