/* DOM/audio-graph tests complement the real browser viewport and interaction checks. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
async function setup({reduced=true,storage='[]',blocked=false}={}){
  const {Window}=await import('happy-dom');
  const win=new Window({url:'http://localhost:4187/',width:390,height:844,settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,enableJavaScriptEvaluation:true,suppressInsecureJavaScriptEnvironmentWarning:true}});
  const tasks=new Map(),frames=new Map(),errors=[],animations=[];let id=1,now=0;
  win.document.write(fs.readFileSync(path.join(root,'index.html'),'utf8'));
  win.matchMedia=query=>({matches:query.includes('reduced-motion')?reduced:query.includes('pointer'),addEventListener(){},removeEventListener(){}});
  win.requestAnimationFrame=fn=>{const n=id++;frames.set(n,fn);return n};win.cancelAnimationFrame=n=>frames.delete(n);
  win.setTimeout=(fn,delay=0)=>{const n=id++;tasks.set(n,{fn,time:now+delay});return n};win.clearTimeout=n=>tasks.delete(n);win.setInterval=()=>id++;
  Object.defineProperty(win,'performance',{value:{now:()=>now},configurable:true});
  win.ResizeObserver=class{constructor(fn){this.fn=fn}observe(){this.fn()}disconnect(){}};
  win.HTMLElement.prototype.getBoundingClientRect=function(){return {x:20,y:100,left:20,top:100,right:320,bottom:400,width:300,height:300,toJSON(){}}};
  win.HTMLElement.prototype.setPointerCapture=function(){};
  win.HTMLElement.prototype.animate=function(keyframes,options){const animation={element:this,keyframes,options,cancelled:false,cancel(){this.cancelled=true},finished:new Promise(()=>{})};animations.push(animation);return animation;};win.HTMLElement.prototype.getAnimations=function(){return animations.filter(a=>a.element===this&&!a.cancelled)};
  const context=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(obj,key)=>key in obj?obj[key]:()=>{}});
  win.HTMLCanvasElement.prototype.getContext=()=>context;
  const audio=win.document.querySelector('#soundtrack');audio.playCalls=0;audio.pauseCalls=0;
  audio.play=()=>{audio.playCalls++;return blocked?Promise.reject(new Error('blocked')):Promise.resolve()};audio.pause=()=>{audio.pauseCalls++};
  const audioCalls=[];let connections=0;
  const parameter=()=>({value:0,setValueAtTime(...args){audioCalls.push(['set',...args])},exponentialRampToValueAtTime(...args){audioCalls.push(['ramp',...args])},setTargetAtTime(...args){audioCalls.push(['target',...args])}});
  const node=()=>({gain:parameter(),frequency:parameter(),connect(){connections++},disconnect(){}});
  win.AudioContext=class{
    constructor(){this.state='running';this.currentTime=0;this.sampleRate=1000;this.destination={};}
    createGain(){return node()} createConvolver(){return node()}
    createAnalyser(){return {...node(),frequencyBinCount:128,getByteFrequencyData(array){array.fill(20)}}} createMediaElementSource(){return node()}
    createDynamicsCompressor(){return {...node(),threshold:parameter(),knee:parameter(),ratio:parameter(),attack:parameter(),release:parameter()}}
    createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length)}}
    createOscillator(){return {...node(),start(at){audioCalls.push(['start',at])},stop(at){audioCalls.push(['stop',at])}}}
    resume(){this.state='running';return Promise.resolve()} suspend(){this.state='suspended';return Promise.resolve()}
  };
  win.localStorage.setItem('invitewonderland-enchanted-wishes-v1',storage);
  win.addEventListener('error',e=>errors.push(e.message));
  for(const file of ['effects','audio','scratch','app'])win.eval(fs.readFileSync(path.join(root,'js',file+'.js'),'utf8'));
  function advance(ms){const end=now+ms;let loop=0;while(loop++<1000){const next=[...tasks].filter(([,v])=>v.time<=end).sort((a,b)=>a[1].time-b[1].time)[0];if(!next)break;now=next[1].time;tasks.delete(next[0]);next[1].fn();}now=end;}
  const $=selector=>win.document.querySelector(selector);
  function click(selector){$(selector).click()}
  function go(index){win.Invitation.go(index);advance(700);}
  function pointer(selector,type,x,y){$(selector).dispatchEvent(new win.PointerEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,pointerId:1,isPrimary:true}));}
  return {win,$,click,advance,go,pointer,audio,audioCalls,frames,errors,animations,get app(){return win.Invitation},close:()=>win.happyDOM.abort()};
}
test('one fullscreen journey, all assets local and identities preserved',async()=>{
  const h=await setup();assert.equal(h.win.document.querySelectorAll('.scene').length,8);assert.equal(h.win.document.querySelectorAll('.scene:not([hidden])').length,1);
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.doesNotMatch(html,/guest mode|reel mode|mode-selection/i);
  const ids=[...h.win.document.querySelectorAll('[id]')].map(e=>e.id);assert.equal(new Set(ids).size,ids.length);
  for(const el of h.win.document.querySelectorAll('[src],[href]')){const ref=el.getAttribute('src')||el.getAttribute('href');if(!/^(https?:|#)/.test(ref))assert.ok(fs.existsSync(path.join(root,ref.split('?')[0])),ref);}
  assert.match(h.$('#soundtrack').src,/A_Canopy_of_White_Roses/);assert.ok(h.$('#soundtrack').loop);assert.equal(h.$('#soundtrack').controls,false);assert.equal(h.audio.playCalls,0);assert.equal(h.app.go(2),false);assert.deepEqual(h.errors,[]);await h.close();
});
test('gesture entry, forward/back navigation, hidden-scene inertness and replay',async()=>{
  const h=await setup();h.click('#openPortal');h.advance(30);await Promise.resolve();assert.equal(h.app.state.scene,1);assert.equal(h.audio.playCalls,1);
  for(let i=2;i<8;i++){h.go(i);assert.equal(h.app.state.scene,i);assert.equal(h.win.document.querySelectorAll('.scene:not([hidden])').length,1);assert.ok(h.$('#scene-portal').inert);}
  h.click('#replay');assert.equal(h.app.state.scene,0);assert.equal(h.app.state.entered,false);assert.equal(h.$('#openPortal').disabled,false);assert.ok(h.$('#journeyNav').hidden);assert.equal(h.app.state.dateRevealed,false);h.click('#openPortal');h.advance(30);assert.equal(h.app.state.scene,1);assert.deepEqual(h.errors,[]);await h.close();
});
test('blocked audio never blocks entry, and the next gesture retries it',async()=>{
  const h=await setup({blocked:true});h.click('#openPortal');h.advance(30);await new Promise(setImmediate);assert.equal(h.app.state.scene,1);const calls=h.audio.playCalls;h.win.document.dispatchEvent(new h.win.PointerEvent('pointerdown',{bubbles:true}));await new Promise(setImmediate);assert.ok(h.audio.playCalls>calls);await h.close();
});
test('all eight original photos are explorable without a separate mode',async()=>{
  const h=await setup();h.click('#openPortal');h.advance(30);const photos=new Set([h.$('#memoryImage').src]);for(let i=0;i<7;i++){h.click('#memoryTouch');photos.add(h.$('#memoryImage').src)}assert.equal(photos.size,8);assert.match(h.$('#memoryCount').textContent,/08 \/ 08/);await h.close();
});
test('real scratch geometry, accessible reveal, and retained coverage on resize',async()=>{
  const h=await setup();h.click('#openPortal');h.advance(30);h.go(2);
  h.pointer('#goldCanvas','pointerdown',50,160);for(let y=160;y<=340;y+=35)for(let x=50;x<=290;x+=35)h.pointer('#goldCanvas','pointermove',x,y);h.pointer('#goldCanvas','pointerup',290,340);
  assert.equal(h.app.state.dateRevealed,true);assert.match(h.$('#dateTitle').textContent,/Written in/);h.app.scratch.reset();assert.equal(h.app.scratch.revealed,false);
  h.app.scratch.mark(.5,.5,.1);const before=h.app.scratch.cells.size;h.app.scratch.width=0;h.app.scratch.draw();assert.equal(h.app.scratch.cells.size,before);Object.defineProperty(h.win,'devicePixelRatio',{value:3,configurable:true});h.app.scratch.width=0;h.app.scratch.draw();assert.equal(h.$('#goldCanvas').width,900,'foil renders at the full native pixel density');h.app.replay();assert.match(h.$('#sceneAnnouncement').textContent,/Scene 1 of 8/);h.click('#openPortal');h.advance(30);h.go(2);h.click('#unveilDate');assert.equal(h.app.state.dateRevealed,true);await h.close();
});
test('three distinct worlds disclose their correct event details',async()=>{
  const h=await setup();h.click('#openPortal');h.advance(30);h.go(3);
  for(const [index,venue] of ['Aegean Terrace','Clifftop Gardens','The Grand Courtyard'].entries()){h.click(`[data-act="${index}"]`);assert.ok(h.$('#eventRevelation').hidden);h.click('#celebrationTouch');assert.ok(!h.$('#eventRevelation').hidden);assert.match(h.$('#eventPlace').textContent,new RegExp(venue));assert.equal(h.win.document.querySelectorAll('.local-mote').length,0,'reduced motion has no scene particles');}
  await h.close();
});
test('piano has thirteen notes, volume changes its audio gain, and playback is bounded',async()=>{
  const h=await setup();h.click('#openPortal');h.advance(30);h.go(4);assert.equal(h.win.document.querySelectorAll('.piano-key.white').length,8);assert.equal(h.win.document.querySelectorAll('.piano-key.black').length,5);
  h.app.playNote(60);assert.ok(h.audioCalls.some(call=>call[0]==='set'&&Math.abs(call[1]-261.625565)<.01));h.$('#pianoVolume').value='25';h.$('#pianoVolume').dispatchEvent(new h.win.Event('input'));assert.equal(h.app.audio.volume,.25);assert.equal(h.$('#volumeValue').textContent,'25%');
  for(let i=0;i<30;i++)h.app.playNote(60+i%13);assert.ok(h.app.audio.voices.length<=160);h.click('#playMelody');assert.ok(h.$('#playMelody').disabled);h.go(5);assert.equal(h.app.audio.melodyTimers.length,0);assert.equal(h.$('#playMelody').disabled,false);await h.close();
});
test('blessings are safely rendered, locally bounded, and handle malformed storage',async()=>{
  const h=await setup({storage:'{}'});assert.equal(h.app.state.wishes,0);h.click('#openPortal');h.advance(30);h.go(5);h.app.plant('<img src=x onerror=alert(1)>','<b>Guest</b>');assert.equal(h.$('#bloomMessage').querySelectorAll('img,b').length,0);assert.match(h.$('#bloomMessage p').textContent,/<img/);
  for(let i=0;i<10;i++)h.app.plant('Wish '+i,'Guest');assert.equal(h.app.state.wishes,7);assert.equal(h.win.document.querySelectorAll('.wish-flower').length,7);assert.equal(JSON.parse(h.win.localStorage.getItem('invitewonderland-enchanted-wishes-v1')).length,7);await h.close();
});

test('sound levels stay synchronised and piano ducking respects the score level',async()=>{
  const h=await setup();h.click('#openPortal');h.advance(30);await new Promise(setImmediate);h.go(4);
  h.click('#soundLevels');assert.equal(h.$('#soundLevels').getAttribute('aria-expanded'),'true');assert.ok(!h.$('#soundPanel').hidden);
  h.$('#musicLevel').value='10';h.$('#musicLevel').dispatchEvent(new h.win.Event('input'));assert.equal(h.audio.volume,.1);
  h.app.playNote(60);assert.ok(h.audio.volume<=.1,'ducking cannot raise a quiet score');h.advance(1100);assert.equal(h.audio.volume,.1);
  h.$('#musicLevel').value='0';h.$('#musicLevel').dispatchEvent(new h.win.Event('input'));h.app.playNote(64);assert.equal(h.audio.volume,0);
  h.$('#instrumentLevel').value='35';h.$('#instrumentLevel').dispatchEvent(new h.win.Event('input'));assert.equal(h.app.audio.volume,.35);assert.equal(h.$('#pianoVolume').value,'35');assert.equal(h.$('#volumeValue').textContent,'35%');
  h.click('#soundLevels');assert.ok(h.$('#soundPanel').hidden);await h.close();
});
test('promise, finale and replay reset correctly, and particles have a hard cap',async()=>{
  const h=await setup({reduced:false});h.click('#openPortal');h.advance(1900);h.go(6);h.click('#writePromise');assert.ok(h.app.state.promiseWritten);assert.ok(h.$('#scene-promise').classList.contains('written'));h.go(7);h.click('#lightSky');assert.ok(h.$('#scene-finale').classList.contains('sky-lit'));for(let i=0;i<20;i++)h.app.effects.burst(100,100,100);assert.ok(h.app.effects.particles.length<=6000);h.click('#replay');assert.equal(h.app.state.scene,0);assert.equal(h.app.state.promiseWritten,false);assert.equal(h.$('#scene-finale').classList.contains('sky-lit'),false);assert.equal(h.app.effects.particles.length,0);assert.deepEqual(h.errors,[]);await h.close();
});

test('form submission plants a wish and rapid navigation keeps the latest destination',async()=>{
  const h=await setup({reduced:false});h.click('#openPortal');h.advance(1100);h.app.go(2);h.app.go(3);h.advance(700);assert.equal(h.app.state.scene,3);assert.equal(h.win.document.querySelectorAll('.scene:not([hidden])').length,1);h.go(5);h.$('#wishName').value='A guest';h.$('#wishText').value='A lifetime of little wonders.';h.$('#wishForm').dispatchEvent(new h.win.Event('submit',{bubbles:true,cancelable:true}));assert.equal(h.$('#wishText').value,'');assert.match(h.$('#bloomMessage p').textContent,/A lifetime of little wonders/);assert.equal(h.app.state.wishes,1);h.app.replay();assert.equal(h.app.state.scene,0);assert.deepEqual(h.errors,[]);await h.close();
});


test('every transition hides outgoing content immediately and cancels interrupted animations',async()=>{
  const h=await setup({reduced:false});h.click('#openPortal');h.advance(1700);
  for(const index of [2,3,4,5,6,7,6,5,4,3,2,1,4,2]){
    const previous=h.app.state.scene;
    h.app.go(index);
    assert.equal(h.win.document.querySelectorAll('.scene:not([hidden])').length,1);
    assert.equal(h.win.document.querySelectorAll('.scene:not([inert])').length,1);
    assert.equal(h.win.document.querySelector('.scene:not([hidden])').dataset.scene,String(index));
    for(const delay of [15,190,245,120]){h.advance(delay);assert.equal(h.win.document.querySelectorAll('.scene:not([hidden])').length,1,'outgoing scene stays retired across the old fade boundary');}
    const rootAnimation=h.animations.findLast(a=>a.element.classList.contains('scene'));
    if(rootAnimation)assert.ok(rootAnimation.keyframes.every(frame=>!('transform' in frame)&&!('clipPath' in frame)),'GPU anchor parents never move during DOM transitions');
    if(index===2){h.click('#unveilDate');h.advance(80);}
    if(previous!==index)assert.ok(h.animations.filter(a=>a.element.closest('.scene')?.dataset.scene===String(previous)).every(a=>a.cancelled));
  }
  h.app.go(5);h.advance(30);h.app.go(4);h.advance(30);h.app.go(7);h.advance(600);assert.equal(h.app.state.scene,7);assert.equal(h.win.document.querySelectorAll('.scene:not([hidden])').length,1);
  h.app.replay();assert.ok(h.animations.every(a=>a.cancelled));assert.deepEqual(h.errors,[]);await h.close();
});

test('replay cancels delayed sound accents',async()=>{
  const h=await setup({reduced:false});h.click('#openPortal');h.advance(30);h.app.playNote(68);const before=h.audioCalls.filter(x=>x[0]==='start').length;assert.ok(before>0);h.app.replay();h.advance(400);assert.equal(h.audioCalls.filter(x=>x[0]==='start').length,before);assert.equal(h.app.audio.chimeTimers.length,0);assert.equal(h.app.audio.envelopes.size,0);assert.equal(h.app.audio.voices.length,0);await h.close();
});

test('leaving a held promise cancels pending completion, even if its old frame arrives',async()=>{
  const h=await setup({reduced:false});h.click('#openPortal');h.advance(1700);h.go(6);h.pointer('#writePromise','pointerdown',170,240);const pending=[...h.frames.values()];h.go(5);pending.forEach(callback=>callback(10000));assert.equal(h.app.state.promiseWritten,false);assert.equal(h.$('#writePromise').style.getPropertyValue('--hold'),'0');assert.equal(h.$('#scene-promise').hidden,true);await h.close();
});
