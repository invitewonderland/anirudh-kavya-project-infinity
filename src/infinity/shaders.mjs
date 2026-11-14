export const noise = `
float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float n=0.,a=.5;for(int i=0;i<4;i++){n+=a*noise3(p);p=p*2.03+3.1;a*=.5;}return n;}
`;
export const backgroundVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const backgroundFragment=`
uniform sampler2D uFrom,uTo;uniform float uFromScene,uScene,uProgress,uTime,uAspect,uFromAspect,uToAspect,uEnergy,uOpen;uniform vec2 uPointer;
varying vec2 vUv;
${noise}
vec2 coverUV(vec2 uv,float ar){vec2 ratio=vec2(min(uAspect/ar,1.),min(ar/uAspect,1.));return (uv-.5)*ratio+.5;}
vec3 photograph(sampler2D image,vec2 uv,float ar,float s){
 vec3 raw=texture2D(image,uv).rgb;float outside=0.;
 vec2 q=coverUV(uv,ar);
 if(uAspect>1.2 && s>5.5){float imageWidth=ar/uAspect;q=vec2((uv.x-.07)/imageWidth,uv.y);outside=(q.x<0.||q.x>1.)?1.:0.;q=clamp(q,0.,1.);}
 if(s>2.5 && s<4.5){float water=1.-smoothstep(.0,.4,uv.y);q.x+=sin(q.y*90.+uTime*.65)*.0018*water;q.y+=sin(q.x*45.-uTime*.45)*.001*water;}
 vec3 c=texture2D(image,q).rgb;
 if(s>.5&&s<1.5){c=texture2D(image,q+vec2(.035,0)).rgb+texture2D(image,q+vec2(-.035,0)).rgb+texture2D(image,q+vec2(0,.035)).rgb+texture2D(image,q+vec2(0,-.035)).rgb+texture2D(image,q+vec2(.025,.025)).rgb+texture2D(image,q+vec2(-.025,.025)).rgb+texture2D(image,q+vec2(.025,-.025)).rgb+texture2D(image,q+vec2(-.025,-.025)).rgb;c=c*.125*.09+vec3(.003,.016,.022);}
 else if(s>1.5&&s<2.5){float n=fbm(vec3(uv*4.,uTime*.055));c=mix(vec3(.007,.035,.062),vec3(.055,.22,.23),n);c+=vec3(.07,.042,.012)*pow(max(0.,1.-length((uv-vec2(.52,.5))*vec2(uAspect,1.))*1.3),4.);}
 else if(s>4.5&&s<5.5){c*=.045;c+=vec3(.008,.055,.037)*fbm(vec3(uv*7.,uTime*.04));}
 else if(s>3.5&&s<4.5)c*=.09;
 else if(s>5.5){float lower=1.-smoothstep(.25,.83,uv.y);float right=uAspect>1.2?smoothstep(.22,.67,uv.x):0.;c*=mix(.88,.10,max(lower,right));}
 else c*=mix(.25,.9,smoothstep(.05,.7,uv.y));
 float ray=pow(max(0.,sin(atan((uv.x-.5)*uAspect,(1.12-uv.y))*29.+sin(uTime*.17)*.4)),28.);
 float haze=fbm(vec3(uv*3.,uTime*.07));
 c+=vec3(1.,.69,.28)*ray*.045*haze*(.5+uEnergy);
 float vignette=smoothstep(.85,.18,length((uv-.5)*vec2(.85,1.)));c*=mix(.58,1.04,vignette);
 c=mix(c,vec3(.012,.045,.06),outside);if(s<-.5)c=raw;
 return c;
}
void main(){vec2 uv=vUv;
 if(uProgress>=.999999){gl_FragColor=vec4(photograph(uTo,uv,uToAspect,uScene),1.);return;}
 if(uProgress<=0.){gl_FragColor=vec4(photograph(uFrom,uv,uFromAspect,uFromScene),1.);return;}
 float n=fbm(vec3(uv*5.,uTime*.17));float travel=distance((uv-vec2(.5,.49))*vec2(uAspect,1.),vec2(0));float edge=uProgress*1.7-travel+n*.15;
 float mask=uProgress<=.001?0.:uProgress>=.999?1.:smoothstep(-.055,.055,edge);
 vec3 a=photograph(uFrom,uv,uFromAspect,uFromScene),b=photograph(uTo,uv,uToAspect,uScene);vec3 col=mix(a,b,mask);
 float filament=(1.-smoothstep(.0,.045,abs(edge)))*step(.01,uProgress)*step(uProgress,.99);
 col+=vec3(2.7,1.6,.45)*filament*(.3+.7*n);
 gl_FragColor=vec4(col,1.);
}`;
export const atmosphereVertex=`
attribute vec4 aSeed;uniform float uTime,uScene,uEnergy,uDpr,uHeight;uniform vec2 uWorld;uniform vec3 uAnchor;varying vec3 vColor;varying float vAlpha;varying float vSeed;
void main(){float t=aSeed.x*6.2831853;float travel=uTime*(.025+aSeed.y*.015);vec3 p;
 if(uScene>1.5&&uScene<2.5){float r=2.5+aSeed.y*2.8;p=vec3(cos(t+travel)*r,sin(t+travel)*r*.9,(aSeed.z-.5)*5.)+uAnchor;}
 else if(uScene>3.5&&uScene<4.5){float a=t+travel*2.;float r=1.5+aSeed.y*4.;p=vec3(cos(a)*r,sin(a*2.)*.9+aSeed.z*2.,sin(a)*2.5-2.8)+uAnchor;p.y+=sin(a*5.+uTime)*uEnergy*.4;}
 else if(uScene>4.5&&uScene<5.5){p=vec3(sin(t*3.+travel)*(.5+aSeed.y*3.),(aSeed.z-.5)*7.,cos(t*2.-travel)*2.-2.)+uAnchor;}
 else if(uScene>6.5){float x=16.*pow(sin(t),3.);float y=13.*cos(t)-5.*cos(2.*t)-2.*cos(3.*t)-cos(4.*t);float scale=.16+aSeed.y*.025;p=vec3(x*scale,y*scale,(aSeed.z-.5)*5.)+uAnchor;p+=vec3(sin(uTime*.2+t)*.07,cos(uTime*.3+t)*.07,0.);}
 else{p=vec3((aSeed.x-.5)*uWorld.x*1.9,mod(aSeed.y*uWorld.y+uTime*(.025+aSeed.z*.04),uWorld.y)-uWorld.y*.5,-2.-aSeed.z*12.);p.x+=sin(p.y*.5+uTime*.12+aSeed.w*6.)*.25;}
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 float twinkle=.18+.82*pow(.5+.5*sin(uTime*(.4+aSeed.z)+aSeed.w*50.),6.);
 gl_PointSize=clamp((1.2+aSeed.w*3.4)*uDpr*(17./max(3.,-mv.z)),1.,25.*uDpr);
 vColor=mix(vec3(.48,.8,.79),vec3(1.,.73,.35),aSeed.w);vAlpha=twinkle*(.009+aSeed.z*.024+step(.989,aSeed.w)*.18);vSeed=aSeed.w;
}`;
export const atmosphereFragment=`varying vec3 vColor;varying float vAlpha;varying float vSeed;
void main(){vec2 p=gl_PointCoord-.5;float d=length(p);if(d>.5)discard;float core=exp(-d*d*90.);float star=pow(max(0.,1.-abs(p.x)*14.),5.)*exp(-abs(p.y)*9.)+pow(max(0.,1.-abs(p.y)*14.),5.)*exp(-abs(p.x)*9.);float a=(core+star*.35)*vAlpha;gl_FragColor=vec4(vColor*(1.+core*2.),a);}`;
export const burstVertex=`
attribute vec3 aVelocity;attribute vec4 aLife;attribute vec3 aTint;uniform float uTime,uDpr;varying float vAlpha,vKind,vSpin;varying vec3 vColor;
void main(){float age=uTime-aLife.x;float t=age/max(.001,aLife.y);vAlpha=0.;vKind=aLife.w;vSpin=age*2.+aLife.z;
 if(age<0.||t>1.){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}
 vec3 p=position+aVelocity*age;float buoyancy=vKind>1.5&&vKind<2.5?.42:-.32;p.y+=buoyancy*age*age;p.x+=sin(age*2.5+aLife.z)*.15*t;p.z+=sin(age*2.+aLife.z)*.25;
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((vKind<.5?3.4:vKind<1.5?7.5:vKind<2.5?10.:4.5)*uDpr*(16./max(2.,-mv.z))*(1.-t*.35),1.,90.*uDpr);
 vAlpha=smoothstep(0.,.055,t)*pow(1.-t,1.2);vColor=aTint;
}`;
export const burstFragment=`varying float vAlpha,vKind,vSpin;varying vec3 vColor;
void main(){vec2 p=gl_PointCoord-.5;float c=cos(vSpin),s=sin(vSpin);p=mat2(c,-s,s,c)*p;float alpha;
 if(vKind<.5){alpha=1.-smoothstep(.15,.2,max(abs(p.x)*1.3,abs(p.y)*2.8));}
 else if(vKind<1.5){vec2 q=p*vec2(1.4,1.);alpha=(1.-smoothstep(.35,.4,length(q)))*(.65+.35*cos(p.x*7.));}
 else if(vKind<2.5){float wing=sin(vSpin*5.)*.2+.72;vec2 q=p*vec2(1./wing,1.);float shape=pow(q.x*q.x+q.y*q.y-.11,3.)-q.x*q.x*q.y*q.y*q.y;alpha=1.-smoothstep(-.004,.004,shape);alpha*=1.-smoothstep(.4,.5,length(p));}
 else{float d=length(p);alpha=exp(-d*d*55.)+.3*pow(max(0.,1.-abs(p.x)*15.),4.)*exp(-abs(p.y)*9.)+.3*pow(max(0.,1.-abs(p.y)*15.),4.)*exp(-abs(p.x)*9.);}
 if(alpha<.01)discard;gl_FragColor=vec4(vColor*1.8,alpha*vAlpha*(vKind>1.5&&vKind<2.5?.055:.16));
}`;
export const ribbonVertex=`
attribute float aT;attribute float aSide;uniform float uTime,uScene,uIndex,uEnergy,uKick,uScale;uniform vec3 uAnchor;varying float vT,vSide;
vec3 curve(float t){float a=t*6.2831853+uTime*.1+uIndex*.7;vec3 p;
 if(uScene>5.5){float h=t*6.2831853;p=vec3(16.*pow(sin(h),3.),13.*cos(h)-5.*cos(2.*h)-2.*cos(3.*h)-cos(4.*h),0.)*.17;p.z=sin(a*2.)*.5;}
 else if(uScene>4.5){p=vec3(sin(a*2.)*(1.+uIndex*.08),cos(a)*2.6,sin(a)*1.2);}
 else if(uScene>3.5){p=vec3(cos(a)*(2.4+uIndex*.12),sin(a*2.)*(.5+uEnergy)+.5,sin(a)*1.6);}
 else if(uScene>1.5&&uScene<2.5){float radius=2.7+uIndex*.035;p=vec3(cos(a)*radius,sin(a)*radius,sin(a*2.)*.18);}
 else{float radius=2.4+uIndex*.045;p=vec3(cos(a)*radius,sin(a)*radius*(.7+uIndex*.01),sin(a*2.)*.6);}
 p*=uScale;p+=uAnchor;p.y+=sin(a*5.+uTime*.9)*(.025+uEnergy*.1);return p;}
void main(){vec3 p=curve(aT),q=curve(aT+.001);vec3 tangent=normalize(q-p);vec3 side=normalize(cross(tangent,vec3(0,0,1)));float width=(.006+uKick*.025+uEnergy*.02)*sin(aT*3.14159);p+=side*aSide*width;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);vT=aT;vSide=aSide;}
`;
export const ribbonFragment=`uniform float uTime,uIndex,uOpacity,uEnergy,uProgress;varying float vT,vSide;void main(){float wave=.4+.6*pow(.5+.5*sin(vT*36.-uTime*1.3+uIndex),3.);vec3 c=mix(vec3(.7,1.15,1.1),vec3(2.9,1.7,.5),.5+.5*sin(uIndex*.7));gl_FragColor=vec4(c*(1.+uEnergy),pow(max(0.,1.-abs(vSide)),.45)*wave*uOpacity*(1.-smoothstep(uProgress,uProgress+.025,vT)));}`;
export const filmShader={
 uniforms:{tDiffuse:{value:null},uTime:{value:0},uKick:{value:0},uEnergy:{value:0}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform float uTime,uKick,uEnergy;varying vec2 vUv;void main(){vec2 p=vUv-.5;vec2 aberration=p*length(p)*(.0003+uKick*.002);vec3 c=texture2D(tDiffuse,vUv).rgb;c.r=texture2D(tDiffuse,vUv+aberration).r;c.b=texture2D(tDiffuse,vUv-aberration).b;float grain=fract(sin(dot(vUv+uTime*.003,vec2(12.9898,78.233)))*43758.5453)-.5;c+=grain*.0018;gl_FragColor=vec4(c,1.);}`
};
