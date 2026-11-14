/* Gold leaf that really erases. Coverage uses a small geometry grid, no GPU readback. */
(() => {
  'use strict';
  class GoldReveal {
    constructor(canvas,{onDust,onReveal}={}){
      this.canvas=canvas;this.host=canvas.parentElement;this.ctx=canvas.getContext('2d');this.onDust=onDust;this.onReveal=onReveal;this.revealed=false;this.down=false;this.pointer=null;this.last=null;this.lastDust=0;this.cells=new Set();this.grid=24;
      canvas.addEventListener('pointerdown',e=>{if(this.revealed||e.isPrimary===false)return;e.preventDefault();this.down=true;this.pointer=e.pointerId;this.last=null;this.host.classList.add('scratching');canvas.setPointerCapture?.(e.pointerId);this.erase(e);});
      canvas.addEventListener('pointermove',e=>{if(this.down&&this.pointer===e.pointerId)this.erase(e);});
      const stop=e=>{if(this.pointer!==e.pointerId)return;this.down=false;this.pointer=null;this.last=null;if(this.coverage()>=.32)this.reveal();};
      canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
      this.observer=new ResizeObserver(()=>this.draw());this.observer.observe(this.host);
    }
    draw(){
      if(this.revealed||!this.ctx)return;const r=this.host.getBoundingClientRect();if(r.width<10)return;
      if(this.width&&Math.abs(this.width-r.width)<1)return;
      const dpr=devicePixelRatio||1;this.width=r.width;this.height=r.height;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);
      const c=this.ctx;c.setTransform(dpr,0,0,dpr,0,0);const g=c.createLinearGradient(0,0,r.width,r.height);
      [[0,'#856334'],[.22,'#efdaa3'],[.4,'#ba9658'],[.55,'#fff0bd'],[.74,'#b28b4c'],[1,'#805a2d']].forEach(([stop,color])=>g.addColorStop(stop,color));c.fillStyle=g;c.fillRect(0,0,r.width,r.height);
      c.globalAlpha=.2;for(let x=-r.height;x<r.width+r.height;x+=4){c.beginPath();c.moveTo(x,0);c.lineTo(x+r.height,r.height);c.lineWidth=.5;c.strokeStyle=x%8?'#fff4c9':'#79532d';c.stroke();}c.globalAlpha=1;
      [.34,.4,.45].forEach((scale,i)=>{c.beginPath();c.setLineDash(i===1?[1,5]:[]);c.arc(r.width/2,r.height/2,r.width*scale,0,Math.PI*2);c.strokeStyle='#88633380';c.lineWidth=1;c.stroke();});c.setLineDash([]);
      for(let i=0;i<48;i++){const a=i*Math.PI/24,rad=r.width*.46;c.beginPath();c.moveTo(r.width/2+Math.cos(a)*rad,r.height/2+Math.sin(a)*rad);c.lineTo(r.width/2+Math.cos(a)*(rad-(i%4===0?9:4)),r.height/2+Math.sin(a)*(rad-(i%4===0?9:4)));c.stroke();}
      // Restore revealed cells after orientation/size changes instead of resetting the guest's work.
      c.globalCompositeOperation='destination-out';for(const cell of this.cells){const x=cell%this.grid,y=Math.floor(cell/this.grid);c.fillRect(x/this.grid*r.width,y/this.grid*r.height,r.width/this.grid+1,r.height/this.grid+1);}c.globalCompositeOperation='source-over';
    }
    mark(x,y,radius){for(let gy=0;gy<this.grid;gy++)for(let gx=0;gx<this.grid;gx++){const nx=(gx+.5)/this.grid,ny=(gy+.5)/this.grid;if((nx-.5)**2+(ny-.5)**2>.25)continue;if((nx-x)**2+(ny-y)**2<radius**2)this.cells.add(gy*this.grid+gx);}}
    coverage(){return this.cells.size/(Math.PI*(this.grid/2)**2);}
    erase(e){
      if(!this.ctx||this.revealed)return;const r=this.canvas.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));const brush=.095,c=this.ctx;
      c.globalCompositeOperation='destination-out';c.lineCap='round';c.lineJoin='round';c.lineWidth=r.width*brush*2;c.strokeStyle='#000';c.fillStyle='#000';
      if(this.last){c.beginPath();c.moveTo(this.last.x*r.width,this.last.y*r.height);c.lineTo(x*r.width,y*r.height);c.stroke();const distance=Math.hypot(x-this.last.x,y-this.last.y),steps=Math.max(1,Math.ceil(distance/brush));for(let i=1;i<=steps;i++)this.mark(this.last.x+(x-this.last.x)*i/steps,this.last.y+(y-this.last.y)*i/steps,brush);}
      c.beginPath();c.arc(x*r.width,y*r.height,brush*r.width,0,Math.PI*2);c.fill();this.mark(x,y,brush);this.last={x,y};
      if(performance.now()-this.lastDust>35){this.onDust?.(e.clientX,e.clientY);this.lastDust=performance.now();}if(this.coverage()>=.36)this.reveal();
    }
    reveal(){if(this.revealed)return;this.revealed=true;this.down=false;this.pointer=null;this.host.classList.add('revealed');this.canvas.setAttribute('aria-hidden','true');this.onReveal?.();}
    reset(){this.revealed=false;this.down=false;this.cells.clear();this.last=null;this.width=0;this.host.classList.remove('revealed','scratching');this.canvas.removeAttribute('aria-hidden');this.draw();}
  }
  window.GoldReveal=GoldReveal;
})();
