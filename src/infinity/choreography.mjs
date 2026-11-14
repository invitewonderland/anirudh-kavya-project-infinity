// Wall-clock choreography keeps the curtain and its handoff together after a slow first frame.
export const OPENING_DURATION=1500;
export function smoothArrival(value){const t=Math.max(0,Math.min(1,value));return t*t*t*(t*(t*6-15)+10);}
export function openingState(now,started,reduced=false){
  const progress=reduced?1:smoothArrival((now-started)/OPENING_DURATION);
  return {progress,seamOpacity:Math.pow(1-progress,3),seamWidth:1+Math.sin(progress*Math.PI)*1.8};
}

// Re-distribute existing vertices into intentional formations, rather than an additive point-source flash.
// No particle is removed. Existing tint, spin, lifetime and stochastic variation are retained.
export function shapeEmission(arrays,{capacity,start,count,x,y,z,width,height,formation,birthWindow=.16,time}){
  if(!formation)return;
  const p=arrays.position,v=arrays.aVelocity,life=arrays.aLife;
  for(let i=0;i<count;i++){
    const index=(start+i)%capacity,k=index*3,l=index*4;
    const vx=v[k],vy=v[k+1],vz=v[k+2],norm=Math.max(.001,Math.sqrt(vx*vx+vy*vy)),c=vx/norm,s=vy/norm;
    const scatter=Math.max(0,Math.min(1,(life[l]-time)/.16));
    if(formation==='portal'){
      const scale=width/5.4;
      if(i%3){const dx=c*2.64;p[k]=dx*scale;p[k+1]=(2.5+Math.sqrt(Math.max(0,7.05-dx*dx)))*height/13.5;}
      else{p[k]=(i%2?1:-1)*2.67*scale;p[k+1]=(scatter*8.4-5.8)*height/13.5;}
      p[k+2]=z+vz*.12;v[k]=Math.sign(p[k])*(.3+Math.abs(vx)*.24);v[k+1]=.18+Math.abs(vy)*.22;v[k+2]=vz*.3;
    }else if(formation==='orbit'){
      const radius=.9+scatter*.22;p[k]=x+c*width*radius;p[k+1]=y+s*height*radius;p[k+2]=z+vz*.15;
      v[k]=c*.38-s*.26;v[k+1]=s*.38+c*.26;v[k+2]=vz*.24;
    }else if(formation==='garden'){
      p[k]=x+c*width*(.2+scatter*.8);p[k+1]=y+s*height*(.2+scatter*.8);p[k+2]=z+vz*.3;v[k]*=.4;v[k+1]=Math.abs(vy)*.45+.35;
    }else if(formation==='memory'){
      const side=i%4;if(side<2){p[k]=x+(side?-1:1)*width;p[k+1]=y+(scatter-.5)*height*2;}else{p[k]=x+(scatter-.5)*width*2;p[k+1]=y+(side===2?1:-1)*height;}
      p[k+2]=z+.08+vz*.04;v[k]*=.07;v[k+1]*=.07;v[k+2]*=.08;
    }else if(formation==='petalfall'){
      p[k]=x+(life[l+2]/(Math.PI*2)-.5)*width*1.9;p[k+1]=y+(scatter-.2)*height*1.4;p[k+2]=z+vz*.35;
      v[k]*=.22;v[k+1]=-.2-Math.abs(vy)*.25;v[k+2]*=.25;
    }else if(formation==='arrival'){
      p[k]=x+(life[l+2]/(Math.PI*2)-.5)*width*.8;p[k+1]=y+(scatter-.5)*height*.24;p[k+2]=z+vz*.2;v[k]*=.25;v[k+1]=Math.abs(vy)*.3+.2;v[k+2]*=.2;
    }else if(formation==='sky'){
      p[k]=x+c*width*scatter;p[k+1]=y+s*height*scatter;p[k+2]=z+vz*.3;v[k]*=.75;v[k+1]=Math.abs(vy)*.65+.65;
    }
    life[l]=time+Math.max(0,Math.min(1,(life[l]-time)/.16))*birthWindow;
  }
}
