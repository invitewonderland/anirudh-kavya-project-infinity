import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
// Execute the same film sampling immediately before the existing ACES/sRGB output transform.
export class FilmOutputPass extends OutputPass{
  constructor(shader,bloomTexture){
    super();for(const name of ['uTime','uKick','uEnergy'])this.uniforms[name]={value:0};
    this.uniforms.uBloom={value:bloomTexture};
    const body=shader.fragmentShader.split('void main(){')[1].slice(0,-1).replace(/texture2D\(tDiffuse,([^)]*)\)/g,'filmInput($1)');
    this.material.fragmentShader=this.material.fragmentShader.replace('precision highp float;','precision highp float;\n uniform float uTime,uKick,uEnergy;').replace('uniform sampler2D tDiffuse;', 'uniform sampler2D tDiffuse;uniform sampler2D uBloom;\nvec4 filmInput(vec2 uv){return texture2D(tDiffuse,uv)+vec4(texture2D(uBloom,uv).rgb,0.);}') .replace('gl_FragColor = texture2D( tDiffuse, vUv );',body);
    // This final screen pass never writes to the composer's alternate MSAA target.
    this.needsSwap=false;
    this.material.name='CinematicFilmAndOutput';
  }
}
