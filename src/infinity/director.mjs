import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import * as S from './shaders.mjs';
import {materials,palace,astrolabe,lantern,rose,compass,grandPiano,garden,volumeMaterial,mesh,torus} from './objects.mjs';

const TAU=Math.PI*2,clamp=T.MathUtils.clamp;
const ease=x=>1-Math.pow(1-clamp(x,0,1),3);
const BG=['assets/scenes/ceremony.webp','assets/images/02-royal-romance.webp','assets/scenes/ceremony.webp','assets/scenes/welcome.webp','assets/scenes/moonlight.webp','assets/scenes/ceremony.webp','assets/images/03-love-beyond-words.webp','assets/images/08-into-forever.webp'];
const PHOTOS=['02-royal-romance','01-grand-arrival','03-love-beyond-words','04-aegean-promise','05-royal-bride','06-royal-groom','07-symphony-of-us','08-into-forever'].map(x=>`assets/images/${x}.webp`);

export class InfinityDirector {
  constructor(host){
    this.host=host;this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.sceneIndex=0;this.act=0;this.time=0;this.transitionStarted=0;this.last=performance.now();this.born=this.last;this.ready=false;this.suspended=document.hidden;
    this.pointer=new T.Vector2();this.pointerTarget=new T.Vector2();this.open=0;this.openTarget=0;this.openVelocity=0;this.kick=0;this.energy=0;this.reveal=0;this.revealTarget=0;this.lit=0;this.litTarget=0;this.promise=0;this.sky=0;this.noteEnergy=new Float32Array(12);this.writeIndex=0;this.spawned=0;this.capacity=131072;this.atmosphereCount=24000;this.frames=0;this.frameTimes=[];this.layoutDirty=true;this.bloomTime=-100;this.selectedWish=0;
    this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',stencil:false});this.renderer.setClearColor(0x061b25);this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.93;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;this.renderer.info.autoReset=false;
    this.renderer.domElement.id='infinityCanvas';this.renderer.domElement.setAttribute('aria-hidden','true');host.prepend(this.renderer.domElement);
    this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(40,1,.1,150);this.camera.position.z=18;
    const pmrem=new T.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.scene.environment=pmrem.fromScene(room,.04).texture;this.scene.environmentIntensity=.22;room.dispose();pmrem.dispose();
    this.m=materials();this.lighting();this.background();this.createObjects();this.createAtmosphere();this.createBursts();this.createRibbons();this.createBeams();
    const target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,format:T.RGBAFormat,samples:4,depthBuffer:true});
    this.composer=new EffectComposer(this.renderer,target);this.composer.addPass(new RenderPass(this.scene,this.camera));this.bloomPass=new UnrealBloomPass(new T.Vector2(1,1),.58,.6,1.3);this.composer.addPass(this.bloomPass);this.film=new ShaderPass(S.filmShader);this.composer.addPass(this.film);this.composer.addPass(new OutputPass());
    this.resize();
    this.layoutObserver=new ResizeObserver(()=>{this.layoutDirty=true;this.wake();});
    for(const element of document.querySelectorAll('.scene-heading,.memory-picture,.memory-caption,#dateRelic,#grandPiano,.wish-tree,.promise-copy,.finale-copy'))this.layoutObserver.observe(element);
    document.fonts?.ready.then(()=>{this.layoutDirty=true;this.wake();});
    window.addEventListener('resize',()=>this.resize(),{passive:true});window.visualViewport?.addEventListener('resize',()=>this.resize(),{passive:true});
    document.addEventListener('pointermove',e=>{this.pointerTarget.set(e.clientX/this.width*2-1,1-e.clientY/this.height*2);},{passive:true});
    document.addEventListener('visibilitychange',()=>{this.suspended=document.hidden;if(this.suspended){cancelAnimationFrame(this.raf);this.raf=0;}else{this.last=performance.now();this.wake();}});
    this.motion.addEventListener('change',()=>{this.last=performance.now();this.wake();});
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.fail('WebGL context lost; interactive fallback restored.');});
    this.loadAssets();this.wake();
  }
  lighting(){
    this.scene.add(new T.HemisphereLight(0xc7f0e1,0x3b2212,.65));this.key=new T.DirectionalLight(0xffe4ae,1.7);this.key.position.set(-4,7,9);this.key.castShadow=true;this.key.shadow.mapSize.set(4096,4096);Object.assign(this.key.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:50});this.key.shadow.normalBias=.035;this.key.shadow.bias=-.00015;this.scene.add(this.key);
    this.rim=new T.DirectionalLight(0x8fded5,1.1);this.rim.position.set(5,2,-3);this.scene.add(this.rim);this.warm=new T.PointLight(0xffbb61,35,28,2);this.warm.position.set(0,2,7);this.scene.add(this.warm);
    this.touchLight=new T.PointLight(0xffd58a,0,10,2);this.scene.add(this.touchLight);
  }
  background(){
    const pixel=new T.DataTexture(new Uint8Array([9,36,44,255]),1,1);pixel.needsUpdate=true;
    this.bg=new T.ShaderMaterial({uniforms:{uFrom:{value:pixel},uTo:{value:pixel},uFromScene:{value:0},uScene:{value:0},uProgress:{value:1},uTime:{value:0},uAspect:{value:1},uFromAspect:{value:1},uToAspect:{value:1},uEnergy:{value:0},uOpen:{value:0},uPointer:{value:this.pointer}},vertexShader:S.backgroundVertex,fragmentShader:S.backgroundFragment,depthWrite:false,depthTest:false});
    this.backgroundPlane=new T.Mesh(new T.PlaneGeometry(2,2),this.bg);this.backgroundPlane.position.z=-30;this.backgroundPlane.renderOrder=-100;this.backgroundPlane.frustumCulled=false;this.scene.add(this.backgroundPlane);
    this.textures=new Map();this.loader=new T.TextureLoader();
    this.captureScene=new T.Scene();this.capturePlane=this.backgroundPlane.clone();this.captureScene.add(this.capturePlane);
    this.captureTargets=[0,1].map(()=>new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:false}));this.captureIndex=0;
  }
  loadTexture(url){
    if(this.textures.has(url))return this.textures.get(url).promise;
    const entry={texture:null,aspect:1,promise:null};entry.promise=this.loader.loadAsync(url).then(texture=>{texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=this.renderer.capabilities.getMaxAnisotropy();texture.minFilter=T.LinearMipmapLinearFilter;entry.texture=texture;entry.aspect=texture.image.width/texture.image.height;this.wake();return entry;});this.textures.set(url,entry);return entry.promise;
  }
  async loadAssets(){
    try{
      await Promise.all([...new Set([...BG,...PHOTOS,'assets/scenes/ceremony.webp','assets/scenes/moonlight.webp'])].map(url=>this.loadTexture(url)));
      this.setBackground(this.sceneIndex===3?`assets/scenes/${['welcome','ceremony','moonlight'][this.act]}.webp`:BG[this.sceneIndex],true);this.updatePhoto(this.pendingPhoto||document.querySelector('#memoryImage')?.getAttribute('src')||PHOTOS[0],false);await this.renderer.compileAsync(this.scene,this.camera);this.born=performance.now();this.ready=true;this.host.classList.add('infinity-ready');this.host.dataset.renderer='webgl2-hdr';this.host.dataset.quality='native-resolution';this.layoutDirty=true;this.wake();
    }catch(error){this.fail('The 3D assets could not initialize: '+error.message);}
  }
  captureBackground(){
    // Ping-pong snapshots preserve the current blend on interruption without sampling our own render target.
    this.captureIndex=1-this.captureIndex;
    const target=this.captureTargets[this.captureIndex],previous=this.renderer.getRenderTarget();
    this.capturePlane.scale.copy(this.backgroundPlane.scale);
    try{this.renderer.setRenderTarget(target);this.renderer.render(this.captureScene,this.camera);}finally{this.renderer.setRenderTarget(previous);}
    return target.texture;
  }
  setBackground(url,instant=false){
    const entry=this.textures.get(url);if(!entry?.texture)return;
    if(!instant&&this.backgroundURL===url&&this.backgroundScene===this.sceneIndex)return;
    const uniforms=this.bg.uniforms,interrupted=!instant&&uniforms.uProgress.value<.999;
    const previousTexture=interrupted?this.captureBackground():uniforms.uTo.value;
    uniforms.uFrom.value=previousTexture;uniforms.uFromAspect.value=interrupted?this.camera.aspect:uniforms.uToAspect.value;uniforms.uFromScene.value=interrupted?-1:uniforms.uScene.value;
    uniforms.uTo.value=entry.texture;uniforms.uToAspect.value=entry.aspect;uniforms.uScene.value=this.sceneIndex;uniforms.uProgress.value=instant||this.motion.matches?1:0;
    this.backgroundURL=url;this.backgroundScene=this.sceneIndex;this.transitionStarted=this.time;this.wake();
  }
  createObjects(){
    this.palace=palace(this.m);this.scene.add(this.palace.group);
    this.relic=astrolabe(this.m);this.scene.add(this.relic.group);
    this.lantern=lantern(this.m);this.rose=rose(this.m);this.star=compass(this.m);[this.lantern,this.rose,this.star].forEach(o=>this.scene.add(o.group));
    this.piano=grandPiano(this.m);this.scene.add(this.piano.group);this.tree=garden(this.m);this.scene.add(this.tree.group);this.seed=rose(this.m);this.scene.add(this.seed.group);
    this.wishModels=Array.from({length:7},()=>{const flower=rose(this.m,false);this.scene.add(flower.group);return flower;});
    this.photoGroup=new T.Group();this.photoMat=new T.MeshBasicMaterial({color:0xffffff});this.photoMesh=mesh(new T.PlaneGeometry(1,1,32,32),this.photoMat,this.photoGroup,0,0,.1);this.photoBorders=[];
    for(let i=0;i<4;i++)this.photoBorders.push(mesh(new T.BoxGeometry(1,1,.025),this.m.gold,this.photoGroup));
    this.scene.add(this.photoGroup);
    this.photoUniform={value:0};this.photoMat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb *= mix(.32,1.,smoothstep(0.,.34,vMapUv.y));');shader.uniforms.uLivingTime=this.photoUniform;shader.vertexShader='uniform float uLivingTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += sin(position.x*3.+uLivingTime*.2)*.012;');};
  }
  createAtmosphere(){
    const seeds=new Float32Array(this.atmosphereCount*4);for(let i=0;i<seeds.length;i++)seeds[i]=Math.random();const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(this.atmosphereCount*3),3));geometry.setAttribute('aSeed',new T.BufferAttribute(seeds,4));
    this.atmosphereUniforms={uTime:{value:0},uScene:{value:0},uEnergy:{value:0},uDpr:{value:1},uHeight:{value:1},uWorld:{value:new T.Vector2(7,13)},uAnchor:{value:new T.Vector3()}};
    const material=new T.ShaderMaterial({uniforms:this.atmosphereUniforms,vertexShader:S.atmosphereVertex,fragmentShader:S.atmosphereFragment,transparent:true,depthWrite:false,blending:T.AdditiveBlending});this.atmosphere=new T.Points(geometry,material);this.atmosphere.frustumCulled=false;this.atmosphere.renderOrder=-5;this.scene.add(this.atmosphere);
  }
  createBursts(){
    this.burstGeometry=new T.BufferGeometry();this.burstArrays={position:new Float32Array(this.capacity*3),aVelocity:new Float32Array(this.capacity*3),aLife:new Float32Array(this.capacity*4),aTint:new Float32Array(this.capacity*3)};
    for(let i=0;i<this.capacity;i++)this.burstArrays.aLife[i*4]=-1000;
    for(const [name,array] of Object.entries(this.burstArrays))this.burstGeometry.setAttribute(name,new T.BufferAttribute(array,name==='aLife'?4:3).setUsage(T.DynamicDrawUsage));
    this.burstUniforms={uTime:{value:0},uDpr:{value:1}};this.burstMaterial=new T.ShaderMaterial({uniforms:this.burstUniforms,vertexShader:S.burstVertex,fragmentShader:S.burstFragment,transparent:true,depthWrite:false,depthTest:false,blending:T.AdditiveBlending});this.burstMesh=new T.Points(this.burstGeometry,this.burstMaterial);this.burstMesh.frustumCulled=false;this.burstMesh.renderOrder=10;this.scene.add(this.burstMesh);
  }
  createRibbons(){
    const positions=[],ts=[],sides=[],indices=[],segments=256;
    for(let i=0;i<=segments;i++)for(const side of [-1,1]){positions.push(0,0,0);ts.push(i/segments);sides.push(side);}
    for(let i=0;i<segments;i++){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('aT',new T.Float32BufferAttribute(ts,1));geometry.setAttribute('aSide',new T.Float32BufferAttribute(sides,1));geometry.setIndex(indices);
    this.ribbons=[];for(let i=0;i<14;i++){const uniforms={uTime:{value:0},uScene:{value:0},uIndex:{value:i},uEnergy:{value:0},uKick:{value:0},uAnchor:{value:new T.Vector3()},uOpacity:{value:.2},uProgress:{value:1},uScale:{value:1}};const material=new T.ShaderMaterial({uniforms,vertexShader:S.ribbonVertex,fragmentShader:S.ribbonFragment,side:T.DoubleSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending});const ribbon=new T.Mesh(geometry,material);ribbon.frustumCulled=false;this.scene.add(ribbon);this.ribbons.push({mesh:ribbon,uniforms});}
  }
  createBeams(){this.beams=[];for(let i=0;i<5;i++){const mat=volumeMaterial(),beam=mesh(new T.CylinderGeometry(.02,2.4,12,48,1,true),mat,this.scene,(i-2)*2,1,-4);beam.rotation.z=(i-2)*.12;this.beams.push(beam);}}
  point(x,y,z=0){const p=new T.Vector3(x/this.width*2-1,1-y/this.height*2,.5).unproject(this.camera),dir=p.sub(this.camera.position).normalize();return this.camera.position.clone().add(dir.multiplyScalar((z-this.camera.position.z)/dir.z));}
  rect(selector){const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return r.width>0&&r.height>0?r:null;}
  place(group,selector,baseWidth=2){const r=this.rect(selector);if(!r)return;const center=this.point(r.left+r.width/2,r.top+r.height/2),left=this.point(r.left,r.top+r.height/2),right=this.point(r.right,r.top+r.height/2);group.position.copy(center);group.scale.setScalar(left.distanceTo(right)/baseWidth);}
  fit(group,selector,baseWidth,baseHeight,centerY=0){
    const r=this.rect(selector);if(!r)return;
    const a=this.point(r.left,r.top),b=this.point(r.right,r.bottom);
    const scale=Math.min(Math.abs(b.x-a.x)/baseWidth,Math.abs(b.y-a.y)/baseHeight);
    group.scale.setScalar(scale);group.position.copy(this.point(r.left+r.width/2,r.top+r.height/2));group.position.y-=centerY*scale;
  }
  resize(){
    this.width=innerWidth;this.height=window.visualViewport?.height||innerHeight;const maximum=this.renderer.capabilities.maxTextureSize;const dpr=Math.min(devicePixelRatio||1,maximum/Math.max(this.width,this.height));this.dpr=dpr;this.renderer.setPixelRatio(dpr);this.renderer.setSize(this.width,this.height,false);this.captureTargets?.forEach(target=>target.setSize(Math.round(this.width*dpr),Math.round(this.height*dpr)));this.camera.aspect=this.width/this.height;this.camera.updateProjectionMatrix();this.composer?.setPixelRatio(dpr);this.composer?.setSize(this.width,this.height);
    const worldHeight=2*Math.tan(T.MathUtils.degToRad(20))*18;this.worldHeight=worldHeight;this.worldWidth=worldHeight*this.camera.aspect;
    this.backgroundPlane.scale.set(this.worldWidth*(48/18)/2,this.worldHeight*(48/18)/2,1);this.bg.uniforms.uAspect.value=this.camera.aspect;this.atmosphereUniforms.uDpr.value=dpr;this.atmosphereUniforms.uWorld.value.set(this.worldWidth,this.worldHeight);this.burstUniforms.uDpr.value=dpr;this.layoutDirty=true;this.host.dataset.renderResolution=`${Math.round(this.width*dpr)}x${Math.round(this.height*dpr)}`;this.wake();
  }
  layout(){
    this.layoutDirty=false;this.palace.group.scale.set(this.worldWidth/5.4,this.worldHeight/13.5,1);
    if(this.sceneIndex===0)this.place(this.star.group,'#openPortal',3.2);
    if(this.sceneIndex===1)this.layoutPhoto();
    if(this.sceneIndex===2)this.place(this.relic.group,'#dateRelic',3.7);
    if(this.sceneIndex===3){const target=[this.lantern.group,this.rose.group,this.star.group][this.act];this.place(target,'#objectArt',1.7);}
    if(this.sceneIndex===4){const r=this.rect('.piano-lid');if(r){this.place(this.piano.group,'.piano-lid',5.3);const p1=this.point(r.left,r.top),p2=this.point(r.left,r.bottom);this.piano.group.scale.y=p1.distanceTo(p2)/3.;}}
    if(this.sceneIndex===5){this.fit(this.tree.group,'.wish-tree',4.9,5.2,.2);this.fit(this.seed.group,'#plantLight',1.8,2.5,-.35);const buttons=[...document.querySelectorAll('.wish-flower')];this.wishModels.forEach((o,i)=>{o.group.visible=i<buttons.length;if(buttons[i]){const r=buttons[i].getBoundingClientRect();o.group.position.copy(this.point(r.left+r.width/2,r.top+r.height/2,.4));o.group.scale.setScalar(.23);}});}
    const anchors={0:'#openPortal',1:'.memory-picture',2:'#dateRelic',3:'#celebrationTouch',4:'#grandPiano',5:'.wish-tree',6:'.promise-copy',7:'.finale-copy'};
    const r=this.rect(anchors[this.sceneIndex]);if(r)this.anchor=this.point(r.left+r.width/2,r.top+r.height/2,-.5);else this.anchor=new T.Vector3();
    this.atmosphereUniforms.uAnchor.value.copy(this.anchor);
    let ribbonScale=1;
    if(r){const a=this.point(r.left,r.top),b=this.point(r.right,r.bottom),w=Math.abs(b.x-a.x),h=Math.abs(b.y-a.y);
      if(this.sceneIndex===0)ribbonScale=w*1.2/5.8;
      if(this.sceneIndex===2)ribbonScale=w*1.24/6.2;
      if(this.sceneIndex===5)ribbonScale=Math.min(w/4.8,h/5.8);
      if(this.sceneIndex>=6)ribbonScale=Math.max(w/5.7,h/5.5);
    }
    this.ribbons.forEach(r=>{r.uniforms.uAnchor.value.copy(this.anchor);r.uniforms.uScale.value=ribbonScale;});
  }
  layoutPhoto(){
    const r=this.rect('.memory-picture');if(!r)return;const ar=this.photoAspect||.8;let width=r.width,height=width/ar;if(height>r.height){height=r.height;width=height*ar;}
    const p=this.point(r.left+r.width/2,r.top+r.height*.43+height*.07,.3),a=this.point(0,0,.3),b=this.point(width,height,.3);const ww=Math.abs(b.x-a.x),hh=Math.abs(b.y-a.y);this.photoGroup.position.copy(p);this.photoMesh.scale.set(ww,hh,1);
    this.photoBorders.forEach((border,i)=>{const horizontal=i<2;border.scale.set(horizontal?ww:.012,horizontal?.012:hh,1);border.position.set(horizontal?0:(i===2?-ww/2:ww/2),horizontal?(i===0?-hh/2:hh/2):0,.12);});
  }
  updatePhoto(url,burst=true){this.pendingPhoto=url;const entry=this.textures.get(url);if(!entry?.texture)return;this.photoMat.map=entry.texture;this.photoMat.needsUpdate=true;this.photoAspect=entry.aspect;this.layoutDirty=true;if(this.sceneIndex===1)this.setBackground(url,false);if(burst)this.emit(this.width*.82,this.height*.2,2200,'butterfly');this.wake();}
  connectAudio(audio){this.audio=audio;}
  setScene(index){this.retireParticles();this.noteEnergy.fill(0);this.kick=0;this.sceneIndex=index;this.openTarget=index===0?0:1;this.setBackground(index===3?`assets/scenes/${['welcome','ceremony','moonlight'][this.act]}.webp`:BG[index]);this.atmosphereUniforms.uScene.value=index;this.ribbons.forEach(r=>r.uniforms.uScene.value=index);this.layoutDirty=true;this.kick=Math.max(this.kick,.4);if(index===0){this.open=0;this.openVelocity=0;this.revealTarget=0;this.litTarget=0;this.sky=0;this.promise=0;this.born=performance.now();}this.wake();}
  selectAct(index){this.act=index;this.litTarget=0;if(this.sceneIndex===3){this.retireParticles();this.setBackground(`assets/scenes/${['welcome','ceremony','moonlight'][index]}.webp`);}this.layoutDirty=true;this.kick=.7;this.wake();}
  openPortal(){this.openTarget=1;this.emit(this.width*.5,this.height*.62,8200,'gold',{spread:3.5,speed:3.5});this.kick=1;this.wake();}
  revealDate(){this.revealTarget=1;this.kick=1;const r=this.rect('#dateRelic');if(r)this.emit(r.left+r.width/2,r.top+r.height/2,11500,'dust',{speed:3.3,life:3.7});this.wake();}
  lightCelebration(){this.litTarget=1;this.kick=1;const r=this.rect('#celebrationTouch');if(r)this.emit(r.left+r.width/2,r.top+r.height/2,this.act===1?6500:4200,this.act===1?'petal':this.act===2?'gold':'lantern',{speed:1.8,life:4.5});this.wake();}
  bloom(){this.bloomTime=this.time;this.selectedWish=0;this.layoutDirty=true;this.kick=.8;const r=this.rect('#plantLight');if(r)this.emit(r.left+r.width/2,r.top+r.height/2,5400,'butterfly',{speed:1.5,life:4});this.wake();}
  selectWish(index){this.selectedWish=index;this.kick=.35;this.wake();}
  writePromise(){this.promise=1;this.kick=1;this.emit(this.width*.5,this.height*.6,6500,'gold',{speed:2.1,life:4});this.wake();}
  note(midi,element){this.noteEnergy[midi%12]=1;this.kick=Math.max(this.kick,.45);const r=element?.getBoundingClientRect();if(r)this.emit(r.left+r.width/2,r.top,1650,'butterfly',{speed:1.1,life:3.6,color:midi%3===0?'#ffcf8d':midi%3===1?'#b6ece0':'#f1b3cf'});this.wake();}
  skyFinale(){this.sky=1;this.kick=1;for(let i=0;i<5;i++)this.emit(this.width*(.15+i*.175),this.height*(.22+i%2*.13),7200,'gold',{speed:2.4+Math.random()*1.2,life:3.8+i*.2});this.wake();}
  emit(x,y,count=1200,kind='gold',extra={}){
    if(this.motion.matches)return;const point=this.point(x,y,2),types={dust:0,petal:1,butterfly:2,note:2,lantern:2,gold:3},tint=new T.Color(extra.color||({dust:'#ffe1a1',petal:'#ffe1d2',butterfly:'#f4cf8b',gold:'#fbd591'}[kind]||'#fbd591'));
    count=Math.min(count,this.capacity);const start=this.writeIndex;let cursor=start;
    for(let i=0;i<count;i++){
      const j=cursor%this.capacity,a=Math.random()*TAU,z=Math.random()*2-1,rad=Math.sqrt(1-z*z),speed=(extra.speed||2)*(.25+Math.random()),spread=extra.spread||.05;
      this.burstArrays.position.set([point.x+(Math.random()-.5)*spread,point.y+(Math.random()-.5)*spread,point.z+(Math.random()-.5)*spread],j*3);
      this.burstArrays.aVelocity.set([Math.cos(a)*rad*speed,Math.sin(a)*rad*speed+(kind==='butterfly'||kind==='lantern'?.9:0),z*speed*.6],j*3);
      this.burstArrays.aLife.set([this.time+Math.random()*.16,extra.life||1.3+Math.random()*2.1,Math.random()*6.28,types[kind]??3],j*4);this.burstArrays.aTint.set([tint.r,tint.g,tint.b],j*3);cursor++;
    }
    this.writeIndex=cursor%this.capacity;this.spawned+=count;
    for(const attr of Object.values(this.burstGeometry.attributes)){const stride=attr.itemSize,first=Math.min(count,this.capacity-start);attr.addUpdateRange(start*stride,first*stride);if(first<count)attr.addUpdateRange(0,(count-first)*stride);attr.needsUpdate=true;}
    this.host.dataset.emittedParticles=String(this.spawned);this.touchLight.position.copy(point);this.wake();
  }
  retireParticles(){for(let i=0;i<this.capacity;i++)this.burstArrays.aLife[i*4]=-1000;const attribute=this.burstGeometry.attributes.aLife;attribute.clearUpdateRanges();attribute.addUpdateRange(0,attribute.array.length);attribute.needsUpdate=true;this.touchLight.intensity=0;}
  clear(){this.spawned=0;this.retireParticles();this.sky=0;this.promise=0;this.kick=0;this.wake();}
  wake(){if(!this.raf&&!this.suspended&&!this.failed)this.raf=requestAnimationFrame(now=>this.frame(now));}
  frame(now){
    this.raf=0;if(this.suspended||this.failed)return;
    const elapsed=now-this.last;this.frameTimes.push(elapsed);if(this.frameTimes.length>120)this.frameTimes.shift();const dt=Math.min(elapsed/1000,.05);this.last=now;if(!this.motion.matches)this.time+=dt;
    try{
      this.pointer.lerp(this.pointerTarget,1-Math.exp(-dt*4));this.openVelocity+=(this.openTarget-this.open)*dt*35;this.openVelocity*=Math.exp(-dt*10);this.open=clamp(this.open+this.openVelocity*dt,0,1.05);
      this.reveal=T.MathUtils.damp(this.reveal,this.revealTarget,3,dt);this.lit=T.MathUtils.damp(this.lit,this.litTarget,3,dt);this.kick*=Math.exp(-dt*2.4);
      if(this.audio?.analyser){this.audio.analyser.getByteFrequencyData(this.audio.spectrum);let total=0;for(let i=1;i<30;i++)total+=this.audio.spectrum[i];this.energy=T.MathUtils.damp(this.energy,total/(29*255),5,dt);}else this.energy*=.97;
      this.camera.position.z=18;this.camera.position.x=this.motion.matches?0:this.pointer.x*.09;this.camera.position.y=this.motion.matches?0:this.pointer.y*.065;this.camera.lookAt(0,0,0);
      if(this.layoutDirty)this.layout();const t=this.time,index=this.sceneIndex,typing=this.host.classList.contains('keyboard-open');
      this.bg.uniforms.uTime.value=t;this.bg.uniforms.uEnergy.value=this.energy;this.bg.uniforms.uOpen.value=this.open;if(this.bg.uniforms.uProgress.value<1)this.bg.uniforms.uProgress.value=this.motion.matches?1:ease((t-this.transitionStarted)/.9);
      this.palace.group.visible=index===0;this.photoGroup.visible=index===1;this.relic.group.visible=index===2;this.lantern.group.visible=index===3&&this.act===0;this.rose.group.visible=index===3&&this.act===1;this.star.group.visible=index===0||index===3&&this.act===2;this.piano.group.visible=index===4;this.tree.group.visible=index===5&&!typing;this.seed.group.visible=index===5&&!typing;this.wishModels.forEach(o=>{if(index!==5||typing)o.group.visible=false;});
      this.palace.uniforms.uAssemble.value=this.motion.matches?1:ease((now-this.born)/1600);this.palace.uniforms.uOpen.value=this.open;this.palace.uniforms.uTime.value=t;this.palace.curtains.forEach(c=>{c.uniforms.uTime.value=t;c.uniforms.uOpen.value=this.open;});this.palace.seam.scale.x=1+this.open*100;this.palace.seam.material.opacity=1-this.open;
      this.photoUniform.value=t;this.photoGroup.rotation.y=this.motion.matches?0:Math.sin(t*.12)*.035;
      this.relic.rings.forEach((ring,i)=>{ring.rotation.z=(i%2?1:-1)*t*.035*(1+this.reveal);ring.rotation.y=Math.sin(t*.2+i)*(.07+this.reveal*.13);});
      this.lantern.group.rotation.z=Math.sin(t*.8)*.06;this.lantern.flame.scale.y=1.5+Math.sin(t*8.)*.15+this.lit*.7;this.lantern.light.intensity=9+this.lit*14+this.energy*15;
      this.rose.flower.rotation.z=t*.055;this.rose.petals.forEach(({pivot,base,layer})=>pivot.rotation.x=base+this.lit*(.3+layer*.05));this.star.rings.forEach((ring,i)=>{ring.rotation.x=t*(.12+i*.04);ring.rotation.y=t*(.17-i*.02);});this.star.crystal.rotation.y=t*.2;
      this.tree.flowers.forEach((flower,i)=>{flower.flower.rotation.z=Math.sin(t*.3+i)*.1;const opening=ease((t-this.bloomTime-i*.045)/1.4);flower.petals.forEach(({pivot,base})=>pivot.rotation.x=base+(this.bloomTime>-90?opening*.46:0));});
      this.wishModels.forEach((flower,i)=>{flower.petals.forEach(({pivot,base})=>pivot.rotation.x=base+(i===this.selectedWish?.65:.12));});
      if(index===3)this.place([this.lantern.group,this.rose.group,this.star.group][this.act],'#objectArt',1.7);
      if(index===5){this.tree.group.updateMatrixWorld(true);const inverse=this.tree.group.matrixWorld.clone().invert(),matrix=new T.Matrix4();for(const batch of this.tree.batches){batch.sources.forEach((source,i)=>{matrix.multiplyMatrices(inverse,source.matrixWorld);batch.mesh.setMatrixAt(i,matrix);});batch.mesh.instanceMatrix.needsUpdate=true;}}
      this.noteEnergy.forEach((value,i)=>{this.noteEnergy[i]*=Math.exp(-dt*1.7);});this.piano.strings.forEach((line,i)=>{line.position.z=Math.sin(t*60+i)*this.noteEnergy[i%12]*.025;});
      this.atmosphereUniforms.uTime.value=t;this.atmosphereUniforms.uEnergy.value=this.energy;this.atmosphere.visible=!this.motion.matches;this.burstMesh.visible=!this.motion.matches;this.burstUniforms.uTime.value=t;
      const held=index===6?Number(document.querySelector('#writePromise')?.style.getPropertyValue('--hold')||0):0;
      this.ribbons.forEach((r,i)=>{r.uniforms.uProgress.value=index===6?Math.max(this.promise,held):1;r.mesh.visible=[0,2,4,5,6,7].includes(index)&&!(index===5&&typing);r.uniforms.uTime.value=t;r.uniforms.uEnergy.value=this.energy;r.uniforms.uKick.value=this.kick;r.uniforms.uOpacity.value=index===6?Math.max(this.promise,held)*.4:index===7?.08+this.sky*.45:index===4?.18+Math.max(...this.noteEnergy)*.48:index===2?.14+this.reveal*.2:.12;});
      this.beams.forEach((beam,i)=>{beam.visible=index!==1;beam.material.uniforms.uTime.value=t;beam.material.uniforms.uStrength.value=(index===0?.018:.008)+this.energy*.018;beam.rotation.z=(i-2)*.1+Math.sin(t*.08+i)*.035;});
      this.warm.intensity=8+this.energy*12+this.kick*15;this.touchLight.intensity=this.kick*14;this.bloomPass.strength=.54+this.energy*.18+this.kick*.12;this.film.uniforms.uTime.value=t;this.film.uniforms.uKick.value=this.kick;this.film.uniforms.uEnergy.value=this.energy;
      this.renderer.info.reset();this.composer.render(dt);this.frames++;if(this.frames%90===0){this.host.dataset.gpuDrawCalls=String(this.renderer.info.render.calls);this.host.dataset.gpuParticleCapacity=String(this.atmosphereCount+this.capacity);this.host.dataset.measuredFps=String(Math.round(1000/(this.frameTimes.reduce((a,b)=>a+b,0)/this.frameTimes.length)));this.host.dataset.renderTriangles=String(this.renderer.info.render.triangles);}
    }catch(error){this.fail(error.message);return;}
    if(!this.motion.matches||!this.ready)this.wake();
  }
  fail(reason){this.failed=true;cancelAnimationFrame(this.raf);this.raf=0;this.host.classList.remove('infinity-ready');this.host.dataset.renderer='interactive-fallback';this.renderer.domElement.style.display='none';console.warn('Infinity renderer:',reason);this.onFailure?.(reason);}
}

if(typeof window!=='undefined')window.InfinityDirector=InfinityDirector;
