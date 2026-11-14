/* One invitation. Eight connected scenes. No auto-tour, no recording mode, no scrolling. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const CONFIG={date:'2027-01-24T16:30:00+02:00',storage:'invitewonderland-enchanted-wishes-v1',holdDuration:650};
  const labels=['THE IMPOSSIBLE OPENING','THE ART OF US','A SECRET IN THE STARS','THREE WORLDS, ONE FOREVER','THE ROYAL PIANO','THE WISH GARDEN','THE TIMELESS PROMISE','INTO FOREVER'];
  const nextLabels=['Touch the light','A golden secret','The palace awaits','Follow the music','Plant a little love','One quiet promise','Into forever','Begin again'];
  const scenes=$$('.scene'),world=$('#world'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const fx=new RoyalEffects($('#magicCanvas')),audio=new RoyalAudio($('#soundtrack'));
  let current=0,entered=false,transitioning=false,transitionTimer=0,portalTimer=0,toastTimer=0,sceneEpoch=0;
  let memoryIndex=0,actIndex=0,holdFrame=0,holdStart=0,promiseWritten=false,holding=false,localTimer=0;
  const compact=false;
  fx.connectAudio(audio);
  function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3300);}
  const sceneAnimations=new Map();
  function cancelAnimations(root){for(const [element,animation] of sceneAnimations)if(root===element||root.contains(element)){animation.cancel();sceneAnimations.delete(element);}}
  function animate(el,keyframes,options={}){
    if(!el||motion.matches||!el.animate||el.closest('.scene[hidden]'))return;
    sceneAnimations.get(el)?.cancel();
    const animation=el.animate(keyframes,{duration:550,easing:'cubic-bezier(.16,1,.3,1)',fill:'both',...options});
    sceneAnimations.set(el,animation);
    animation.finished?.then(()=>{if(sceneAnimations.get(el)===animation){sceneAnimations.delete(el);animation.cancel();}},()=>{if(sceneAnimations.get(el)===animation)sceneAnimations.delete(el);});
    return animation;
  }
  function viewport(){const h=window.visualViewport?.height||innerHeight;world.style.setProperty('--view-height',`${Math.round(h)}px`);const focused=!!document.activeElement?.matches('#wishForm input,#wishForm textarea');world.classList.toggle('keyboard-open',focused&&innerHeight-h>100||focused&&h<530);fx.resize();}
  document.fonts?.ready.then(()=>{viewport();fx.refreshLayout();});
  window.visualViewport?.addEventListener('resize',viewport);window.addEventListener('resize',viewport,{passive:true});document.addEventListener('focusin',e=>{if(e.target.matches('#wishForm input,#wishForm textarea'))viewport();});document.addEventListener('focusout',()=>setTimeout(viewport,220));viewport();
  function finishTransition(epoch){if(epoch!==sceneEpoch)return;scenes.forEach((scene,i)=>{scene.hidden=i!==current;scene.inert=i!==current;scene.classList.toggle('is-active',i===current)});transitioning=false;world.dataset.transitioning='false';}
  function go(index,{force=false,focus=true}={}){
    const target=Math.max(0,Math.min(scenes.length-1,index));if(target===current)return false;
    if(!entered&&target>0)return false;
    if(transitioning){clearTimeout(transitionTimer);finishTransition(sceneEpoch);}
    const previous=current,from=scenes[previous],to=scenes[target];clearTimeout(transitionTimer);cancelHold();audio.stopChimes();cancelAnimations(from);cancelAnimations(to);
    if(previous===4){audio.stopMelody();$('#playMelody').disabled=false;$('#playMelody').innerHTML='Their melody <span>♫</span>';releaseKeys();}
    if(previous===3)clearLocal();
    current=target;sceneEpoch++;const epoch=sceneEpoch;transitioning=!motion.matches;
    // Commit DOM visibility atomically before measuring any GPU anchors. Outgoing text never shares the new world.
    scenes.forEach((scene,i)=>{scene.hidden=i!==target;scene.inert=i!==target;scene.classList.toggle('is-active',i===target);scene.scrollTop=0;scene.scrollLeft=0;});
    world.scrollTop=0;world.scrollLeft=0;$('#stage').scrollTop=0;document.body.scrollTop=0;
    world.dataset.scene=String(target);world.dataset.transitioning=String(transitioning);fx.setScene(target);
    $('#sceneCounter').textContent=`${String(target+1).padStart(2,'0')} / 08`;$('#sceneLabel').textContent=labels[target];$('#nextLabel').textContent=nextLabels[target];$('#journeyNav').hidden=target===0;
    $$('#sceneDots button').forEach((button,i)=>{if(i===target)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current')});
    $('#sceneAnnouncement').textContent=`Scene ${target+1} of 8. ${labels[target]}.`;
    if(focus)to.focus({preventScroll:true});
    if(motion.matches)finishTransition(epoch);
    else{
      // The environment carries the cinematic transformation; the touch stage stays geometrically stable.
      animate(to,[{opacity:0},{opacity:1}],{duration:550});
      transitionTimer=setTimeout(()=>finishTransition(epoch),560);
    }
    if(target===2)scratch.draw();if(target===5)renderWishes();if(target===7)fx.burst(innerWidth*.5,(window.visualViewport?.height||innerHeight)*.4,compact?32:55,'gold');
    const preload=scenes[target+1]?.querySelector('img');if(preload)preload.loading='eager';return true;
  }
  function openPortal(){if(entered)return;entered=true;audio.start();audio.chime('open');$('#openPortal').disabled=true;$('#scene-portal').classList.add('opening');fx.glint($('#openPortal'),compact?55:100);portalTimer=setTimeout(()=>go(1,{force:true}),motion.matches?20:1100);}
  $('#openPortal').addEventListener('click',openPortal);
  $('#nextScene').addEventListener('click',()=>{if(current<7)go(current+1)});$('#previousScene').addEventListener('click',()=>go(Math.max(1,current-1)));
  labels.forEach((label,index)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`Scene ${index+1}: ${label.toLowerCase()}`);button.addEventListener('click',()=>{if(index===0)replay();else go(index)});$('#sceneDots').append(button);});
  $('#soundtrack').addEventListener('error',()=>toast('The soundtrack could not load. The piano and invitation remain available.'));
  $('#fullscreenButton').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen({navigationUI:'hide'});else toast('This browser already fills the available screen.');}catch{toast('Fullscreen is unavailable here. The invitation still fills the browser.');}});
  document.addEventListener('fullscreenchange',()=>$('#fullscreenButton').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen'));
  document.addEventListener('pointerdown',()=>{if(entered&&!audio.playing&&!document.hidden)audio.start();},{passive:true});
  const memory=[
    ['02-royal-romance','Anirudh & Kavya','In every lifetime. In every universe. You.','TWO HEARTS. ONE BEAUTIFUL DESTINY.','Anirudh and Kavya smiling at each other beside the Aegean'],
    ['01-grand-arrival','The first note','And suddenly, everything felt like music.','THE BEGINNING OF OUR FOREVER','The couple walking hand in hand down the white stone steps'],
    ['03-love-beyond-words','A quiet promise','Not a thousand words. Just a lifetime of meaning.','SOME THINGS ARE ONLY FELT','The couple touching foreheads in a quiet intimate moment'],
    ['04-aegean-promise','Our golden hours','The world turned gold. And we stayed.','WHERE HOME BECAME A PERSON','The couple watching the Santorini sunset together'],
    ['05-royal-bride','Kavya','The light in every one of our tomorrows.','THE BRIDE','Kavya in her blush and champagne bridal lehenga'],
    ['06-royal-groom','Anirudh','The heart she would choose in every lifetime.','THE GROOM','Anirudh in his ivory and gold embroidered sherwani'],
    ['07-symphony-of-us','The symphony of us','Different notes. The most beautiful harmony.','A LITTLE DANCE INTO FOREVER','The couple dancing on a lantern-lit Santorini terrace'],
    ['08-into-forever','A thousand tomorrows','The most beautiful story is still unwritten.','AND THIS IS ONLY THE BEGINNING','The couple looking into the golden Aegean horizon']
  ];
  function paintMemory(){const [file,title,line,kicker,alt]=memory[memoryIndex];$('#memoryImage').src=`assets/images/${file}.webp`;$('#memoryImage').alt=alt;$('#memoryHaze').src=$('#memoryImage').src;if(memoryIndex===0)$('#memoryTitle').innerHTML='Anirudh <em>&</em> Kavya';else $('#memoryTitle').textContent=title;$('#memoryLine').textContent=line;$('#memoryKicker').textContent=kicker;$('#memoryCount').textContent=`${String(memoryIndex+1).padStart(2,'0')} / 08`;}
  function changeMemory(){memoryIndex=(memoryIndex+1)%memory.length;paintMemory();animate($('#memoryImage'),[{clipPath:'inset(0 50% 0 50%)',filter:'brightness(1.3)'},{clipPath:'inset(0 0 0 0)',filter:'brightness(1)'}],{duration:700});fx.glint($('#memoryTouch'),18);audio.chime('bloom');}
  $('#memoryTouch').addEventListener('click',changeMemory);
  let depthFrame=0;
  $('#scene-memories').addEventListener('pointermove',e=>{if(motion.matches||depthFrame)return;depthFrame=requestAnimationFrame(()=>{depthFrame=0;$('#scene-memories').style.setProperty('--depth-x',`${(e.clientX/innerWidth-.5)*10}px`);$('#scene-memories').style.setProperty('--depth-y',`${(e.clientY/innerHeight-.5)*8}px`);});},{passive:true});
  const scratch=new GoldReveal($('#goldCanvas'),{onDust:(x,y)=>fx.trail(x,y),onReveal:()=>{
    $('#unveilDate').textContent='Our forever begins here ✧';$('#unveilDate').disabled=true;$('#dateTitle').innerHTML='Written in<br><em>the stars.</em>';fx.glint($('#dateRelic'),compact?70:120);audio.chime('reveal');$('#sceneAnnouncement').textContent='The illustrative date is revealed: Sunday, 24 January 2027, Santorini.';animate($('.date-inscription'),[{opacity:.3,transform:'scale(.85)'},{opacity:1,transform:'scale(1)'}],{duration:1000});
  }});
  $('#unveilDate').addEventListener('click',()=>scratch.reveal());
  function countdown(){const diff=Math.max(0,Date.parse(CONFIG.date)-Date.now()),days=Math.floor(diff/86400000),hours=Math.floor(diff/3600000)%24;$('#dateCountdown').textContent=diff?`${days} days, ${hours} hours. A little nearer to forever.`:'The waiting becomes a memory. Forever begins.';}
  countdown();setInterval(()=>{if(!document.hidden&&current===2)countdown()},10000);
  const roseArt='<svg viewBox="0 0 110 125" aria-hidden="true"><defs><radialGradient id="rosePetal"><stop stop-color="#fffdf0"/><stop offset=".65" stop-color="#efd9c3"/><stop offset="1" stop-color="#b58971"/></radialGradient><radialGradient id="roseInner"><stop stop-color="#fff9dc"/><stop offset="1" stop-color="#d9ad89"/></radialGradient></defs><path d="M54 75Q45 95 56 121M52 105Q27 104 31 88Q48 86 52 105" fill="#657c55" stroke="#a2ac76" stroke-width="1"/><g fill="url(#rosePetal)" stroke="#fff3d7" stroke-opacity=".6" stroke-width=".7">'+Array.from({length:8},(_,i)=>'<path d="M55 64C24 62 14 31 33 17C48 6 72 23 55 64Z" transform="rotate('+i*45+' 55 54)"/>').join('')+'</g><g fill="url(#roseInner)" stroke="#fbe7c2" stroke-width=".6">'+Array.from({length:6},(_,i)=>'<path d="M55 59C36 60 32 38 43 31C55 25 68 40 55 59Z" transform="rotate('+i*60+' 55 53)"/>').join('')+'</g><path d="M45 56C38 44 59 39 63 49C66 61 48 66 45 56Z" fill="#e7c194" stroke="#fff0cb"/><path d="M49 54Q56 46 59 54Q56 61 49 54" fill="#ffedbd"/></svg>';
  const starArt='<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="starFacet"><stop stop-color="#fff5cc"/><stop offset=".45" stop-color="#c8a260"/><stop offset="1" stop-color="#fff0b8"/></linearGradient></defs><circle cx="60" cy="60" r="45" fill="#0b293544" stroke="#e6c88b" stroke-width=".7"/><circle cx="60" cy="60" r="52" fill="none" stroke="#e6c88b66" stroke-dasharray="1 5"/><path d="M60 5 72 47 112 60 72 72 60 115 48 72 8 60 48 47Z" fill="url(#starFacet)" stroke="#fff0c6"/><path d="M60 5V115M8 60H112M48 47 72 72M72 47 48 72" stroke="#99723b" stroke-opacity=".6"/><path d="M60 39 75 60 60 81 45 60Z" fill="#fff6d4" stroke="#ecd3a0"/></svg>';
  $('#plantLight span').innerHTML=roseArt.replaceAll('rosePetal','gardenPetal').replaceAll('roseInner','gardenInner');
  const acts=[
    {image:'welcome',kicker:'ACT I · THE FIRST NOTE',title:'A welcome<br><em>under the stars.</em>',cue:'LIGHT THE LANTERN',type:'lantern',date:'FRIDAY, 22 JANUARY 2027',time:'6:30 PM',place:'Aegean Terrace · Santorini',alt:'A candlelit terrace and roses above the sea at sunset'},
    {image:'ceremony',kicker:'ACT II · THE TIMELESS PROMISE',title:'The royal<br><em>wedding.</em>',cue:'TOUCH THE ROSE',type:'petal',date:'SUNDAY, 24 JANUARY 2027',time:'4:30 PM',place:'Clifftop Gardens · Santorini',alt:'White roses and candlelight along a palace wedding aisle'},
    {image:'moonlight',kicker:'ACT III · UNTIL THE STARS FADE',title:'A moonlit<br><em>symphony.</em>',cue:'WAKE THE STARS',type:'star',date:'SUNDAY, 24 JANUARY 2027',time:'7:30 PM',place:'The Grand Courtyard · Santorini',alt:'A moonlit courtyard beneath glowing crystal chandeliers'}
  ];
  function clearLocal(){clearTimeout(localTimer);$('#celebrationEffects').replaceChildren();}
  function selectAct(index){actIndex=index;fx.selectAct(index);const act=acts[index];clearLocal();$('#scene-celebrations').classList.remove('is-lit');$('#eventRevelation').hidden=true;$('#celebrationImage').src=`assets/scenes/${act.image}.webp`;$('#celebrationImage').alt=act.alt;$('#celebrationKicker').textContent=act.kicker;$('#celebrationTitle').innerHTML=act.title;$('#objectCue').textContent=act.cue;$('#celebrationTouch').className='enchanted-object '+(['lantern-object','rose-object','star-object'][index]);$('#objectArt').innerHTML=index===0?'<i class="lantern-handle"></i><i class="lantern-body"></i><i class="lantern-flame"></i>':index===1?roseArt:starArt;$('#celebrationTouch').setAttribute('aria-label',`${act.cue.toLowerCase()} and reveal ${act.place}`);$('#eventDate').textContent=act.date;$('#eventTime').textContent=act.time;$('#eventPlace').textContent=act.place;$$('[data-act]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));animate($('#celebrationImage'),[{opacity:.2,transform:'scale(1.06)'},{opacity:1,transform:'scale(1)'}],{duration:1000});}
  $$('[data-act]').forEach(button=>button.addEventListener('click',()=>selectAct(Number(button.dataset.act))));
  function lightCelebration(){clearLocal();$('#scene-celebrations').classList.add('is-lit');$('#eventRevelation').hidden=false;animate($('#eventRevelation'),[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}]);audio.chime('reveal');if(motion.matches)return;
    for(let i=0;i<(compact?12:22);i++){const p=document.createElement('i');p.className=`local-mote ${acts[actIndex].type}`;p.style.setProperty('--x',`${8+Math.random()*84}%`);p.style.setProperty('--drift',`${Math.random()*150-75}px`);p.style.setProperty('--duration',`${3+Math.random()*2}s`);p.style.setProperty('--delay',`${Math.random()*.9}s`);$('#celebrationEffects').append(p);}localTimer=setTimeout(clearLocal,6500);fx.glint($('#celebrationTouch'),20,actIndex===1?'petal':'gold');
  }
  $('#celebrationTouch').addEventListener('click',lightCelebration);
  const white=[60,62,64,65,67,69,71,72],black=[61,63,66,68,70],keyCodes=['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK'],blackCodes=['KeyW','KeyE','KeyT','KeyY','KeyU'];
  const activePointers=new Map();let keyHighlightTimers=new Map();
  function playNote(midi,key){const works=audio.note(midi);if(!works){toast('Piano sound is unavailable in this browser.');return;}if(key){clearTimeout(keyHighlightTimers.get(key));key.classList.add('pressed');keyHighlightTimers.set(key,setTimeout(()=>key.classList.remove('pressed'),230));const r=key.getBoundingClientRect();fx.note(midi,key);}$('#pianoHint').textContent=['A little light, only you could play.','Every note becomes a memory.','You are part of our symphony.'][midi%3];}
  function releaseKeys(){activePointers.clear();keyHighlightTimers.forEach(clearTimeout);keyHighlightTimers.clear();$$('.piano-key').forEach(key=>key.classList.remove('pressed'));}
  function addKey(midi,isBlack,index){const key=document.createElement('button');key.type='button';key.className=`piano-key ${isBlack?'black':'white'}`;key.dataset.midi=String(midi);key.setAttribute('aria-label',`Play ${['C','C sharp','D','D sharp','E','F','F sharp','G','G sharp','A','A sharp','B'][midi%12]}${Math.floor(midi/12)-1}`);if(isBlack){const before=white.indexOf(midi-1);key.style.left=`calc(${(before+1)/8*100}% - 3.7%)`;}else{const label=document.createElement('span');label.textContent=keyCodes[index].replace('Key','');key.append(label);}key.addEventListener('pointerdown',e=>{e.preventDefault();key.setPointerCapture?.(e.pointerId);activePointers.set(e.pointerId,midi);playNote(midi,key);});key.addEventListener('click',e=>{if(e.detail===0)playNote(midi,key)});$('#pianoKeys').append(key);}
  white.forEach((midi,index)=>addKey(midi,false,index));black.forEach((midi,index)=>addKey(midi,true,index));
  $('#pianoKeys').addEventListener('pointermove',e=>{if(!activePointers.has(e.pointerId))return;const key=document.elementFromPoint?.(e.clientX,e.clientY)?.closest('.piano-key');if(key&&Number(key.dataset.midi)!==activePointers.get(e.pointerId)){activePointers.set(e.pointerId,Number(key.dataset.midi));playNote(Number(key.dataset.midi),key);}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>$('#pianoKeys').addEventListener(type,e=>activePointers.delete(e.pointerId)));
  $('#pianoVolume').addEventListener('input',e=>{audio.setVolume(Number(e.target.value)/100);$('#volumeValue').textContent=`${e.target.value}%`;$('#instrumentLevel').value=e.target.value;$('#instrumentLevelValue').textContent=`${e.target.value}%`;});
  $('#soundLevels').addEventListener('click',()=>{const open=$('#soundPanel').hidden;$('#soundPanel').hidden=!open;$('#soundLevels').setAttribute('aria-expanded',String(open));});
  $('#musicLevel').addEventListener('input',e=>{audio.background=Number(e.target.value)/100;audio.track.volume=audio.background;$('#musicLevelValue').textContent=`${e.target.value}%`;});
  $('#instrumentLevel').addEventListener('input',e=>{audio.setVolume(Number(e.target.value)/100);$('#pianoVolume').value=e.target.value;$('#volumeValue').textContent=`${e.target.value}%`;$('#instrumentLevelValue').textContent=`${e.target.value}%`;});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#soundControls,#soundPanel')){$('#soundPanel').hidden=true;$('#soundLevels').setAttribute('aria-expanded','false');}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#soundPanel').hidden=true;$('#soundLevels').setAttribute('aria-expanded','false');}});
  $('#playMelody').addEventListener('click',()=>{const button=$('#playMelody');if(button.disabled)return;button.disabled=true;button.textContent='Their melody is playing…';audio.melody(midi=>{if(current===4)playNote(midi,$(`.piano-key[data-midi="${midi}"]`));},()=>{button.disabled=false;button.innerHTML='Their melody <span>♫</span>';});});
  function loadWishes(){try{const value=JSON.parse(localStorage.getItem(CONFIG.storage)||'[]');return Array.isArray(value)?value.filter(x=>x&&typeof x.message==='string'&&typeof x.name==='string').slice(-7):[];}catch{return[];}}
  let wishes=loadWishes();const positions=[[32,37],[69,25],[24,62],[78,53],[43,14],[53,43],[60,64]];
  function displayWish(wish,index){fx.selectWish(index);$('#bloomMessage p').textContent='“'+wish.message+'”';$('#bloomMessage small').textContent=wish.name?`WITH LOVE, ${wish.name.toUpperCase()} · SAVED ON THIS DEVICE`:'A LITTLE LIGHT, SAVED ON THIS DEVICE';$$('.wish-flower').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));animate($('#bloomMessage'),[{opacity:.2,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}]);}
  function renderWishes(){const layer=$('#wishFlowers');layer.replaceChildren();[...wishes].reverse().forEach((wish,i)=>{const button=document.createElement('button');button.type='button';button.className='wish-flower';button.textContent=i%2?'✧':'✿';button.style.setProperty('--x',`${positions[i][0]}%`);button.style.setProperty('--y',`${positions[i][1]}%`);button.setAttribute('aria-label',`Read the wish from ${wish.name||'a loving guest'}`);button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>displayWish(wish,i));layer.append(button);});$('#plantLight').style.opacity=wishes.length?'.4':'1';}
  function plant(message,name=''){const wish={message:message.slice(0,120),name:name.slice(0,32)};wishes.push(wish);wishes=wishes.slice(-7);let persisted=true;try{localStorage.setItem(CONFIG.storage,JSON.stringify(wishes))}catch{persisted=false;}renderWishes();displayWish(wish,0);if(!persisted)$('#bloomMessage small').textContent='A LITTLE LIGHT FOR THIS VISIT · STORAGE UNAVAILABLE';fx.glint($('#plantLight'),compact?40:75,'petal');audio.chime('bloom');animate($('#wishTree'),[{filter:'brightness(1.7)'},{filter:'brightness(1)'}],{duration:1200});}
  $('#wishForm').addEventListener('submit',e=>{e.preventDefault();const text=$('#wishText').value.trim();if(!text)return;plant(text,$('#wishName').value.trim());$('#wishText').value='';document.activeElement?.blur();viewport();});
  $('#plantLight').addEventListener('click',()=>plant('May your forever be full of little wonders.'));renderWishes();
  function writePromise(){if(promiseWritten)return;cancelHold();promiseWritten=true;$('#scene-promise').classList.add('written');$('#writePromise').style.setProperty('--hold','1');$('#writePromise small').textContent='A PROMISE, WRITTEN IN LIGHT';fx.glint($('#writePromise'),compact?55:95);audio.chime('reveal');$('#sceneAnnouncement').textContent='Their promise is written in light. In every lifetime, I would choose you.';animate($('#promiseTitle'),[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:1100});}
  function cancelHold(){cancelAnimationFrame(holdFrame);holdFrame=0;holding=false;if(!promiseWritten)$('#writePromise').style.setProperty('--hold','0');}
  function holdTick(now){if(!holding)return;const progress=Math.min(1,(now-holdStart)/CONFIG.holdDuration);$('#writePromise').style.setProperty('--hold',String(progress));if(progress>=1)writePromise();else holdFrame=requestAnimationFrame(holdTick);}
  $('#writePromise').addEventListener('pointerdown',e=>{if(promiseWritten)return;e.preventDefault();audio.unlock();holding=true;holdStart=performance.now();$('#writePromise').setPointerCapture?.(e.pointerId);holdFrame=requestAnimationFrame(holdTick);});
  $('#writePromise').addEventListener('pointerup',()=>{if(holding&&!promiseWritten)writePromise();else cancelHold()});$('#writePromise').addEventListener('pointercancel',cancelHold);$('#writePromise').addEventListener('click',()=>writePromise());
  $('#lightSky').addEventListener('click',()=>{$('#scene-finale').classList.add('sky-lit');fx.sky();audio.chime('finale');$('#lightSky').innerHTML='Our forever, written above <span>✧</span>';});
  function replay(){clearTimeout(portalTimer);clearTimeout(transitionTimer);scenes.forEach(cancelAnimations);cancelHold();clearLocal();audio.replay();fx.clear();entered=false;transitioning=false;sceneEpoch++;current=0;world.dataset.scene='0';finishTransition(sceneEpoch);$('#sceneCounter').textContent='01 / 08';$('#sceneLabel').textContent=labels[0];$('#nextLabel').textContent=nextLabels[0];$$('#sceneDots button').forEach(button=>button.removeAttribute('aria-current'));$('#scene-portal').classList.remove('opening');$('#openPortal').disabled=false;$('#journeyNav').hidden=true;scratch.reset();$('#dateTitle').innerHTML='Every forever<br>has <em>a secret.</em>';$('#unveilDate').disabled=false;$('#unveilDate').innerHTML='Or unveil with one touch <span>↗</span>';promiseWritten=false;$('#scene-promise').classList.remove('written');$('#writePromise').style.setProperty('--hold','0');$('#writePromise small').textContent='HOLD TO WRITE FOREVER';$('#scene-finale').classList.remove('sky-lit');$('#lightSky').innerHTML='Make the sky ours <span>✧</span>';selectAct(0);memoryIndex=0;paintMemory();fx.setScene(0);$('#sceneAnnouncement').textContent='Scene 1 of 8. THE IMPOSSIBLE OPENING.';$('#openPortal').focus({preventScroll:true});}
  $('#replay').addEventListener('click',replay);
  $('#shareExperience').addEventListener('click',async()=>{const data={title:'Anirudh & Kavya · An Enchanted Symphony',text:'Some love stories open entire worlds. Experience the magic by Invite Wonderland.'};if(location.protocol==='http:'||location.protocol==='https:')data.url=location.href;try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url||'https://www.instagram.com/invitewonderland');toast('The wonder is ready to share — link copied.');}}catch(e){if(e.name!=='AbortError')toast('Share the invitation URL from your browser.');}});
  let swipe=null;
  $('#stage').addEventListener('pointerdown',e=>{if(e.target.closest('[data-interactive],button,input,a')||e.isPrimary===false)return;swipe={x:e.clientX,y:e.clientY,id:e.pointerId};},{passive:true});
  $('#stage').addEventListener('pointerup',e=>{if(!swipe||swipe.id!==e.pointerId)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.5)return;if(current===0){openPortal();return;}go(current+(dx<0?1:-1));});$('#stage').addEventListener('pointercancel',()=>swipe=null);
  window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if(e.repeat)return;if(entered&&!audio.playing)audio.start();if(current===4){const ix=keyCodes.indexOf(e.code),bi=blackCodes.indexOf(e.code),midi=ix>=0?white[ix]:bi>=0?black[bi]:null;if(midi!==null){e.preventDefault();playNote(midi,$(`.piano-key[data-midi="${midi}"]`));return;}}if(e.key==='ArrowRight'&&current>0){e.preventDefault();go(current+1);}if(e.key==='ArrowLeft'&&current>1){e.preventDefault();go(current-1);}if(e.key==='Escape')cancelHold();});
  document.addEventListener('visibilitychange',()=>{world.classList.toggle('is-hidden',document.hidden);if(document.hidden){cancelHold();clearLocal();releaseKeys();$('#playMelody').disabled=false;$('#playMelody').innerHTML='Their melody <span>♫</span>';}});
  motion.addEventListener('change',()=>{clearLocal();cancelHold();finishTransition(sceneEpoch);});
  $$('img').forEach(img=>img.addEventListener('error',()=>{img.style.visibility='hidden';toast('A portrait could not load. The next wonder is still waiting.');},{once:true}));
  // A small read-only diagnostic surface is also used by the interaction tests.
  window.Invitation={go,open:openPortal,replay,revealDate:()=>scratch.reveal(),selectAct,lightCelebration,plant,writePromise,playNote:note=>playNote(note,$(`.piano-key[data-midi="${note}"]`)),get state(){return {scene:current,entered,transitioning,memory:memoryIndex,act:actIndex,wishes:wishes.length,dateRevealed:scratch.revealed,promiseWritten};},audio,effects:fx,scratch};
})();
