/* A gesture-unlocked soundtrack and a polyphonic, compressed, reverberant piano. */
(() => {
  'use strict';
  class RoyalAudio {
    constructor(track){this.track=track;this.volume=.8;this.background=.38;this.started=false;this.playing=false;this.ctx=null;this.voices=[];this.melodyTimers=[];this.chimeTimers=[];this.envelopes=new Map();this.starting=false;this.epoch=0;this.duckTimer=0;this.wasPlaying=false;this.track.volume=this.background;
      track.addEventListener('pause',()=>{this.playing=false;});
      document.addEventListener('visibilitychange',()=>{if(document.hidden){this.wasPlaying=!track.paused;track.pause();this.stopChimes();this.stopMelody();this.stopEffects();this.ctx?.suspend().catch(()=>{});}else if(this.started&&this.wasPlaying)this.start();});
    }
    async start(){this.started=true;this.unlock();if(this.starting||document.hidden)return;this.starting=true;const epoch=this.epoch;try{await this.track.play();if(this.started&&epoch===this.epoch)this.playing=true;}catch{this.playing=false;}finally{this.starting=false;}}
    unlock(){
      const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return false;
      try{
        if(!this.ctx){
          this.ctx=new Context();const ctx=this.ctx;this.master=ctx.createGain();this.master.gain.value=this.volume*.9;
          this.compressor=ctx.createDynamicsCompressor();this.compressor.threshold.value=-20;this.compressor.knee.value=18;this.compressor.ratio.value=4;this.compressor.attack.value=.004;this.compressor.release.value=.2;
          this.master.connect(this.compressor);
          this.analyser=ctx.createAnalyser();this.analyser.fftSize=256;this.analyser.smoothingTimeConstant=.8;this.spectrum=new Uint8Array(this.analyser.frequencyBinCount);this.compressor.connect(this.analyser);this.analyser.connect(ctx.destination);
          this.scoreSource=ctx.createMediaElementSource(this.track);this.scoreSource.connect(this.analyser);
          this.reverb=ctx.createConvolver();const length=Math.floor(ctx.sampleRate*1.45),impulse=ctx.createBuffer(2,length,ctx.sampleRate);
          for(let c=0;c<2;c++){const data=impulse.getChannelData(c);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/length,3)*.22;}
          this.reverb.buffer=impulse;this.wet=ctx.createGain();this.wet.gain.value=.2;this.reverb.connect(this.wet);this.wet.connect(this.master);
        }
        if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return true;
      }catch{return false;}
    }
    setVolume(value){this.volume=Math.max(0,Math.min(1,value));if(this.master)this.master.gain.setTargetAtTime(this.volume*.9,this.ctx.currentTime,.025);}
    note(midi,velocity=.85){
      if(!this.unlock()||document.hidden)return false;
      const ctx=this.ctx,at=ctx.currentTime,frequency=440*Math.pow(2,(midi-69)/12);
      while(this.voices.length>155){const old=this.voices.shift();try{old.stop()}catch{}}
      [{ratio:1,level:.29,type:'triangle',decay:2.4},{ratio:2.003,level:.125,type:'sine',decay:1.65},{ratio:3.01,level:.046,type:'sine',decay:1.1},{ratio:4.02,level:.023,type:'sine',decay:.86},{ratio:6.01,level:.009,type:'sine',decay:.6}].forEach(part=>{
        const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=part.type;osc.frequency.setValueAtTime(frequency*part.ratio,at);
        gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,part.level*velocity),at+.009);gain.gain.exponentialRampToValueAtTime(.0001,at+part.decay);
        osc.connect(gain);gain.connect(this.master);gain.connect(this.reverb);this.voices.push(osc);this.envelopes.set(osc,gain);osc.start(at);osc.stop(at+part.decay+.03);osc.onended=()=>{this.envelopes.delete(osc);osc.disconnect();gain.disconnect();this.voices=this.voices.filter(v=>v!==osc);};
      });
      if(this.playing){this.track.volume=this.background*.47;clearTimeout(this.duckTimer);this.duckTimer=setTimeout(()=>{this.track.volume=this.background},1050);}return true;
    }
    cinematic(kind){
      if(!this.ctx?.createBufferSource||document.hidden)return;
      const ctx=this.ctx,at=ctx.currentTime,duration=kind==='finale'?4.8:kind==='open'?2.5:2.;
      const pitches=kind==='finale'?[48,55,60,64,71]:kind==='open'?[48,55,64]:[60,67,71];
      pitches.forEach((midi,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();osc.type='sawtooth';osc.frequency.value=440*Math.pow(2,(midi-69)/12);osc.detune.value=(i-1)*2.5;filter.type='lowpass';filter.frequency.value=900+i*210;filter.Q.value=.4;gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.025,at+.14+i*.035);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(filter);filter.connect(gain);gain.connect(this.master);gain.connect(this.reverb);this.envelopes.set(osc,gain);osc.start(at);osc.stop(at+duration+.05);osc.onended=()=>{this.envelopes.delete(osc);osc.disconnect();gain.disconnect();filter.disconnect();};});
      if(kind==='open'||kind==='reveal'){const source=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter(),buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.7),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.sin(i/data.length*Math.PI);source.buffer=buffer;filter.type='bandpass';filter.frequency.setValueAtTime(350,at);filter.frequency.exponentialRampToValueAtTime(1800,at+.45);filter.Q.value=.7;gain.gain.value=.019;source.connect(filter);filter.connect(gain);gain.connect(this.master);gain.connect(this.reverb);this.envelopes.set(source,gain);source.start(at);source.stop(at+.72);source.onended=()=>{this.envelopes.delete(source);source.disconnect();gain.disconnect();filter.disconnect();};}
    }
    chime(kind='reveal'){if(!this.ctx||document.hidden)return;if(kind!=='bloom')this.cinematic(kind);const notes=kind==='bloom'?[72,76,79]:kind==='open'?[60,67,72]:[72,76,83];notes.forEach((note,i)=>{const timer=setTimeout(()=>{this.chimeTimers=this.chimeTimers.filter(id=>id!==timer);if(!document.hidden&&this.started)this.note(note,.38)},i*110);this.chimeTimers.push(timer);});}
    melody(onNote,onEnd){this.stopMelody();if(!this.unlock()){onEnd?.();return false;}const notes=[64,67,72,71,69,67,64,65,69,72,71,67,64,60];notes.forEach((n,i)=>this.melodyTimers.push(setTimeout(()=>onNote(n),i*215)));this.melodyTimers.push(setTimeout(()=>{this.melodyTimers=[];onEnd?.()},notes.length*215+200));return true;}
    stopEffects(){if(!this.ctx)return;const at=this.ctx.currentTime;for(const [source,gain] of this.envelopes){gain.gain.cancelScheduledValues?.(at);gain.gain.setTargetAtTime(.0001,at,.015);try{source.stop(at+.06)}catch{}}this.envelopes.clear();this.voices=[];}
    stopChimes(){this.chimeTimers.forEach(clearTimeout);this.chimeTimers=[];}
    stopMelody(){this.melodyTimers.forEach(clearTimeout);this.melodyTimers=[];}
    replay(){this.epoch++;this.stopChimes();this.stopMelody();this.stopEffects();clearTimeout(this.duckTimer);this.track.pause();this.track.currentTime=0;this.track.volume=this.background;this.playing=false;this.started=false;}
  }
  window.RoyalAudio=RoyalAudio;
})();
