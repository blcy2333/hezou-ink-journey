import * as T from './vendor/three.module.js';
export async function loadCarvedBoat(){
 const [response,binary]=await Promise.all([fetch('./assets/carved-boat-meta.json?v=5'),fetch('./assets/carved-boat.bin?v=5')]);if(!response.ok||!binary.ok)throw new Error('模型加载失败');const data=await response.json(),buffer=await binary.arrayBuffer();const root=new T.Group();const shutters=[],figures={};
 const material=new T.MeshPhysicalMaterial({vertexColors:true,roughness:.49,metalness:0,clearcoat:.07,clearcoatRoughness:.6,side:T.DoubleSide});
 material.onBeforeCompile=s=>{
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 stoneP;').replace('#include <begin_vertex>','#include <begin_vertex>\nstoneP=position;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 stoneP;
float shash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float snoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(shash(i),shash(i+vec3(1,0,0)),f.x),mix(shash(i+vec3(0,1,0)),shash(i+vec3(1,1,0)),f.x),f.y),mix(mix(shash(i+vec3(0,0,1)),shash(i+vec3(1,0,1)),f.x),mix(shash(i+vec3(0,1,1)),shash(i+vec3(1,1,1)),f.x),f.y),f.z);}
`).replace('#include <color_fragment>','#include <color_fragment>\nfloat patina=snoise(stoneP*8.);float pores=snoise(stoneP*180.);diffuseColor.rgb*=.65+.28*patina+.13*pores;').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+.18*(pores-.5),.28,.7);');
 };
 for(const [name,v] of Object.entries(data)){
  const g=new T.BufferGeometry();for(const attr of ['position','normal','color'])g.setAttribute(attr,new T.BufferAttribute(new Float32Array(buffer,v[attr].offset,v[attr].count),3));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,v.index.offset,v.index.count),1));const m=new T.Mesh(g,material);m.castShadow=true;m.receiveShadow=true;
  if(v.hinge){const pivot=new T.Group();pivot.position.set(...v.hinge);g.translate(...v.hinge.map(n=>-n));pivot.add(m);root.add(pivot);pivot.userData.side=v.side;shutters.push(pivot);}else if(v.origin){g.translate(...v.origin.map(n=>-n));const pivot=new T.Group();pivot.position.set(...v.origin);pivot.add(m);root.add(pivot);figures[name]=m;}else root.add(m);
 }
 root.userData.shutters=shutters;root.userData.figures=figures;return root;
}
