import * as T from './vendor/three.module.js';

// Solid, bevelled pierced carving. The holes are geometry, not painted marks.
export function makeCarvedScreen(){
  const group=new T.Group();group.position.set(0,2,-3.7);
  const lattice=new T.Group();group.add(lattice);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(512,512);
  let seed=41;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const i=(y*512+x)*4;
    // Fine, lengthwise grain with a slower wandering figure. It remains subtle
    // enough to read as polished fruit stone rather than ordinary timber.
    const long=Math.sin(y*.075+Math.sin(x*.014)*3.2)*16;
    const pores=Math.sin(y*.53+x*.035)*4+(rand()-.5)*13;
    const v=Math.max(58,Math.min(205,132+long+pores));
    pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;
  }
  ctx.putImageData(pixels,0,0);const bump=new T.CanvasTexture(canvas);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(2.4,5.5);
  const finish={roughness:.43,bumpMap:bump,bumpScale:.013,clearcoat:.10,clearcoatRoughness:.68};
  const base=new T.MeshPhysicalMaterial({color:0x704127,...finish});
  const raised=new T.MeshPhysicalMaterial({color:0xa96b3d,...finish,roughness:.38,bumpScale:.009,clearcoat:.16});
  const edge=new T.MeshPhysicalMaterial({color:0x874b2b,...finish,roughness:.46,bumpScale:.011});
  const recess=new T.MeshStandardMaterial({color:0x321c14,roughness:.86,bumpMap:bump,bumpScale:.006});
  function solid(shape,depth,z,material=raised,parent=group,bevel=.005){
    const geo=new T.ExtrudeGeometry(shape,{depth,steps:1,curveSegments:32,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3});
    const mesh=new T.Mesh(geo,material);mesh.position.z=z;mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function rect(x,y,w,h){const s=new T.Shape();s.moveTo(x,y);s.lineTo(x+w,y);s.lineTo(x+w,y+h);s.lineTo(x,y+h);s.closePath();return s;}
  function circle(r){const s=new T.Shape();s.absarc(0,0,r,0,Math.PI*2,false);return s;}
  function ring(outer,inner,z,depth,material,parent=group){const s=circle(outer),hole=new T.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(hole);return solid(s,depth,z,material,parent,.004);}
  // The opaque spandrels frame a real circular opening, with a stepped reveal.
  const screen=rect(-1.68,-1.83,3.36,3.38),opening=new T.Path();opening.absarc(0,0,1.265,0,Math.PI*2,true);screen.holes.push(opening);solid(screen,.11,-.12,base);
  ring(1.305,1.235,.005,.035,recess);
  ring(1.32,1.285,.055,.038,raised);
  ring(1.273,1.221,.075,.026,edge);
  ring(1.232,1.214,.10,.017,raised);
  ring(1.21,1.165,.025,.052,base,lattice);
  ring(1.172,1.151,.075,.018,raised,lattice);
  ring(.17,.12,.075,.062,edge,lattice);
  ring(.126,.111,.122,.018,raised,lattice);
  // Two rows of tiny turned beads and petal bosses deepen the reveal. These
  // catch side light at different depths, which makes the window feel carved.
  for(const [count,radius,z,size] of [[64,1.286,.128,.014],[48,1.205,.139,.010]])for(let i=0;i<count;i++){
    const a=i*Math.PI*2/count,bead=solid(circle(size),.015,z,raised,lattice,.002);
    bead.position.set(Math.cos(a)*radius,Math.sin(a)*radius,0);
  }
  for(let i=0;i<16;i++){
    const a=i*Math.PI/8,petal=new T.Shape();petal.moveTo(-.035,0);petal.quadraticCurveTo(0,.09,.035,0);petal.quadraticCurveTo(0,-.025,-.035,0);
    const boss=solid(petal,.026,.127,i%2?edge:raised,lattice,.003);boss.position.set(Math.cos(a)*1.095,Math.sin(a)*1.095,0);boss.rotation.z=a-Math.PI/2;
  }
  // Pointed lotus tracery: flattened cutting faces and small bevels, not tubes.
  for(let k=0;k<8;k++){
    const petal=new T.Shape();petal.moveTo(0,.153);petal.bezierCurveTo(-.155,.29,-.207,.54,-.14,.72);petal.bezierCurveTo(-.08,.85,-.045,.99,0,1.16);petal.bezierCurveTo(.045,.99,.08,.85,.14,.72);petal.bezierCurveTo(.207,.54,.155,.29,0,.153);
    const hole=new T.Path();hole.moveTo(0,.255);hole.bezierCurveTo(.105,.35,.155,.54,.105,.69);hole.bezierCurveTo(.057,.82,.025,.96,0,1.03);hole.bezierCurveTo(-.025,.96,-.057,.82,-.105,.69);hole.bezierCurveTo(-.155,.54,-.105,.35,0,.255);petal.holes.push(hole);
    const p=solid(petal,.055,.05,edge,lattice,.007);p.rotation.z=k*Math.PI/4;
    const small=new T.Shape();small.moveTo(0,.94);small.bezierCurveTo(-.054,1.02,-.055,1.095,0,1.145);small.bezierCurveTo(.055,1.095,.054,1.02,0,.94);
    const bud=solid(small,.028,.10,raised,lattice,.003);bud.rotation.z=k*Math.PI/4+Math.PI/8;
  }
  function ribbon(points,width,z,depth,material,parent=group){
    const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],p[1],0))),ps=c.getPoints(64),left=[],right=[];
    ps.forEach((p,i)=>{const d=ps[Math.min(i+1,64)].clone().sub(ps[Math.max(0,i-1)]).normalize();const w=width*(.42+.58*Math.sin(Math.PI*i/64));left.push(new T.Vector2(p.x-d.y*w,p.y+d.x*w));right.push(new T.Vector2(p.x+d.y*w,p.y-d.x*w));});
    const shape=new T.Shape([...left,...right.reverse()]);shape.closePath();return solid(shape,depth,z,material,parent,.003);
  }
  function fret(points,width,z){
    const left=[],right=[];
    for(let i=0;i<points.length;i++){
      const p=new T.Vector2(...points[i]),prev=new T.Vector2(...points[Math.max(0,i-1)]),next=new T.Vector2(...points[Math.min(points.length-1,i+1)]);
      const d1=i===0?next.clone().sub(p).normalize():p.clone().sub(prev).normalize(),d2=i===points.length-1?d1:next.clone().sub(p).normalize();
      const n1=new T.Vector2(-d1.y,d1.x),n2=new T.Vector2(-d2.y,d2.x),m=n1.clone().add(n2).normalize().multiplyScalar(width/Math.max(.4,n1.clone().add(n2).normalize().dot(n1)));
      left.push(p.clone().add(m));right.push(p.clone().sub(m));
    }
    const shape=new T.Shape([...left,...right.reverse()]);shape.closePath();return solid(shape,.03,z,edge,group,.003);
  }
  // Eight pairs of inward-turning foliate scrolls connect adjacent petals.
  for(let k=0;k<8;k++)for(const side of [-1,1]){
    const a=k*Math.PI/4+Math.PI/8,c=Math.cos(a),s=Math.sin(a);
    const ps=[[0,1.16],[side*.12,1.02],[side*.18,.84],[side*.155,.64],[side*.09,.52],[side*.015,.55],[side*.012,.63],[side*.055,.67]];
    ribbon(ps.map(([x,y])=>[x*c-y*s,x*s+y*c]),.013,.074,.036,raised,lattice);
  }
  // Concentric engraved-looking beads stay small so the openwork remains legible.
  for(let i=0;i<80;i++){const a=i*Math.PI*2/80;const bead=solid(circle(.011),.012,.098,raised);bead.position.x=Math.cos(a)*1.25;bead.position.y=Math.sin(a)*1.25;}
  // Corner foliage carved into the solid screen, layered above a dark ground.
  for(const sx of [-1,1])for(const sy of [-1,1]){
    const yy=sy<0?-1.54:1.37;
    ribbon([[sx*1.51,yy],[sx*1.38,yy-sy*.12],[sx*1.29,yy-sy*.21],[sx*1.34,yy-sy*.34],[sx*1.48,yy-sy*.3],[sx*1.47,yy-sy*.21]],.023,.018,.025,raised);
    ribbon([[sx*1.51,yy],[sx*1.3,yy],[sx*1.1,yy-sy*.05],[sx*.98,yy],[sx*.99,yy+sy*.075],[sx*1.08,yy+sy*.065]],.019,.02,.027,edge);
  }
  // Recessed rectangular side panels with double mitred borders and fretwork.
  for(const sx of [-1,1]){
    solid(rect(sx>0?1.69:-3.3,-1.84,1.61,3.42),.12,-.12,base);
    const x=sx*2.48;
    for(const inset of [0,.075]){
      const w=1.35-inset*2,h=2.97-inset*2,frame=rect(x-w/2,-.16-h/2,w,h);frame.holes.push(new T.Path(rect(x-w/2+.035,-.16-h/2+.035,w-.07,h-.07).getPoints()));solid(frame,.033,.018+inset*.3,raised);
    }
    for(let row=0;row<5;row++)for(let col=0;col<2;col++){
      const cx=x+(col-.5)*.53,cy=-1.27+row*.53;
      const p=[[cx-.20,cy-.19],[cx+.19,cy-.19],[cx+.19,cy+.19],[cx-.12,cy+.19],[cx-.12,cy-.08],[cx+.075,cy-.08],[cx+.075,cy+.075]];
      fret(p,.017,.05);
    }
  }
  // A carved lintel and sill instead of a plain rectangular strip.
  for(const y of [-1.79,1.52]){
    solid(rect(-3.32,y,6.64,.10),.17,.01,edge);
    solid(rect(-3.30,y+.025,6.60,.025),.05,.16,raised);
    for(let i=0;i<24;i++){
      const x=-3.18+i*.275;
      ribbon([[x,y+.11],[x+.1,y+.16],[x+.21,y+.11]],.013,.07,.024,raised);
    }
  }
  return {group,lattice,materials:{base,raised,edge,recess}};
}
