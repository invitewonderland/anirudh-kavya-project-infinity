import * as T from 'three';
export function batchRepeatedMeshes(group,maskChildren=false){
  group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),buckets=new Map(),matrix=new T.Matrix4(),batches=[];
  group.traverse(source=>{if(!source.isMesh||source.isInstancedMesh||!source.visible)return;const key=source.geometry.uuid+source.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(source);});
  for(const sources of buckets.values())if(sources.length>1){
    const mesh=new T.InstancedMesh(sources[0].geometry,sources[0].material,sources.length);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
    sources.forEach((source,i)=>{mesh.setMatrixAt(i,matrix.multiplyMatrices(inverse,source.matrixWorld));source.visible=false;source.matrixAutoUpdate=false;});
    const roots=maskChildren?sources.map(source=>{let root=source;while(root.parent!==group)root=root.parent;return root;}):null;
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(mesh);batches.push({mesh,sources,roots});
  }
  return batches;
}
export function syncBatches(group,batches,inverse,matrix){
  inverse.copy(group.matrixWorld).invert();
    for(const batch of batches){for(let i=0;i<batch.sources.length;i++){if(batch.roots&&!batch.roots[i].visible)matrix.makeTranslation(1e6,1e6,1e6);else matrix.multiplyMatrices(inverse,batch.sources[i].matrixWorld);batch.mesh.setMatrixAt(i,matrix);}batch.mesh.instanceMatrix.needsUpdate=true;}
}
