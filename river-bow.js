import * as T from './vendor/three.module.js';

export function makeRiverBow(){
  const group=new T.Group();
  const grain=document.createElement('canvas');grain.width=grain.height=256;const ctx=grain.getContext('2d');
  ctx.fillStyle='#bb7645';ctx.fillRect(0,0,256,256);let seed=29;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<900;i++){
    const x=random()*256,y=random()*256,l=12+random()*55;
    ctx.strokeStyle=`rgba(55,24,10,${.025+random()*.055})`;ctx.lineWidth=.45+random()*.65;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+3,y+l*.35,x-2,y+l*.7,x+1,y+l);ctx.stroke();
  }
  const map=new T.CanvasTexture(grain);map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(2.4,4.2);map.colorSpace=T.SRGBColorSpace;
  const wood=new T.MeshPhysicalMaterial({bumpMap:map,bumpScale:.008,color:new T.Color().setRGB(.285,.095,.032),roughness:.48,clearcoat:.08,clearcoatRoughness:.72,side:T.DoubleSide});
  const edge=new T.MeshPhysicalMaterial({bumpMap:map,bumpScale:.008,color:new T.Color().setRGB(.365,.125,.038),roughness:.52,clearcoat:.05,side:T.DoubleSide});
  const raised=new T.MeshPhysicalMaterial({bumpMap:map,bumpScale:.008,color:new T.Color().setRGB(.48,.205,.066),roughness:.42,clearcoat:.10,clearcoatRoughness:.68});
  const add=(geometry,material=wood,parent=group)=>{const mesh=new T.Mesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;};
  const tube=(points,r=.025,material=edge,parent=group)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),48,r,8,false),material,parent);
  const box=(w,h,d,x,y,z,material=wood,parent=group)=>{const mesh=add(new T.BoxGeometry(w,h,d,4,2,4),material,parent);mesh.position.set(x,y,z);return mesh;};

  // A tapered foredeck leaves the centre view open and reads as a miniature
  // fruit-stone boat rather than a modern dashboard.
  const deckShape=new T.Shape();deckShape.moveTo(-1.66,.54);deckShape.quadraticCurveTo(-1.24,-.66,-.42,-2.15);deckShape.quadraticCurveTo(0,-2.48,.42,-2.15);deckShape.quadraticCurveTo(1.24,-.66,1.66,.54);deckShape.closePath();
  const deck=add(new T.ExtrudeGeometry(deckShape,{depth:.11,bevelEnabled:true,bevelSize:.055,bevelThickness:.045,bevelSegments:4,curveSegments:24}),wood);deck.rotation.x=-Math.PI/2;deck.position.y=-.25;deck.position.z=.10;
  // Narrow inlaid planks converge at the bow.
  for(let i=-5;i<=5;i++){
    const sx=i*.245,ex=i*.055;
    tube([[sx,-.175,.47],[sx*.72,-.16,-.45],[ex,-.13,-2.03]],.010,i%2?edge:raised);
  }
  // Low gunwales and hand-sized rails frame the water without blocking it.
  for(const side of [-1,1]){
    const lower=[],upper=[];
    for(let i=0;i<=20;i++){
      const t=i/20,z=.48-2.42*t,x=side*(1.58*(1-t)+.38*t),curve=.05*Math.sin(t*Math.PI);
      lower.push([x,-.16+curve,z]);upper.push([x,.25+curve,z]);
    }
    tube(lower,.050,edge);tube(upper,.035,raised);
    for(const t of [.08,.28,.48,.68,.86]){
      const z=.48-2.42*t,x=side*(1.58*(1-t)+.38*t),curve=.05*Math.sin(t*Math.PI);
      box(.055,.42,.055,x,.045+curve,z,edge);
      const pin=add(new T.SphereGeometry(.045,16,10),raised);pin.position.set(x,.29+curve,z);
    }
  }
  // Small central prow ornament stays below the horizon.
  tube([[0,-.14,-2.08],[0,.05,-2.20],[0,.31,-2.16],[.10,.42,-2.10],[.18,.36,-2.05]],.034,edge);
  for(let i=0;i<9;i++){
    const a=i*Math.PI/4,bead=add(new T.SphereGeometry(.022,12,8),raised);bead.position.set(Math.cos(a)*.16,.08+Math.sin(a)*.12,-2.13);
  }
  // A slim carved apron is visible only at the very bottom edge.
  tube([[-1.55,-.34,.54],[-.80,-.42,.62],[0,-.46,.65],[.80,-.42,.62],[1.55,-.34,.54]],.045,edge);
  group.position.set(0,1.38,-3.20);group.rotation.x=-.04;group.visible=false;
  return {group,update(t,sailing,travel=0){group.position.y=1.38+Math.sin(t*.75)*.025+(sailing?Math.sin(t*2.1)*.012:0);group.position.z=-travel-3.20;group.rotation.z=Math.sin(t*.55)*.006;}};
}
