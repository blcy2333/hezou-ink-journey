import * as T from './vendor/three.module.js';

export async function loadCabinModel(){
  const [metaResponse,binaryResponse]=await Promise.all([
    fetch('./assets/cabin-interior-meta.json?v=19'),
    fetch('./assets/cabin-interior.bin?v=19')
  ]);
  if(!metaResponse.ok||!binaryResponse.ok)throw new Error('精细船舱模型加载失败');
  const data=await metaResponse.json(),buffer=await binaryResponse.arrayBuffer(),root=new T.Group(),items={};let lattice=null;
  const material=new T.MeshPhysicalMaterial({vertexColors:true,roughness:.43,metalness:0,clearcoat:.12,clearcoatRoughness:.66,side:T.DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 cabinP;').replace('#include <begin_vertex>','#include <begin_vertex>\ncabinP=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 cabinP;
float chash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float cnoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(chash(i),chash(i+vec3(1,0,0)),f.x),mix(chash(i+vec3(0,1,0)),chash(i+vec3(1,1,0)),f.x),f.y),mix(mix(chash(i+vec3(0,0,1)),chash(i+vec3(1,0,1)),f.x),mix(chash(i+vec3(0,1,1)),chash(i+vec3(1,1,1)),f.x),f.y),f.z);}
`).replace('#include <color_fragment>','#include <color_fragment>\nfloat grain=cnoise(vec3(cabinP.x*3.,cabinP.y*22.,cabinP.z*4.));float pore=cnoise(cabinP*155.);diffuseColor.rgb*=.80+.26*grain+.06*pore;').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+.13*(pore-.5),.28,.68);');
  };
  for(const [name,v] of Object.entries(data)){
    const g=new T.BufferGeometry();
    for(const attr of ['position','normal','color'])g.setAttribute(attr,new T.BufferAttribute(new Float32Array(buffer,v[attr].offset,v[attr].count),3));
    g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,v.index.offset,v.index.count),1));
    const mesh=new T.Mesh(g,material);mesh.castShadow=mesh.receiveShadow=true;
    if(v.origin){g.translate(...v.origin.map(n=>-n));const pivot=new T.Group();pivot.position.set(...v.origin);pivot.add(mesh);root.add(pivot);if(name==='lattice')lattice=pivot;else items[name]=pivot;}else root.add(mesh);
  }
  return {root,lattice,items,material};
}
