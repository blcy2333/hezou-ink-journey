import * as T from './vendor/three.module.js';
export function makeCabinObjects(materials){
 const group=new T.Group(),items=[];const {base,raised,edge}=materials;
 const mesh=(geo,mat,x,y,z,parent=group)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
 const box=(w,h,d,x,y,z,mat=base,p=group)=>{const bevel=Math.min(.018,w*.18,h*.18,d*.18),s=new T.Shape();s.moveTo(-w/2+bevel,-h/2+bevel);s.lineTo(w/2-bevel,-h/2+bevel);s.lineTo(w/2-bevel,h/2-bevel);s.lineTo(-w/2+bevel,h/2-bevel);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:d-2*bevel,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3});g.translate(0,0,-d/2+bevel);return mesh(g,mat,x,y,z,p);};
 function tube(points,r,parent=group,mat=raised){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),40,r,8,false),mat,0,0,0,parent);}
 function stand(x,z){
  const s=new T.Group();s.position.set(x,0,z);group.add(s);
  box(1.50,.12,1.04,0,.84,0,edge,s);box(1.38,.045,.92,0,.925,0,raised,s);
  for(const dx of [-.57,.57])for(const dz of [-.36,.36]){
   box(.09,.76,.09,dx,.40,dz,edge,s);box(.14,.07,.14,dx,.06,dz,raised,s);
   tube([[dx,.77,dz],[dx*.78,.63,dz],[dx*.70,.52,dz]],.026,s,raised);
  }
  const apronShape=new T.Shape();apronShape.moveTo(-.67,.12);apronShape.lineTo(-.67,.34);apronShape.lineTo(.67,.34);apronShape.lineTo(.67,.12);apronShape.bezierCurveTo(.46,.20,.25,.02,0,.13);apronShape.bezierCurveTo(-.25,.02,-.46,.20,-.67,.12);apronShape.closePath();
  for(const front of [-1,1]){const a=mesh(new T.ExtrudeGeometry(apronShape,{depth:.055,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3}),raised,0,.52,front*.45,s);if(front<0)a.rotation.y=Math.PI;}
  for(const side of [-1,1]){const a=mesh(new T.ExtrudeGeometry(apronShape,{depth:.055,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3}),raised,side*.70,.52,0,s);a.scale.x=.62;a.rotation.y=side*Math.PI/2;}
  for(const front of [-1,1])tube([[-.52,.23,front*.40],[0,.17,front*.40],[.52,.23,front*.40]],.018,s,raised);
 }
 function item(name,x,z,kind){stand(x,z);const root=new T.Group();root.position.set(x,.93,z);group.add(root);const i={name,root,kind,active:false,value:0,p:new T.Vector3(x,2.2,z)};items.push(i);return i;}
 const fan=item('苏扇 · 借风',-3.45,-3.6,'fan');fan.root.rotation.x=-.12;fan.root.rotation.y=.6;
 const leaf=new T.Group();fan.root.add(leaf);fan.leaf=leaf;
 for(let k=0;k<15;k++){const a=(k-7)*.12;const rib=new T.Group();rib.rotation.z=a;leaf.add(rib);box(.022,1.2,.035,0,.63,0,raised,rib);const sh=new T.Shape();sh.moveTo(-.075,.38);sh.lineTo(-.09,1.2);sh.quadraticCurveTo(0,1.26,.09,1.2);sh.lineTo(.075,.38);sh.closePath();mesh(new T.ExtrudeGeometry(sh,{depth:.015,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:2}),edge,0,0,-.025,rib);for(let j=0;j<3;j++)tube([[-.06,.58+j*.17,0],[0,.65+j*.17,.008],[.06,.58+j*.17,0]],.007,rib);}
 mesh(new T.SphereGeometry(.05,20,12),raised,0,.04,.035,fan.root);
 const lute=item('琵琶 · 拨弦',3.45,-3.15,'lute');lute.root.rotation.z=-.18;lute.root.rotation.y=-.65;
 const body=new T.Shape();body.moveTo(0,0);body.bezierCurveTo(-.64,0,-.6,.72,-.20,.95);body.lineTo(-.07,1.62);body.lineTo(.07,1.62);body.lineTo(.20,.95);body.bezierCurveTo(.6,.72,.64,0,0,0);
 mesh(new T.ExtrudeGeometry(body,{depth:.10,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:4,curveSegments:36}),edge,0,0,0,lute.root);
 for(let j=0;j<4;j++)tube([[(j-1.5)*.035,.20,.15],[(j-1.5)*.029,1.6,.15]],.005,lute.root,raised);
 for(let j=0;j<12;j++)box(.15+j*.012,.016,.04,0,1.47-j*.079,.16,raised,lute.root);
 for(const x of [-.22,.22]){const s=new T.Shape();s.absellipse(0,0,.045,.09,0,Math.PI*2,false,0);mesh(new T.ExtrudeGeometry(s,{depth:.007,bevelEnabled:false}),base,x,.55,.138,lute.root);}
 const rock=item('太湖石 · 藏月',-3.45,1.4,'rock');rock.root.rotation.y=Math.PI/2;
 const stone=new T.Shape();stone.moveTo(-.28,0);stone.bezierCurveTo(-.56,.12,-.32,.28,-.42,.42);stone.bezierCurveTo(-.51,.56,-.28,.61,-.33,.8);stone.bezierCurveTo(-.46,1.02,-.15,.95,-.20,1.17);stone.bezierCurveTo(-.08,1.38,.16,1.21,.12,1.08);stone.bezierCurveTo(.41,1.14,.40,.94,.30,.85);stone.bezierCurveTo(.50,.70,.31,.57,.38,.40);stone.bezierCurveTo(.58,.21,.19,.25,.30,0);stone.closePath();
 for(const [x,y,rx,ry] of [[-.09,.25,.11,.15],[-.15,.67,.09,.13],[.08,.97,.08,.12],[.15,.5,.065,.10]]){const h=new T.Path();h.absellipse(x,y,rx,ry,0,Math.PI*2,true,.3);stone.holes.push(h);}
 mesh(new T.ExtrudeGeometry(stone,{depth:.24,bevelEnabled:true,bevelSize:.037,bevelThickness:.055,bevelSegments:5,curveSegments:40}),edge,0,.035,-.10,rock.root);
 for(let i=0;i<5;i++){const x=-.26+i*.12;tube([[x,.05,.205],[x-.025,.13,.21],[x+.035,.2,.19]],.006,rock.root,raised);}
 const moon=mesh(new T.SphereGeometry(.085,24,16),raised,0,.76,-.04,rock.root);rock.moon=moon;moon.visible=false;
 const tea=item('茶壶 · 偷闲',3.45,2.5,'tea');
 const profile=[[0,0],[.20,0],[.30,.1],[.33,.27],[.25,.43],[.18,.46]].map(p=>new T.Vector2(...p));mesh(new T.LatheGeometry(profile,48),edge,0,.03,0,tea.root);
 tube([[.23,.15,0],[.43,.18,0],[.50,.43,0],[.64,.46,0]],.075,tea.root);
 const handle=mesh(new T.TorusGeometry(.22,.038,12,40),raised,-.29,.27,0,tea.root);handle.scale.set(.8,1,1);
 const lid=new T.Group();lid.position.y=.5;tea.root.add(lid);tea.lid=lid;mesh(new T.SphereGeometry(.2,32,16),raised,0,0,0,lid).scale.set(1,.2,1);mesh(new T.SphereGeometry(.045,20,12),edge,0,.07,0,lid);
 for(const x of [-.5,.5])mesh(new T.LatheGeometry([[0,0],[.08,0],[.11,.14],[.095,.15],[.067,.02]].map(p=>new T.Vector2(...p)),32),raised,x,0,.24,tea.root);
 return {group,items,replaceWith(models){group.visible=false;for(const i of items)if(models[i.kind]){i.root=models[i.kind];i.replacement=true;i.baseY=i.root.position.y;}},update(dt,t){for(const i of items){i.value=T.MathUtils.damp(i.value,i.active?1:0,4,dt);if(i.kind==='fan'){if(i.replacement)i.root.rotation.y=i.value*.16;else i.leaf.scale.x=.25+i.value*.75;}if(i.kind==='lute')i.root.rotation.z=(i.replacement?0:-.18)+Math.sin(t*16)*.013*i.value;if(i.kind==='rock'){i.root.rotation.y=(i.replacement?0:Math.PI/2)+i.value*.34;if(!i.replacement)i.moon.visible=i.active;}if(i.kind==='tea'){if(i.replacement)i.root.position.y=i.baseY+i.value*.035+Math.sin(t*2.4)*.006*i.value;else i.lid.position.y=.5+i.value*.26+Math.sin(t*3)*.015*i.value;}}}};
}
