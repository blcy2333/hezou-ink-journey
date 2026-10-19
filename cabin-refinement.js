import * as T from './vendor/three.module.js';

// Real rounded relief: restrained same-colour carving, no printed ornament.
export function makeCabinRefinement(materials){
 const group=new T.Group(),{raised,edge,base}=materials;
 const mesh=(g,m,p,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;};
 const line=(points,r,p,mat=raised)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),24,r,6,false),mat,p);
 function blossom(p,x,y,z,size=.075){for(let j=0;j<5;j++){const a=j*Math.PI*2/5;const petal=mesh(new T.SphereGeometry(size*.46,10,7),raised,p,x+Math.cos(a)*size*.62,y+Math.sin(a)*size*.62,z);petal.scale.z=.36;}mesh(new T.SphereGeometry(size*.24,10,7),edge,p,x,y,z+.008);}
 // Plum branches follow the inside jambs, leaving the pierced centre open.
 for(const side of [-1,1]){
   const p=new T.Group();p.position.set(side*3.3,0,-5.66);group.add(p);
   line([[0,.65,0],[side*.06,1.25,0],[-side*.04,1.9,0],[side*.09,2.65,0],[0,3.8,0]],.018,p);
   for(let i=0;i<6;i++){const y=1+i*.44,dx=(i%2?1:-1)*.17;line([[0,y-.13,0],[dx*.4,y,0],[dx,y+.12,0]],.009,p);blossom(p,dx,y+.12,.014,.065);}
 }
 // Suzhou-style curled apron detail and finely beaded table edges.
 for(const [x,z] of [[-3.45,-3.6],[3.45,-3.15],[-3.45,1.4],[3.45,2.5]]){
   const p=new T.Group();p.position.set(x,0,z);group.add(p);
   for(const s of [-1,1]){
     line([[-.65,.88,s*.51],[0,.88,s*.51],[.65,.88,s*.51]],.011,p);
     for(let j=-3;j<=3;j++){
       const cx=j*.17;line([[cx-.07,.73,s*.51],[cx-.06,.67,s*.52],[cx,.65,s*.53],[cx+.055,.69,s*.52],[cx+.015,.72,s*.51]],.012,p);
     }
   }
 }
 // A small carved open scroll beside the tea tray: engraved water-line relief.
 const scroll=new T.Group();scroll.position.set(2.96,.99,2.75);scroll.rotation.y=.18;group.add(scroll);
 const shape=new T.Shape();shape.moveTo(-.16,-.24);shape.lineTo(.16,-.24);shape.lineTo(.16,.24);shape.lineTo(-.16,.24);shape.closePath();
 const sheet=mesh(new T.ExtrudeGeometry(shape,{depth:.012,bevelEnabled:true,bevelSize:.008,bevelThickness:.005,bevelSegments:3}),base,scroll);sheet.rotation.x=-Math.PI/2;
 for(const z of [-.24,.24]){const rod=mesh(new T.CylinderGeometry(.028,.028,.37,16),edge,scroll,0,.018,z);rod.rotation.z=Math.PI/2;}
 for(let i=0;i<4;i++)line([[-.11,.022,-.14+i*.08],[-.03,.024,-.16+i*.08],[.05,.024,-.13+i*.08],[.11,.022,-.15+i*.08]],.004,scroll,raised);
 // Small pierced quatrefoils in the upper transom; rounded inner edges catch light.
 for(let i=-5;i<=5;i++){
   const sh=new T.Shape();sh.moveTo(-.20,-.14);sh.lineTo(.20,-.14);sh.lineTo(.20,.14);sh.lineTo(-.20,.14);sh.closePath();
   const hole=new T.Path();
   for(let j=0;j<=64;j++){const a=-j*Math.PI*2/64,r=.084+.022*Math.cos(4*a);if(!j)hole.moveTo(Math.cos(a)*r,Math.sin(a)*r);else hole.lineTo(Math.cos(a)*r,Math.sin(a)*r);}hole.closePath();sh.holes.push(hole);
   mesh(new T.ExtrudeGeometry(sh,{depth:.035,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:4,curveSegments:24}),edge,group,i*.46,4.38,-5.70);
 }
 return batchCarvings(group);
}

// Preserve every carved surface but submit only one mesh per material.
function batchCarvings(group){
 group.updateMatrixWorld(true);const batches=new Map();
 group.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(g);});
 const result=new T.Group();for(const [material,parts] of batches){const g=new T.BufferGeometry();for(const key of ['position','normal','uv']){let count=0;for(const part of parts)count+=part.getAttribute(key).array.length;const values=new Float32Array(count);let offset=0;for(const part of parts){values.set(part.getAttribute(key).array,offset);offset+=part.getAttribute(key).array.length;}g.setAttribute(key,new T.BufferAttribute(values,key==='uv'?2:3));}g.computeBoundingSphere();const m=new T.Mesh(g,material);m.castShadow=m.receiveShadow=true;result.add(m);for(const part of parts)part.dispose();}
 group.traverse(o=>{if(o.isMesh)o.geometry.dispose();});return result;
}

export function refineCabinObjects(items,materials){
 // The original pipa was showing its back to arriving visitors.
 if(items.lute)for(const child of items.lute.children)child.rotation.y=Math.PI;
}
