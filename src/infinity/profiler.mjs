const percentile=(values,p)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))]||0;};
const stats=values=>({mean:values.length?values.reduce((a,b)=>a+b,0)/values.length:0,p95:percentile(values,.95)});
export class FrameProfiler{
  constructor(renderer,host){
    this.renderer=renderer;this.host=host;this.mode=new URLSearchParams(location.search).get('profile');this.enabled=this.mode!==null;this.pending=[];this.pool=[];this.counter=0;
    if(!this.enabled)return;
    this.gl=renderer.getContext();this.extension=this.gl.getExtension('EXT_disjoint_timer_query_webgl2');
    const debug=this.gl.getExtension('WEBGL_debug_renderer_info');this.device=debug?this.gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'not exposed';
    if(this.mode==='shadow'){const render=renderer.shadowMap.render.bind(renderer.shadowMap);renderer.shadowMap.render=(...args)=>{this.beginGpu();try{return render(...args);}finally{this.endGpu();}};}this.reset(0);
  }
  reset(scene){if(!this.enabled)return;this.scene=scene;this.frames=[];this.update=[];this.submit=[];this.gpu=[];this.calls=[];this.triangles=[];this.points=[];this.warmup=30;this.host.dataset.profileReady='false';this.host.dataset.profileScene=String(scene);}
  begin(now){if(!this.enabled)return;this.started=performance.now();this.interval=this.last?now-this.last:0;this.last=now;this.counter++;this.poll();}
  renderStart(){if(!this.enabled)return;this.updated=performance.now();if(this.mode!=='shadow')this.beginGpu();}
  beginGpu(){if(this.extension&&this.counter%4===0&&this.pending.length<8){this.query=this.pool.pop()||this.gl.createQuery();this.gl.beginQuery(this.extension.TIME_ELAPSED_EXT,this.query);}}
  endGpu(){if(this.query){this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);this.pending.push({query:this.query,scene:this.scene});this.query=null;}}
  end(){
    if(!this.enabled)return;const ended=performance.now();
    this.endGpu();
    if(this.warmup-->0)return;
    const info=this.renderer.info.render;
    for(const [array,value] of [[this.frames,this.interval],[this.update,this.updated-this.started],[this.submit,ended-this.updated],[this.calls,info.calls],[this.triangles,info.triangles],[this.points,info.points]]){array.push(value);if(array.length>240)array.shift();}
    if(this.frames.length>=180&&this.counter%30===0){const report={scene:this.scene,samples:this.frames.length,device:this.device,viewport:[innerWidth,innerHeight],renderResolution:this.host.dataset.renderResolution,frameMs:stats(this.frames),cpuUpdateMs:stats(this.update),cpuRenderSubmitMs:stats(this.submit),gpuScope:this.mode==='shadow'?'shadow':'whole-frame',gpuMs:this.gpu.length?stats(this.gpu):null,drawCalls:stats(this.calls),triangles:stats(this.triangles),points:stats(this.points),textures:this.renderer.info.memory.textures,geometries:this.renderer.info.memory.geometries};this.host.dataset.profile=JSON.stringify(report);this.host.dataset.profileReady='true';}
  }
  poll(){if(!this.extension||!this.pending.length)return;const gl=this.gl;if(gl.getParameter(this.extension.GPU_DISJOINT_EXT)){for(const item of this.pending)gl.deleteQuery(item.query);this.pending.length=0;return;}while(this.pending.length&&gl.getQueryParameter(this.pending[0].query,gl.QUERY_RESULT_AVAILABLE)){const item=this.pending.shift(),ms=gl.getQueryParameter(item.query,gl.QUERY_RESULT)/1e6;this.pool.push(item.query);if(item.scene===this.scene){this.gpu.push(ms);if(this.gpu.length>60)this.gpu.shift();}}}
}
