/* Prepare full-capacity stochastic trajectories away from the input/render thread. */
self.onmessage=event=>{
  const count=event.data.count,values=new Float32Array(count*9),tau=Math.PI*2;
  for(let i=0;i<count;i++){
    const j=i*9,a=Math.random()*tau,z=Math.random()*2-1,r=Math.sqrt(1-z*z),speed=.25+Math.random();
    values[j]=Math.random()-.5;values[j+1]=Math.random()-.5;values[j+2]=Math.random()-.5;
    values[j+3]=Math.cos(a)*r*speed;values[j+4]=Math.sin(a)*r*speed;values[j+5]=z*speed;
    values[j+6]=Math.random()*.16;values[j+7]=1.3+Math.random()*2.1;values[j+8]=Math.random()*tau;
  }
  self.postMessage(values.buffer,[values.buffer]);self.close();
};
