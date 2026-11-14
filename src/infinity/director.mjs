import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {FilmOutputPass} from './film-output.mjs';
import {ParticleLedger} from './particle-ledger.mjs';
import {syncBatches,batchRepeatedMeshes} from './batching.mjs';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import * as S from './shaders.mjs';
import {portraitOpacity} from './portrait.mjs';
import {openingState,shapeEmission} from './choreography.mjs';
import {FrameProfiler} from './profiler.mjs';
import {auditFilmOutput} from './fidelity-audit.mjs';
import {materials,palace,astrolabe,lantern,rose,compass,grandPiano,garden,volumeMaterial,mesh,torus} from './objects.mjs';

const TAU=Math.PI*2,clamp=T.MathUtils.clamp;
const ease=x=>1-Math.pow(1-clamp(x,0,1),3);
const BG=['assets/scenes/ceremony.webp','assets/images/02-royal-romance.webp','assets/scenes/ceremony.webp','assets/scenes/welcome.webp','assets/scenes/moonlight.webp','assets/scenes/ceremony.webp','assets/images/03-love-beyond-words.webp','assets/images/08-into-forever.webp'];
const PHOTOS=['02-royal-romance','01-grand-arrival','03-love-beyond-words','04-aegean-promise','05-royal-bride','06-royal-groom','07-symphony-of-us','08-into-forever'].map(x=>`assets/images/${x}.webp`);

export class InfinityDirector {
  constructor(host){
    this.host=host;this.audit=new URLSearchParams(location.search).has('audit');this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.sceneIndex=0;this.act=0;this.time=0;this.transitionStarted=0;this.last=performance.now();this.born=this.last;this.ready=false;this.suspended=document.hidden;
    this.pointer=new T.Vector2();this.pointerTarget=new T.Vector2();this.open=0;this.openTarget=0;this.openVelocity=0;this.kick=0;this.energy=0;this.reveal=0;this.revealTarget=0;this.lit=0;this.litTarget=0;this.promise=0;this.sky=0;this.noteEnergy=new Float32Array(12);this.writeIndex=0;this.spawned=0;this.capacity=131072;this.atmosphereCount=24000;this.frames=0;this.frameTimes=[];this.portraitStarted=0;this.portraitDuration=1.45;this.layoutDirty=true;this.bloomTime=-100;this.selectedWish=0;
    this.renderer=new T.WebGLRenderer({antialias:false,alpha:false,powerPreference:'high-performance',stencil:false});this.renderer.setClearColor(0x061b25);this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.93;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;this.renderer.info.autoReset=false;
    this.renderer.domElement.id='infinityCanvas';this.renderer.domElement.setAttribute('aria-hidden','true');host.prepend(this.renderer.domElement);
    this.scene=new T.Scene();this.scene.matrixWorldAutoUpdate=false;this.scratchInverse=new T.Matrix4();this.scratchMatrix=new T.Matrix4();this.scratchPoints=[new T.Vector3(),new T.Vector3(),new T.Vector3()];this.camera=new T.PerspectiveCamera(40,1,.1,150);this.camera.position.z=18;
    const pmrem=new T.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.scene.environment=pmrem.fromScene(room,.04).texture;this.scene.environmentIntensity=.22;room.dispose();pmrem.dispose();
    this.m=materials();this.m.ebony.envMap=this.scene.environment;this.lighting();this.background();this.createObjects();this.createAtmosphere();this.createBursts();this.createRibbons();this.createBeams();
    const target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,format:T.RGBAFormat,samples:4,depthBuffer:true});
    this.composer=new EffectComposer(this.renderer,target);this.composer.addPass(new RenderPass(this.scene,this.camera));this.bloomPass=new UnrealBloomPass(new T.Vector2(1,1),.58,.6,1.3);this.composer.addPass(this.bloomPass);this.bloomPass.blendMaterial.visible=false;this.film=new FilmOutputPass(S.filmShader,this.bloomPass.renderTargetsHorizontal[0].texture);this.composer.addPass(this.film);
    this.profiler=new FrameProfiler(this.renderer,host);this.resize();
    this.layoutObserver=new ResizeObserver(()=>{this.layoutDirty=true;this.wake();});
    for(const element of document.querySelectorAll('.scene-heading,.memory-picture,.memory-caption,#dateRelic,#grandPiano,.wish-tree,.promise-copy,.finale-copy'))this.layoutObserver.observe(element);
    document.fonts?.ready.then(()=>{this.layoutDirty=true;this.wake();});
    window.addEventListener('resize',()=>{this.resizePending=true;this.wake();},{passive:true});window.visualViewport?.addEventListener('resize',()=>{this.resizePending=true;this.wake();},{passive:true});
    document.addEventListener('pointermove',e=>{this.pointerTarget.set(e.clientX/this.width*2-1,1-e.clientY/this.height*2);},{passive:true});
    document.addEventListener('visibilitychange',()=>{this.suspended=document.hidden;if(this.suspended){cancelAnimationFrame(this.raf);this.raf=0;}else{this.last=performance.now();this.wake();}});
    this.motion.addEventListener('change',()=>{this.last=performance.now();this.wake();});
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.fail('WebGL context lost; interactive fallback restored.');});
    this.assetsReady=this.loadAssets();this.wake();
  }
  lighting(){
    this.scene.add(new T.HemisphereLight(0xc7f0e1,0x3b2212,.65));this.key=new T.DirectionalLight(0xffe4ae,1.7);this.key.position.set(-4,7,9);this.key.castShadow=true;this.key.shadow.mapSize.set(4096,4096);Object.assign(this.key.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:50});this.key.shadow.normalBias=.035;this.key.shadow.bias=-.00015;this.scene.add(this.key);
    this.rim=new T.DirectionalLight(0x8fded5,1.1);this.rim.position.set(5,2,-3);this.scene.add(this.rim);this.warm=new T.PointLight(0xffbb61,35,28,2);this.warm.position.set(0,2,7);this.scene.add(this.warm);
    this.touchLight=new T.PointLight(0xffd58a,0,10,2);this.scene.add(this.touchLight);
  }
  background(){
    const pixel=new T.DataTexture(new Uint8Array([9,36,44,255]),1,1);pixel.needsUpdate=true;
    this.bg=new T.ShaderMaterial({uniforms:{uFrom:{value:pixel},uTo:{value:pixel},uFromScene:{value:0},uScene:{value:0},uProgress:{value:1},uDirection:{value:1},uTime:{value:0},uAspect:{value:1},uFromAspect:{value:1},uToAspect:{value:1},uEnergy:{value:0},uOpen:{value:0},uPointer:{value:this.pointer}},vertexShader:S.backgroundVertex,fragmentShader:S.backgroundFragment,depthWrite:false,depthTest:false});
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
      this.setBackground(this.sceneIndex===3?`assets/scenes/${['welcome','ceremony','moonlight'][this.act]}.webp`:BG[this.sceneIndex],true);this.updatePhoto(this.pendingPhoto||document.querySelector('#memoryImage')?.getAttribute('src')||PHOTOS[0],false);await this.renderer.compileAsync(this.scene,this.camera);this.born=performance.now();this.ready=true;this.host.classList.add('infinity-ready');this.host.dataset.renderer='webgl2-hdr';this.host.dataset.quality='native-resolution';if(this.sceneIndex===1)this.portraitStarted=this.time;this.layoutDirty=true;this.wake();if(this.audit)auditFilmOutput(this.renderer).then(result=>{this.host.dataset.fidelityAudit=JSON.stringify(result);}).catch(error=>{this.host.dataset.fidelityAudit=JSON.stringify({error:error.message});});
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
    if(uniforms.uDirection)uniforms.uDirection.value=this.navigationDirection||1;
    uniforms.uTo.value=entry.texture;uniforms.uToAspect.value=entry.aspect;uniforms.uScene.value=this.sceneIndex;uniforms.uProgress.value=instant||this.motion.matches?1:0;
    this.backgroundURL=url;this.backgroundScene=this.sceneIndex;this.transitionStarted=this.time;this.wake();
  }
  createObjects(){
    this.palace=palace(this.m);this.scene.add(this.palace.group);
    this.relic=astrolabe(this.m);this.scene.add(this.relic.group);
    this.lantern=lantern(this.m);this.rose=rose(this.m,true,true);this.star=compass(this.m);[this.lantern,this.rose,this.star].forEach(o=>this.scene.add(o.group));
    this.piano=grandPiano(this.m);this.scene.add(this.piano.group);this.tree=garden(this.m);this.scene.add(this.tree.group);this.seed=rose(this.m,true,true);this.scene.add(this.seed.group);
    this.wishRoot=new T.Group();this.scene.add(this.wishRoot);this.wishModels=Array.from({length:7},()=>{const flower=rose(this.m,false);this.wishRoot.add(flower.group);return flower;});this.wishBatches=batchRepeatedMeshes(this.wishRoot,true);
    this.photoGroup=new T.Group();this.portraitReveal={value:0};this.photoMat=new T.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false});this.photoMesh=mesh(new T.PlaneGeometry(1,1,32,32),this.photoMat,this.photoGroup,0,0,.1);this.photoBorders=[];
    for(let i=0;i<4;i++)this.photoBorders.push(mesh(new T.BoxGeometry(1,1,.025),this.m.gold.clone(),this.photoGroup));
    this.photoBorders.forEach(border=>{border.material.transparent=true;border.material.depthWrite=false;border.material.opacity=0;});
    this.scene.add(this.photoGroup);
    this.photoUniform={value:0};this.previousPortrait={value:null};this.portraitBlend={value:1};this.photoMat.onBeforeCompile=shader=>{shader.uniforms.uPreviousPortrait=this.previousPortrait;shader.uniforms.uPortraitBlend=this.portraitBlend;shader.fragmentShader='uniform sampler2D uPreviousPortrait;uniform float uPortraitBlend;\n'+shader.fragmentShader;shader.uniforms.uPortraitReveal=this.portraitReveal;shader.fragmentShader='uniform float uPortraitReveal;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','diffuseColor.a *= uPortraitReveal;\n#include <opaque_fragment>');shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(uPortraitBlend<.999999)diffuseColor.rgb=mix(texture2D(uPreviousPortrait,vMapUv).rgb,diffuseColor.rgb,uPortraitBlend);\ndiffuseColor.rgb *= mix(.32,1.,smoothstep(0.,.34,vMapUv.y));');shader.uniforms.uLivingTime=this.photoUniform;shader.vertexShader='uniform float uLivingTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += sin(position.x*3.+uLivingTime*.2)*.012;');};
  }
  createAtmosphere(){
    const seeds=new Float32Array(this.atmosphereCount*4);for(let i=0;i<seeds.length;i++)seeds[i]=Math.random();const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(this.atmosphereCount*3),3));geometry.setAttribute('aSeed',new T.BufferAttribute(seeds,4));
    this.atmosphereUniforms={uTime:{value:0},uScene:{value:0},uEnergy:{value:0},uDpr:{value:1},uHeight:{value:1},uWorld:{value:new T.Vector2(7,13)},uAnchor:{value:new T.Vector3()}};
    const material=new T.ShaderMaterial({uniforms:this.atmosphereUniforms,vertexShader:S.atmosphereVertex,fragmentShader:S.atmosphereFragment,transparent:true,depthWrite:false,blending:T.AdditiveBlending});this.atmosphere=new T.Points(geometry,material);this.atmosphere.frustumCulled=false;this.atmosphere.renderOrder=-5;this.scene.add(this.atmosphere);
  }
  createBursts(){
    this.randomCursor=0;
    if(typeof Worker!=='undefined'){try{const worker=new Worker(new URL('js/particle-random.worker.js?schema=random9-v1',document.baseURI));worker.onmessage=event=>{this.randomBank=new Float32Array(event.data);this.host.dataset.particlePreparation='worker-ready';worker.terminate();};worker.onerror=()=>{worker.terminate();};worker.postMessage({count:this.capacity});}catch{}}
    this.burstGeometry=new T.BufferGeometry();this.particleLedger=new ParticleLedger(this.capacity);const indices=new Uint32Array(this.capacity*2);for(let i=0;i<indices.length;i++)indices[i]=i%this.capacity;this.burstGeometry.setIndex(new T.BufferAttribute(indices,1));this.burstGeometry.setDrawRange(0,0);this.burstArrays={position:new Float32Array(this.capacity*3),aVelocity:new Float32Array(this.capacity*3),aLife:new Float32Array(this.capacity*4),aTint:new Float32Array(this.capacity*3)};
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
  createBeams(){this.beams=[];for(let i=0;i<5;i++){const mat=volumeMaterial(),beam=mesh(new T.CylinderGeometry(.02,2.4,12,48,1,true),mat,this.scene,(i-2)*2,1,-4);beam.castShadow=false;beam.receiveShadow=false;beam.rotation.z=(i-2)*.12;this.beams.push(beam);}}
  point(x,y,z=0,target=new T.Vector3()){target.set(x/this.width*2-1,1-y/this.height*2,.5).unproject(this.camera).sub(this.camera.position).normalize();return target.multiplyScalar((z-this.camera.position.z)/target.z).add(this.camera.position);}
  rect(selector){const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return r.width>0&&r.height>0?r:null;}
  place(group,selector,baseWidth=2){const r=this.rect(selector);if(!r)return;const center=this.point(r.left+r.width/2,r.top+r.height/2,0,this.scratchPoints[0]),left=this.point(r.left,r.top+r.height/2,0,this.scratchPoints[1]),right=this.point(r.right,r.top+r.height/2,0,this.scratchPoints[2]);group.position.copy(center);group.scale.setScalar(left.distanceTo(right)/baseWidth);}
  fit(group,selector,baseWidth,baseHeight,centerY=0){
    const r=this.rect(selector);if(!r)return;
    const a=this.point(r.left,r.top),b=this.point(r.right,r.bottom);
    const scale=Math.min(Math.abs(b.x-a.x)/baseWidth,Math.abs(b.y-a.y)/baseHeight);
    group.scale.setScalar(scale);group.position.copy(this.point(r.left+r.width/2,r.top+r.height/2));group.position.y-=centerY*scale;
  }
  resize(){
    this.resizePending=false;const width=innerWidth,height=window.visualViewport?.height||innerHeight,maximum=this.renderer.capabilities.maxTextureSize,dpr=Math.min(devicePixelRatio||1,maximum/Math.max(width,height));if(this.width===width&&this.height===height&&this.dpr===dpr){this.layoutDirty=true;return;}this.width=width;this.height=height;this.dpr=dpr;this.renderer.setPixelRatio(dpr);this.renderer.setSize(this.width,this.height,false);this.captureTargets?.forEach(target=>target.setSize(Math.round(this.width*dpr),Math.round(this.height*dpr)));this.camera.aspect=this.width/this.height;this.camera.updateProjectionMatrix();this.composer?.setPixelRatio(dpr);this.composer?.setSize(this.width,this.height);
    const worldHeight=2*Math.tan(T.MathUtils.degToRad(20))*18;this.worldHeight=worldHeight;this.worldWidth=worldHeight*this.camera.aspect;
    this.backgroundPlane.scale.set(this.worldWidth*(48/18)/2,this.worldHeight*(48/18)/2,1);this.bg.uniforms.uAspect.value=this.camera.aspect;this.atmosphereUniforms.uDpr.value=dpr;this.atmosphereUniforms.uWorld.value.set(this.worldWidth,this.worldHeight);this.burstUniforms.uDpr.value=dpr;this.layoutDirty=true;this.host.dataset.renderResolution=`${Math.round(this.width*dpr)}x${Math.round(this.height*dpr)}`;this.wake();
  }
  layout(){
    this.layoutDirty=false;this.palace.group.scale.set(this.worldWidth/5.4,this.worldHeight/13.5,1);
    if(this.sceneIndex===0){this.place(this.star.group,'#openPortal',3.2);this.starOpeningScale=this.star.group.scale.x;}
    if(this.sceneIndex===1)this.layoutPhoto();
    if(this.sceneIndex===2)this.place(this.relic.group,'#dateRelic',3.7);
    if(this.sceneIndex===3){const target=[this.lantern.group,this.rose.group,this.star.group][this.act];this.place(target,'#objectArt',1.7);}
    if(this.sceneIndex===4){const r=this.rect('.piano-lid');if(r){this.place(this.piano.group,'.piano-lid',5.3);const p1=this.point(r.left,r.top),p2=this.point(r.left,r.bottom);this.piano.group.scale.y=p1.distanceTo(p2)/3.;}}
    if(this.sceneIndex===5){this.seedDirty=true;this.wishesDirty=true;this.fit(this.tree.group,'.wish-tree',4.9,5.2,.2);this.fit(this.seed.group,'#plantLight',1.8,2.5,-.35);const buttons=[...document.querySelectorAll('.wish-flower')];this.wishVisibleCount=buttons.length;this.wishModels.forEach((o,i)=>{o.group.visible=i<buttons.length;if(buttons[i]){const r=buttons[i].getBoundingClientRect();o.group.position.copy(this.point(r.left+r.width/2,r.top+r.height/2,.4));o.group.scale.setScalar(.23);}});}
    const anchors={0:'#openPortal',1:'.memory-picture',2:'#dateRelic',3:'#celebrationTouch',4:'#grandPiano',5:'.wish-tree',6:'.promise-copy',7:'#finaleTitle'};
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
  capturePortrait(){
    if(!this.photoMat.map)return null;
    if(this.portraitBlend.value>=1)return this.photoMat.map;
    if(this.portraitBlend.value<=0)return this.previousPortrait.value;
    if(!this.portraitTargets){
      this.portraitTargets=[0,1].map(()=>{const target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:false});target.texture.generateMipmaps=true;target.texture.minFilter=T.LinearMipmapLinearFilter;target.texture.anisotropy=this.renderer.capabilities.getMaxAnisotropy();return target;});this.portraitCaptureIndex=0;
      this.portraitCaptureMaterial=new T.ShaderMaterial({uniforms:{uFrom:this.previousPortrait,uTo:{value:null},uBlend:this.portraitBlend},depthTest:false,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'uniform sampler2D uFrom,uTo;uniform float uBlend;varying vec2 vUv;void main(){gl_FragColor=mix(texture2D(uFrom,vUv),texture2D(uTo,vUv),uBlend);}'});
      this.portraitCaptureScene=new T.Scene();this.portraitCaptureScene.add(new T.Mesh(new T.PlaneGeometry(2,2),this.portraitCaptureMaterial));
    }
    this.portraitCaptureIndex=1-this.portraitCaptureIndex;const target=this.portraitTargets[this.portraitCaptureIndex],previous=this.renderer.getRenderTarget(),image=this.photoMat.map.image;
    target.setSize(image.width,image.height);this.portraitCaptureMaterial.uniforms.uTo.value=this.photoMat.map;
    try{this.renderer.setRenderTarget(target);this.renderer.render(this.portraitCaptureScene,this.camera);}finally{this.renderer.setRenderTarget(previous);}
    return target.texture;
  }
  updatePhoto(url,burst=true){this.pendingPhoto=url;const entry=this.textures.get(url);if(!entry?.texture)return;this.previousPortrait.value=(burst?this.capturePortrait():this.photoMat.map)||entry.texture;this.photoMat.map=entry.texture;this.portraitBlend.value=burst&&!this.motion.matches?0:1;this.photoBlendStarted=this.time;this.host.dataset.portraitBlend=this.portraitBlend.value.toFixed(3);this.photoMat.needsUpdate=true;this.photoAspect=entry.aspect;this.layoutDirty=true;if(this.sceneIndex===1)this.setBackground(url,false);if(burst){this.retireParticles();this.emit(this.width*.5,this.height*.5,2200,'butterfly',{formation:'memory',origin:this.photoGroup.position,extentX:this.photoMesh.scale.x*.5,extentY:this.photoMesh.scale.y*.5,birthWindow:.65});}this.wake();}
  connectAudio(audio){this.audio=audio;}
  setScene(index){this.profiler?.reset(index);const previous=this.sceneIndex;if(index===1){this.portraitStarted=this.time;this.portraitDuration=previous===0?1.45:.75;this.portraitReveal.value=this.motion.matches?1:0;this.host.dataset.portraitReveal=String(this.portraitReveal.value);}this.retireParticles();this.noteEnergy.fill(0);this.kick=0;this.navigationDirection=index>=previous?1:-1;this.sceneIndex=index;this.openTarget=index===0?0:1;this.setBackground(index===3?`assets/scenes/${['welcome','ceremony','moonlight'][this.act]}.webp`:BG[index]);this.atmosphereUniforms.uScene.value=index;this.ribbons.forEach(r=>r.uniforms.uScene.value=index);this.layoutDirty=true;this.kick=Math.max(this.kick,.4);if(index===0){this.open=0;this.openVelocity=0;this.revealTarget=0;this.litTarget=0;this.sky=0;this.promise=0;this.born=performance.now();this.openingStarted=null;}this.wake();}
  selectAct(index){this.navigationDirection=index>=this.act?1:-1;this.act=index;this.litTarget=0;if(this.sceneIndex===3){this.retireParticles();this.setBackground(`assets/scenes/${['welcome','ceremony','moonlight'][index]}.webp`);}this.layoutDirty=true;this.kick=.7;this.wake();}
  openPortal(){if(this.openingStarted!=null)return;this.openingStarted=performance.now();this.openTarget=1;this.host.dataset.portalPhase='opening';this.emit(this.width*.5,this.height*.62,8200,'gold',{spread:3.5,speed:3.5,formation:'portal',birthWindow:1.05});this.kick=.45;this.wake();}
  revealDate(){this.revealTarget=1;this.kick=1;const r=this.rect('#dateRelic');if(r)this.emit(r.left+r.width/2,r.top+r.height/2,11500,'dust',{speed:3.3,life:3.7,formation:'orbit',extentX:r.width*.58/this.width*this.worldWidth,extentY:r.height*.58/this.height*this.worldHeight,birthWindow:.85});this.wake();}
  lightCelebration(){if(this.litTarget===1)return;this.litTarget=1;this.kick=.55;const r=this.rect('#celebrationTouch');if(r)this.emit(r.left+r.width/2,r.top+r.height/2,this.act===1?6500:4200,this.act===1?'petal':this.act===2?'gold':'lantern',{speed:1.8,life:4.5,formation:this.act===1?'petalfall':'sky',extentX:this.worldWidth*(this.act===1?.48:.20),extentY:this.worldHeight*(this.act===1?.26:.15),birthWindow:this.act===1?1.5:.9});this.wake();}
  bloom(){this.bloomTime=this.time;this.selectedWish=0;this.layoutDirty=true;this.kick=.8;const r=this.rect('#plantLight');if(r)this.emit(r.left+r.width/2,r.top+r.height/2,5400,'butterfly',{speed:1.5,life:4,formation:'garden',extentX:this.worldWidth*.28,extentY:this.worldHeight*.12,birthWindow:.9});this.wake();}
  selectWish(index){this.wishesDirty=true;this.selectedWish=index;this.kick=.35;this.wake();}
  writePromise(){this.promise=1;this.kick=1;this.emit(this.width*.5,this.height*.5,6500,'gold',{speed:2.1,life:4,formation:'orbit',extentX:this.worldWidth*.31,extentY:this.worldHeight*.22,birthWindow:1});this.wake();}
  note(midi,element){this.noteEnergy[midi%12]=1;this.kick=Math.max(this.kick,.45);const r=element?.getBoundingClientRect();if(r)this.emit(r.left+r.width/2,r.top,1650,'note',{speed:1.1,life:3.6,color:midi%3===0?'#ffcf8d':midi%3===1?'#b6ece0':'#f1b3cf'});this.wake();}
  skyFinale(){if(this.sky===1)return;this.sky=1;this.kick=.65;for(let i=0;i<5;i++)this.emit(this.width*(.15+i*.175),this.height*(.12+i%2*.025),7200,'gold',{speed:2.4+Math.random()*1.2,life:3.8+i*.2,formation:'sky',extentX:this.worldWidth*.09,extentY:this.worldHeight*.055,birthWindow:1.8});this.wake();}
  emit(x,y,count=1200,kind='gold',extra={}){
    if(this.motion.matches)return;const point=this.point(x,y,2),types={dust:0,petal:1,butterfly:2,note:4,lantern:2,gold:3},tint=new T.Color(extra.color||({dust:'#ffe1a1',petal:'#ffe1d2',butterfly:'#f4cf8b',gold:'#fbd591'}[kind]||'#fbd591'));
    if(extra.origin)point.copy(extra.origin);count=Math.min(count,this.capacity);const start=this.writeIndex;let cursor=start;
    if(this.randomBank){const bank=this.randomBank,rotation=Math.random()*TAU,cos=Math.cos(rotation),sin=Math.sin(rotation),speed=extra.speed||2,rise=kind==='butterfly'||kind==='lantern'?.9:0,spread=extra.spread||.05;
      const p=this.burstArrays.position,v=this.burstArrays.aVelocity,b=this.burstArrays.aLife,c=this.burstArrays.aTint;
      for(let i=0;i<count;i++){
        const j=cursor%this.capacity,k=j*3,l=j*4,n=((this.randomCursor+i)%this.capacity)*9,x=bank[n+3],y=bank[n+4];
        p[k]=point.x+bank[n]*spread;p[k+1]=point.y+bank[n+1]*spread;p[k+2]=point.z+bank[n+2]*spread;
        v[k]=(x*cos-y*sin)*speed;v[k+1]=(x*sin+y*cos)*speed+rise;v[k+2]=bank[n+5]*speed*.6;
        b[l]=this.time+bank[n+6];b[l+1]=extra.life||bank[n+7];b[l+2]=bank[n+8];b[l+3]=types[kind]??3;
        c[k]=tint.r;c[k+1]=tint.g;c[k+2]=tint.b;cursor++;
      }
      this.randomCursor=(this.randomCursor+count)%this.capacity;
    }else{
    for(let i=0;i<count;i++){
      const j=cursor%this.capacity,a=Math.random()*TAU,z=Math.random()*2-1,rad=Math.sqrt(1-z*z),speed=(extra.speed||2)*(.25+Math.random()),spread=extra.spread||.05;
      const k=j*3,l=j*4,p=this.burstArrays.position,v=this.burstArrays.aVelocity,b=this.burstArrays.aLife,c=this.burstArrays.aTint;p[k]=point.x+(Math.random()-.5)*spread;p[k+1]=point.y+(Math.random()-.5)*spread;p[k+2]=point.z+(Math.random()-.5)*spread;
      v[k]=Math.cos(a)*rad*speed;v[k+1]=Math.sin(a)*rad*speed+(kind==='butterfly'||kind==='lantern'?.9:0);v[k+2]=z*speed*.6;
      b[l]=this.time+Math.random()*.16;b[l+1]=extra.life||1.3+Math.random()*2.1;b[l+2]=Math.random()*6.28;b[l+3]=types[kind]??3;c[k]=tint.r;c[k+1]=tint.g;c[k+2]=tint.b;cursor++;
    }
    }
    shapeEmission({position:this.burstArrays.position,aVelocity:this.burstArrays.aVelocity,aLife:this.burstArrays.aLife},{capacity:this.capacity,start,count,x:point.x,y:point.y,z:point.z,width:extra.extentX||this.worldWidth,height:extra.extentY||this.worldHeight,formation:extra.formation,birthWindow:extra.birthWindow,time:this.time});
    this.writeIndex=cursor%this.capacity;this.spawned+=count;this.particleLedger.add(start,count,this.time+(extra.birthWindow||.16)+(extra.life||3.4));this.burstGeometry.setDrawRange(this.particleLedger.start,this.particleLedger.count);
    for(const attr of Object.values(this.burstGeometry.attributes)){const stride=attr.itemSize,first=Math.min(count,this.capacity-start);attr.addUpdateRange(start*stride,first*stride);if(first<count)attr.addUpdateRange(0,(count-first)*stride);attr.needsUpdate=true;}
    this.host.dataset.emittedParticles=String(this.spawned);this.touchLight.position.copy(point);this.wake();
  }
  retireParticles(){this.particleLedger.clear();this.burstGeometry.setDrawRange(0,0);this.touchLight.intensity=0;}
  clear(){this.spawned=0;this.retireParticles();this.sky=0;this.promise=0;this.kick=0;this.wake();}
  wake(){if(!this.raf&&!this.suspended&&!this.failed)this.raf=requestAnimationFrame(now=>this.frame(now));}
  frame(now){
    this.raf=0;if(this.suspended||this.failed)return;this.profiler?.begin(now);if(this.resizePending)this.resize();
    const elapsed=now-this.last;this.frameTimes.push(elapsed);if(this.frameTimes.length>120)this.frameTimes.shift();const dt=Math.min(elapsed/1000,.05);this.last=now;if(!this.motion.matches)this.time+=dt;
    try{
      this.pointer.lerp(this.pointerTarget,1-Math.exp(-dt*4));if(this.openingStarted!=null){const state=openingState(now,this.openingStarted,this.motion.matches);this.open=state.progress;this.palace.seams.forEach(edge=>{edge.scale.x=state.seamWidth;edge.material.opacity=state.seamOpacity*.5;});const phase=this.open===1?'open':this.open>.25?'parted':'opening';if(this.host.dataset.portalPhase!==phase)this.host.dataset.portalPhase=phase;}else this.open=this.openTarget;
      this.reveal=T.MathUtils.damp(this.reveal,this.revealTarget,3,dt);this.lit=T.MathUtils.damp(this.lit,this.litTarget,3,dt);this.kick*=Math.exp(-dt*2.4);
      if(this.audio?.analyser){this.audio.analyser.getByteFrequencyData(this.audio.spectrum);let total=0;for(let i=1;i<30;i++)total+=this.audio.spectrum[i];this.energy=T.MathUtils.damp(this.energy,total/(29*255),5,dt);}else this.energy*=.97;
      this.camera.position.z=18;this.camera.position.x=this.motion.matches?0:this.pointer.x*.09;this.camera.position.y=this.motion.matches?0:this.pointer.y*.065;this.camera.lookAt(0,0,0);
      if(this.layoutDirty)this.layout();const t=this.time,index=this.sceneIndex,typing=this.host.classList.contains('keyboard-open');
      this.bg.uniforms.uTime.value=t;this.bg.uniforms.uEnergy.value=this.energy;this.bg.uniforms.uOpen.value=this.open;if(this.bg.uniforms.uProgress.value<1)this.bg.uniforms.uProgress.value=this.motion.matches?1:ease((t-this.transitionStarted)/.9);
      this.palace.group.visible=index===0;this.photoGroup.visible=index===1;this.relic.group.visible=index===2;this.lantern.group.visible=index===3&&this.act===0;this.rose.group.visible=index===3&&this.act===1;this.star.group.visible=index===0&&this.open<.55||index===3&&this.act===2;this.piano.group.visible=index===4;this.wishRoot.visible=index===5&&!typing&&this.wishVisibleCount>0;this.tree.group.visible=index===5&&!typing;this.seed.group.visible=index===5&&!typing;this.wishModels.forEach(o=>{if(index!==5||typing)o.group.visible=false;});
      if(index===0){this.palace.uniforms.uAssemble.value=this.motion.matches?1:Math.max(ease((now-this.born)/1600),this.openingStarted!=null?ease((now-this.openingStarted)/250):0);this.palace.uniforms.uOpen.value=this.open;this.palace.uniforms.uTime.value=t;this.palace.curtains.forEach(c=>{c.uniforms.uTime.value=t;c.uniforms.uOpen.value=this.open;});if(this.openingStarted==null){this.palace.seams.forEach(edge=>{edge.scale.x=1;edge.material.opacity=.5;});}}
      this.photoUniform.value=t;if(index===1){this.portraitBlend.value=this.motion.matches?1:portraitOpacity(t,this.photoBlendStarted||0,.72);if(this.lastPortraitBlend!==this.portraitBlend.value){this.host.dataset.portraitBlend=this.portraitBlend.value.toFixed(3);this.lastPortraitBlend=this.portraitBlend.value;}const alpha=portraitOpacity(t,this.portraitStarted,this.portraitDuration,this.motion.matches);this.portraitReveal.value=alpha;this.photoBorders.forEach(border=>border.material.opacity=alpha);if(this.lastPortraitAlpha!==alpha){this.host.dataset.portraitReveal=alpha.toFixed(3);this.lastPortraitAlpha=alpha;}}this.photoGroup.rotation.y=this.motion.matches?0:Math.sin(t*.12)*.035;
      if(index===2)this.relic.rings.forEach((ring,i)=>{ring.rotation.z=(i%2?1:-1)*t*.035*(1+this.reveal);ring.rotation.y=Math.sin(t*.2+i)*(.07+this.reveal*.13);});
      if(index===3&&this.act===0){this.lantern.group.rotation.z=Math.sin(t*.8)*.06;this.lantern.flame.scale.y=1.5+Math.sin(t*8.)*.15+this.lit*.7;this.lantern.light.intensity=9+this.lit*14+this.energy*15;}
      if(index===3&&this.act===1){this.rose.flower.rotation.z=t*.055;this.rose.petals.forEach(({pivot,base,layer})=>pivot.rotation.x=base+this.lit*(.3+layer*.05));}if(index===0||index===3&&this.act===2){this.star.rings.forEach((ring,i)=>{ring.rotation.x=t*(.12+i*.04);ring.rotation.y=t*(.17-i*.02);});this.star.crystal.rotation.y=t*.2;if(index===0)this.star.group.scale.setScalar((this.starOpeningScale||1)*Math.max(.001,1-this.open*2));}
      if(index===5){this.tree.flowers.forEach((flower,i)=>{flower.flower.rotation.z=Math.sin(t*.3+i)*.1;const opening=ease((t-this.bloomTime-i*.045)/1.4);flower.petals.forEach(({pivot,base})=>pivot.rotation.x=base+(this.bloomTime>-90?opening*.46:0));});
      if(this.wishesDirty&&this.wishVisibleCount>0)this.wishModels.forEach((flower,i)=>{flower.petals.forEach(({pivot,base})=>pivot.rotation.x=base+(i===this.selectedWish?.65:.12));});
      }
      if(index===3)this.place([this.lantern.group,this.rose.group,this.star.group][this.act],'#objectArt',1.7);
      const noteDecay=Math.exp(-dt*1.7);let noteMax=0;for(let i=0;i<12;i++){this.noteEnergy[i]*=noteDecay;noteMax=Math.max(noteMax,this.noteEnergy[i]);}if(index===4)this.piano.strings.forEach((line,i)=>{line.position.z=Math.sin(t*60+i)*this.noteEnergy[i%12]*.025;});
      this.atmosphereUniforms.uTime.value=t;this.atmosphereUniforms.uEnergy.value=this.energy;this.atmosphere.visible=!this.motion.matches;this.particleLedger.expire(t);this.burstGeometry.setDrawRange(this.particleLedger.start,this.particleLedger.count);this.burstMesh.visible=!this.motion.matches&&this.particleLedger.count>0;this.burstUniforms.uTime.value=t;
      const held=index===6?Number(document.querySelector('#writePromise')?.style.getPropertyValue('--hold')||0):0;
      this.ribbons.forEach((r,i)=>{r.uniforms.uProgress.value=index===6?Math.max(this.promise,held):1;r.mesh.visible=[0,2,4,5,6,7].includes(index)&&!(index===5&&typing)&&!(index===0&&this.open>=.55);r.uniforms.uTime.value=t;r.uniforms.uEnergy.value=this.energy;r.uniforms.uKick.value=this.kick;r.uniforms.uOpacity.value=index===6?Math.max(this.promise,held)*.4:index===7?.08+this.sky*.45:index===4?.18+noteMax*.48:index===2?.14+this.reveal*.2:index===0?.12*Math.max(0,1-this.open*2):.12;});
      this.beams.forEach((beam,i)=>{beam.visible=index!==1;beam.material.uniforms.uTime.value=t;beam.material.uniforms.uStrength.value=(index===0?.018:.008)+this.energy*.018;beam.rotation.z=(i-2)*.1+Math.sin(t*.08+i)*.035;});
      this.warm.intensity=8+this.energy*12+this.kick*5;this.touchLight.intensity=this.kick*5;this.bloomPass.strength=.54+this.energy*.18+this.kick*.12;this.film.uniforms.uTime.value=t;this.film.uniforms.uKick.value=this.kick;this.film.uniforms.uEnergy.value=this.energy;
      for(const object of this.scene.children)if(object.visible&&!(object===this.wishRoot&&!this.wishesDirty)&&!(object===this.seed.group&&!this.seedDirty))object.updateMatrixWorld();
      if(index===3&&this.act===1)syncBatches(this.rose.group,this.rose.batches,this.scratchInverse,this.scratchMatrix);
      if(index===5&&!typing){syncBatches(this.tree.group,this.tree.batches,this.scratchInverse,this.scratchMatrix);if(this.seedDirty){syncBatches(this.seed.group,this.seed.batches,this.scratchInverse,this.scratchMatrix);this.seedDirty=false;}if(this.wishesDirty&&this.wishRoot.visible){syncBatches(this.wishRoot,this.wishBatches,this.scratchInverse,this.scratchMatrix);this.wishesDirty=false;}}
      this.renderer.info.reset();this.profiler?.renderStart();
      this.composer.render(dt);this.profiler?.end();this.frames++;if(this.frames%90===0){this.host.dataset.gpuDrawCalls=String(this.renderer.info.render.calls);this.host.dataset.gpuParticleCapacity=String(this.atmosphereCount+this.capacity);this.host.dataset.measuredFps=String(Math.round(1000/(this.frameTimes.reduce((a,b)=>a+b,0)/this.frameTimes.length)));this.host.dataset.renderTriangles=String(this.renderer.info.render.triangles);if(this.audit)this.host.dataset.materialAudit=JSON.stringify({ebony:{color:this.m.ebony.color.getHexString(),authoredEnvironmentIntensity:this.m.ebony.envMapIntensity,actualEnvironmentIntensity:this.renderer.properties.get(this.m.ebony).uniforms?.envMapIntensity?.value},beamShadows:this.beams.some(beam=>beam.castShadow),energy:this.energy,kick:this.kick});}
    }catch(error){this.fail(error.message);return;}
    if(!this.motion.matches||!this.ready)this.wake();
  }
  fail(reason){this.failed=true;cancelAnimationFrame(this.raf);this.raf=0;this.host.classList.remove('infinity-ready');this.host.dataset.renderer='interactive-fallback';this.renderer.domElement.style.display='none';console.warn('Infinity renderer:',reason);this.onFailure?.(reason);}
}

if(typeof window!=='undefined')window.InfinityDirector=InfinityDirector;
