/* Gold leaf that really erases. Coverage uses a small geometry grid, no GPU readback. */
(() => {
  'use strict';
  class GoldReveal {
    constructor(canvas,{onDust,onReveal}={}){
      this.canvas=canvas;this.host=canvas.parentElement;this.ctx=canvas.getContext('2d');this.onDust=onDust;this.onReveal=onReveal;this.revealed=false;this.down=false;this.pointer=null;this.last=null;this.lastDust=0;this.cells=new Set();this.grid=24;this.strokes=[];
      canvas.addEventListener('pointerdown',e=>{if(this.revealed||e.isPrimary===false)return;e.preventDefault();this.down=true;this.pointer=e.pointerId;this.last=null;this.host.classList.add('scratching');canvas.setPointerCapture?.(e.pointerId);this.erase(e);});
      canvas.addEventListener('pointermove',e=>{if(this.down&&this.pointer===e.pointerId)this.erase(e);});
      const stop=e=>{if(this.pointer!==e.pointerId)return;this.down=false;this.pointer=null;this.last=null;if(this.coverage()>=.32)this.reveal();};
      canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);canvas.addEventListener('lostpointercapture',()=>this.cancel());
      this.observer=new ResizeObserver(()=>this.draw());this.observer.observe(this.host);
    }
    draw(){
      if(this.revealed||!this.ctx)return;const r=this.host.getBoundingClientRect();if(r.width<10)return;
      const dpr=devicePixelRatio||1;if(this.width&&Math.abs(this.width-r.width)<1&&Math.abs(this.height-r.height)<1&&this.dpr===dpr)return;
      this.dpr=dpr;this.width=r.width;this.height=r.height;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);
      const c=this.ctx;c.setTransform(dpr,0,0,dpr,0,0);const g=c.createLinearGradient(0,0,r.width,r.height);
      [[0,'#856334'],[.22,'#efdaa3'],[.4,'#ba9658'],[.55,'#fff0bd'],[.74,'#b28b4c'],[1,'#805a2d']].forEach(([stop,color])=>g.addColorStop(stop,color));c.fillStyle=g;c.fillRect(0,0,r.width,r.height);
      c.globalAlpha=.2;for(let x=-r.height;x<r.width+r.height;x+=4){c.beginPath();c.moveTo(x,0);c.lineTo(x+r.height,r.height);c.lineWidth=.5;c.strokeStyle=x%8?'#fff4c9':'#79532d';c.stroke();}c.globalAlpha=1;
      [.34,.4,.45].forEach((scale,i)=>{c.beginPath();c.setLineDash(i===1?[1,5]:[]);c.arc(r.width/2,r.height/2,r.width*scale,0,Math.PI*2);c.strokeStyle='#88633380';c.lineWidth=1;c.stroke();});c.setLineDash([]);
      for(let i=0;i<48;i++){const a=i*Math.PI/24,rad=r.width*.46;c.beginPath();c.moveTo(r.width/2+Math.cos(a)*rad,r.height/2+Math.sin(a)*rad);c.lineTo(r.width/2+Math.cos(a)*(rad-(i%4===0?9:4)),r.height/2+Math.sin(a)*(rad-(i%4===0?9:4)));c.stroke();}
      // Replay smooth normalized brush paths; the coverage grid never becomes visible square cutouts.
      c.globalCompositeOperation='destination-out';c.lineCap='round';c.lineJoin='round';c.strokeStyle='#000';c.fillStyle='#000';
      for(const stroke of this.strokes){c.lineWidth=r.width*stroke.brush*2;if(stroke.from){c.beginPath();c.moveTo(stroke.from.x*r.width,stroke.from.y*r.height);c.lineTo(stroke.x*r.width,stroke.y*r.height);c.stroke();}c.beginPath();c.arc(stroke.x*r.width,stroke.y*r.height,stroke.brush*r.width,0,Math.PI*2);c.fill();}
      c.globalCompositeOperation='source-over';
    }
    mark(x,y,radius){const loX=Math.max(0,Math.floor((x-radius)*this.grid)),hiX=Math.min(this.grid-1,Math.ceil((x+radius)*this.grid)),loY=Math.max(0,Math.floor((y-radius)*this.grid)),hiY=Math.min(this.grid-1,Math.ceil((y+radius)*this.grid));for(let gy=loY;gy<=hiY;gy++)for(let gx=loX;gx<=hiX;gx++){const nx=(gx+.5)/this.grid,ny=(gy+.5)/this.grid;if((nx-.5)**2+(ny-.5)**2>.25)continue;if((nx-x)**2+(ny-y)**2<radius**2)this.cells.add(gy*this.grid+gx);}}
    coverage(){return this.cells.size/(Math.PI*(this.grid/2)**2);}
    erase(e){
      if(!this.ctx||this.revealed)return;const r=this.canvas.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));const brush=.095,c=this.ctx;
      c.globalCompositeOperation='destination-out';c.lineCap='round';c.lineJoin='round';c.lineWidth=r.width*brush*2;c.strokeStyle='#000';c.fillStyle='#000';
      if(this.last){c.beginPath();c.moveTo(this.last.x*r.width,this.last.y*r.height);c.lineTo(x*r.width,y*r.height);c.stroke();const distance=Math.hypot(x-this.last.x,y-this.last.y),steps=Math.max(1,Math.ceil(distance/brush));for(let i=1;i<=steps;i++)this.mark(this.last.x+(x-this.last.x)*i/steps,this.last.y+(y-this.last.y)*i/steps,brush);}
      c.beginPath();c.arc(x*r.width,y*r.height,brush*r.width,0,Math.PI*2);c.fill();this.mark(x,y,brush);this.strokes.push({x,y,brush,from:this.last});this.last={x,y};
      if(performance.now()-this.lastDust>35){this.onDust?.(e.clientX,e.clientY);this.lastDust=performance.now();}if(this.coverage()>=.36)this.reveal();
    }
    cancel(){const pointer=this.pointer;this.down=false;this.pointer=null;this.last=null;if(pointer!=null){try{this.canvas.releasePointerCapture?.(pointer)}catch{}}}
    reveal(){if(this.revealed)return;this.cancel();this.revealed=true;this.host.classList.add('revealed');this.canvas.setAttribute('aria-hidden','true');this.onReveal?.();}
    reset(){this.cancel();this.revealed=false;this.cells.clear();this.strokes.length=0;this.width=0;this.host.classList.remove('revealed','scratching');this.canvas.removeAttribute('aria-hidden');this.draw();}
  }
  window.GoldReveal=GoldReveal;
})();
