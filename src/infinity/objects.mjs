import * as T from 'three';

export function materials(){
  return {
    gold:new T.MeshPhysicalMaterial({color:0xd7b372,metalness:1,roughness:.19,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:.65}),
    dark:new T.MeshPhysicalMaterial({color:0x041a20,metalness:.42,roughness:.32,clearcoat:.45,clearcoatRoughness:.24,envMapIntensity:.18}),
    ivory:new T.MeshPhysicalMaterial({color:0xf4e2cb,metalness:.08,roughness:.48,clearcoat:.35,envMapIntensity:.4,transmission:.08,thickness:.08,side:T.DoubleSide}),
    leaf:new T.MeshPhysicalMaterial({color:0x658b68,metalness:.72,roughness:.28,clearcoat:.6,side:T.DoubleSide}),
    light:new T.MeshBasicMaterial({color:new T.Color(4.5,2.5,.75)}),
    glass:new T.MeshPhysicalMaterial({color:0xffedca,metalness:0,roughness:.045,transmission:.88,thickness:.28,ior:1.45,clearcoat:1,envMapIntensity:1.3})
  };
}
export function mesh(geometry,material,parent,x=0,y=0,z=0){const m=new T.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;m.position.set(x,y,z);parent.add(m);return m;}
export function torus(parent,material,radius,tube=.012,x=0,y=0,z=0,arc=Math.PI*2){return mesh(new T.TorusGeometry(radius,tube,12,160,arc),material,parent,x,y,z);}
export function tube(parent,material,points,radius=.025){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,90,radius,8,false),material,parent);}

export function palace(m){
  const group=new T.Group(),arches=new T.Group();group.add(arches);
  for(const side of [-1,1]){
    const column=new T.Group();column.position.set(side*2.72,-1.6,-.55);arches.add(column);
    mesh(new T.CylinderGeometry(.17,.22,8.2,32),m.dark,column);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;mesh(new T.CylinderGeometry(.018,.018,8.1,8),m.gold,column,Math.cos(a)*.225,0,Math.sin(a)*.225);}
    for(const y of [-4.1,-3.98,3.97,4.1])mesh(new T.CylinderGeometry(.32,.32,.11,32),m.gold,column,0,y,0);
    const arch=torus(arches,m.gold,2.72,.035,0,2.5,-.55,Math.PI);arch.rotation.z=0;
    torus(arches,m.gold,2.5,.012,0,2.5,-.5,Math.PI);
  }
  const count=3600,geometry=new T.BoxGeometry(.8,.8,.8),material=m.gold.clone();
  const fragments=new T.InstancedMesh(geometry,material,count);const scatter=new Float32Array(count*3),dummy=new T.Object3D();
  for(let i=0;i<count;i++){
    const t=i/count,which=i%4;let x,y,z;
    if(which<2){const side=which===0?-1:1;x=side*(2.5+Math.random()*.5);y=-5.8+Math.random()*8.7;z=-.55+(Math.random()-.5)*.5;}
    else{const a=Math.random()*Math.PI,r=2.55+Math.random()*.42;x=Math.cos(a)*r;y=2.5+Math.sin(a)*r;z=-.55+(Math.random()-.5)*.25;}
    const scale=.018+Math.random()*.038;dummy.position.set(x,y,z);dummy.scale.set(scale,scale*(1+Math.random()*2),scale);dummy.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);dummy.updateMatrix();fragments.setMatrixAt(i,dummy.matrix);
    scatter[i*3]=(Math.random()-.5)*400;scatter[i*3+1]=(Math.random()-.5)*400;scatter[i*3+2]=(Math.random()-.5)*300;
  }
  geometry.setAttribute('aScatter',new T.InstancedBufferAttribute(scatter,3));
  const uniforms={uAssemble:{value:0},uOpen:{value:0},uTime:{value:0}};
  material.onBeforeCompile=shader=>{Object.assign(shader.uniforms,uniforms);shader.vertexShader='attribute vec3 aScatter;uniform float uAssemble,uOpen,uTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed += aScatter * (1.0-uAssemble+uOpen*.7);transformed += sin(aScatter+uTime)*uOpen*.8;');};
  fragments.frustumCulled=false;group.add(fragments);
  const curtains=[];
  for(const direction of [-1,1]){
    const geo=new T.PlaneGeometry(2.7,15.2,48,80),mat=new T.MeshPhysicalMaterial({color:0x041b27,metalness:.06,roughness:.68,sheen:.8,sheenColor:new T.Color(0x518779),sheenRoughness:.6,envMapIntensity:.45,side:T.DoubleSide});
    const state={uTime:{value:0},uOpen:{value:0},uDirection:{value:direction}};
    mat.onBeforeCompile=shader=>{Object.assign(shader.uniforms,state);shader.vertexShader='uniform float uTime,uOpen,uDirection;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float fold=sin(position.x*19.+uTime*.12)*.07+sin(position.x*37.)*.025;
      transformed.z+=fold+(sin(position.y*.8+uTime*2.5+position.x)*.15)*uOpen;
      transformed.x+=uDirection*uOpen*(4.5+sin(position.y*.3)*.6);
      transformed.y+=uOpen*sin(position.x*2.+uTime)*.12;`);
      shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>\nobjectNormal=normalize(vec3(-cos(position.x*19.+uTime*.12)*.45,0.,1.));`);
    };
    const curtain=mesh(geo,mat,group,direction*1.355,0,-.7);curtains.push({mesh:curtain,uniforms:state});
  }
  const seam=mesh(new T.PlaneGeometry(.014,13.5),m.light.clone(),group,0,0,-.55);seam.material.transparent=true;seam.material.depthWrite=false;
  return {group,arches,fragments,uniforms,curtains,seam};
}

export function astrolabe(m){
  const group=new T.Group();
  const rings=[];
  for(let i=0;i<4;i++){const ring=torus(group,m.gold,1.85+i*.13,i===0?.043:.015);ring.rotation.set(i%2*.18,(i%3-1)*.14,0);rings.push(ring);}
  const tickGeo=new T.BoxGeometry(.012,.065,.035),ticks=new T.InstancedMesh(tickGeo,m.gold,96),d=new T.Object3D();
  for(let i=0;i<96;i++){const a=i/96*Math.PI*2;d.position.set(Math.cos(a)*2.05,Math.sin(a)*2.05,.05);d.rotation.z=a-Math.PI/2;d.scale.y=i%8===0?2.4:1;d.updateMatrix();ticks.setMatrixAt(i,d.matrix);}group.add(ticks);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;mesh(new T.OctahedronGeometry(.055,0),m.light,group,Math.cos(a)*2.3,Math.sin(a)*2.3,0);}
  return {group,rings};
}
export function lantern(m){
  const group=new T.Group();
  mesh(new T.CylinderGeometry(.34,.42,1.1,8,1,true),m.glass,group,0,0,0);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;mesh(new T.CylinderGeometry(.018,.018,1.2,8),m.gold,group,Math.cos(a)*.4,0,Math.sin(a)*.4);}
  for(const y of [-.62,.62])mesh(new T.CylinderGeometry(.43,.43,.08,8),m.gold,group,0,y,0);
  mesh(new T.ConeGeometry(.46,.27,8),m.gold,group,0,.79,0);torus(group,m.gold,.23,.025,0,1.05,0);
  const flame=mesh(new T.SphereGeometry(.13,24,24),m.light,group,0,-.05,0);flame.scale.set(.6,1.6,.6);
  const light=new T.PointLight(0xffbb62,12,8,2);group.add(light);
  return {group,flame,light};
}
export function petalGeometry(){
  const rows=18,cols=14,positions=[],uvs=[],indices=[];
  for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){const u=x/cols*2-1,v=y/rows,width=Math.sin(v*Math.PI*.87)*.39;positions.push(u*width,v*.9,Math.pow(v,2)*.32+u*u*width*.35-Math.sin(v*Math.PI)*.1);uvs.push(x/cols,v);}
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
const sharedPetal=petalGeometry();
const sharedCore=new T.SphereGeometry(.11,18,12);
const sharedLeaf=new T.SphereGeometry(1,16,10);
export function rose(m,full=true){
  const group=new T.Group(),flower=new T.Group(),petals=[];flower.rotation.x=.34;group.add(flower);
  for(let layer=0;layer<(full?5:3);layer++){
    const count=full?9:6;
    for(let i=0;i<count;i++){const pivot=new T.Group(),a=i/count*Math.PI*2+layer*.43;flower.add(pivot);pivot.rotation.z=a;pivot.rotation.x=(.5+layer*.12);pivot.position.z=layer*.045;pivot.scale.setScalar(.9-layer*.12);const p=mesh(sharedPetal,m.ivory,pivot,0,-.12,0);petals.push({pivot,base:pivot.rotation.x,layer});}
  }
  mesh(sharedCore,m.gold,flower,0,0,.22);
  tube(group,m.leaf,[[0,-.2,-.1],[-.08,-.65,-.12],[.09,-1.3,-.2]],.025);
  for(const side of [-1,1]){const leaf=mesh(sharedLeaf,m.leaf,group,side*.17,-.8,-.1);leaf.scale.set(.27,.09,.025);leaf.rotation.z=side*.55;}
  return {group,flower,petals};
}
export function compass(m){
  const group=new T.Group(),rings=[];
  for(let i=0;i<3;i++){const ring=torus(group,m.gold,.75+i*.09,.015);ring.rotation.set(i*.6,i*.8,0);rings.push(ring);}
  const crystal=mesh(new T.OctahedronGeometry(.48,0),new T.MeshPhysicalMaterial({color:0xf5ebd5,metalness:0,roughness:.015,transmission:.94,thickness:.7,ior:2.1,envMapIntensity:2,clearcoat:1}),group);crystal.rotation.z=Math.PI/4;
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const ray=mesh(new T.ConeGeometry(.075,.65,4),m.gold,group,Math.sin(a)*1.03,Math.cos(a)*1.03,0);ray.rotation.z=-a;}
  return {group,rings,crystal};
}
export function grandPiano(m){
  const group=new T.Group(),shape=new T.Shape();shape.moveTo(-2.55,-1.4);shape.lineTo(-2.53,.15);shape.bezierCurveTo(-2.53,1.1,-1.8,1.65,-.7,1.4);shape.bezierCurveTo(.05,1.25,.25,.6,1.05,.72);shape.bezierCurveTo(2.,.85,2.65,.3,2.55,-.6);shape.lineTo(2.55,-1.4);shape.closePath();
  const body=mesh(new T.ExtrudeGeometry(shape,{depth:.15,bevelEnabled:true,bevelSize:.035,bevelThickness:.04,bevelSegments:4,curveSegments:40}),m.dark,group);
  const linePoints=shape.getPoints(200).map(p=>new T.Vector3(p.x,p.y,.23));linePoints.push(linePoints[0].clone());tube(group,m.gold,linePoints.map(p=>p.toArray()),.026);
  const strings=[];
  for(let i=0;i<27;i++){const x=-2.18+i*.165,y=.9-.7*(i/26);const line=tube(group,m.gold,[[x,-1.2,.23],[x+.08,-.25,.23],[x+.14,y,.23]],.004);strings.push(line);}
  const emblem=torus(group,m.gold,.31,.008,0,-.72,.25);emblem.scale.y=.7;
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;mesh(new T.SphereGeometry(.024,10,8),m.gold,group,Math.cos(a)*.3,-.72+Math.sin(a)*.2,.25);}
  group.rotation.x=-.2;return {group,strings,body};
}
export function garden(m){
  const group=new T.Group(),branches=[
    [[0,-2.2,0],[-.1,-.8,.1],[.12,.6,.05],[0,2.1,-.1]],
    [[0,-1.4,0],[-.9,-1.1,.1],[-1.8,-.4,.0],[-2.2,.3,-.2]],
    [[0,-.6,.1],[.9,-.4,.1],[1.6,.3,0],[2.05,1,-.3]],
    [[0,.1,.05],[-.65,.6,.1],[-1.2,1.35,0],[-1.3,1.95,-.1]],
    [[.05,.7,.05],[.8,1.05,0],[1.3,1.75,-.1],[1.55,2.5,-.2]],
    [[0,1.4,0],[-.4,1.75,0],[-.55,2.5,-.1]],
    [[-1.3,-.8,.1],[-1.5,-.2,.25],[-1.7,.5,.1]],
    [[1.2,-.1,0],[1.5,.5,.1],[1.55,1.4,0]]
  ];
  const flowers=[];
  branches.forEach((points,index)=>{tube(group,m.gold,points,.018+(index===0?.028:0));const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));for(let i=0;i<6;i++){const t=.35+i*.12,pos=curve.getPoint(t);const leaf=mesh(sharedLeaf,m.leaf,group,pos.x+Math.sin(i)*.08,pos.y,pos.z);leaf.scale.set(.16,.055,.025);leaf.rotation.z=i*1.3+index;
    if(i%2===0){const bloom=rose(m,false);bloom.group.position.copy(pos);bloom.group.rotation.z=i*.6;bloom.group.scale.setScalar(.12+Math.random()*.08);group.add(bloom.group);flowers.push(bloom);}}
  });
  const buckets=new Map();group.updateMatrixWorld(true);
  group.traverse(object=>{if(!object.isMesh)return;const key=object.geometry.uuid+object.material.uuid;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(object);});
  const batches=[];
  for(const sources of buckets.values())if(sources.length>3){const instanced=new T.InstancedMesh(sources[0].geometry,sources[0].material,sources.length);instanced.castShadow=true;instanced.receiveShadow=true;sources.forEach((source,i)=>{instanced.setMatrixAt(i,source.matrixWorld);source.visible=false;});instanced.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(instanced);batches.push({mesh:instanced,sources});}
  return {group,flowers,batches};
}
export function volumeMaterial(){return new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{uTime:{value:0},uStrength:{value:.12}},vertexShader:`varying vec3 vLocal;void main(){vLocal=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float uTime,uStrength;varying vec3 vLocal;void main(){float axial=1.-clamp(abs(vLocal.y)/6.,0.,1.);float radial=1.-smoothstep(0.,2.5,length(vLocal.xz));float n=.55+.45*sin(vLocal.y*7.+vLocal.x*4.+uTime*.5)*sin(vLocal.z*5.-uTime*.2);gl_FragColor=vec4(1.9,1.15,.4,radial*axial*n*uStrength);}`});}
