import {makeCabinLife,fitWalkingFigure} from './cabin-life.js?v=32';
import {makeCabinRefinement,refineCabinObjects} from './cabin-refinement.js?v=32';
import {moveCabin} from './navigation.js?v=40';
import * as T from './vendor/three.module.js';
import {loadCarvedBoat} from './carved-model.js?v=5';
import {loadCabinModel} from './cabin-model.js?v=40';
import {makeJourney} from './journey.js?v=41';
import {makeRiverBow} from './river-bow.js?v=27';
import {makeCabinVista} from './cabin-vista.js?v=21';
import {makeCabinObjects} from './cabin-objects.js?v=40';
import {makeCarvedScreen} from './carved-interior.js?v=14';
import {makeCabinDetail} from './cabin-detail.js?v=15';
const $=id=>document.getElementById(id), canvas=$('world');
const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0xeeeadd);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
const scene=new T.Scene();scene.fog=new T.FogExp2(0xeeeadd,.019);const camera=new T.PerspectiveCamera(innerWidth<700?67:48,innerWidth/innerHeight,.05,240);scene.add(camera);
const ambient=new T.HemisphereLight(0xfff9e6,0x667567,2.5);scene.add(ambient);const sun=new T.DirectionalLight(0xffedcd,3);sun.position.set(-8,20,9);scene.add(sun);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.5,far:40});sun.shadow.bias=-.0003;sun.shadow.normalBias=.012;
const river=new T.Group(), boat=new T.Group(), cabin=new T.Group();scene.add(river,boat,cabin);cabin.visible=false;
const riverBow=makeRiverBow();scene.add(riverBow.group);
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.95,...extra});
const ink=mat(0x333e39), plaster=mat(0xe8e5d6), stone=mat(0xa4a79a), wood=mat(0x805133), darkWood=mat(0x4b3023), paleWood=mat(0xbd8b57), red=mat(0xa95642), green=mat(0x849e87);
function grain(wooden){const c=document.createElement('canvas');c.width=c.height=256;const q=c.getContext('2d');q.fillStyle=wooden?'#e0c2a0':'#fffdf4';q.fillRect(0,0,256,256);for(let i=0;i<600;i++){let x=Math.random()*256,y=Math.random()*256;q.strokeStyle=wooden?'rgba(58,32,17,.08)':'rgba(43,65,48,.045)';q.lineWidth=wooden?.5:1;q.beginPath();q.moveTo(x,y);q.lineTo(x+(wooden?2:10),y+(wooden?40:3));q.stroke();}let t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;return t;}plaster.map=grain(false);wood.map=grain(true);paleWood.map=wood.map;darkWood.map=wood.map;
function mesh(g,m,x=0,y=0,z=0,parent=river){let o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;}
function box(w,h,d,m,x,y,z,p=river){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p);}
function sphere(r,m,x,y,z,p=river,sx=1,sy=1,sz=1){let o=mesh(new T.SphereGeometry(r,20,14),m,x,y,z,p);o.scale.set(sx,sy,sz);return o;}
function beam(a,b,r,m,p){let av=new T.Vector3(...a),bv=new T.Vector3(...b),o=mesh(new T.CylinderGeometry(r,r,av.distanceTo(bv),8),m,0,0,0,p);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...b).sub(new T.Vector3(...a)).normalize());return o;}
function stroke(points,color=0x47554c,opacity=.45,p=river){let o=new T.Line(new T.BufferGeometry().setFromPoints(points.map(v=>new T.Vector3(...v))),new T.LineBasicMaterial({color,transparent:true,opacity}));p.add(o);return o;}
let seed=12;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function roof(w,d,x,y,z,p=river,m=ink){const sh=new T.Shape();sh.moveTo(-w*.62,0);sh.lineTo(-w*.42,.16);sh.lineTo(0,w*.3);sh.lineTo(w*.42,.16);sh.lineTo(w*.62,0);sh.lineTo(0,w*.22);sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);return mesh(g,m,x,y,z,p);}
function house(x,z,w,h,d){const g=new T.Group();g.position.set(x,0,z);river.add(g);box(w,h,d,plaster,0,h/2,0,g);roof(w,d+.6,0,h,0,g);box(w+.25,.18,d+.3,stone,0,.12,0,g);for(let j=0;j<3;j++){let xx=(j-1)*w*.29;box(.35,.65,.045,ink,xx,h*.65,d/2+.025,g);box(.45,.035,.15,ink,xx,h*.65-.35,d/2+.07,g);}box(.55,1.25,.06,ink,0,.63,d/2+.04,g);const side=x>0?-1:1;for(let k=0;k<2;k++)box(.03,.55,.45,ink,side*w/2,h*.65,(k-.5)*d*.48,g);for(let k=0;k<4;k++){let zz=-d/2+rand()*d;box(.02,.25+rand()*.7,.035,stone,side*(w/2+.01),.4+rand()*h*.55,zz,g);}if(rand()>.6)sphere(.13,red,side*(w/2+.18),1.7,d*.3,g,1,1.5,1);}
const ripples=[];const journey=makeJourney();scene.add(journey.group);journey.group.visible=false;
// Carved boat, deliberately rounded like a fruit stone.
function makeBoat(){sphere(1,wood,0,.17,0,boat,1.25,.48,3.25);box(1.95,.12,4.7,paleWood,0,.43,0,boat);for(let i=0;i<20;i++)stroke([[-.85,.502,-2.2+i*.23],[.85,.502,-2.2+i*.23]],0x5e3c27,.42,boat);for(let x of [-.94,.94]){beam([x,.52,-2.1],[x,.74,2],.06,darkWood,boat);for(let z of [-1.8,-1,0,1,1.8])beam([x,.48,z],[x,.72,z],.045,wood,boat);}for(let x of [-.78,.78])for(let z of [-1.3,.7])beam([x,.5,z],[x,1.8,z],.065,darkWood,boat);roof(1.75,2.5,0,1.8,-.3,boat,wood);for(let x of [-.81,.81]){for(let z=-1.2;z<.8;z+=.22)beam([x,.82,z],[x,1.65,z],.025,paleWood,boat);for(let y of [.82,1.22,1.65])beam([x,y,-1.25],[x,y,.7],.03,paleWood,boat);}for(let i=0;i<20;i++){let t=i*Math.PI*2/20;stroke([[Math.cos(t)*1.07,.22,Math.sin(t)*2.8],[Math.cos(t)*1.14,.09,Math.sin(t)*2.9]],0x51331f,.4,boat);} }
makeBoat();
function person(x,z,monk,p,scale=1){let g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);p.add(g);sphere(.45,monk?paleWood:wood,0,.48,0,g,1,.9,.8);mesh(new T.ConeGeometry(.36,.78,14),monk?wood:darkWood,0,.92,0,g);sphere(.19,paleWood,0,1.48,0,g);if(!monk){box(.39,.18,.3,ink,0,1.68,0,g);sphere(.13,darkWood,0,1.29,.13,g,.75,1.5,.45);}sphere(.07,paleWood,-.29,1,.1,g);sphere(.07,paleWood,.29,1,.1,g);for(let x of [-.065,.065])sphere(.017,ink,x,1.5,.176,g);if(monk)for(let i=0;i<12;i++){let a=i*Math.PI/6;sphere(.025,darkWood,Math.cos(a)*.2,1.05+Math.sin(a)*.15,.25,g);}return g;}
person(-.4,-.1,false,boat,.42).position.y=.52;person(.4,-.25,true,boat,.42).position.y=.52;
// An explorable cabin built around a large circular carved window.
cabin.position.set(0,0,0);
// Layered pierced screen, with solid bevelled carving and a real aperture.
const {group:win,lattice,materials:carvedMaterials}=makeCarvedScreen();let activeLattice=lattice;win.position.set(0,2.4,-6);win.scale.setScalar(1.3);cabin.add(win);
const cabinDetail=makeCabinDetail(carvedMaterials);cabin.add(cabinDetail);cabin.add(makeCabinRefinement(carvedMaterials));
const cabinKey=new T.PointLight(0xffc98b,28,12,2);cabinKey.position.set(-3.9,3.7,-2.2);cabin.add(cabinKey);
const cabinFill=new T.PointLight(0xffead0,12,11,2);cabinFill.position.set(3.7,3.1,3.8);cabin.add(cabinFill);
const cabinRim=new T.PointLight(0xd8e4d5,10,9,2);cabinRim.position.set(3.5,4.3,-4.6);cabin.add(cabinRim);
const cabinObjectLight=new T.PointLight(0xffd6a3,18,8,2);cabinObjectLight.position.set(0,3.1,.8);cabin.add(cabinObjectLight);
const painted=document.getElementById('painted');
const imagePaths=['./assets/ink-canal-v1.webp','./assets/ink-garden-v1.webp','./assets/ink-moon-v1.webp'];
const inkTextures=imagePaths.map(path=>{const t=new T.TextureLoader().load(path,()=>{},undefined,()=>toast('背景图片未加载，请刷新重试'));t.colorSpace=T.SRGBColorSpace;return t;});
const vistaDepth=makeCabinVista(inkTextures);cabin.add(vistaDepth.group);
function drawVista(n){vistaDepth.setScene(n);painted.style.backgroundImage='url('+imagePaths[n]+')';}
wood.color.setHex(0x805039);paleWood.color.setHex(0xa36a40);darkWood.color.setHex(0x4b2e20);
const dpo=person(-3.25,-4.9,false,cabin,1),fo=person(3.55,3.7,true,cabin,1);
const cabinLife=makeCabinLife(dpo,fo,$('banter'));
fo.rotation.y=Math.PI;
const objects=makeCabinObjects(carvedMaterials);cabin.add(objects.group);
loadCabinModel().then(model=>{cabin.remove(win,cabinDetail);cabin.add(model.root);activeLattice=model.lattice||activeLattice;objects.replaceWith(model.items);refineCabinObjects(model.items,carvedMaterials);toast('精细船舱已展开。');}).catch(error=>{console.error(error);toast('精细船舱暂未加载，保留基础模型。');});
const hotspots=[{name:'东坡',p:new T.Vector3(-3.25,2,-4.9),action:()=>talk('dong')},{name:'佛印',p:new T.Vector3(3.55,2,3.7),action:()=>talk('fo')},{name:'转动花窗',p:new T.Vector3(0,3.4,-5.8),action:openPuzzle},...objects.items.map(item=>({name:item.name,p:item.p,action:()=>touchObject(item)}))];
for(const h of hotspots){h.el=document.createElement('button');h.el.className='hotspot';h.el.textContent=h.name;h.el.onclick=h.action;$('hotspots').appendChild(h.el);}
hotspots[0].el.classList.add('actor-hotspot');hotspots[1].el.classList.add('actor-hotspot');
const cabinPos=new T.Vector3(0,1.85,3.4),keys=new Set();let autoSail=false,routeEnd=false,viewerStep=0,viewerStride=0;
const joystickEl=$('joystick'),joystickKnob=$('joystickKnob'),joystick={x:0,y:0,drive:0,turn:0,pointer:null};
function resetJoystick(){joystick.x=joystick.y=joystick.drive=joystick.turn=0;joystick.pointer=null;joystickKnob.style.transform='translate(-50%,-50%)';joystickEl.classList.remove('active');delete joystickEl.dataset.direction;}
function setJoystick(e){const rect=joystickEl.getBoundingClientRect(),radius=rect.width*.29,dead=.20,rawX=(e.clientX-(rect.left+rect.width/2))/radius,rawY=(e.clientY-(rect.top+rect.height/2))/radius,raw=Math.hypot(rawX,rawY);if(raw<=dead){joystick.x=joystick.y=0;joystickKnob.style.transform='translate(-50%,-50%)';delete joystickEl.dataset.direction;return;}const ux=rawX/raw,uy=rawY/raw,visual=Math.min(1,raw),amount=(visual-dead)/(1-dead),strength=amount*amount*(3-2*amount);joystick.x=Math.sign(ux)*Math.pow(Math.abs(ux),1.3)*strength;joystick.y=Math.sign(uy)*Math.pow(Math.abs(uy),1.3)*strength;const directions=[];if(joystick.y<-.08)directions.push('front');if(joystick.y>.08)directions.push('back');if(joystick.x<-.08)directions.push('left');if(joystick.x>.08)directions.push('right');joystickEl.dataset.direction=directions.join(' ');joystickKnob.style.transform=`translate(calc(-50% + ${ux*visual*radius}px),calc(-50% + ${uy*visual*radius}px))`;}
joystickEl.onpointerdown=e=>{e.preventDefault();joystick.pointer=e.pointerId;joystickEl.setPointerCapture(e.pointerId);joystickEl.classList.add('active');setJoystick(e);};
joystickEl.onpointermove=e=>{if(e.pointerId===joystick.pointer)setJoystick(e);};
const finishJoystick=e=>{if(joystick.pointer!==null&&(!e||e.pointerId===joystick.pointer))resetJoystick();};
joystickEl.onpointerup=joystickEl.onpointercancel=joystickEl.onlostpointercapture=finishJoystick;
window.addEventListener('pointerup',finishJoystick);window.addEventListener('pointercancel',finishJoystick);document.addEventListener('visibilitychange',()=>{if(document.hidden)resetJoystick();});
const objectStories={
 fan:{tag:'吴门雅玩 · 苏扇',title:'一扇收住半面江南',intro:'苏扇把扇骨、扇面和书画合为一体。明代以后，吴门书画进入扇面，日常纳凉物也成了文人随身雅玩。',story:'“十年磨一扇”说的是慢工：开料、刮纸、制骨、扇刻、组装，细处全看手上的分寸。'},
 lute:{tag:'评弹行头 · 琵琶',title:'一拨弦，故事就开场',intro:'苏州弹词常用琵琶、三弦伴奏，以说、唱、弹、噱、演讲一部长故事。',story:'两人同台时，常见一人持三弦、一人抱琵琶。东坡若抢着唱，佛印大概只好负责“噱”。'},
 rock:{tag:'园林缩景 · 太湖石',title:'一块石，也能藏山水',intro:'太湖石以“皱、漏、瘦、透”见长，孔洞与褶皱让人从一石联想到峰峦洞壑。',story:'相传米芾爱石成痴，见奇石便整衣下拜。“米芾拜石”后来成了赏石文化里的趣谈。'},
 tea:{tag:'洞庭春信 · 碧螺春',title:'先闻香，再问茶名',intro:'洞庭碧螺春来自太湖洞庭东西山，茶条卷曲如螺，带着江南春天的鲜灵气。',story:'它旧有“吓煞人香”之称。传说康熙嫌名字不雅，改题“碧螺春”；故事可以慢慢考，茶香先到了。'}
};
function hideObjectCard(){$('objectCard').hidden=true;}
function showObjectCard(item){const info=objectStories[item.kind];$('objectTag').textContent=info.tag;$('objectTitle').textContent=info.title;$('objectIntro').textContent=info.intro;$('objectStory').textContent=info.story;$('objectCard').hidden=false;}
$('closeObjectCard').onclick=hideObjectCard;
function touchObject(item){item.active=!item.active;dismiss();showObjectCard(item);cabinLife.interact(item.kind);if(item.kind==='lute')pluck();}
function pluck(){if(!audioOn||!audioCtx)return;for(let i=0;i<3;i++){const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime+i*.09;o.type='triangle';o.frequency.value=[293.66,392,440][i];g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.7);o.connect(g).connect(audioCtx.destination);o.start(t);o.stop(t+.72);}}
let windowClose=false;
let mode='intro',travel=0,sailing=false,yaw=0,pitch=0,orbit=.5,windowIndex=0,solved=false,seen=0,drag=null,clock=new T.Clock(),toastTimer,windowRotation=0;
let activeLandmark=-2;
function updateLandmarkCard(){
 const card=$('landmarkCard');
 if(mode!=='river'){card.hidden=true;activeLandmark=-2;return;}
 const index=journey.landmarks.findIndex(item=>Math.abs(travel-item.at)<=7.5);
 if(index===activeLandmark)return;
 activeLandmark=index;
 if(index<0){card.hidden=true;return;}
 const item=journey.landmarks[index];
 $('landmarkSide').textContent=item.side+' · 行舟到站';$('landmarkName').textContent=item.name;$('landmarkLabel').textContent=item.label;$('landmarkHistory').textContent=item.history;
 card.dataset.side=item.side;card.hidden=false;
}
const names=['水巷 · 一重景','园林 · 二重景','月夜 · 三重景'];
function toast(s){$('toast').textContent=s;$('toast').style.opacity=1;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.opacity=0,3500);}
function say(who,line,options){$('dialogue').hidden=false;$('who').textContent=who;$('tone').textContent=who==='东坡'?'舟中闲客 · 兴致正浓':'舟中闲客 · 心有成竹';$('line').textContent=line;$('choices').replaceChildren();for(let [label,fn] of options){let b=document.createElement('button');b.textContent=label;b.onclick=fn;$('choices').appendChild(b);}}
function dismiss(){$('dialogue').hidden=true;}
function talk(who){dismiss();$('puzzle').hidden=true;cabinLife.interact(who);}
function openPuzzle(){dismiss();hideObjectCard();$('puzzle').hidden=false;yaw=0;pitch=.1;$('instruction').textContent='点击左右箭头转动花窗 · 找到东坡藏起的月亮';}
function changeWindow(d){windowIndex=(windowIndex+d+3)%3;windowRotation+=d*Math.PI/4;drawVista(windowIndex);$('windowName').textContent=names[windowIndex];chime();if(windowIndex===2&&!solved){solved=true;$('puzzleTitle').textContent='月亮，原来在这里。';$('puzzleDesc').textContent='一转花窗，换了一重天地。回头听听东坡怎么说。';$('closePuzzle').textContent='叫东坡来看';$('outside').hidden=false;toast('月色入舟 · 解锁「掌中看舟」');}else if(windowIndex!==2){$('puzzleTitle').textContent=solved?'再借一窗江南':'月亮，藏在哪一扇？';$('puzzleDesc').textContent='轻转花窗。窗外的天地，也会跟着改变。';}}
function enter(){first=true;autoSail=false;windowClose=false;resetJoystick();hideObjectCard();cabinPos.set(0,1.85,3.4);mode='cabin';ambient.intensity=1.28;sun.intensity=1.65;sailing=false;river.visible=false;boat.visible=false;cabin.visible=true;scene.fog=null;renderer.setClearColor(0xddd5bf);yaw=0;pitch=0;$('intro').hidden=true;$('controls').hidden=false;$('enter').hidden=true;$('sail').hidden=true;$('chapter').textContent='贰 · 窗中奇遇';$('verse').textContent='推窗借月';$('verseSub').textContent='方寸藏天';$('instruction').textContent='右下操作杆：上下行走、左右转向 · 可原地回头';toast('右下操作杆上下行走、左右转向，持续转动可以回头。');}
function toOutside(){first=true;mode='outside';resetJoystick();hideObjectCard();ambient.intensity=2.3;sun.intensity=3;dismiss();$('puzzle').hidden=true;cabin.visible=false;river.visible=false;boat.visible=true;boat.position.set(0,0,0);boat.rotation.set(0,0,0);scene.fog=null;renderer.setClearColor(0xeeeadd);$('ending').hidden=false;$('outside').hidden=true;$('hotspots').hidden=true;$('chapter').textContent='叁 · 掌中天地';$('verse').textContent='一核一世界';$('verseSub').textContent='不盈一握';$('instruction').textContent='拖动旋转核舟 · 滚轮拉近查看';orbit=.5;}
$('start').onclick=()=>{first=true;ambient.intensity=2.5;sun.intensity=3;yaw=0;pitch=0;mode='river';boat.visible=false;$('intro').hidden=true;$('controls').hidden=false;$('instruction').textContent='拖动环顾两岸 · 按住行舟 / 自动行舟';toast('现在站在船头，左右拖动看看两岸。');};$('enter').onclick=enter;$('outside').onclick=toOutside;$('backInside').onclick=()=>{$('ending').hidden=true;$('hotspots').hidden=false;enter();$('outside').hidden=!solved;};$('nextWindow').onclick=()=>changeWindow(1);$('prevWindow').onclick=()=>changeWindow(-1);$('closePuzzle').onclick=()=>{$('puzzle').hidden=true;if(solved)talk('dong');};$('reset').onclick=()=>location.reload();
$('sail').onpointerdown=e=>{sailing=true;e.currentTarget.setPointerCapture(e.pointerId);};$('sail').onpointerup=$('sail').onpointercancel=()=>sailing=false;window.addEventListener('blur',()=>sailing=false);
let distance=8;canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(!drag)return;let dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(mode==='outside')orbit-=dx*.008;else{yaw-=dx*.006;if(mode==='river')yaw=T.MathUtils.clamp(yaw,-Math.PI*.56,Math.PI*.56);pitch=T.MathUtils.clamp(pitch+dy*.003,-.5,.55);}drag={x:e.clientX,y:e.clientY};};canvas.onpointerup=canvas.onpointercancel=()=>drag=null;canvas.onwheel=e=>{if(mode==='outside'){e.preventDefault();distance=T.MathUtils.clamp(distance+e.deltaY*.004,5,13);} };window.addEventListener('keydown',e=>{if(e.code==='Space'&&mode==='river'&&e.target===document.body){e.preventDefault();sailing=true;}if(e.key==='Escape'){dismiss();$('puzzle').hidden=true;}});window.addEventListener('keyup',e=>{if(e.code==='Space')sailing=false;});
let audioCtx,audioOn=false,audioNodes=[];function chime(){if(!audioOn)return;let o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=[392,440,523][windowIndex];g.gain.setValueAtTime(.09,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+1.6);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+1.6);}
$('sound').onclick=async()=>{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();await audioCtx.resume();audioOn=!audioOn;$('sound').textContent=audioOn?'声 · 开':'声 · 关';if(audioOn){for(let f of [130.81,196,261.63]){let o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.008;o.connect(g).connect(audioCtx.destination);o.start();audioNodes.push(o);}chime();}else{audioNodes.forEach(o=>o.stop());audioNodes=[];}};
const riverFog=new T.FogExp2(0xeeeadd,.004);
const target=new T.Vector3(),look=new T.Vector3();camera.position.set(20,12,19);let first=true,elapsed=0;
function frame(){requestAnimationFrame(frame);const realDt=clock.getDelta(),dt=Math.min(realDt,.05);elapsed+=dt;const t=elapsed;if(mode==='river'&&(sailing||autoSail)){travel=Math.min(travel+dt*3,journey.length);if(travel===journey.length&&!routeEnd){routeEnd=true;autoSail=false;sailing=false;toast('一程江南已尽，进舟中坐坐。');}}
const cabinMoveReady=mode==='cabin'&&!windowClose&&$('dialogue').hidden&&$('puzzle').hidden;if(!cabinMoveReady&&(joystick.x||joystick.y||joystick.drive||joystick.turn))resetJoystick();if(cabinMoveReady){const forward=T.MathUtils.clamp(Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'))-joystick.y,-1,1),turn=T.MathUtils.clamp(Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))+joystick.x,-1,1);joystick.drive=forward===0?0:T.MathUtils.damp(joystick.drive,forward,6.2,dt);joystick.turn=turn===0?0:T.MathUtils.damp(joystick.turn,turn,5.4,dt);yaw=T.MathUtils.euclideanModulo(yaw+joystick.turn*dt*.92+Math.PI,Math.PI*2)-Math.PI;const next=moveCabin(cabinPos,yaw,joystick.drive*dt*1.12,[dpo.position,fo.position]),moved=Math.hypot(next.x-cabinPos.x,next.z-cabinPos.z);viewerStride=T.MathUtils.damp(viewerStride,moved>0?Math.min(1,Math.abs(joystick.drive)):0,9,dt);viewerStep+=moved*7.5;cabinPos.x=next.x;cabinPos.z=next.z;}else viewerStride=T.MathUtils.damp(viewerStride,0,9,dt);
cabinLife.update(document.hidden?0:Math.min(realDt,.15),mode==='cabin'&&!windowClose&&$('puzzle').hidden,cabinPos);hotspots[0].p.copy(dpo.position).y+=2;hotspots[1].p.copy(fo.position).y+=2;for(const [i,actor] of [dpo,fo].entries()){hotspots[i].el.textContent=(i?'佛印':'东坡')+' · '+(actor.userData.actionLabel||'舟中闲客');}objects.update(dt,t);journey.update(t);riverBow.update(t,sailing||autoSail,travel);vistaDepth.update(yaw,pitch,windowClose);
if(mode==='intro'){target.set(7,4,8);look.set(-1.2,.7,0);boat.position.set(0,0,0);boat.rotation.y=.1;}else if(mode==='river'){target.set(0,3.1,-travel);look.set(Math.sin(yaw)*14,3.1-pitch*7,-travel-14*Math.cos(yaw));}else if(mode==='cabin'){if(windowClose){const d=innerWidth<700?3.5:4.5;target.set(Math.sin(T.MathUtils.clamp(yaw,-.42,.42))*d*1.3,2.48+Math.sin(T.MathUtils.clamp(pitch,-.22,.22))*d,-6.42+Math.cos(T.MathUtils.clamp(yaw,-.42,.42))*d*1.3);look.set(0,2.48,-6.42);}else{target.copy(cabinPos);look.set(cabinPos.x+Math.sin(yaw)*7,cabinPos.y-pitch*5,cabinPos.z-7*Math.cos(yaw));const bob=viewerStride*(.026-.026*Math.cos(viewerStep*2)),sway=viewerStride*Math.sin(viewerStep)*.018,dx=Math.cos(yaw)*sway,dz=Math.sin(yaw)*sway;target.add(new T.Vector3(dx,bob,dz));look.add(new T.Vector3(dx,bob,dz));}}else{target.set(Math.sin(orbit)*distance,4,Math.cos(orbit)*distance);look.set(-1.35,.7,0);boat.rotation.z=Math.sin(t*.6)*.025;}
if(mode==='cabin'&&!windowClose)camera.position.copy(target);
const paintedMode=mode==='intro';river.visible=false;journey.group.visible=mode==='river';riverBow.group.visible=mode==='river';boat.visible=mode==='intro'||mode==='outside';painted.hidden=mode!=='intro';scene.fog=mode==='river'?riverFog:null;if(mode==='river')renderer.setClearColor(0xeeeadd);renderer.setClearAlpha(paintedMode?0:1);if(paintedMode)painted.style.transform='scale('+(1.02+travel*.007)+') translate('+Math.sin(yaw)*2+'%,0)';else painted.style.transform='none';document.body.classList.toggle('painting-mode',paintedMode);camera.position.lerp(target,first?1:1-Math.exp(-dt*3));camera.lookAt(look);cabinLife.place(camera,innerWidth,innerHeight,mode==='cabin'&&!windowClose&&$('puzzle').hidden);first=false;activeLattice.rotation.z=T.MathUtils.lerp(activeLattice.rotation.z,windowRotation,.08);for(let i=0;i<ripples.length;i++)ripples[i].position.x=Math.sin(t*.3+i)*.07;for(let h of hotspots){h.el.hidden=windowClose||mode!=='cabin'||!$('dialogue').hidden||!$('puzzle').hidden;if(!h.el.hidden){let p=h.p.clone().project(camera);h.el.style.left=(p.x*.5+.5)*innerWidth+'px';h.el.style.top=(-p.y*.5+.5)*innerHeight+'px';h.el.style.display=p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1?'none':'block';}}$('riverHud').hidden=mode!=='river';$('autoSail').hidden=mode!=='river';$('autoSail').textContent=autoSail?'暂停行舟':'自动行舟';$('lookLeft').hidden=$('lookRight').hidden=mode!=='river';$('lookLeft').textContent='看左岸';$('lookRight').textContent='看右岸';$('forwardView').hidden=mode!=='river';$('joystick').hidden=mode!=='cabin'||windowClose||!$('dialogue').hidden||!$('puzzle').hidden;$('inspectWindow').hidden=mode!=='cabin';$('routeProgress').value=travel;const part=Math.min(3,Math.floor(travel/40));$('routePlace').textContent=['七里山塘','拙政园 · 园林借景','虎丘塔影','盘门水城'][part];updateLandmarkCard();$('inspectTurn').hidden=mode!=='cabin'||!windowClose;renderer.render(scene,camera);}
const originalEnter=enter;$('face').onclick=()=>{first=true;windowClose=false;$('inspectWindow').textContent='近看花窗';yaw=0;pitch=0;dismiss();$('puzzle').hidden=true;};new MutationObserver(()=>{$('face').hidden=mode!=='cabin';document.body.classList.toggle('in-cabin',mode==='cabin');}).observe($('chapter'),{childList:true});
window.onresize=()=>{camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?67:48;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);};$('loading').hidden=true;frame();
loadCarvedBoat().then(model=>{boat.clear();boat.add(model);for(const [key,person] of [['figure_scholar',dpo],['figure_monk',fo]]){const source=model.userData.figures[key];if(source){fitWalkingFigure(person,source,key==='figure_monk');}}}).catch(error=>{console.error(error);toast('精细船体暂未加载，保留基础模型。');});

$('inspectWindow').onclick=()=>{first=true;windowClose=!windowClose;resetJoystick();yaw=windowClose?.12:0;pitch=0;dismiss();$('puzzle').hidden=true;$('inspectWindow').textContent=windowClose?'退回舟中':'近看花窗';$('instruction').textContent=windowClose?'拖动查看透雕厚度 · 转动花窗切换景色':'右下操作杆：上下行走、左右转向 · 可原地回头';};
$('inspectTurn').onclick=()=>{changeWindow(1);toast(names[windowIndex]);};

$('autoSail').onclick=()=>{if(travel>=journey.length){travel=0;routeEnd=false;}autoSail=!autoSail;};
$('lookLeft').onclick=()=>{first=true;yaw=mode==='cabin'?-Math.PI*.38:-Math.PI/2;pitch=0;};$('lookRight').onclick=()=>{first=true;yaw=mode==='cabin'?Math.PI*.38:Math.PI/2;pitch=0;};$('forwardView').onclick=()=>{first=true;yaw=0;pitch=0;};
window.addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.code)&&!['INPUT','TEXTAREA','BUTTON'].includes(e.target.tagName)){keys.add(e.code);e.preventDefault();}});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();autoSail=false;resetJoystick();});
