/* Infinity GPU director, with a functional Canvas fallback only when WebGL is unavailable. */
(() => {
  'use strict';
  class RoyalEffects {
    constructor(canvas){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.motion=matchMedia('(prefers-reduced-motion: reduce)');
      this.economy=false;
      this.limit=6000;this.particles=[];this.raf=0;this.last=0;this.scene=0;this.active=true;
      this.sprite=document.createElement('canvas');this.sprite.width=64;this.sprite.height=64;
      const c=this.sprite.getContext('2d');
      if(c){const g=c.createRadialGradient(32,32,0,32,32,30);g.addColorStop(0,'#fff8df');g.addColorStop(.1,'#ffe2a5');g.addColorStop(.3,'#dbb66b65');g.addColorStop(1,'#d6ad5a00');c.fillStyle=g;c.fillRect(0,0,64,64);c.fillStyle='#fff2cc';c.beginPath();c.moveTo(32,16);c.lineTo(35,29);c.lineTo(48,32);c.lineTo(35,35);c.lineTo(32,48);c.lineTo(29,35);c.lineTo(16,32);c.lineTo(29,29);c.fill();}
      try{if(window.InfinityDirector){this.director=new window.InfinityDirector(document.getElementById('world'));this.director.onFailure=()=>{this.director=null;this.resize();this.wake();};}}catch(error){console.warn('3D initialization unavailable; using interactive Canvas.',error);this.director=null;}
      this.resize();window.addEventListener('resize',()=>this.resize(),{passive:true});
      this.motion.addEventListener('change',()=>{this.clear();this.wake();});
      document.addEventListener('visibilitychange',()=>{this.active=!document.hidden;this.clear();if(this.active)this.wake();});this.wake();
    }
    resize(){this.width=innerWidth;this.height=window.visualViewport?.height||innerHeight;if(this.director)return;const dpr=devicePixelRatio||1;if(this.canvas.width===Math.round(this.width*dpr)&&this.canvas.height===Math.round(this.height*dpr))return;this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.height*dpr);this.ctx?.setTransform(dpr,0,0,dpr,0,0);}
    clear(){this.director?.clear();cancelAnimationFrame(this.raf);this.raf=0;this.particles.length=0;this.ctx?.clearRect(0,0,this.width,this.height);}
    setScene(index){this.particles.length=0;this.ctx?.clearRect(0,0,this.width,this.height);this.scene=index;this.director?.setScene(index);this.wake();}
    refreshLayout(){if(this.director){this.director.layoutDirty=true;this.director.wake();}}
    connectAudio(audio){this.director?.connectAudio(audio);}
    selectAct(index){this.director?.selectAct(index);}
    selectWish(index){this.director?.selectWish(index);}
    note(midi,key){if(this.director){this.director.note(midi,key);return;}const r=key?.getBoundingClientRect();if(r)this.burst(r.left+r.width/2,r.top,45,'note');}
    wake(){if(this.director&&!this.director.failed)return;if(!this.raf&&this.ctx&&this.active&&!this.motion.matches)this.raf=requestAnimationFrame(now=>this.paint(now));}
    burst(x,y,count=35,kind='gold',extra={}){
      if(this.motion.matches||!this.active||!this.ctx)return;
      if(this.director){this.director.emit(x,y,Math.max(500,count*24),kind,extra);return;}
      count=Math.min(count,this.limit-this.particles.length);
      for(let i=0;i<count;i++){
        const angle=Math.random()*Math.PI*2,speed=25+Math.random()*150;
        this.particles.push({x,y,vx:Math.cos(angle)*speed,vy:kind==='note'?-60-Math.random()*120:Math.sin(angle)*speed-25,age:0,life:1+Math.random()*1.8,size:kind==='dust'?2+Math.random()*4:7+Math.random()*15,spin:Math.random()*6,turn:Math.random()*3-1.5,kind,...extra});
      }this.wake();
    }
    glint(element,count=25,kind='gold'){if(this.director){const id=element.id;if(id==='openPortal')this.director.openPortal();else if(id==='dateRelic')this.director.revealDate();else if(id==='celebrationTouch')this.director.lightCelebration();else if(id==='plantLight')this.director.bloom();else if(id==='writePromise')this.director.writePromise();else if(id==='memoryTouch')this.director.updatePhoto(new URL(document.getElementById('memoryImage').src).pathname.split('/').slice(-3).join('/'));else{const r=element.getBoundingClientRect();this.director.emit(r.left+r.width/2,r.top+r.height/2,count*25,kind);}return;}const r=element.getBoundingClientRect();this.burst(r.left+r.width/2,r.top+r.height/2,count,kind);}
    trail(x,y){if(this.director){this.director.emit(x,y,1100,'dust',{speed:.8,life:1.8});return;}this.burst(x,y,6,'dust',{life:.6+Math.random()*.7,vy:35+Math.random()*70});}
    sky(){if(this.director){this.director.skyFinale();return;}for(let i=0;i<4;i++){const x=this.width*(.17+i*.22),y=this.height*(.17+(i%2)*.14);this.burst(x,y,this.economy?24:45,'gold',{life:2+Math.random()*2});}}
    paint(now){
      this.raf=0;if(!this.active||this.motion.matches)return;
      const interval=0;if(now-this.last<interval){this.wake();return;}
      const dt=Math.min((now-this.last)/1000||.04,.06);this.last=now;const ctx=this.ctx,w=this.width,h=this.height;
      ctx.clearRect(0,0,w,h);
      const ambient=[0,2,5,7].includes(this.scene)?240:70;
      for(let i=0;i<ambient;i++){const size=8+i%3*3,x=(i*.618034%1)*w+Math.sin(now*.00014+i)*17,y=((i*.381966%1)*h-now*.004*(1+i%3)+h*10)%h;ctx.globalAlpha=.13+(Math.sin(now*.001+i*4)+1)*.13;ctx.drawImage(this.sprite,x-size/2,y-size/2,size,size);}
      for(let i=this.particles.length-1;i>=0;i--){
        const p=this.particles[i];p.age+=dt;if(p.age>=p.life){this.particles.splice(i,1);continue;}
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-dt*.5);p.vy+=(p.kind==='note'?-8:25)*dt;
        const t=p.age/p.life;ctx.globalAlpha=Math.min(1,p.age*12)*(1-t);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.spin+p.turn*p.age);
        if(p.kind==='dust'){ctx.fillStyle='#f5cf85';ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.45);}
        else if(p.kind==='petal'){ctx.fillStyle='#f6d4bf';ctx.beginPath();ctx.ellipse(0,0,p.size*.35,p.size*.65,.4,0,Math.PI*2);ctx.fill();}
        else if(p.kind==='note'){ctx.fillStyle=p.color||'#f5d59e';ctx.font=`${p.size+15}px Georgia`;ctx.fillText('♪',-p.size/2,0);}
        else ctx.drawImage(this.sprite,-p.size/2,-p.size/2,p.size,p.size);
        ctx.restore();
      }ctx.globalAlpha=1;this.wake();
    }
  }
  window.RoyalEffects=RoyalEffects;
})();
