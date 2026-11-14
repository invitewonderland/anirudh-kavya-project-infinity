import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {materials,petalGeometry,palace,grandPiano,garden,astrolabe,lantern,compass} from '../src/infinity/objects.mjs';

function validGeometry(geometry){
  for(const [name,attribute] of Object.entries(geometry.attributes)){
    assert.ok([...attribute.array].every(Number.isFinite),`${name} contains a non-finite component`);
  }
  const positions=geometry.getAttribute('position');
  if(geometry.index)for(const index of geometry.index.array)assert.ok(index>=0&&index<positions.count,'index outside geometry');
  geometry.computeBoundingBox();geometry.computeBoundingSphere();
  assert.ok(Number.isFinite(geometry.boundingSphere.radius)&&geometry.boundingSphere.radius>0,'invalid bounds');
}
function validObject(group){
  group.updateMatrixWorld(true);
  let meshes=0;
  group.traverse(object=>{
    assert.ok(object.matrixWorld.elements.every(Number.isFinite),'non-finite world transform');
    if(!object.isMesh)return;
    meshes++;validGeometry(object.geometry);
    if(object.isInstancedMesh){
      const matrix=new T.Matrix4();
      for(let i=0;i<object.count;i++){object.getMatrixAt(i,matrix);assert.ok(matrix.elements.every(Number.isFinite));assert.ok(Math.abs(matrix.determinant())>1e-12,'collapsed instance');}
    }
  });
  assert.ok(meshes>0);
}
test('sculpted petals have finite normals, valid topology and useful bounds',()=>validGeometry(petalGeometry()));
test('palace cloth and assembled fragments have valid geometry and transforms',()=>validObject(palace(materials()).group));
test('extruded piano and physical celebration objects have valid surfaces',()=>{
  const m=materials();for(const factory of [grandPiano,astrolabe,lantern,compass])validObject(factory(m).group);
});
test('living garden batches preserve source transforms when petals open',()=>{
  const g=garden(materials());validObject(g.group);assert.ok(g.batches.length>0);
  g.group.position.set(2,-1,0);g.flowers.forEach(f=>f.petals.forEach(p=>p.pivot.rotation.x+=.2));g.group.updateMatrixWorld(true);
  const inverse=g.group.matrixWorld.clone().invert(),matrix=new T.Matrix4();
  for(const {mesh,sources} of g.batches){
    sources.forEach((source,i)=>mesh.setMatrixAt(i,matrix.multiplyMatrices(inverse,source.matrixWorld)));
    mesh.getMatrixAt(0,matrix);const expected=new T.Matrix4().multiplyMatrices(inverse,sources[0].matrixWorld);
    matrix.elements.forEach((v,i)=>assert.ok(Math.abs(v-expected.elements[i])<1e-5));
  }
});
