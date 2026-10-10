import * as T from './vendor/three.module.js';

const W=1200,H=650;

function canvasTexture(scene,layer){
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const c=canvas.getContext('2d');c.lineCap='round';c.lineJoin='round';
  const line=(points,color='rgba(40,47,42,.55)',width=4)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.stroke();};
  const wash=(x,y,rx,ry,color)=>{const g=c.createRadialGradient(x,y,2,x,y,Math.max(rx,ry));g.addColorStop(0,color);g.addColorStop(1,'rgba(112,138,117,0)');c.fillStyle=g;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  const wall=(x,y,w,h)=>{c.fillStyle='rgba(244,241,229,.80)';c.fillRect(x,y,w,h);line([[x,y+h],[x+w,y+h]],'rgba(70,78,71,.23)',3);};
  const roof=(x,y,w,h)=>{c.fillStyle='rgba(38,43,40,.67)';c.beginPath();c.moveTo(x-w*.58,y+h*.18);c.quadraticCurveTo(x-w*.22,y-h*.12,x,y-h*.32);c.quadraticCurveTo(x+w*.22,y-h*.12,x+w*.58,y+h*.18);c.lineTo(x+w*.46,y+h*.30);c.quadraticCurveTo(x,y+h*.02,x-w*.46,y+h*.30);c.closePath();c.fill();line([[x-w*.61,y+h*.18],[x,y-h*.34],[x+w*.61,y+h*.18]],'rgba(24,29,27,.72)',4);};
  const branch=(pts,thick=7)=>{line(pts,'rgba(39,47,42,.62)',thick);for(let i=1;i<pts.length;i+=2){const [x,y]=pts[i];line([[x,y],[x+34+(i%3)*17,y-50-(i%2)*24]],'rgba(48,57,51,.48)',Math.max(2,thick*.42));}};
  const leaf=(x,y,r=10,color='rgba(99,130,108,.32)')=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,r,r*.45,-.45,0,Math.PI*2);c.fill();};

  if(layer===1){
    if(scene===0){
      wash(190,210,210,170,'rgba(114,142,118,.28)');wash(1015,225,225,175,'rgba(105,135,114,.24)');
      wall(25,310,315,230);wall(875,330,300,210);roof(185,307,360,105);roof(1010,327,340,100);
      for(const [x,y] of [[80,365],[145,385],[260,360],[945,382],[1035,370],[1120,395]]){c.fillStyle='rgba(63,67,62,.34)';c.fillRect(x,y,22,75);line([[x-8,y+74],[x+31,y+74]],'rgba(45,50,47,.42)',3);}
      line([[0,535],[285,520],[455,530],[600,558],[770,530],[935,520],[1200,540]],'rgba(65,79,70,.28)',6);
    }else if(scene===1){
      wash(230,205,250,180,'rgba(102,137,110,.28)');wash(925,210,250,190,'rgba(93,127,105,.27)');
      wall(80,345,1040,205);c.fillStyle='rgba(232,229,215,.03)';c.globalCompositeOperation='destination-out';c.beginPath();c.arc(600,435,122,0,Math.PI*2);c.fill();c.globalCompositeOperation='source-over';
      line([[478,550],[478,435],[490,385],[530,340],[600,320],[670,340],[710,385],[722,435],[722,550]],'rgba(48,57,51,.50)',7);
      roof(310,345,280,90);roof(890,345,280,90);for(const x of [188,265,935,1010])line([[x,360],[x,530]],'rgba(58,65,60,.28)',4);
      line([[120,550],[330,520],[470,545],[600,525],[760,548],[920,518],[1090,550]],'rgba(68,83,72,.30)',7);
    }else{
      wash(195,255,235,175,'rgba(84,111,101,.20)');wash(1010,265,245,170,'rgba(77,101,94,.18)');
      roof(235,405,390,125);roof(930,430,345,110);wall(65,435,335,125);wall(790,455,330,100);
      line([[0,558],[230,540],[420,555],[600,535],[790,560],[1010,540],[1200,550]],'rgba(48,63,58,.38)',5);
      for(let i=0;i<8;i++)line([[360+i*70,540+i%2*7],[405+i*60,520-i%3*8]],'rgba(236,229,207,.33)',2);
    }
  }else{
    if(scene===0){
      branch([[8,45],[75,92],[145,128],[220,205]],9);branch([[1195,70],[1125,110],[1060,175],[1018,245]],8);
      for(let i=0;i<26;i++){leaf(35+i*22,70+(i%5)*33,8+(i%3)*3);leaf(1160-i*21,85+(i%4)*39,7+(i%4)*2);}
      line([[0,586],[165,566],[300,574]],'rgba(58,65,60,.46)',11);line([[900,574],[1055,560],[1200,580]],'rgba(58,65,60,.44)',11);
    }else if(scene===1){
      for(const x of [78,126,1080,1125]){line([[x,640],[x+18,160]],'rgba(45,62,50,.48)',7);for(let y=220;y<570;y+=58){line([[x+12,y],[x+(x<600?75:-65),y-55]],'rgba(55,79,61,.40)',4);leaf(x+(x<600?64:-55),y-48,13);}}
      c.fillStyle='rgba(64,73,67,.34)';c.beginPath();c.moveTo(0,650);c.bezierCurveTo(25,555,95,530,145,565);c.bezierCurveTo(205,515,270,570,325,650);c.closePath();c.fill();
      line([[0,620],[92,583],[170,600],[250,566],[335,620]],'rgba(42,50,46,.50)',5);
    }else{
      branch([[0,80],[92,105],[190,160],[280,245]],10);branch([[28,102],[105,70],[175,45]],5);
      for(let i=0;i<18;i++){const x=40+i*26,y=88+(i%5)*30;c.fillStyle=i%6===0?'rgba(146,66,54,.42)':'rgba(50,60,54,.24)';c.beginPath();c.arc(x,y,4+(i%3),0,Math.PI*2);c.fill();}
      c.fillStyle='rgba(35,40,38,.54)';c.beginPath();c.moveTo(840,650);c.lineTo(980,520);c.lineTo(1200,535);c.lineTo(1200,650);c.closePath();c.fill();
      line([[845,626],[980,510],[1200,528]],'rgba(24,29,27,.72)',6);
    }
  }
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;return texture;
}

export function makeCabinVista(farTextures){
  const group=new T.Group();
  const midTextures=[0,1,2].map(i=>canvasTexture(i,1));
  const nearTextures=[0,1,2].map(i=>canvasTexture(i,2));
  const material=(map,transparent=false)=>new T.MeshBasicMaterial({map,transparent,alphaTest:transparent?.012:0,depthWrite:!transparent,toneMapped:false,side:T.DoubleSide});
  const plane=(w,h,map,x,y,z,ry=0,transparent=false,order=0)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),material(map,transparent));m.position.set(x,y,z);m.rotation.y=ry;m.renderOrder=order;group.add(m);return m;};
  const far=plane(19.4,10.8,farTextures[0],0,2.4,-8.92,0,false,-3);
  const mid=plane(18.9,10.25,midTextures[0],0,2.38,-8.26,0,true,-2);
  const near=plane(18.4,10,nearTextures[0],0,2.42,-7.52,0,true,-1);
  // The side and rear windows use the same 2.5D construction so turning away
  // from the flower window never reveals a single wallpaper-like plane.
  for(const side of [-1,1]){
    const index=side<0?0:1,rotation=side*Math.PI/2;
    plane(30,10,farTextures[index],side*6.85,2,0,rotation,false,-3);
    plane(29.4,9.8,midTextures[index],side*6.38,2,0,rotation,true,-2);
    plane(28.8,9.55,nearTextures[index],side*5.94,2,0,rotation,true,-1);
  }
  plane(19.4,10.8,farTextures[1],0,2.4,8.92,Math.PI,false,-3);
  plane(18.9,10.25,midTextures[1],0,2.38,8.28,Math.PI,true,-2);
  plane(18.4,10,nearTextures[1],0,2.42,7.56,Math.PI,true,-1);
  return {group,setScene(index){far.material.map=farTextures[index];mid.material.map=midTextures[index];near.material.map=nearTextures[index];far.material.needsUpdate=mid.material.needsUpdate=near.material.needsUpdate=true;},update(yaw,pitch,close){const turn=T.MathUtils.clamp(yaw,-.85,.85),lift=T.MathUtils.clamp(pitch,-.4,.4),amount=close?1:.62;far.position.x=-turn*.05*amount;mid.position.x=-turn*.18*amount;near.position.x=-turn*.46*amount;mid.position.y=2.38+lift*.035;near.position.y=2.42+lift*.09;}};
}
