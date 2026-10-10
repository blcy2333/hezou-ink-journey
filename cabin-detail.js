import * as T from './vendor/three.module.js';

export function makeCabinDetail(materials){
  const {base,raised,edge,recess}=materials,group=new T.Group();
  const add=(geometry,material=base,parent=group)=>{const m=new T.Mesh(geometry,material);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
  function bevelBox(w,h,d,material=base,parent=group,bevel=.018){
    const b=Math.min(bevel,w*.18,h*.18,d*.18),s=new T.Shape();
    s.moveTo(-w/2+b,-h/2);s.lineTo(w/2-b,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+b);
    s.lineTo(w/2,h/2-b);s.quadraticCurveTo(w/2,h/2,w/2-b,h/2);s.lineTo(-w/2+b,h/2);
    s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-b);s.lineTo(-w/2,-h/2+b);s.quadraticCurveTo(-w/2,-h/2,-w/2+b,-h/2);
    const g=new T.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*b),bevelEnabled:b>0,bevelSize:b,bevelThickness:b,bevelSegments:3,curveSegments:3});g.translate(0,0,-d/2+b);
    return add(g,material,parent);
  }
  function tube(points,r=.025,material=raised,parent=group,segments=48){
    return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments,r,8,false),material,parent);
  }
  function place(o,x,y,z,rx=0,ry=0,rz=0){o.position.set(x,y,z);o.rotation.set(rx,ry,rz);return o;}
  function frame(w,h,d,material=raised,parent=group){
    const g=new T.Group();parent.add(g);const t=.07;
    place(bevelBox(w,t,d,material,g),0,h/2-t/2,0);place(bevelBox(w,t,d,material,g),0,-h/2+t/2,0);
    place(bevelBox(t,h-t*2,d,material,g),-w/2+t/2,0,0);place(bevelBox(t,h-t*2,d,material,g),w/2-t/2,0,0);return g;
  }
  // Individually bevelled floorboards, perimeter rails, and a narrow inlaid fret band.
  place(bevelBox(9.75,.14,13.75,base),0,-.06,0);
  for(let i=0;i<10;i++)place(bevelBox(.91,.055,13.38,base),-4.32+i*.96,.05,0);
  for(const x of [-4.82,4.82])place(bevelBox(.18,.16,13.7,edge),x,.11,0);
  for(const z of [-6.82,6.82])place(bevelBox(9.72,.16,.18,edge),0,.11,z);
  for(let i=0;i<31;i++){
    const x=-4.5+i*.30,flip=i%2?1:-1;
    tube([[x-.11,.19,-6.68],[x,.19,-6.58+flip*.015],[x+.11,.19,-6.68]],.010,raised);
  }
  // A single curved inner roof skin replaces the old flat ceiling.
  const nx=24,nz=24,pos=[],idx=[];
  for(let iz=0;iz<=nz;iz++)for(let ix=0;ix<=nx;ix++){
    const x=-4.9+9.8*ix/nx,z=-6.9+13.8*iz/nz,y=4.30+.84*(1-(x/4.9)**2);pos.push(x,y,z);
  }
  for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++){const a=iz*(nx+1)+ix,b=a+1,c=a+nx+1,d=c+1;idx.push(a,b,c,b,d,c);}
  const roofGeo=new T.BufferGeometry();roofGeo.setAttribute('position',new T.Float32BufferAttribute(pos,3));roofGeo.setIndex(idx);roofGeo.computeVertexNormals();const roof=add(roofGeo,base);roof.material=base;
  // Close-set roof slats and transverse ribs create readable craft at close range.
  for(let ix=0;ix<=20;ix++){
    const x=-4.55+ix*.455,y=4.30+.84*(1-(x/4.9)**2)-.015;
    tube([[x,y,-6.75],[x,y,-2.25],[x,y,2.25],[x,y,6.75]],.018,ix%4===0?edge:raised);
  }
  for(let z=-6.5;z<=6.5;z+=.65){
    const pts=[];for(let i=0;i<=28;i++){const x=-4.72+9.44*i/28;pts.push([x,4.30+.84*(1-(x/4.9)**2)-.04,z]);}tube(pts,.032,z%1.3===0?edge:raised);
  }
  // Small ceiling bosses mark the main bays and catch warm side light.
  for(const z of [-4,-2,0,2,4]){
    const ring=add(new T.TorusGeometry(.17,.026,10,36),edge);ring.rotation.x=Math.PI/2;ring.position.set(0,5.065,z);
    const boss=add(new T.CylinderGeometry(.055,.072,.055,20),raised);boss.position.set(0,5.055,z);
    for(let k=0;k<8;k++){
      const a=k*Math.PI/4,bead=add(new T.SphereGeometry(.028,12,8),raised);bead.position.set(Math.cos(a)*.24,5.045,z+Math.sin(a)*.24);bead.scale.y=.55;
    }
  }
  // Side pillars use square carved sections, layered feet and bracket capitals.
  for(const side of [-1,1])for(const z of [-6,-2,2,6]){
    place(bevelBox(.18,3.78,.18,edge),side*4.72,2.28,z);
    place(bevelBox(.34,.15,.34,raised),side*4.72,.45,z);place(bevelBox(.27,.12,.27,edge),side*4.72,.58,z);
    place(bevelBox(.42,.13,.50,raised),side*4.72,4.05,z);
    const bracket=bevelBox(.62,.12,.18,edge);place(bracket,side*4.48,3.88,z,0,0,side*.42);
    const pin=add(new T.CylinderGeometry(.035,.035,.23,16),raised);pin.rotation.z=Math.PI/2;pin.position.set(side*4.72,3.66,z);
  }
  // Lower wainscot panels and upper open lattice windows are separate joinery bays.
  for(const side of [-1,1])for(const z of [-4,0,4]){
    const wall=new T.Group();wall.position.set(side*4.73,1.03,z);wall.rotation.y=side*Math.PI/2;group.add(wall);
    place(bevelBox(3.66,1.23,.14,base,wall),0,0,0);frame(3.48,1.05,.07,raised,wall);
    for(const px of [-1.12,0,1.12]){
      const inset=frame(.92,.72,.055,edge,wall);inset.position.set(px,0,.075);
      for(const turn of [-1,1]){
        const leaf=bevelBox(.37,.028,.075,raised,wall,.007);leaf.position.set(px+turn*.09,0,.10);leaf.rotation.z=turn*Math.PI/4;
      }
      const boss=add(new T.CylinderGeometry(.035,.045,.035,16),raised,wall);boss.rotation.x=Math.PI/2;boss.position.set(px,0,.14);
    }
    for(const sx of [-1,1])for(const sy of [-1,1]){
      const curl=[];for(let i=0;i<=20;i++){const a=i*Math.PI*1.4/20,r=.08+.012*i;curl.push([sx*(.86+r*Math.cos(a)),sy*(.25+r*Math.sin(a)),.09]);}tube(curl,.014,edge,wall,28);
    }
    const upper=new T.Group();upper.position.set(side*4.71,2.65,z);upper.rotation.y=side*Math.PI/2;group.add(upper);frame(3.7,1.82,.12,edge,upper);
    for(const u of [-1.50,-1,-.50,0,.50,1,1.50])place(bevelBox(.028,1.62,.07,raised,upper),u,0,0);
    for(const v of [-.64,-.32,0,.32,.64])place(bevelBox(3.5,.028,.07,raised,upper),0,v,0);
    // Interlocking diagonal pieces and pin bosses make an ice-crack lattice.
    for(const u of [-1.25,-.75,-.25,.25,.75,1.25])for(const v of [-.48,.16]){
      place(bevelBox(.34,.024,.075,raised,upper),u,v,0,0,0,Math.PI/4);
      place(bevelBox(.34,.024,.075,edge,upper),u,v+.32,0,0,0,-Math.PI/4);
      const pin=add(new T.CylinderGeometry(.018,.023,.022,12),raised,upper);pin.rotation.x=Math.PI/2;pin.position.set(u,v+.16,.075);
    }
  }
  // Front bulkhead panels flank the flower window without covering its opening.
  for(const side of [-1,1]){
    const front=new T.Group();front.position.set(side*3.66,2.36,-6.03);group.add(front);
    place(bevelBox(2.28,3.78,.17,base,front),0,0,0);frame(2.08,3.52,.08,raised,front);
    for(const y of [-1.10,0,1.10]){
      const sub=frame(1.72,.82,.06,edge,front);sub.position.y=y;
      const diamond=bevelBox(.46,.035,.075,raised,front);diamond.position.y=y;diamond.rotation.z=Math.PI/4;
    }
  }
  // Longitudinal rails, tiny pegs, and thresholds make joints legible in side light.
  for(const side of [-1,1])for(const y of [.55,1.72,3.61,4.14])place(bevelBox(.13,.13,13.56,y>3.8?edge:raised),side*4.70,y,0);
  // A restrained cloud frieze runs below the roof; it is shallow relief, not a glowing effect.
  for(const side of [-1,1])for(let z=-6.15;z<6.2;z+=.72){
    tube([[side*4.64,3.90,z-.30],[side*4.58,4.02,z-.14],[side*4.62,3.94,z],[side*4.58,4.02,z+.14],[side*4.64,3.90,z+.30]],.016,raised);
  }
  for(const side of [-1,1])for(let z=-5.5;z<=5.5;z+=1){
    const peg=add(new T.CylinderGeometry(.026,.026,.035,12),edge);peg.rotation.z=Math.PI/2;peg.position.set(side*4.79,3.61,z);
  }
  return group;
}
