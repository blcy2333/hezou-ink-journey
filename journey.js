import * as T from './vendor/three.module.js';
export function makeJourney(){
 const group=new T.Group(),loader=new T.TextureLoader();
 const paper=new T.MeshBasicMaterial({color:0xe9e7d9});
 const underlay=new T.Mesh(new T.PlaneGeometry(26,280),paper);underlay.rotation.x=-Math.PI/2;underlay.position.set(0,-.08,-90);group.add(underlay);
 const waterMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{uTime:{value:0}},vertexShader:`
  varying vec2 vUv;
  uniform float uTime;
  void main(){
   vUv=uv;vec3 p=position;
   p.z+=.025*sin(position.y*.34+uTime*.75)+.012*sin(position.x*.82-position.y*.18+uTime*1.1);
   gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
  }`,fragmentShader:`
  varying vec2 vUv;
  uniform float uTime;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
  void main(){
   float t=uTime;
   float wash=noise(vec2(vUv.x*15.+sin(vUv.y*22.)*.4,vUv.y*46.-t*.045));
   float rippleA=.5+.5*sin(vUv.y*920.+sin(vUv.x*31.)*3.+t*2.1);
   float rippleB=.5+.5*sin(vUv.y*510.-vUv.x*19.-t*1.35);
   float glint=pow(max(0.,rippleA),18.)*.62+pow(max(0.,rippleB),24.)*.30;
   float bank=pow(abs(vUv.x-.5)*2.,2.7);
   float reflected=noise(vec2(vUv.x*38.,vUv.y*8.-t*.02));
   vec3 paper=vec3(.905,.905,.855),jade=vec3(.60,.68,.64),ink=vec3(.31,.39,.36);
   vec3 col=mix(paper,jade,.16+.15*wash);col=mix(col,ink,bank*(.08+.15*reflected));
   col=mix(col,vec3(.97,.95,.86),glint*(.10+.16*(1.-bank)));
   gl_FragColor=vec4(col,.92);
  }`});
 const water=new T.Mesh(new T.PlaneGeometry(25.8,280,30,180),waterMaterial);water.rotation.x=-Math.PI/2;water.position.set(0,0,-90);group.add(water);
 function painting(path,w,h,x,y,z,rotation=0){const map=loader.load(path);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;const material=new T.MeshBasicMaterial({map,side:T.DoubleSide,transparent:true,depthWrite:false,toneMapped:false});material.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 inkUV;').replace('#include <begin_vertex>','#include <begin_vertex>\ninkUV=uv;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 inkUV;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=smoothstep(0.,.04,inkUV.x)*smoothstep(0.,.04,1.-inkUV.x)*smoothstep(0.,.12,inkUV.y)*smoothstep(0.,.3,1.-inkUV.y);');};const o=new T.Mesh(new T.PlaneGeometry(w,h),material);o.position.set(x,y,z);o.rotation.y=rotation;group.add(o);return o;}
 painting('./assets/shore-left-v1.webp',220,30,-13,10.5,-70,Math.PI/2);
 painting('./assets/shore-right-v1.webp',220,30,13,10.5,-70,-Math.PI/2);
 painting('./assets/ink-canal-v1.webp',65,37,0,12,-192);
 const bridgeMap=loader.load('./assets/ink-bridge-v1.webp');bridgeMap.colorSpace=T.SRGBColorSpace;bridgeMap.anisotropy=8;
 const bridge=new T.Mesh(new T.PlaneGeometry(25.6,10.68),new T.MeshBasicMaterial({map:bridgeMap,transparent:true,alphaTest:.08,side:T.DoubleSide,toneMapped:false}));
 bridge.position.set(0,5.34,-64);group.add(bridge);
 // Fine ink ripples keep the open foreground legible without blocking the view.
 for(let i=0;i<120;i++){const x=Math.sin(i*12.7)*15,z=12-i*1.7,w=.3+(i%5)*.22;const g=new T.BufferGeometry().setFromPoints([new T.Vector3(x-w,.015,z),new T.Vector3(x+w,.015,z+.06)]);group.add(new T.Line(g,new T.LineBasicMaterial({color:0x7f928c,transparent:true,opacity:.16})));}
 // The bridge is part of the frontal ink painting. Keeping one painted bridge
 // avoids a second unmatched 3D silhouette and lets the camera travel safely.
 const landmarks=[{name:'山塘街 · 枕河人家',p:new T.Vector3(-18,6,-10)},{name:'园林 · 漏窗借景',p:new T.Vector3(18,7,-35)},{name:'虎丘 · 云岩塔影',p:new T.Vector3(-18,12,-86)},{name:'盘门 · 水陆城门',p:new T.Vector3(18,8,-108)}];
 return {group,landmarks,length:160,update(time){waterMaterial.uniforms.uTime.value=time;}};
}
