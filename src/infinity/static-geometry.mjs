import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// Merge rigid pieces in their parent's local space; retain every original vertex, normal and UV.
export function mergeRigidMeshes(group,excluded=new Set()){
  group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),matrix=new T.Matrix4(),buckets=new Map();
  group.traverse(mesh=>{if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.visible||excluded.has(mesh))return;if(!buckets.has(mesh.material))buckets.set(mesh.material,[]);buckets.get(mesh.material).push(mesh);});
  const merged=[];
  for(const [material,sources] of buckets)if(sources.length>1){
    const geometries=sources.map(source=>{matrix.multiplyMatrices(inverse,source.matrixWorld);const geometry=source.geometry.index?source.geometry.toNonIndexed():source.geometry.clone();geometry.applyMatrix4(matrix);return geometry;});
    const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());
    if(!geometry)throw new Error('Rigid geometry has incompatible attributes');
    const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);merged.push(mesh);
    sources.forEach(source=>{source.visible=false;source.matrixAutoUpdate=false;});
  }
  return merged;
}
