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
 const plaster=new T.MeshStandardMaterial({color:0xe4dfd0,roughness:.92});
 const paleStone=new T.MeshStandardMaterial({color:0xb8b4a7,roughness:.98});
 const inkRoof=new T.MeshStandardMaterial({color:0x313a37,roughness:.90});
 const oldBrick=new T.MeshStandardMaterial({color:0x7b6a58,roughness:.98});
 const cinnabar=new T.MeshStandardMaterial({color:0x8d4334,roughness:.88});
 const darkOpening=new T.MeshBasicMaterial({color:0x27302e});
 const edgeInk=new T.LineBasicMaterial({color:0x3b4641,transparent:true,opacity:.34});
 function block(parent,size,pos,mat=plaster,rotZ=0){const geometry=new T.BoxGeometry(...size),o=new T.Mesh(geometry,mat);o.position.set(...pos);o.rotation.z=rotZ;const outline=new T.LineSegments(new T.EdgesGeometry(geometry,22),edgeInk);o.add(outline);parent.add(o);return o;}
 function arch(parent,x,y,z,r,mat=paleStone,thick=.16){const o=new T.Mesh(new T.TorusGeometry(r,thick,8,48,Math.PI),mat);o.position.set(x,y,z);o.rotation.y=Math.PI/2;parent.add(o);return o;}
 function addShantang(){
  const g=new T.Group();g.position.set(-11.9,0,-20);g.scale.setScalar(.62);
  // White walls, black eaves and a stone arch identify the canal street from
  // a distance while retaining the restrained ink-wash palette.
  for(const [z,w,h] of [[-3.0,2.7,3.2],[-.2,2.4,3.8],[2.4,2.5,3.0]]){
   block(g,[1.9,h,w],[0,h/2,z],plaster);block(g,[2.15,.16,w+.42],[0,h+.03,z],inkRoof);
   block(g,[.045,.95,.58],[.98,1.55,z],darkOpening);block(g,[.06,.08,.66],[1.01,1.55,z],inkRoof);
  }
  arch(g,1.05,1.08,4.75,1.55,paleStone,.19);block(g,[.55,.23,3.55],[1.05,1.03,4.75],paleStone);
  for(const z of [-3.7,-2.4,-.8,.45,1.75,3.0]){const lantern=new T.Mesh(new T.SphereGeometry(.12,10,7),cinnabar);lantern.scale.y=1.35;lantern.position.set(1.08,2.35,z);g.add(lantern);}
  group.add(g);return g;
 }
 function addGarden(){
  const g=new T.Group();g.position.set(11.8,0,-48);g.scale.setScalar(.64);
  // A moon gate and waterside pavilion provide an unmistakable classical
  // garden silhouette without turning the river scene into a theme park.
  const gate=new T.Mesh(new T.TorusGeometry(1.35,.20,10,56),paleStone);gate.rotation.y=Math.PI/2;gate.position.set(-1.0,1.55,-2.0);g.add(gate);
  block(g,[.55,3.5,3.9],[-.03,1.75,-2.0],plaster);block(g,[.12,2.65,2.65],[-.34,1.55,-2.0],darkOpening);
  for(const z of [.2,2.65])for(const x of [-.95,.35])block(g,[.12,2.8,.12],[x,1.45,z],oldBrick);
  block(g,[1.65,.16,3.55],[-.30,2.95,1.42],inkRoof);block(g,[1.40,.12,4.10],[-.30,3.12,1.42],inkRoof);
  block(g,[1.0,.36,4.4],[-.25,.18,1.42],paleStone);
  group.add(g);return g;
 }
 function addTigerHill(){
  const g=new T.Group();g.position.set(-11.7,0,-88);g.rotation.z=.035;g.scale.setScalar(.72);
  block(g,[2.25,.48,3.0],[0,.24,0],paleStone);
  let y=.48;
  for(let level=0;level<7;level++){
   const width=2.35-level*.19,height=.64-level*.025;
   block(g,[1.25,height,width],[0,y+height/2,0],oldBrick);
   block(g,[1.60,.13,width+.62],[0,y+height+.03,0],inkRoof);
   for(const z of [-width*.27,width*.27])block(g,[.04,.22,.18],[-.64,y+height*.55,z],darkOpening);
   y+=height+.18;
  }
  block(g,[.12,.72,.12],[0,y+.28,0],inkRoof);group.add(g);return g;
 }
 function addPanmen(){
  const g=new T.Group();g.position.set(11.75,0,-124);g.scale.setScalar(.63);
  // Twin water openings sit below a compact gate tower; the dark recesses
  // stay behind the masonry so the structure reads clearly from the boat.
  block(g,[1.35,2.65,6.0],[0,1.32,0],oldBrick);
  for(const z of [-1.65,1.65]){
   block(g,[.05,1.2,1.56],[-.69,.62,z],darkOpening);const a=arch(g,-.72,1.18,z,.78,paleStone,.15);a.material=darkOpening;
   arch(g,-.78,1.20,z,.93,paleStone,.16);
  }
  block(g,[1.55,.18,6.5],[0,2.70,0],inkRoof);block(g,[1.28,1.35,3.9],[0,3.44,0],plaster);
  for(const z of [-1.15,0,1.15])block(g,[.04,.52,.38],[-.67,3.46,z],darkOpening);
  block(g,[1.55,.15,4.65],[0,4.17,0],inkRoof);block(g,[1.30,.13,5.15],[0,4.34,0],inkRoof);
  group.add(g);return g;
 }
 // The four landmarks are painted directly into the two continuous shore
 // scrolls above. No separate billboard is placed in front of the scenery.
 const bridgeMap=loader.load('./assets/ink-bridge-v1.webp');bridgeMap.colorSpace=T.SRGBColorSpace;bridgeMap.anisotropy=8;
 const bridge=new T.Mesh(new T.PlaneGeometry(25.6,10.68),new T.MeshBasicMaterial({map:bridgeMap,transparent:true,alphaTest:.08,side:T.DoubleSide,toneMapped:false}));
 bridge.position.set(0,5.34,-64);group.add(bridge);
 // Fine ink ripples keep the open foreground legible without blocking the view.
 for(let i=0;i<120;i++){const x=Math.sin(i*12.7)*15,z=12-i*1.7,w=.3+(i%5)*.22;const g=new T.BufferGeometry().setFromPoints([new T.Vector3(x-w,.015,z),new T.Vector3(x+w,.015,z+.06)]);group.add(new T.Line(g,new T.LineBasicMaterial({color:0x7f928c,transparent:true,opacity:.16})));}
 // Trigger points follow the landmarks already painted into the shore scrolls.
 const landmarks=[
  {id:'shantang',name:'七里山塘',label:'山塘街 · 白公堤',side:'左岸',at:20,history:'唐宝历二年（825），白居易任苏州刺史时疏浚山塘河。河街相依，渐成今日“七里山塘”。'},
  {id:'panmen',name:'盘门',label:'水陆城门 · 瑞光塔影',side:'右岸',at:57,history:'盘门把水门与陆门并列在同一座城防中。今天所见主体经元代重建、明清续修，是苏州水城格局的缩影。'},
  {id:'tiger',name:'虎丘塔',label:'云岩寺塔 · 苏州斜塔',side:'左岸',at:70,history:'云岩寺塔始建于五代后周，七级八面。历经千年后塔身微斜，成为虎丘最醒目的城市轮廓。'},
  {id:'garden',name:'拙政园',label:'苏州园林 · 借景入画',side:'左岸',at:142,history:'明正德四年（1509），王献臣退居苏州营建拙政园。全园以水为中心，把山林、亭榭与远景收进一墙之内。'}
 ];
 return {group,landmarks,length:160,update(time){waterMaterial.uniforms.uTime.value=time;}};
}
