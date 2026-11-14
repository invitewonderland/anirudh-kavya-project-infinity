import * as T from 'three';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {FullScreenQuad} from 'three/addons/postprocessing/Pass.js';
import {FilmOutputPass} from './film-output.mjs';
import {filmShader} from './shaders.mjs';

// Opt-in GPU regression calibration. No timing freeze, readback or reference passes run for guests.
export async function auditFilmOutput(renderer){
  const width=128,height=128,previous=renderer.getRenderTarget(),oldColor=renderer.getClearColor(new T.Color()),oldAlpha=renderer.getClearAlpha(),oldAutoClear=renderer.autoClear;
  const targets=[],passes=[];
  const target=(hdr=false)=>{const t=new T.WebGLRenderTarget(width,height,{type:hdr?T.HalfFloatType:T.UnsignedByteType,depthBuffer:false,samples:hdr?4:0});targets.push(t);return t;};
  const reference=target(true),optimized=target(true),filmTarget=target(true),outReference=target(),outOptimized=target();
  const source=new T.ShaderMaterial({depthTest:false,depthWrite:false,vertexShader:filmShader.vertexShader,fragmentShader:`varying vec2 vUv;void main(){vec3 c=vec3(vUv.x*.8,vUv.y*.5,.07+vUv.x*.1);c+=vec3(5.,2.8,.9)*exp(-pow(length((vUv-vec2(.4,.6))*vec2(1.,1.3))*17.,2.));c+=vec3(.2,1.4,3.)*step(.72,vUv.x)*step(.64,vUv.y);gl_FragColor=vec4(c,1.);}`});
  const quad=new FullScreenQuad(source),bloom=new UnrealBloomPass(new T.Vector2(width,height),.58,.6,1.3),film=new ShaderPass(filmShader),output=new OutputPass(),fused=new FilmOutputPass(filmShader,bloom.renderTargetsHorizontal[0].texture);passes.push(bloom,film,output,fused);
  for(const pass of [film,fused]){pass.uniforms.uTime.value=11;pass.uniforms.uKick.value=.5;pass.uniforms.uEnergy.value=.25;}
  let left,right;const dispose=()=>{quad.dispose();source.dispose();passes.forEach(p=>p.dispose());targets.forEach(t=>t.dispose());};
  try{
    renderer.setRenderTarget(reference);quad.render(renderer);renderer.setRenderTarget(optimized);quad.render(renderer);
    bloom.render(renderer,null,reference);film.render(renderer,filmTarget,reference);output.render(renderer,outReference,filmTarget);
    bloom.blendMaterial.visible=false;bloom.render(renderer,null,optimized);fused.render(renderer,outOptimized,optimized);
    left=renderer.readRenderTargetPixelsAsync(outReference,0,0,width,height,new Uint8Array(width*height*4));
    right=renderer.readRenderTargetPixelsAsync(outOptimized,0,0,width,height,new Uint8Array(width*height*4));
  }catch(error){dispose();throw error;}finally{renderer.setRenderTarget(previous);renderer.setClearColor(oldColor,oldAlpha);renderer.autoClear=oldAutoClear;}
  try{
    const [a,b]=await Promise.all([left,right]);let max=0,sum=0,overOne=0;
    for(let i=0;i<a.length;i++){if(i%4===3)continue;const delta=Math.abs(a[i]-b[i]);max=Math.max(max,delta);sum+=delta;if(delta>1)overOne++;}
    return {width,height,channelSamples:width*height*3,maxChannelDifference:max,meanChannelDifference:sum/(width*height*3),channelsOverOne:overOne,unit:'8-bit output code values',reference:'Original UnrealBloomPass + Film ShaderPass + OutputPass',optimized:'Fused bloom + film + OutputPass',retained:{hdr:'HalfFloat',sceneSamples:4,bloomMips:bloom.nMips,exposure:renderer.toneMappingExposure}};
  }finally{dispose();}
}
